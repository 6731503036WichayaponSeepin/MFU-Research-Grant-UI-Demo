// Run only against the local demo emulator; never a live project.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { createDemoProjects } from '../src/data/demoProjects.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
import { configureProjectStore, saveProposal, updateProject, updateProjectStatus, getProjects } from '../src/utils/projectStorage.js'
import { persist } from '../src/utils/closure.js'

const projectId = 'demo-mfu-research'
const code = readFileSync(new URL('../functions/.secret.local', import.meta.url), 'utf8').trim().split('=')[1]
const api = 'http://127.0.0.1:5001/demo-mfu-research/asia-southeast1/demoApi'
const send = async (body, access = code) => {
  const response = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Demo-Access': access }, body: JSON.stringify(body) })
  return { status: response.status, body: await response.json() }
}
const env = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') } })
try {
  const db = env.unauthenticatedContext().firestore()
  assert.equal((await send({ action: 'seed' }, 'wrong')).status, 403)
  assert.equal((await send({ action: 'seed' })).status, 200)
  assert.equal((await send({ action: 'seed' })).body.seeded, false)
  const initial = await assertSucceeds(getDocs(collection(db, 'demoProjects')))
  assert.ok(initial.size >= 18)
  await assertFails(setDoc(doc(db, 'demoProjects/forbidden'), { fictional: true }))
  await assertFails(deleteDoc(doc(db, 'demoProjects/MFU-DEMO-001')))
  await assertFails(getDocs(collection(db, 'demoControl')))
  let records = initial.docs.map(p => p.data())
  configureProjectStore({ read: () => structuredClone(records), save: async projects => {
    for (const project of projects) {
      const previous = records.find(p => p.id === project.id)
      if (JSON.stringify(previous) === JSON.stringify(project)) continue
      const response = await send({ action: 'save', project, expectedVersion: previous?._version || 0 })
      assert.equal(response.status, 200, JSON.stringify(response.body))
      records = [...records.filter(p => p.id !== project.id), response.body.project]
    }
  } })
  const researcher = { role: 'researcher', username: 'demo-user' }, staff = { ...researcher, role: 'staff' }
  const data = { ...createDemoProjects()[0].proposal, projectTitle: 'Fictional emulator workflow' }
  const saved = await saveProposal(data, researcher)
  await saveProposal({ ...data, _projectId: saved.id }, researcher, true)
  const form = { date: '2026-10-19', responsible: 'Fictional staff', notes: 'Fictional received outcome' }
  for (const status of ['unit_review', 'eoffice_pending']) await updateProject(saved.id, p => recordAdministrativeResult(p, form, staff, status))
  const stale = getProjects().find(p => p.id === saved.id)
  await updateProjectStatus(saved.id, 'revision_required', 'Fictional revision reason')
  assert.equal((await send({ action: 'save', project: stale, expectedVersion: stale._version })).status, 409)
  await saveProposal({ ...data, _projectId: saved.id }, researcher, true)
  await updateProjectStatus(saved.id, 'committee_review', 'Fictional complete review')
  await persist('MFU-DEMO-018', 'review_draft', { scores: [4,4,4,4,4,4], comments: 'Fictional emulator evaluation', result: 'accept' }, { ...researcher, role: 'reviewer' })
  // Fresh client read proves persistence independent of the in-memory adapter.
  const fresh = (await getDocs(collection(db, 'demoProjects'))).docs.map(p => p.data())
  assert.equal(fresh.find(p => p.id === saved.id).status, 'committee_review')
  assert.equal(fresh.find(p => p.id === 'MFU-DEMO-018').closure.evaluation.comments, 'Fictional emulator evaluation')
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { stop(); reject(new Error('Realtime listener timed out')) }, 10000)
    const stop = onSnapshot(doc(db, `demoProjects/${saved.id}`), snapshot => {
      if (snapshot.data()?.status === 'committee_review') { clearTimeout(timeout); stop(); resolve() }
    }, reject)
  })
  console.log('PASS: backend code gate, idempotent seed, public reads, forbidden direct writes/deletes/private reads, cross-role workflow, conflict rejection, reviewer save, fresh-client persistence and realtime read.')
} finally { configureProjectStore(null); await env.cleanup() }
