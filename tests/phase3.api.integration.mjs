// Prepared contract fixtures only. Every endpoint/project is restricted to emulators.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth'
import { createFoundationFixtures } from '../src/data/foundationDemo.js'
import { createStaffScenarios } from '../src/data/staffScenarios.js'
for (const key of ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST', 'FIREBASE_STORAGE_EMULATOR_HOST']) assert.match(process.env[key] || '', /^(127\.0\.0\.1|localhost):\d+$/)
assert.equal(process.env.GCLOUD_PROJECT, 'demo-mfu-secure')
const require = createRequire(new URL('../functions/package.json', import.meta.url)), adminApp = require('firebase-admin/app').initializeApp({ projectId: 'demo-mfu-secure' })
const db = require('firebase-admin/firestore').getFirestore(adminApp), auth = require('firebase-admin/auth').getAuth(adminApp)
const workspace = 'phase3-http', staff = 'staff-http-admin', owner = 'staff-http-owner', reviewers = ['staff-http-r1', 'staff-http-r2', 'staff-http-r3'], clients = {}, apps = []
let checks = 0, sequence = 0
const endpoint = 'http://127.0.0.1:5001/demo-mfu-secure/asia-southeast1/researchApi'
async function request(uid, id, action, payload, expected = 200) {
  const before = (await db.doc(`workspaces/${workspace}/projects/${id}`).get()).data()
  const token = await clients[uid].currentUser.getIdToken()
  const result = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'execute', projectId: id, command: { id: `phase3-http-${++sequence}`, action, payload, expectedVersion: before._version } }) })
  const body = await result.json(); checks++; assert.equal(result.status, expected, `${action}: ${body.error || ''}`)
  const after = (await db.doc(`workspaces/${workspace}/projects/${id}`).get()).data()
  if (expected !== 200) assert.deepEqual(after, before, `${action} rejection must preserve all data`)
  else assert.equal(after.statusHistory.at(-1).updatedBy, uid)
  if(expected===200 && reviewers.includes(uid)) {
    assert.ok(Object.keys(body.project.closure.evaluations).every(id=>id===uid),'reviewer response excludes other evaluations')
    assert.ok(body.project.closure.assignments.every(a=>a.reviewerId===uid),'reviewer response excludes other assignments')
  }
  return after
}
async function seed(source, id) {
  const p = structuredClone(source); p.id = id; p.workspace = workspace; p.ownerUid = owner; p.ownerUsername = owner
  p.fixtureSetup = { synthetic: true, reason: 'Staff HTTP contract fixture; not Reviewer UI or production data' }
  for (const e of p.statusHistory) e.projectId = id
  if (p.closure?.reviewers?.length) {
    const map = Object.fromEntries(p.closure.reviewers.map((old, i) => [old, reviewers[i]]))
    p.closure.reviewers = reviewers; p.reviewerUids = reviewers
    p.closure.assignments = p.closure.assignments.map(a => ({ ...a, id: `${id}-${map[a.reviewerId]}`, reviewerId: map[a.reviewerId] }))
    p.closure.evaluations = Object.fromEntries(Object.entries(p.closure.evaluations).map(([uid, e]) => [map[uid], { ...e, by: map[uid], assignmentId: `${id}-${map[uid]}` }]))
    if (p.closure.release) p.closure.release.reviewerIds = reviewers
  }
  await db.doc(`workspaces/${workspace}/projects/${id}`).set(p)
  return p
}
try {
  for (const [uid, role] of [[staff, 'staff'], [owner, 'researcher'], ...reviewers.map(id => [id, 'reviewer'])]) {
    await auth.createUser({ uid, email: `${uid}@example.test`, password: 'Emulator-only-phase3-123!' })
    await db.doc(`users/${uid}`).set({ role, workspace, active: true })
    const app = initializeApp({ projectId: 'demo-mfu-secure', apiKey: 'demo-key', authDomain: 'localhost' }, uid); apps.push(app)
    const client = getAuth(app); connectAuthEmulator(client, 'http://127.0.0.1:9099', { disableWarnings: true }); await signInWithEmailAndPassword(client, `${uid}@example.test`, 'Emulator-only-phase3-123!'); clients[uid] = client
  }
  const rows = createFoundationFixtures(), source = id => rows.find(p => p.id === id)
  const legacy = { id: 'phase3-legacy-approved', workspace, ownerUid: owner, ownerUsername: owner, status: 'active', correction: { state: 'approved' }, proposal: { projectTitle: 'Legacy original' }, statusHistory: [], _version: 1 }
  const legacyRef = db.doc(`workspaces/${workspace}/projects/${legacy.id}`); await legacyRef.set(legacy)
  const legacyToken = await clients[owner].currentUser.getIdToken()
  const retired = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${legacyToken}` }, body: JSON.stringify({ action: 'save', expectedVersion: 1, project: { ...legacy, proposal: { projectTitle: 'Unauthorized legacy edit' }, statusHistory: [{ action: 'save_proposal' }] } }) })
  checks++; assert.equal(retired.status, 409); assert.match((await retired.json()).error, /Correction Approval is retired/); assert.deepEqual((await legacyRef.get()).data(), legacy)
  const id = 'phase3-proposal'; await seed(source('V16-STAFF'), id)
  await request(owner, id, 'pass_proposal', { confirmed: true }, 403)
  await request(staff, id, 'request_proposal_revision', { notes: '' }, 400)
  await request(staff, id, 'request_proposal_revision', { notes: 'Do not enable local policy', editableSections: ['budget'] }, 403)
  let p = await request(staff, id, 'pass_proposal', { confirmed: true }); assert.equal(p.status, 'COMMITTEE_ACKNOWLEDGEMENT')
  await request(staff, id, 'certify_project', { confirmed: true, reference: 'CERT' }, 400)
  p = await request(staff, id, 'record_acknowledgement', { acknowledged: true, reference: 'ACK/3', date: '2026-11-15', meeting: 'External meeting', notes: 'For acknowledgement', documentIds: [] }); assert.equal(p.status, 'COMMITTEE_ACKNOWLEDGEMENT')
  p = await request(staff, id, 'certify_project', { reference: 'CERT/3', notes: 'Reviewed externally', documentIds: [], confirmed: true }); assert.equal(p.status, 'IN_PROGRESS')
  const beforeTitle = p.title, change = { reason: 'External result', reference: 'CHANGE/3', date: '2026-11-15', changes: { projectTitle: 'Approved title' }, documentIds: [] }
  p = await request(staff, id, 'record_project_change', { ...change, outcome: 'rejected' }); assert.equal(p.title, beforeTitle)
  p = await request(staff, id, 'record_project_change', { ...change, outcome: 'approved' }); assert.equal(p.title, 'Approved title')
  await request(staff, id, 'record_project_change', { ...change, outcome: 'approved', changes: { status: 'CLOSED' } }, 400)
  const ext = { outcome: 'approved', reason: 'External extension', reference: 'EXT/3', date: '2026-11-15', documentIds: [] }
  await request(staff, id, 'record_extension', { ...ext, endDate: '2027-08-01' }, 400)
  await request(staff, id, 'record_extension', { ...ext, endDate: '2027-06-01' })
  p = await request(staff, id, 'record_extension', { ...ext, endDate: '2027-12-01' }); assert.equal(p.status, 'IN_PROGRESS')
  await request(staff, id, 'record_extension', { ...ext, endDate: '2028-01-01' }, 400)
  await request(staff, id, 'cancel_project', { reason: 'OTHER', details: 'Still OPEN-20', confirmed: true, documentIds: [] }, 409)
  await seed(source('V16-CLOSURE'), 'phase3-assignment')
  await request(staff, 'phase3-assignment', 'check_closure', { confirmed: true })
  for (const selected of [reviewers.slice(0, 2), [reviewers[0], reviewers[0], reviewers[2]], [...reviewers, reviewers[0]]]) await request(staff, 'phase3-assignment', 'assign_reviewers', { reviewerIds: selected }, 400)
  p = await request(staff, 'phase3-assignment', 'assign_reviewers', { reviewerIds: reviewers }); assert.equal(p.status, 'REPORT_EVALUATION'); assert.equal(p.closure.assignments.length, 3)
  await request(staff, 'phase3-assignment', 'release_evaluations', { confirmed: true }, 409)
  await seed(source('V16-EVALUATION-3'), 'phase3-release')
  p = await request(staff, 'phase3-release', 'release_evaluations', { confirmed: true, notes: 'Submit revised report' }); assert.equal(p.status, 'REPORT_EVALUATION'); assert.equal(p.closure.release.releasedBy, staff)
  await request(staff, 'phase3-release', 'release_evaluations', { confirmed: true }, 409)
  const scenarios = createStaffScenarios()
  const final = await seed(scenarios.find(p => p.id === 'V16-FINAL-VERIFY'), 'phase3-final')
  const revisedReportVersionId = final.closure.revisedReportVersions.at(-1).id
  await request(staff, 'phase3-final', 'close_report', { confirmed: true }, 400)
  p = await request(staff, 'phase3-final', 'verify_revised_report', { confirmed: true, revisedReportVersionId, notes: 'Actual revised file verified' }); assert.equal(p.status, 'REPORT_EVALUATION'); assert.equal(p.closure.finalCheck.notes, 'Actual revised file verified')
  p = await request(staff, 'phase3-final', 'close_report', { confirmed: true }); assert.equal(p.status, 'CLOSED')
  p = await request(staff, 'phase3-final', 'record_notice', { reference: 'NOTICE/3', date: '2026-11-15', notes: 'External closure letter', documentIds: [] }); assert.equal(p.status, 'CLOSED')
  await request(staff, 'phase3-final', 'close_report', { confirmed: true }, 400)
  await seed(scenarios.find(p => p.id === 'V16-PUBLICATION-REVIEW'), 'phase3-publication')
  await request(staff, 'phase3-publication', 'close_publication', { confirmed: true }, 400)
  await request(staff, 'phase3-publication', 'check_closure', { confirmed: true })
  await request(staff, 'phase3-publication', 'assign_reviewers', { reviewerIds: reviewers }, 400)
  p = await request(staff, 'phase3-publication', 'close_publication', { confirmed: true }); assert.equal(p.status, 'CLOSED'); assert.equal(p.closure.assignments.length, 0)
  console.log(`PASS Phase 3 HTTP: ${checks} authenticated requests; rejected commands preserve full records; emulators only`)
  const phase4Start=checks, reviewId='phase4-independent'
  await seed(source('V16-EVALUATION-0'),reviewId)
  await request(owner,reviewId,'save_evaluation',{evaluation:{}},403)
  await request(reviewers[0],reviewId,'submit_evaluation',{evaluation:{}},400)
  await request(reviewers[0],reviewId,'save_evaluation',{evaluation:{additionalComments:'private reviewer one'}})
  let review=(await db.doc(`workspaces/${workspace}/projects/${reviewId}`).get()).data()
  assert.equal(Object.values(review.closure.evaluations).filter(e=>e.submitted).length,0)
  await request(reviewers[1],reviewId,'save_evaluation',{evaluation:{additionalComments:'private reviewer two'}})
  review=(await db.doc(`workspaces/${workspace}/projects/${reviewId}`).get()).data()
  assert.equal(review.closure.evaluations[reviewers[0]].additionalComments,'private reviewer one')
  const answers={objectives:0,consistency:0,abstract:0,executive:0,result:1,utilization:{},additionalComments:'Submitted exact data'}
  await request(reviewers[0],reviewId,'submit_evaluation',{evaluation:{...answers,by:reviewers[1]}})
  await request(reviewers[0],reviewId,'submit_evaluation',{evaluation:answers},403)
  await request(reviewers[0],reviewId,'save_evaluation',{evaluation:answers},403)
  await request(reviewers[1],reviewId,'submit_evaluation',{evaluation:answers})
  review=await request(reviewers[2],reviewId,'submit_evaluation',{evaluation:answers})
  assert.equal(Object.values(review.closure.evaluations).filter(e=>e.submitted).length,3)
  assert.equal(review.status,'REPORT_EVALUATION');assert.equal(review.closure.release,null)
  await request(reviewers[0],reviewId,'release_evaluations',{confirmed:true},403)
  await request(staff,reviewId,'release_evaluations',{confirmed:true})
  await request(reviewers[2],reviewId,'submit_evaluation',{evaluation:answers},403)
  const broken=await seed(source('V16-EVALUATION-0'),'phase4-malformed')
  broken.closure.assignments[1].reviewerId=reviewers[0]
  await db.doc(`workspaces/${workspace}/projects/${broken.id}`).set(broken)
  await request(reviewers[0],broken.id,'save_evaluation',{evaluation:answers},400)
  console.log(`PASS Phase 4 HTTP: ${checks-phase4Start} authenticated requests; independent drafts, submitted locks and response projections`)
} finally { await Promise.all(apps.map(deleteApp)); await require('firebase-admin/app').deleteApp(adminApp) }
