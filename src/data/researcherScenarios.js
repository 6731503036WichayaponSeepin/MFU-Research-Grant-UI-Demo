import { refineDemoProject } from './researchDemoProfiles.js'
import { createFoundationFixtures, foundationContext } from './foundationDemo.js'
import { executeProjectAction } from '../domain/actions.js'
export function createResearcherScenarios() {
  const rows = createFoundationFixtures()
  return [['V16-STAFF', 'V16-CORRECTION', 'request_proposal_revision', { notes: 'โปรดปรับชื่อเรื่องและอธิบายวิธีเก็บข้อมูลให้ชัดเจน พร้อมแนบเอกสารฉบับแก้ไข', editableSections: ['projectTitle', 'methodology', 'supportingDocuments'] }],
    ['V16-ACTIVE', 'V16-PUBLICATION-ACTIVE', null, {}], ['V16-DRAFT', 'V16-OTHER-OWNER', null, {}],
    ['V16-CLOSURE', 'V16-CLOSURE-MORE', 'request_closure_documents', { notes: 'โปรดแนบภาคผนวกเครื่องมือวิจัยและรายละเอียดการเผยแพร่เพิ่มเติม' }]].map(([source, id, action, payload]) => {
    const p = structuredClone(rows.find(p => p.id === source)); p.id = id
    for (const e of p.statusHistory) e.projectId = id
    for (const n of p.notifications) n.projectId = id
    if (p.signatureConsent) p.signatureConsent.projectId = id
    if (p.proposalSubmission?.consent) p.proposalSubmission.consent.projectId = id
    for (const version of p.proposalVersions) for (const submission of version.submissions || []) if (submission.consent) submission.consent.projectId = id
    p.fixtureSetup = { synthetic: true, reason: 'ข้อมูลสมมติสำหรับแก้ไขข้อเสนอและส่งเอกสารประกอบเพิ่มเติม ไม่ใช่การดำเนินการจริง' }
    if (!action) { if (id === 'V16-OTHER-OWNER') { p.ownerUid = 'demo-other-researcher'; p.ownerUsername = p.ownerUid } return refineDemoProject(p) }
    return refineDemoProject(executeProjectAction(p, { id: `setup-${id}`, action, payload, expectedVersion: p._version }, foundationContext('demo-staff')))
  })
}
