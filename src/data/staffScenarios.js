import { refineDemoProject } from './researchDemoProfiles.js'
import { createFoundationFixtures, foundationContext } from './foundationDemo.js'
import { executeProjectAction } from '../domain/actions.js'
import { demoDocument } from './demoAttachment.js'
export function createStaffScenarios() {
  const rows = createFoundationFixtures()
  let seq = 0
  const act = (p, action, payload = {}, uid = 'demo-staff') => executeProjectAction(p, { id: `staff-setup-${++seq}`, action, payload, expectedVersion: p._version }, foundationContext(uid))
  const clone = (source, id) => {
    const p = structuredClone(rows.find(p => p.id === source)); p.id = id
    for (const e of p.statusHistory) e.projectId = id
    for (const n of p.notifications) n.projectId = id
    for (const a of p.closure?.assignments || []) { a.id = `${id}-${a.reviewerId}`; if (p.closure.evaluations[a.reviewerId]) p.closure.evaluations[a.reviewerId].assignmentId = a.id }
    p.fixtureSetup = { synthetic: true, reason: 'ข้อมูลสมมติสำหรับตรวจเอกสารปิดโครงการ ติดตามผลประเมิน และตรวจรายงานฉบับแก้ไข ไม่ใช่การดำเนินการจริง' }
    if (p.signatureConsent) p.signatureConsent.projectId = id
    if (p.proposalSubmission?.consent) p.proposalSubmission.consent.projectId = id
    for (const version of p.proposalVersions) for (const submission of version.submissions || []) if (submission.consent) submission.consent.projectId = id
    return p
  }
  let publication = clone('V16-ACTIVE', 'V16-PUBLICATION-REVIEW')
  for (const kind of ['summary_report', 'publication']) publication = act(publication, 'attach_document', { document: { ...demoDocument, id: `staff-fixture-${kind}`, kind, version: 1 } }, 'demo-user')
  publication = act(publication, 'submit_closure', { method: 'publication', summary: 'สรุปผลการศึกษาและบทความวิจัยที่เผยแพร่พร้อมหลักฐานประกอบ', finishedDate: '2026-11-15', documentIds: ['staff-fixture-summary_report', 'staff-fixture-publication'] }, 'demo-user')
  let final = clone('V16-RELEASED', 'V16-FINAL-VERIFY')
  final = act(final, 'attach_document', { document: { ...demoDocument, id: 'staff-fixture-revised', kind: 'revised_report', version: 1 } }, 'demo-user')
  final = act(final, 'submit_revised_report', { documentIds: ['staff-fixture-revised'], confirmed: true }, 'demo-user')
  let draft = clone('V16-EVALUATION-0', 'V16-EVALUATION-DRAFT')
  draft = act(draft, 'save_evaluation', { evaluation: { chapters: 'ร่างข้อเสนอแนะ: เพิ่มเติมการอภิปรายผลและข้อจำกัดของการศึกษา' } }, 'demo-reviewer-1')
  return [publication, final, draft, clone('V16-CLOSURE', 'V16-REPORT-ASSIGN')].map(refineDemoProject)
}
