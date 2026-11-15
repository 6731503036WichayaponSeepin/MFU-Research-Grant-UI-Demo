// This test cannot run against live Firebase: every endpoint is explicitly localhost.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth'
import { getStorage, connectStorageEmulator, ref, uploadBytes } from 'firebase/storage'
import { createFoundationFixtures, foundationActors } from '../src/data/foundationDemo.js'
import { demoDocument } from '../src/data/demoAttachment.js'

for (const name of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST', 'FIREBASE_STORAGE_EMULATOR_HOST']) {
  assert.match(process.env[name] || '', /^(127\.0\.0\.1|localhost):\d+$/, name + ': local emulator required')
}
const require = createRequire(new URL('../functions/package.json', import.meta.url))
const adminApp = require('firebase-admin/app').initializeApp({ projectId: 'demo-mfu-secure' })
const db = require('firebase-admin/firestore').getFirestore(adminApp), auth = require('firebase-admin/auth').getAuth(adminApp)
const apps = {}, clients = {}, workspace = 'local-demo-v16', password = 'Emulator-only-v16-123!'
let count = 0, sequence = 0
const endpoint = 'http://127.0.0.1:5001/demo-mfu-secure/asia-southeast1/researchApi'
async function send(uid, body) {
  const token = uid ? await clients[uid].auth.currentUser.getIdToken() : ''
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body) })
  count++
  return { status: response.status, ...await response.json() }
}
const canonical = id => db.doc(`workspaces/${workspace}/projects/${id}`)
try {
  for (const [uid, profile] of Object.entries(foundationActors)) {
    await auth.createUser({ uid, email: uid + '@example.test', password })
    await db.doc('users/' + uid).set({ role: profile.role, workspace, active: true })
    const app = initializeApp({ projectId: 'demo-mfu-secure', apiKey: 'emulator-key', authDomain: 'localhost', storageBucket: 'demo-mfu-secure.appspot.com' }, uid)
    apps[uid] = app
    const clientAuth = getAuth(app); connectAuthEmulator(clientAuth, 'http://127.0.0.1:9099', { disableWarnings: true })
    await signInWithEmailAndPassword(clientAuth, uid + '@example.test', password)
    const storage = getStorage(app); connectStorageEmulator(storage, '127.0.0.1', 9199)
    clients[uid] = { auth: clientAuth, storage }
  }
  const draftCommand = { id: 'http-create', action: 'create_project', expectedVersion: 0, payload: { projectId: 'http-draft', proposal: { projectTitle: 'Emulator Phase 0' } } }
  const denied = await send(null, { action: 'execute', projectId: 'http-draft', command: draftCommand })
  assert.equal(denied.status, 401)
  let result = await send('demo-user', { action: 'execute', projectId: 'http-draft', command: draftCommand })
  assert.equal(result.status, 200, JSON.stringify(result)); assert.equal(result.project.status, 'DRAFT')
  result = await send('demo-user', { action: 'execute', projectId: 'http-draft', command: { id: 'http-open', action: 'confirm_ready', expectedVersion: 1, payload: { approved: true } } })
  assert.equal(result.status, 409); assert.match(result.error, /OPEN-04/)
  const saved = (await canonical('http-draft').get()).data()
  result = await send('demo-staff', { action: 'save', expectedVersion: saved._version, project: { ...saved, schemaVersion: undefined, status: 'admin_review' } })
  assert.equal(result.status, 409)
  result = await send('demo-user', { action: 'execute', projectId: 'http-draft', command: { id: 'http-forge-context', action: 'save_proposal', expectedVersion: 1, context: { actor: 'demo-staff' }, payload: {} } })
  assert.equal(result.status, 400)

  // Seed only an explicitly labelled synthetic evaluation baseline in the local emulator.
  const p = createFoundationFixtures().find(p => p.id === 'V16-EVALUATION-0')
  for (const d of p.documents) {
    delete d.dataUrl; d.contentType = 'application/pdf'
    d.storagePath = `workspaces/${workspace}/projects/${p.id}/${d.uploadedBy}/${d.id}`
    await db.doc('uploadTickets/' + d.id).set({ ...d, projectId: p.id, workspace, uploaderUid: d.uploadedBy, purpose: 'research' })
  }
  await canonical(p.id).set(p)
  const execute = async (uid, action, payload = {}, expected = 200) => {
    const latest = (await canonical(p.id).get()).data()
    const r = await send(uid, { action: 'execute', projectId: p.id, command: { id: `http-command-${++sequence}`, action, payload, expectedVersion: latest._version } })
    assert.equal(r.status, expected, JSON.stringify(r)); return r
  }
  const evaluation = { objectives: 0, consistency: 0, abstract: 0, executive: 0, result: 0, utilization: {} }
  await execute('demo-staff', 'release_evaluations', { confirmed: true }, 409)
  for (let i = 1; i <= 3; i++) {
    await execute(`demo-reviewer-${i}`, 'submit_evaluation', { evaluation })
    const view = (await db.doc(`workspaces/${workspace}/users/demo-user/projects/${p.id}`).get()).data()
    assert.deepEqual(view.closure.evaluations, {})
  }
  await execute('demo-reviewer-1', 'submit_evaluation', { evaluation }, 403)
  await execute('demo-user', 'release_evaluations', { confirmed: true }, 403)
  await execute('demo-staff', 'release_evaluations', { confirmed: true })
  await execute('demo-staff', 'release_evaluations', { confirmed: true }, 409)
  const ownerView = (await db.doc(`workspaces/${workspace}/users/demo-user/projects/${p.id}`).get()).data()
  assert.equal(Object.keys(ownerView.closure.evaluations).length, 3)
  const other = (await db.doc(`workspaces/${workspace}/users/demo-reviewer-1/projects/${p.id}`).get()).data()
  assert.deepEqual(Object.keys(other.closure.evaluations), ['demo-reviewer-1'])
  await execute('demo-staff', 'close_report', { confirmed: true }, 400)
  const bytes = Buffer.from(demoDocument.dataUrl.split(',')[1], 'base64')
  const ticket = await send('demo-user', { action: 'prepareUpload', projectId: p.id, name: 'revised.pdf', size: bytes.length })
  assert.equal(ticket.status, 200, JSON.stringify(ticket))
  const document = { id: ticket.file.id, kind: 'revised_report', version: 1, name: 'revised.pdf', size: bytes.length, storagePath: ticket.file.storagePath, contentType: 'application/pdf' }
  await execute('demo-user', 'attach_document', { document }, 400) // Missing object cannot be attached.
  await uploadBytes(ref(clients['demo-user'].storage, document.storagePath), bytes, { contentType: 'application/pdf', customMetadata: { ticketId: document.id } })
  await execute('demo-user', 'attach_document', { document })
  await execute('demo-user', 'submit_revised_report', { confirmed: true, documentIds: [document.id] })
  await execute('demo-reviewer-1', 'submit_evaluation', { evaluation }, 403)
  const latest = (await canonical(p.id).get()).data()
  await execute('demo-staff', 'verify_revised_report', { confirmed: true, revisedReportVersionId: latest.closure.revisedReportVersions.at(-1).id })
  await execute('demo-staff', 'close_report', { confirmed: true })
  const closed = (await canonical(p.id).get()).data()
  assert.equal(closed.status, 'CLOSED')
  assert.ok(Object.values(closed.closure.evaluations).every(e => e.reviewRound === 1))
  await execute('demo-user', 'submit_closure', {}, 400)
  console.log(`PASS: ${count} v1.6 authenticated HTTP emulator requests, projections, private file verification and one-round closure`)
} finally {
  await Promise.all(Object.values(apps).map(deleteApp))
  await require('firebase-admin/app').deleteApp(adminApp)
}
