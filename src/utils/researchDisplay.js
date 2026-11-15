import { PROJECT_STATES } from '../domain/contracts.js'
import { statusLabel } from '../data/statuses.js'
import { demoNames, demoDocumentNames, demoReference } from '../data/researchDemoProfiles.js'
export const actorName = id => demoNames[id] || id || '—'
export const projectReference = p => p?.referenceNumber || p?.code || demoReference(p?.id) || '—'
export function displayDate(value, language = 'th', time = false) {
  if (!value) return '—'
  const date = value.toDate ? value.toDate() : new Date(value)
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'th-TH', {dateStyle:'medium', ...(time ? {timeStyle:'short'} : {}),timeZone:'Asia/Bangkok'}).format(date) : '—'
}
const documentEnglish={signed_rs1:'Signed RS-1',affiliation_evidence:'Affiliation approval evidence',proposal_pdf:'RS-1 proposal PDF',rs1_source:'RS-1 source',report:'Five-chapter report',revised_report:'Revised report',summary_report:'Research summary',publication:'Publication evidence',feedback:'Reviewer feedback',support:'Supporting document'}
export const documentLabel = (kind, lang='th') => (lang==='en' ? documentEnglish[kind] : demoDocumentNames[kind]?.replaceAll('_',' ')) || kind
const actions = {
 create_project:['สร้างโครงการ','Project created'],save_proposal:['บันทึกข้อเสนอ','Proposal saved'],attach_document:['แนบเอกสาร','Document attached'],confirm_ready:['ยืนยันฉบับพร้อมยื่นต้นสังกัด','Proposal ready for affiliation'],submit_proposal:['ส่งข้อเสนอให้เจ้าหน้าที่','Proposal submitted'],request_proposal_revision:['แจ้งแก้ไขข้อเสนอ','Proposal correction requested'],resubmit_proposal:['ส่งข้อเสนอฉบับแก้ไข','Corrected proposal submitted'],pass_proposal:['ตรวจข้อเสนอผ่าน','Proposal checked'],record_acknowledgement:['บันทึกเสนอเพื่อทราบ','Committee acknowledgement recorded'],certify_project:['รับรองโครงการ','Project certified'],record_extension:['บันทึกผลขยายเวลา','Extension recorded'],record_project_change:['บันทึกผลเปลี่ยนแปลงโครงการ','Project change recorded'],save_closure_draft:['บันทึกร่างเอกสารปิดโครงการ','Closure draft saved'],submit_closure:['ยื่นเอกสารปิดโครงการ','Closure submitted'],request_closure_documents:['ขอเอกสารเพิ่มเติม','Additional documents requested'],supplement_closure:['ส่งเอกสารเพิ่มเติม','Supplemental documents submitted'],check_closure:['ตรวจเอกสารปิดโครงการ','Closure documents checked'],assign_reviewers:['มอบหมายผู้ทรงคุณวุฒิ','Reviewers assigned'],save_evaluation:['บันทึกร่างผลประเมิน','Evaluation draft saved'],submit_evaluation:['ส่งผลประเมิน','Evaluation submitted'],release_evaluations:['เปิดเผยผลประเมิน','Evaluations released'],submit_revised_report:['ส่งรายงานฉบับแก้ไข','Revised report submitted'],verify_revised_report:['ตรวจรายงานฉบับแก้ไข','Revised report verified'],close_report:['ปิดโครงการเส้นทางรายงาน','Report project closed'],close_publication:['ปิดโครงการเส้นทางเผยแพร่','Publication project closed'],cancel_project:['ยกเลิกโครงการ','Project cancelled'],fixture_snapshot:['จัดเตรียมสถานการณ์สมมติ','Fictional scenario prepared']}
export const eventLabel=(action,lang='th')=>actions[action]?.[lang==='en'?1:0] || action || '—'

// Format audit/record copies for display; never rewrite the underlying historical values.
export function recordDisplay(value, language='th') {
  if(Array.isArray(value)) return value.map(v=>recordDisplay(v,language))
  if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,recordDisplay(v,language)]))
  if(typeof value!=='string') return value
  if(PROJECT_STATES.includes(value)) return statusLabel(value,language)
  if(/^\d{4}-\d{2}-\d{2}T/.test(value)) return displayDate(value,language,true)
  return demoNames[value] || demoReference(value) || value
}

const sectionLabels={projectTitle:['ชื่อโครงการ','Project Title'],researcherInformation:['ข้อมูลนักวิจัย','Researcher Information'],coResearchers:['ผู้ร่วมวิจัย','Co-researcher Information'],advisor:['ที่ปรึกษา','Advisor Information'],researchDetails:['รายละเอียดการวิจัย','Research Details'],objectives:['วัตถุประสงค์','Objectives'],methodology:['วิธีดำเนินการวิจัย','Methodology'],researchScope:['ขอบเขตการวิจัย','Research Scope'],researchPlan:['แผนการวิจัย','Research Plan'],researchDuration:['ระยะเวลาวิจัย','Research Duration'],expectedOutcomes:['ผลที่คาดว่าจะได้รับ','Expected Outcomes'],budget:['งบประมาณ','Budget'],supportingDocuments:['เอกสารประกอบ','Supporting Documents']}
export const editableSectionLabel=(section,lang='th')=>sectionLabels[section]?.[lang==='en'?1:0] || section
