import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PROJECT_STATES, TRANSITIONS, ACTIONS, CAPABILITY_MATRIX } from '../src/domain/contracts.js'
import { executeProjectAction, readProjectResource, validateCancellation } from '../src/domain/actions.js'
import { hasCapability, projectProjection } from '../src/domain/permissions.js'
import { validateDocument, evaluationProgress, auditLogs, addMonthsClamped } from '../src/domain/model.js'
import { migrationDryRun } from '../src/domain/migration.js'
import { createFoundationFixtures, foundationActors, foundationContext } from '../src/data/foundationDemo.js'
import { createInteractiveDemo } from '../src/data/interactiveDemo.js'
import { demoDocument } from '../src/data/demoAttachment.js'
import { FOUNDATION_DEMO_KEY, initializeFoundationDemo, dispatchFoundationDemo, readFoundationProjects, readFoundationDemo } from '../src/utils/foundationStore.js'
import { executeFoundationCommand, foundationView } from '../functions/foundationPolicy.js'
import { replayProject } from '../functions/securePolicy.js'
import { databaseRecords } from '../functions/records.js'

let serial = 0
const command = (p, action, payload = {}) => ({ id: `test-command-${++serial}`, action, payload, expectedVersion: p?._version || 0 })
const act = (p, action, payload = {}, uid = 'demo-staff') => executeProjectAction(p, command(p, action, payload), foundationContext(uid))
const fixture = id => createFoundationFixtures().find(p => p.id === id)
const actor = id => foundationActors[id]
const evaluation = { objectives: 0, consistency: 0, abstract: 0, executive: 0, result: 0, utilization: {} }
const pdf = (kind, id = `new-file-${++serial}`) => ({ ...demoDocument, id, kind, version: 1 })
const attach = (p, kind, uid = 'demo-user') => {
  const d = pdf(kind)
  return [act(p, 'attach_document', { document: d }, uid), d.id]
}
const error = code => e => e.code === code

test('foundation has exactly nine project states, seventeen rules and three roles; OPEN actions cannot be enabled by payload', () => {
  assert.equal(PROJECT_STATES.length, 9)
  assert.equal(new Set(PROJECT_STATES).size, 9)
  assert.equal(Object.keys(TRANSITIONS).length, 17)
  assert.deepEqual(Object.keys(CAPABILITY_MATRIX).sort(), ['researcher', 'reviewer', 'staff'])
  for (const [id, rule] of Object.entries(TRANSITIONS)) {
    assert.ok(PROJECT_STATES.includes(rule.to), id)
    assert.ok(rule.from.every(s => s === null || PROJECT_STATES.includes(s)), id)
    assert.ok(Object.values(ACTIONS).some(a => a.rule === id || a.rules?.includes(id)), id)
  }
  for (const [id, action, uid] of [['V16-DRAFT', 'confirm_ready', 'demo-user'], ['V16-STAFF', 'return_to_affiliation', 'demo-user'], ['V16-ACTIVE', 'cancel_project', 'demo-staff']]) {
    assert.throws(() => act(fixture(id), action, { approved: true, enableOpen: true, confirmed: true, reason: 'OTHER', details: 'test' }, uid), error(action === 'confirm_ready' ? 'LATEST_PDF_REQUIRED' : 'OPEN_REQUIREMENT'))
  }
})

test('TR-01/02 create and repeated saves preserve DRAFT, authoritative identity and immutable audit history', () => {
  const c = command(null, 'create_project', { projectId: 'new-project', proposal: { projectTitle: 'draft', ownerUid: 'forged', status: 'CLOSED' } })
  let p = executeProjectAction(null, c, foundationContext('demo-user'))
  assert.equal(p.status, 'DRAFT'); assert.equal(p.ownerUid, 'demo-user'); assert.equal(p.proposal.ownerUid, undefined)
  const original = structuredClone(p)
  p = act(p, 'save_proposal', { proposal: { projectTitle: 'updated' }, status: 'CLOSED', by: 'forged' }, 'demo-user')
  assert.equal(p.status, 'DRAFT'); assert.equal(p.proposalVersions.length, 2)
  assert.deepEqual(p.statusHistory.slice(0, 1), original.statusHistory)
  assert.equal(p.statusHistory.at(-1).transitionRule, 'TR-02')
  assert.equal(p.statusHistory.at(-1).updatedBy, 'demo-user')
  assert.deepEqual(auditLogs(p), p.statusHistory)
  assert.deepEqual(original, executeProjectAction(null, c, foundationContext('demo-user')))
  assert.throws(() => executeProjectAction(p, { ...command(p, 'save_proposal'), expectedVersion: 0 }, foundationContext('demo-user')), error('VERSION_CONFLICT'))
})

test('every main-state edge is bound to its rule; wrong origins and terminal escapes are denied', () => {
  const fixtures = createFoundationFixtures()
  for (const [actionName, contract] of Object.entries(ACTIONS)) {
    if (!contract.rule || actionName === 'create_project') continue
    const allowed = TRANSITIONS[contract.rule].from
    for (const state of PROJECT_STATES.filter(s => !allowed.includes(s))) {
      const p = structuredClone(fixtures.find(p => p.status === state))
      assert.throws(() => act(p, actionName), e => ['INVALID_TRANSITION', 'TERMINAL_STATE'].includes(e.code), `${actionName} from ${state}`)
    }
  }
  assert.throws(() => act(null, 'close_report'), error('INVALID_TRANSITION'))
})

test('TR-04/05/06 require exact current signed evidence and conditional consent; revisions are self transitions', () => {
  const affiliation = fixture('V16-AFFILIATION')
  const ids = affiliation.documents.map(d => d.id)
  const payload = { proposalVersionId: 'mock-ready', documentIds: ids, signaturesComplete: true, usesOthersElectronicSignatures: true, consentConfirmed: true }
  for (const patch of [{ documentIds: [] }, { documentIds: [ids[0]] }, { signaturesComplete: false }, { consentConfirmed: false }]) {
    assert.throws(() => act(affiliation, 'submit_proposal', { ...payload, ...patch }, 'demo-user'))
  }
  let p = act(affiliation, 'submit_proposal', payload, 'demo-user')
  assert.equal(p.status, 'STAFF_REVIEW'); assert.equal(p.signatureConsent.confirmedBy, 'demo-user')
  assert.equal(p.proposalVersions.find(v => v.id === 'mock-ready').submissions.length, 1)
  assert.throws(() => act(p, 'save_proposal', { proposal: p.proposal }, 'demo-user'), error('ACCESS_DENIED'))
  assert.throws(() => act(p, 'request_proposal_revision', { notes: '' }), error('REVISION_REASON_REQUIRED'))
  p = act(p, 'request_proposal_revision', { notes: 'แก้ไขวิธีวิจัย', editableSections: ['methodology'] })
  assert.equal(p.status, 'STAFF_REVIEW')
  p = act(p, 'save_proposal', { proposal: { ...p.proposal, methodology: 'updated method' } }, 'demo-user')
  const current = p.proposalVersions.at(-1).id
  assert.throws(() => act(p, 'resubmit_proposal', payload, 'demo-user'), error('PROPOSAL_VERSION_REQUIRED'))
  const revisionIds = []
  for (const kind of ['signed_rs1', 'affiliation_evidence']) {
    const document = { ...demoDocument, id: `revised-${kind}`, kind, version: 2, proposalVersionId: current }
    p = act(p, 'attach_document', { document }, 'demo-user'); revisionIds.push(document.id)
  }
  p = act(p, 'resubmit_proposal', { ...payload, documentIds: revisionIds, proposalVersionId: current }, 'demo-user')
  assert.equal(p.status, 'STAFF_REVIEW'); assert.equal(p.proposalReview.actionRequiredBy, 'staff')
  const changed = act(affiliation, 'save_proposal', { proposal: affiliation.proposal }, 'demo-user')
  assert.equal(changed.status, 'AFFILIATION_REVIEW'); assert.equal(changed.statusHistory.at(-1).transitionRule, 'TR-04')
})

test('TR-08/09 require staff check, external acknowledgement and certification without inventing a universal standards blocker', () => {
  let p = fixture('V16-STAFF')
  assert.throws(() => act(p, 'pass_proposal', { confirmed: true }, 'demo-user'), error('ACCESS_DENIED'))
  p = act(p, 'pass_proposal', { confirmed: true })
  assert.equal(p.status, 'COMMITTEE_ACKNOWLEDGEMENT')
  assert.throws(() => act(p, 'certify_project', { confirmed: false }), error('CERTIFICATION_REQUIRED'))
  assert.throws(() => act(p, 'certify_project', { confirmed: true }, 'demo-user'), error('ACCESS_DENIED'))
  p = act(p, 'certify_project', { reference: 'external/cert', confirmed: true })
  assert.equal(p.status, 'IN_PROGRESS'); assert.equal(p.certification.standardsPolicy, 'OPEN-17')
})

test('TR-10 and project changes are staff-only external results, retain before/after and enforce two six-month extensions', () => {
  let p = fixture('V16-ACTIVE')
  const data = { reference: 'eoffice/1', date: '2026-11-15', reason: 'approved externally', outcome: 'approved', endDate: '2027-07-01' }
  assert.throws(() => act(p, 'record_extension', data, 'demo-user'), error('ACCESS_DENIED'))
  assert.throws(() => act(p, 'record_extension', { ...data, endDate: '2028-01-01' }), error('EXTENSION_LIMIT'))
  p = act(p, 'record_extension', { ...data, outcome: 'rejected' })
  assert.equal(p.endDate, '2027-01-01')
  p = act(p, 'record_extension', data)
  p = act(p, 'record_extension', { ...data, endDate: '2028-01-01' })
  assert.equal(p.status, 'IN_PROGRESS'); assert.equal(p.extensionRecords.filter(r => r.outcome === 'approved').length, 2)
  assert.throws(() => act(p, 'record_extension', { ...data, endDate: '2028-02-01' }), error('EXTENSION_LIMIT'))
  assert.equal(addMonthsClamped('2026-08-31', 6), '2027-02-28')
  assert.throws(() => act({ ...p, endDate: '2028-08-31', extensionRecords: [] }, 'record_extension', { ...data, endDate: '2029-02-28' }), error('OPEN_REQUIREMENT'))
  const changes = { outcome: 'approved', reference: 'eoffice/change', reason: 'external approval', changes: { projectTitle: 'new title' } }
  const rejected = act(p, 'record_project_change', { ...changes, outcome: 'rejected' })
  assert.notEqual(rejected.title, 'new title')
  p = act(p, 'record_project_change', changes)
  assert.equal(p.title, 'new title'); assert.equal(p.status, 'IN_PROGRESS')
  assert.equal(p.changeRecords.at(-1).before.projectTitle, fixture('V16-ACTIVE').proposal.projectTitle)
  assert.equal(p.statusHistory.at(-1).details.change.after.projectTitle, 'new title')
})

test('TR-11/12/14 publication path requires summary-report and evidence; only checked staff action closes it', () => {
  let p = fixture('V16-ACTIVE'), summary, publication
  ;[p, summary] = attach(p, 'summary_report'); [p, publication] = attach(p, 'publication')
  const data = { method: 'publication', summary: 'summary', finishedDate: '2026-11-15', documentIds: [summary, publication] }
  const draft = act(p, 'save_closure_draft', data, 'demo-user')
  assert.equal(draft.status, 'IN_PROGRESS')
  assert.throws(() => act(p, 'submit_closure', { ...data, documentIds: [publication] }, 'demo-user'), error('DOCUMENTS_REQUIRED'))
  p = act(p, 'submit_closure', data, 'demo-user')
  assert.equal(p.status, 'CLOSURE_REVIEW')
  assert.throws(() => act(p, 'close_publication', { confirmed: true }), error('PUBLICATION_CHECK_REQUIRED'))
  p = act(p, 'request_closure_documents', { notes: 'more evidence' })
  p = act(p, 'supplement_closure', data, 'demo-user')
  assert.equal(p.status, 'CLOSURE_REVIEW')
  p = act(p, 'check_closure', { confirmed: true })
  assert.throws(() => act(p, 'assign_reviewers', { reviewerIds: ['demo-reviewer-1', 'demo-reviewer-2', 'demo-reviewer-3'] }), error('REPORT_CHECK_REQUIRED'))
  p = act(p, 'close_publication', { confirmed: true })
  assert.equal(p.status, 'CLOSED'); assert.deepEqual(p.closure.assignments, [])
})

test('TR-13 assigns exactly three distinct active reviewers to a checked report version', () => {
  let p = act(fixture('V16-CLOSURE'), 'check_closure', { confirmed: true })
  for (const ids of [[], ['demo-reviewer-1'], ['demo-reviewer-1', 'demo-reviewer-2'], ['demo-reviewer-1', 'demo-reviewer-1', 'demo-reviewer-3'], ['demo-reviewer-1', 'demo-reviewer-2', 'outsider'], ['demo-reviewer-1', 'demo-reviewer-2', 'demo-reviewer-3', 'extra']]) {
    assert.throws(() => act(p, 'assign_reviewers', { reviewerIds: ids }))
  }
  const inactive = { ...foundationContext('demo-staff'), profiles: { ...foundationActors, 'demo-reviewer-3': { ...actor('demo-reviewer-3'), active: false } } }
  assert.throws(() => executeProjectAction(p, command(p, 'assign_reviewers', { reviewerIds: ['demo-reviewer-1', 'demo-reviewer-2', 'demo-reviewer-3'] }), inactive), error('INVALID_REVIEWER'))
  p = act(p, 'assign_reviewers', { reviewerIds: ['demo-reviewer-1', 'demo-reviewer-2', 'demo-reviewer-3'] })
  assert.equal(p.status, 'REPORT_EVALUATION'); assert.equal(p.closure.assignments.length, 3)
  assert.equal(evaluationProgress(p).label, '0/3')
})

test('TR-15 drafts do not count; submit/release once with 0/3–3/3 and no premature researcher access', () => {
  let p = fixture('V16-EVALUATION-0')
  p = act(p, 'save_evaluation', { evaluation: { chapters: 'unfinished' } }, 'demo-reviewer-1')
  assert.equal(evaluationProgress(p).label, '0/3')
  assert.throws(() => act(p, 'submit_evaluation', { evaluation: {} }, 'demo-reviewer-1'))
  assert.throws(() => act(p, 'save_evaluation', { evaluation: { chapters: { forged: true } } }, 'demo-reviewer-1'), error('INVALID_EVALUATION'))
  for (let i = 1; i <= 3; i++) {
    assert.throws(() => act(p, 'release_evaluations', { confirmed: true }), error('RELEASE_NOT_READY'))
    p = act(p, 'submit_evaluation', { evaluation }, `demo-reviewer-${i}`)
    assert.equal(evaluationProgress(p).label, `${i}/3`)
    assert.throws(() => act(p, 'submit_evaluation', { evaluation }, `demo-reviewer-${i}`), error('ACCESS_DENIED'))
    assert.equal(Object.keys(projectProjection(p, actor('demo-user')).closure.evaluations).length, 0)
  }
  p = act(p, 'release_evaluations', { confirmed: true })
  assert.equal(p.status, 'REPORT_EVALUATION')
  assert.equal(Object.keys(projectProjection(p, actor('demo-user')).closure.evaluations).length, 3)
  assert.throws(() => act(p, 'release_evaluations', { confirmed: true }), error('RELEASE_NOT_READY'))
  assert.equal(p.closure.release.releasedBy, 'demo-staff')
})

test('TR-15/16 revised report stays in evaluation; no round two; verified latest actual file precedes staff closure', () => {
  let p = fixture('V16-RELEASED'), revised
  const evaluations = structuredClone(p.closure.evaluations), assignments = structuredClone(p.closure.assignments)
  assert.throws(() => act(p, 'close_report', { confirmed: true }), error('FINAL_CHECK_REQUIRED'))
  ;[p, revised] = attach(p, 'revised_report')
  p = act(p, 'submit_revised_report', { documentIds: [revised], confirmed: true }, 'demo-user')
  assert.equal(p.status, 'REPORT_EVALUATION')
  assert.deepEqual(p.closure.evaluations, evaluations); assert.deepEqual(p.closure.assignments, assignments)
  assert.throws(() => act(p, 'submit_evaluation', { evaluation }, 'demo-reviewer-1'), error('ACCESS_DENIED'))
  assert.throws(() => act(p, 'verify_revised_report', { confirmed: true, revisedReportVersionId: 'forged' }), error('REVISED_REPORT_REQUIRED'))
  p = act(p, 'request_revised_documents', { notes: 'add appendix' })
  assert.throws(() => act(p, 'submit_revised_report', { documentIds: [revised], confirmed: true }, 'demo-user'), error('NEW_REVISED_REPORT_REQUIRED'))
  ;[p, revised] = attach(p, 'revised_report')
  p = act(p, 'submit_revised_report', { documentIds: [revised], confirmed: true }, 'demo-user')
  p = act(p, 'verify_revised_report', { confirmed: true, revisedReportVersionId: p.closure.revisedReportVersions.at(-1).id })
  p = act(p, 'close_report', { confirmed: true })
  assert.equal(p.status, 'CLOSED')
  assert.ok(Object.values(p.closure.evaluations).every(e => e.reviewRound === 1))
  assert.deepEqual(p.closure.evaluations, evaluations)
})

test('CLOSED/CANCELLED terminal guards and cancellation validation do not enable OPEN-20', () => {
  for (const id of ['V16-CLOSED-REPORT', 'V16-CANCELLED']) {
    const p = fixture(id)
    for (const action of ['save_proposal', 'attach_document', 'submit_closure', 'record_extension', 'cancel_project']) {
      assert.throws(() => act(p, action), error('TERMINAL_STATE'))
    }
  }
  const p = fixture('V16-ACTIVE')
  for (const reason of ['RESIGNED', 'EXCEEDED_DURATION', 'OTHER']) {
    const payload = { reason, details: 'details', confirmed: true, documentIds: [] }
    validateCancellation(p, payload)
    assert.throws(() => act(p, 'cancel_project', payload), error('OPEN_REQUIREMENT'))
  }
  assert.throws(() => validateCancellation(p, { reason: 'OTHER', confirmed: true }), error('CANCELLATION_REASON_REQUIRED'))
  assert.throws(() => validateCancellation(p, { reason: 'invented', confirmed: true }), error('CANCELLATION_REASON_REQUIRED'))
  const closed = act(fixture('V16-CLOSED-REPORT'), 'record_notice', { reference: 'external/closure', date: '2026-11-15' })
  assert.equal(closed.status, 'CLOSED')
  assert.throws(() => act(fixture('V16-CANCELLED'), 'record_notice', { reference: 'x', date: '2026-11-15' }), error('INVALID_TRANSITION'))
})

test('document bytes, metadata, IDs and immutable versions are validated; preview/download do not mutate', () => {
  const d = pdf('signed_rs1')
  validateDocument(d)
  for (const patch of [{ kind: 'unknown' }, { id: '__proto__' }, { size: 0 }, { size: d.size + 1 }, { size: 3000000 }, { version: 0 }, { dataUrl: 'data:application/pdf;base64,YmFk' }, { name: 'signed.exe' }]) {
    assert.throws(() => validateDocument({ ...d, ...patch }), error('INVALID_DOCUMENT'))
  }
  assert.throws(() => validateDocument(d, 'backend'), error('INVALID_DOCUMENT'))
  let p = fixture('V16-AFFILIATION')
  p = act(p, 'attach_document', { document: d }, 'demo-user')
  assert.equal(p.status, 'AFFILIATION_REVIEW')
  assert.throws(() => act(p, 'attach_document', { document: d }, 'demo-user'), error('DOCUMENT_IMMUTABLE'))
  const before = structuredClone(p)
  const result = readProjectResource(p, actor('demo-user'), { type: 'document', documentId: d.id }, 'local-demo')
  result.name = 'outside mutation'
  readProjectResource(p, actor('demo-user'), { type: 'project' }, 'local-demo')
  assert.deepEqual(p, before)
})

test('capability matrix scopes owners, workspaces, assigned reports, submitted own results and released researcher PDFs', () => {
  const pending = fixture('V16-EVALUATION-1'), released = fixture('V16-RELEASED')
  assert.equal(hasCapability(pending, { ...actor('demo-user'), uid: 'outsider' }, 'read'), false)
  assert.equal(hasCapability(pending, { ...actor('demo-staff'), workspace: 'elsewhere' }, 'read'), false)
  assert.equal(hasCapability(pending, actor('demo-reviewer-1'), 'evaluate'), false)
  assert.equal(hasCapability(pending, actor('demo-reviewer-2'), 'evaluate'), true)
  assert.equal(hasCapability(pending, actor('demo-user'), 'readEvaluations'), false)
  assert.equal(hasCapability(released, actor('demo-user'), 'readEvaluations'), true)
  for (const uid of Object.keys(foundationActors)) assert.equal(hasCapability(released, actor(uid), 'cancel'), false)
  assert.throws(() => readProjectResource(pending, actor('demo-user'), { type: 'evaluationPdf', reviewerId: 'demo-reviewer-1' }, 'local-demo'), error('ACCESS_DENIED'))
  readProjectResource(pending, actor('demo-reviewer-1'), { type: 'evaluationPdf', reviewerId: 'demo-reviewer-1' }, 'local-demo')
  assert.throws(() => readProjectResource(pending, actor('demo-reviewer-2'), { type: 'evaluationPdf', reviewerId: 'demo-reviewer-1' }, 'local-demo'), error('ACCESS_DENIED'))
  readProjectResource(released, actor('demo-user'), { type: 'evaluationPdf', reviewerId: 'demo-reviewer-1' }, 'local-demo')
  assert.throws(() => readProjectResource(fixture('V16-CLOSED-REPORT'), actor('demo-user'), { type: 'evaluationPdf', reviewerId: 'demo-reviewer-1' }, 'local-demo'), error('ACCESS_DENIED'))
  const p = structuredClone(released)
  p.closure.reviewRounds = [{ evaluations: { outsider: { secret: 'secret-result' } } }]
  const view = projectProjection(p, actor('demo-reviewer-1'))
  assert.equal(view.closure.reviewRounds, undefined); assert.equal(view.proposalVersions.length, 0)
  assert.deepEqual(Object.keys(view.closure.evaluations), ['demo-reviewer-1'])
  assert.ok(view.documents.every(d => d.kind === 'report'))
})

test('local simulation is not authentication; backend reducer ignores forged actor/status and protects its command boundary', () => {
  const staff = { ...actor('demo-staff') }; delete staff.simulation
  const p = fixture('V16-STAFF')
  assert.throws(() => executeProjectAction(p, command(p, 'pass_proposal', { confirmed: true }), { actor: staff, mode: 'backend' }), error('AUTH_REQUIRED'))
  assert.throws(() => executeProjectAction(p, command(p, 'pass_proposal', { confirmed: true }), { actor: { ...staff, authenticated: true }, mode: 'local-demo' }), error('AUTH_REQUIRED'))
  const next = executeFoundationCommand(p, command(p, 'pass_proposal', { confirmed: true, status: 'CLOSED', actor: 'fake' }), staff, foundationActors, '2026-11-15T04:00:00Z')
  assert.equal(next.status, 'COMMITTEE_ACKNOWLEDGEMENT'); assert.equal(next.statusHistory.at(-1).updatedBy, 'demo-staff')
  assert.equal(next.serverUpdatedAt, '2026-11-15T04:00:00Z')
  assert.throws(() => executeFoundationCommand(p, { ...command(p, 'pass_proposal'), context: { actor: staff } }, staff, foundationActors), error('INVALID_COMMAND'))
  assert.throws(() => replayProject(p, { ...p, schemaVersion: undefined, status: 'admin_review' }, staff), /v1.6 execute/)
  assert.throws(() => executeFoundationCommand({ ...p, schemaVersion: undefined }, command(p, 'pass_proposal'), staff, foundationActors), error('MIGRATION_REVIEW_REQUIRED'))
  const before = fixture('V16-EVALUATION-0')
  const b = executeFoundationCommand(before, command(before, 'submit_evaluation', { evaluation }), actor('demo-reviewer-1'), foundationActors)
  assert.equal(Object.keys(foundationView(b, actor('demo-user')).closure.evaluations).length, 0)
  const records = databaseRecords(b, before, actor('demo-reviewer-1'), 'server-event')
  assert.equal(records.find(r => r.collection === 'projects').data.currentStage, 'REPORT_EVALUATION')
  assert.equal(records.find(r => r.collection === 'reviews').data.released, false)
})

test('migration dry-run preserves every original byte/field/history, separates ambiguous records and never auto-maps cancellation', () => {
  const legacy = createInteractiveDemo(), before = JSON.stringify(legacy)
  const report = migrationDryRun(legacy)
  assert.equal(report.dryRun, true); assert.equal(report.writes, 0); assert.equal(report.total, legacy.length)
  assert.equal(JSON.stringify(legacy), before)
  for (let i = 0; i < legacy.length; i++) assert.deepEqual(report.results[i].original, legacy[i])
  assert.ok(report.results.some(r => r.reasons.some(s => s.includes('repeated evaluation'))))
  const ambiguous = ['eoffice_pending', 'revision_required', 'unknown'].map((status, i) => ({ id: `legacy-${i}`, status, ownerUsername: 'old-user' }))
  assert.ok(migrationDryRun(ambiguous).results.every(r => r.status === 'needs_review' && r.suggestedState === null))
  const cancelled = migrationDryRun([{ id: 'old-cancel', status: 'active', ownerUsername: 'old-user', certification: {}, committeeRecord: {}, registry: { assessmentStatus: 'ยกเลิก/ลาออก' } }])
  assert.equal(cancelled.results[0].suggestedState, null)
  assert.equal(migrationDryRun([null, { id: 'same' }, { id: 'same' }]).counts.invalid, 2)
  assert.equal(migrationDryRun(createFoundationFixtures()).counts.already_current, 14)
})

test('v1.6 fixture namespace is opt-in and non-destructive; all nine states, both closures and 0/3–3/3 are available', () => {
  const values = new Map([['mfu-interactive-demo-v1-projects', 'legacy bytes unchanged'], ['real-projects', 'real bytes unchanged']])
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) }
  const rows = initializeFoundationDemo(storage)
  assert.deepEqual([...new Set(rows.map(p => p.status))].sort(), [...PROJECT_STATES].sort())
  assert.equal(rows.filter(p => p.status === 'CLOSED').length, 2)
  assert.deepEqual([0, 1, 2, 3].map(i => evaluationProgress(rows.find(p => p.id === `V16-EVALUATION-${i}`)).label), ['0/3', '1/3', '2/3', '3/3'])
  assert.ok(rows.every(p => Object.values(p.closure?.evaluations || {}).every(e => e.reviewRound === 1)))
  const original = values.get(FOUNDATION_DEMO_KEY)
  initializeFoundationDemo(storage)
  assert.equal(values.get(FOUNDATION_DEMO_KEY), original)
  const p = rows.find(p => p.status === 'DRAFT'), c = command(p, 'save_proposal', { proposal: { projectTitle: 'local changed' } })
  dispatchFoundationDemo(p.id, c, 'demo-user', storage)
  assert.throws(() => dispatchFoundationDemo(p.id, c, 'demo-user', storage), error('DUPLICATE_ACTION'))
  assert.equal(readFoundationProjects(storage).find(r => r.id === p.id).title, 'local changed')
  readFoundationDemo(p.id, 'demo-user', { type: 'project' }, storage)
  assert.equal(values.get('mfu-interactive-demo-v1-projects'), 'legacy bytes unchanged')
  assert.equal(values.get('real-projects'), 'real bytes unchanged')
  values.set(FOUNDATION_DEMO_KEY, 'broken original')
  assert.throws(() => initializeFoundationDemo(storage))
  assert.equal(values.get(FOUNDATION_DEMO_KEY), 'broken original')
})

test('packaged server foundation is byte-identical to the shared source contract', () => {
  for (const name of ['contracts', 'permissions', 'model', 'actions', 'migration', 'localDemoPolicy']) {
    assert.deepEqual(readFileSync(new URL(`../functions/domain/src/domain/${name}.js`, import.meta.url)), readFileSync(new URL(`../src/domain/${name}.js`, import.meta.url)), name)
  }
})
