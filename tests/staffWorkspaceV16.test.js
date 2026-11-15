import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoundationFixtures, foundationActors, foundationContext } from '../src/data/foundationDemo.js'
import { createStaffScenarios } from '../src/data/staffScenarios.js'
import { staffRows, staffTask, STAFF_QUEUES } from '../src/utils/staffWorkspace.js'
import { executeProjectAction, validateCancellation } from '../src/domain/actions.js'
import { executeFoundationCommand } from '../functions/foundationPolicy.js'
import { replayProject } from '../functions/securePolicy.js'
import { buildProposal } from '../src/utils/projectStorage.js'
import { correctionAction } from '../src/utils/demoCorrection.js'
import { evaluationProgress } from '../src/domain/model.js'
import { addStaffScenarios, initializeFoundationDemo, readFoundationProjects } from '../src/utils/foundationStore.js'
import { routeAllowed } from '../src/utils/commonWorkspace.js'
let seq = 0
const fixture = id => createFoundationFixtures().find(p => p.id === id)
const act = (p, action, payload = {}, uid = 'demo-staff') => executeProjectAction(p, { id: `phase3-${++seq}`, action, payload, expectedVersion: p._version }, foundationContext(uid))
test('registry queues/search/sort are workspace scoped, and all Staff task URLs deny other roles', () => {
  const rows = createFoundationFixtures(), staff = foundationActors['demo-staff']
  assert.equal(staffRows(rows, staff).length, 14)
  assert.equal(staffRows(rows, { ...staff, workspace: 'other' }).length, 0)
  assert.equal(staffRows(rows, foundationActors['demo-user']).length, 0)
  assert.equal(staffRows(rows, staff, { search: 'V16-CANCELLED' })[0].status, 'CANCELLED')
  const required = staffRows(rows, staff, { queue: 'action' }).map(p => p.id)
  assert.ok(required.includes('V16-EVALUATION-3')); assert.ok(!required.includes('V16-EVALUATION-2')); assert.ok(!required.includes('V16-RELEASED'))
  for (const queue of STAFF_QUEUES) for (const p of staffRows(rows, staff, { queue })) assert.equal(p.workspace, staff.workspace)
  const sorted = staffRows(rows, staff, { sort: 'id', direction: 'asc' }).map(p => p.id)
  assert.deepEqual(sorted, [...sorted].sort((a, b) => a.localeCompare(b)))
  for (const route of ['closure-review', 'reviewer-assignment', 'evaluation-tracking', 'final-verification', 'cancellation']) {
    assert.equal(routeAllowed(route, 'staff'), true); assert.equal(routeAllowed(route, 'researcher'), false); assert.equal(routeAllowed(route, 'reviewer'), false)
  }
})
test('proposal pass requires actual submitted evidence and correction remains a scoped Local Demo self-transition', () => {
  const p = fixture('V16-STAFF'), invalid = structuredClone(p); invalid.documents = []
  assert.throws(() => act(invalid, 'pass_proposal', { confirmed: true }), /document/)
  const requested = act(p, 'request_proposal_revision', { notes: 'Clarify budget', editableSections: ['budget'] })
  assert.equal(requested.status, 'STAFF_REVIEW'); assert.equal(requested.proposalReview.requestedBy, 'demo-staff')
  assert.throws(() => act(requested, 'pass_proposal', { confirmed: true }), /Confirm/)
  assert.equal(act(p, 'pass_proposal', { confirmed: true }).status, 'COMMITTEE_ACKNOWLEDGEMENT')
  const legacy = { id: 'legacy-approved-change', workspace: 'local-demo-v16', ownerUid: 'demo-user', ownerUsername: 'demo-user', status: 'active', correction: { state: 'approved' }, proposal: { projectTitle: 'Original' }, statusHistory: [] }
  assert.throws(() => replayProject(legacy, { ...legacy, proposal: { projectTitle: 'Not authorized' }, statusHistory: [{ action: 'save_proposal' }] }, foundationActors['demo-user']), /Correction Approval is retired/)
  const beforeLegacy = JSON.stringify(legacy)
  assert.throws(() => buildProposal(legacy, { projectTitle: 'Not authorized' }, foundationActors['demo-user']), /Correction Approval is retired/)
  assert.throws(() => correctionAction(legacy.id, 'approved', foundationActors['demo-staff'], 'No more web approvals'), /Correction Approval is retired/)
  assert.equal(JSON.stringify(legacy), beforeLegacy)
})
test('acknowledgement and certification are separate guarded records; optional metadata is preserved', () => {
  let p = fixture('V16-COMMITTEE')
  assert.throws(() => act(p, 'certify_project', { confirmed: true, reference: 'CERT' }), /acknowledgement/)
  p = act(p, 'record_acknowledgement', { reference: 'MEETING/1', date: '2026-11-15', meeting: 'External meeting', notes: 'For acknowledgement', documentIds: [], acknowledged: true })
  assert.equal(p.status, 'COMMITTEE_ACKNOWLEDGEMENT'); assert.equal(p.administrativeRecords.at(-1).meeting, 'External meeting')
  p = act(p, 'certify_project', { reference: 'CERT/1', notes: 'Staff certification', documentIds: [], confirmed: true })
  assert.equal(p.status, 'IN_PROGRESS'); assert.equal(p.certification.notes, 'Staff certification')
})
test('denied changes preserve values; extensions enforce two six-month limits and block unresolved month-end policy', () => {
  let p = fixture('V16-ACTIVE'), before = p.title
  const change = { reference: 'EXT/1', date: '2026-11-15', reason: 'External outcome', changes: { projectTitle: 'New title' }, documentIds: [] }
  p = act(p, 'record_project_change', { ...change, outcome: 'rejected' }); assert.equal(p.title, before)
  p = act(p, 'record_project_change', { ...change, outcome: 'approved' }); assert.equal(p.title, 'New title'); assert.equal(p.changeRecords.at(-1).date, '2026-11-15')
  const ext = { outcome: 'approved', reference: 'EXT/2', date: '2026-11-15', reason: 'Approved externally', documentIds: [] }
  assert.throws(() => act(p, 'record_extension', { ...ext, endDate: '2027-08-01' }), /six calendar/)
  p = act(p, 'record_extension', { ...ext, endDate: '2027-06-01' }); p = act(p, 'record_extension', { ...ext, endDate: '2027-07-01' })
  assert.throws(() => act(p, 'record_extension', { ...ext, endDate: '2027-08-01' }), /two approved/)
  const monthEnd = fixture('V16-ACTIVE'); monthEnd.endDate = '2027-08-31'; monthEnd.proposal.endDate = monthEnd.endDate
  assert.throws(() => act(monthEnd, 'record_extension', { ...ext, endDate: '2028-02-29' }), /OPEN-10/)
  assert.equal(p.status, 'IN_PROGRESS')
})
test('exactly three active distinct reviewers and submitted-only release at 3/3; duplicate release is denied', () => {
  let p = act(fixture('V16-CLOSURE'), 'check_closure', { confirmed: true })
  for (const reviewerIds of [['demo-reviewer-1'], ['demo-reviewer-1', 'demo-reviewer-1', 'demo-reviewer-2'], ['demo-reviewer-1', 'demo-reviewer-2', 'demo-reviewer-3', 'demo-reviewer-1']]) assert.throws(() => act(p, 'assign_reviewers', { reviewerIds }), /Exactly three/)
  p = act(p, 'assign_reviewers', { reviewerIds: ['demo-reviewer-1', 'demo-reviewer-2', 'demo-reviewer-3'] }); assert.equal(p.status, 'REPORT_EVALUATION')
  const draft = createStaffScenarios().find(p => p.id === 'V16-EVALUATION-DRAFT'); assert.equal(evaluationProgress(draft).label, '0/3')
  assert.throws(() => act(fixture('V16-EVALUATION-2'), 'release_evaluations', { confirmed: true }), /Release once/)
  const released = act(fixture('V16-EVALUATION-3'), 'release_evaluations', { confirmed: true })
  assert.equal(released.closure.release.releasedBy, 'demo-staff'); assert.equal(released.status, 'REPORT_EVALUATION')
  assert.throws(() => act(released, 'release_evaluations', { confirmed: true }), /Release once/)
})
test('final verification rejects missing revised bytes/reference, requires separate close, and keeps external notice history', () => {
  let p = createStaffScenarios().find(p => p.id === 'V16-FINAL-VERIFY'), latest = p.closure.revisedReportVersions.at(-1)
  const invalid = structuredClone(p); invalid.documents = invalid.documents.filter(d => d.kind !== 'revised_report')
  assert.throws(() => act(invalid, 'verify_revised_report', { confirmed: true, revisedReportVersionId: latest.id }), /document/)
  assert.throws(() => act(p, 'close_report', { confirmed: true }), /Staff verification/)
  p = act(p, 'verify_revised_report', { confirmed: true, revisedReportVersionId: latest.id, notes: 'Actual report checked' })
  assert.equal(p.status, 'REPORT_EVALUATION'); assert.equal(p.closure.finalCheck.notes, 'Actual report checked')
  p = act(p, 'close_report', { confirmed: true }); assert.equal(p.status, 'CLOSED')
  const old = p.statusHistory.length
  p = act(p, 'record_notice', { reference: 'NOTICE/1', date: '2026-11-15', notes: 'External closure notice', documentIds: [] })
  assert.equal(p.status, 'CLOSED'); assert.equal(p.statusHistory.length, old + 1); assert.equal(p.administrativeRecords.at(-1).reference, 'NOTICE/1')
})
test('cancellation contract can be previewed but all local/backend mutations remain OPEN-20; fixtures do not overwrite', () => {
  const p = fixture('V16-ACTIVE'), valid = { reason: 'OTHER', details: 'Preview', documentIds: [], confirmed: true }
  assert.doesNotThrow(() => validateCancellation(p, valid)); assert.throws(() => validateCancellation(p, { ...valid, details: '' }), /Cancellation reason/)
  assert.throws(() => act(p, 'cancel_project', valid), /OPEN-20/)
  assert.throws(() => executeFoundationCommand(p, { id: 'server-cancel', action: 'cancel_project', payload: valid, expectedVersion: p._version }, { ...foundationActors['demo-staff'], authenticated: true }, foundationActors), /OPEN-20/)
  const values = new Map(), storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  initializeFoundationDemo(storage); const first = readFoundationProjects(storage)[0]
  addStaffScenarios(storage); addStaffScenarios(storage)
  assert.equal(readFoundationProjects(storage).length, 18); assert.deepEqual(readFoundationProjects(storage)[0], first)
  assert.equal(staffTask(createStaffScenarios()[1]), 'final-verification')
})
