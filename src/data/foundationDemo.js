import { demoNames, demoAffiliations, refineDemoProject } from './researchDemoProfiles.js'
import { executeProjectAction } from '../domain/actions.js'
import { clone } from '../domain/model.js'
import { demoDocument } from './demoAttachment.js'

export const FOUNDATION_DEMO_WORKSPACE = 'local-demo-v16'
export const foundationActors = Object.freeze(Object.fromEntries([
  ['demo-user', 'researcher'], ['demo-staff', 'staff'],
  ['demo-reviewer-1', 'reviewer'], ['demo-reviewer-2', 'reviewer'], ['demo-reviewer-3', 'reviewer'],
].map(([uid, role]) => [uid, Object.freeze({ uid, username: uid, displayName: demoNames[uid], affiliation: demoAffiliations[uid], role, workspace: FOUNDATION_DEMO_WORKSPACE, active: true, simulation: true })])))
export const foundationContext = uid => ({ mode: 'local-demo', actor: foundationActors[uid], profiles: foundationActors, now: '2026-11-15T03:00:00.000Z' })
const proposal = { projectTitle: 'การพัฒนาบรรจุภัณฑ์ย่อยสลายได้จากกากกาแฟอาราบิกา', leaderName: demoNames['demo-user'], objectives: 'ศึกษาข้อมูลสมมติ',
  methodology: 'ใช้ข้อมูลสังเคราะห์', startDate: '2026-01-01', endDate: '2027-01-01', compensation: 1000 }

export function createFoundationFixtures() {
  let sequence = 0
  const act = (p, action, payload = {}, uid = 'demo-staff') => executeProjectAction(p,
    { id: `fixture-command-${++sequence}`, action, payload, expectedVersion: p?._version || 0 }, foundationContext(uid))
  const snapshot = (p, id) => ({ ...clone(p), id, fictional: true, simulationOnly: true, fixtureVersion: '1.6' })
  let p = act(null, 'create_project', { projectId: 'V16-DRAFT', proposal }, 'demo-user')
  const rows = [snapshot(p, 'V16-DRAFT')]
  // OPEN-04 prevents executing TR-03. This labelled setup is synthetic, not an alleged approval event.
  p = snapshot(p, 'V16-AFFILIATION')
  p.status = 'AFFILIATION_REVIEW'
  p.proposalVersions.push({ id: 'mock-ready', version: 2, kind: 'ready', proposal: clone(p.proposal), createdBy: 'fixture-setup', createdAt: p.createdAt })
  p.fixtureSetup = { synthetic: true, state: p.status, notExecutedTransition: 'TR-03', reason: 'OPEN-04; supplied scenario snapshot only' }
  p.statusHistory.push({ id: 'fixture-affiliation-setup', projectId: p.id, action: 'fixture_snapshot', transitionRule: null, previousStatus: null, newStatus: p.status, status: p.status, updatedBy: 'fixture-setup', updatedAt: p.createdAt, role: 'researcher', note: 'Synthetic setup, not TR-03 execution' })
  const attach = (kind, uid = 'demo-user') => { const id = `fixture-doc-${++sequence}`; p = act(p, 'attach_document', { document: { ...demoDocument, id, kind, version: 1, ...(['signed_rs1', 'affiliation_evidence'].includes(kind) ? { proposalVersionId: p.proposalVersions.at(-1).id } : {}) } }, uid); return id }
  const signed = attach('signed_rs1'), affiliation = attach('affiliation_evidence')
  rows.push(snapshot(p, 'V16-AFFILIATION'))
  p = act(p, 'submit_proposal', { proposalVersionId: 'mock-ready', documentIds: [signed, affiliation], signaturesComplete: true, usesOthersElectronicSignatures: false }, 'demo-user')
  rows.push(snapshot(p, 'V16-STAFF'))
  p = act(p, 'pass_proposal', { confirmed: true })
  rows.push(snapshot(p, 'V16-COMMITTEE'))
  p = act(p, 'record_acknowledgement', { reference: 'อว 7700/2569/041', date: '2026-11-15', acknowledged: true })
  p = act(p, 'certify_project', { reference: 'มฟล. วจ. 2569/018', confirmed: true })
  rows.push(snapshot(p, 'V16-ACTIVE'))
  const cancelled = snapshot(p, 'V16-CANCELLED')
  cancelled.status = 'CANCELLED'; cancelled.fixtureSetup = { synthetic: true, notExecutedTransition: 'TR-17', reason: 'OPEN-20; read-only terminal-state scenario' }
  cancelled.cancellation = { projectId: cancelled.id, previousState: 'IN_PROGRESS', reason: 'OTHER', details: 'หัวหน้าโครงการย้ายสถานที่ปฏิบัติงานและไม่สามารถดำเนินการต่อได้ (สถานการณ์สมมติ สิทธิ์ยกเลิกยังรอยืนยัน)', documentIds: [], cancelledBy: 'fixture-setup', cancelledAt: p.updatedAt }
  cancelled.statusHistory.push({ id: 'fixture-cancel-setup', projectId: cancelled.id, action: 'fixture_snapshot', transitionRule: null, previousStatus: null, newStatus: 'CANCELLED', status: 'CANCELLED', updatedBy: 'fixture-setup', updatedAt: p.updatedAt, role: 'staff', note: 'Synthetic setup, cancellation permission is not enabled' })
  rows.push(cancelled)
  const active = clone(p)
  const report = attach('report')
  p = act(p, 'submit_closure', { method: 'report', summary: 'ข้อมูลสมมติ', finishedDate: '2026-11-15', documentIds: [report] }, 'demo-user')
  rows.push(snapshot(p, 'V16-CLOSURE'))
  p = act(p, 'check_closure', { confirmed: true })
  p = act(p, 'assign_reviewers', { reviewerIds: ['demo-reviewer-1', 'demo-reviewer-2', 'demo-reviewer-3'] })
  rows.push(snapshot(p, 'V16-EVALUATION-0'))
  for (let i = 1; i <= 3; i++) {
    p = act(p, 'submit_evaluation', { evaluation: { objectives: 0, consistency: 0, abstract: 0, executive: 0, result: 1, utilization: {}, chapters: 'ข้อเสนอแนะสมมติ' } }, `demo-reviewer-${i}`)
    rows.push(snapshot(p, `V16-EVALUATION-${i}`))
  }
  p = act(p, 'release_evaluations', { confirmed: true, notes: 'ส่งฉบับแก้ไขใน Web ไม่ประเมินซ้ำ' })
  rows.push(snapshot(p, 'V16-RELEASED'))
  const revised = attach('revised_report')
  p = act(p, 'submit_revised_report', { documentIds: [revised], confirmed: true }, 'demo-user')
  p = act(p, 'verify_revised_report', { confirmed: true, revisedReportVersionId: p.closure.revisedReportVersions.at(-1).id })
  p = act(p, 'close_report', { confirmed: true })
  rows.push(snapshot(p, 'V16-CLOSED-REPORT'))
  p = active
  const summary = attach('summary_report'), publication = attach('publication')
  p = act(p, 'submit_closure', { method: 'publication', summary: 'ผลงานเผยแพร่สมมติ', finishedDate: '2026-11-15', documentIds: [summary, publication] }, 'demo-user')
  p = act(p, 'check_closure', { confirmed: true })
  p = act(p, 'close_publication', { confirmed: true })
  rows.push(snapshot(p, 'V16-CLOSED-PUBLICATION'))
  // Give each clone internally consistent project/assignment/history identities.
  return rows.map(row => {
    for (const event of row.statusHistory) event.projectId = row.id
    for (const n of row.notifications) n.projectId = row.id
    if (row.signatureConsent) row.signatureConsent.projectId = row.id
    if (row.proposalSubmission?.consent) row.proposalSubmission.consent.projectId = row.id
    for (const version of row.proposalVersions) for (const submission of version.submissions || []) if (submission.consent) submission.consent.projectId = row.id
    for (const a of row.closure?.assignments || []) {
      a.id = `${row.id}-${a.reviewerId}`
      if (row.closure.evaluations[a.reviewerId]) row.closure.evaluations[a.reviewerId].assignmentId = a.id
    }
    return refineDemoProject(row)
  })
}
