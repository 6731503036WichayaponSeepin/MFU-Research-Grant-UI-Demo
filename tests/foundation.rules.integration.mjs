// Local emulators only. No Firebase credentials, production database or migration writer.
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getBytes, deleteObject } from 'firebase/storage'
import { demoDocument } from '../src/data/demoAttachment.js'

assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):\d+$/)
assert.match(process.env.FIREBASE_STORAGE_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):\d+$/)
await import('./rules.integration.mjs') // Preserve the existing Firestore access-control regression checks.
const env = await initializeTestEnvironment({ projectId: 'demo-mfu-secure',
  firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  storage: { host: '127.0.0.1', port: 9199, rules: readFileSync(new URL('../storage.rules', import.meta.url), 'utf8') },
})
const workspace = 'foundation-rules', projectId = 'canonical-project'
const users = { 'v16-owner': 'researcher', 'v16-outsider': 'researcher', 'v16-staff': 'staff', 'v16-one': 'reviewer', 'v16-two': 'reviewer', 'v16-three': 'reviewer' }
const bytes = Buffer.from(demoDocument.dataUrl.split(',')[1], 'base64')
const specs = [
  ['report-ticket', 'v16-owner', 'research'], ['signed-ticket', 'v16-owner', 'research'],
  ['feedback-one', 'v16-one', 'feedback'], ['feedback-two', 'v16-two', 'feedback'],
]
let checks = 0
const succeeds = async promise => { await assertSucceeds(promise); checks++ }
const fails = async promise => { await assertFails(promise); checks++ }
const file = (uid, ticketId) => ref(env.authenticatedContext(uid).storage(), `workspaces/${workspace}/projects/${projectId}/${specs.find(s => s[0] === ticketId)[1]}/${ticketId}`)
try {
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore()
    for (const [uid, role] of Object.entries(users)) await setDoc(doc(db, 'users/' + uid), { role, active: true, workspace })
    await setDoc(doc(db, `workspaces/${workspace}/projects/${projectId}`), {
      schemaVersion: '1.6', status: 'REPORT_EVALUATION', ownerUid: 'v16-owner', reviewerUids: ['v16-one', 'v16-two', 'v16-three'],
      closure: { reportDocumentIds: ['report-ticket'], release: null, releasedFeedbackDocumentIds: [] },
    })
    for (const [id, uid, purpose] of specs) await setDoc(doc(db, 'uploadTickets/' + id), {
      id, uploaderUid: uid, ownerUid: 'v16-owner', workspace, projectId, purpose, name: id + '.pdf', size: bytes.length,
      storagePath: `workspaces/${workspace}/projects/${projectId}/${uid}/${id}`, expiresAt: Date.now() + 600000,
    })
  })
  for (const [id, uid] of specs) await succeeds(uploadBytes(file(uid, id), bytes, { contentType: 'application/pdf' }))
  await succeeds(getBytes(file('v16-one', 'report-ticket')))
  await fails(getBytes(file('v16-one', 'signed-ticket')))
  await succeeds(getBytes(file('v16-one', 'feedback-one')))
  await fails(getBytes(file('v16-one', 'feedback-two')))
  await fails(getBytes(file('v16-owner', 'feedback-one')))
  await succeeds(getBytes(file('v16-owner', 'signed-ticket')))
  await succeeds(getBytes(file('v16-staff', 'feedback-two')))
  await fails(getBytes(file('v16-outsider', 'report-ticket')))
  const anonymous = ref(env.unauthenticatedContext().storage(), `workspaces/${workspace}/projects/${projectId}/v16-owner/report-ticket`)
  await fails(getBytes(anonymous))
  await fails(deleteObject(file('v16-staff', 'report-ticket')))
  await env.withSecurityRulesDisabled(async c => updateDoc(doc(c.firestore(), `workspaces/${workspace}/projects/${projectId}`), {
    'closure.release': { releasedAt: '2026-11-15T03:00:00Z' }, 'closure.releasedFeedbackDocumentIds': ['feedback-one'],
  }))
  await succeeds(getBytes(file('v16-owner', 'feedback-one')))
  await fails(getBytes(file('v16-owner', 'feedback-two'))) // Unsubmitted/unreleased attachment remains private.
  await env.withSecurityRulesDisabled(async c => updateDoc(doc(c.firestore(), 'users/v16-one'), { active: false }))
  await fails(getBytes(file('v16-one', 'feedback-one')))
  console.log(`PASS: ${checks} v1.6 Storage emulator access-control checks`)
} finally { await env.cleanup() }
