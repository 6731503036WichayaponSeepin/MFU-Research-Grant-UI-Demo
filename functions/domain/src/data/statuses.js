import { PROJECT_STATES } from '../domain/contracts.js'
export { PROJECT_STATES, TRANSITIONS } from '../domain/contracts.js'

// Compatibility presentation for legacy records only. Not a v1.6 transition contract.
export const workflow = [
  ['draft', 'ร่างข้อเสนอโครงการ', 'Draft Proposal'],
  ['unit_review', 'รอส่วนงานต้นสังกัดพิจารณา', 'Pending Unit Review'],
  ['eoffice_pending', 'รอส่งข้อเสนอผ่าน e-Office', 'Pending e-Office'],
  ['admin_review', 'รอส่วนบริหารงานวิจัยตรวจสอบ', 'Pending Research Administration Review'],
  ['committee_review', 'รอเสนอคณะกรรมการเพื่อทราบและรับรองโครงการ', 'Pending Committee Record'],
  ['active', 'ดำเนินการวิจัย', 'Active Research'],
  ['final_report', 'ส่งผลงานเพื่อปิดโครงการ', 'Final Research Outputs'],
  ['closure_review', 'รอตรวจสอบและประเมินเอกสารปิดโครงการ', 'Closure Review'],
  ['completed', 'ปิดโครงการแล้ว', 'Completed']
]
export const normalizeStatus = status => ({ submitted: 'unit_review', review: 'admin_review', closure: 'closure_review' })[status] || status
export const statusConfig = Object.fromEntries(workflow.map(([key, th, en], step) => [key, { th, en, step }]))
statusConfig.revision_required = { th: 'มีประเด็นต้องแก้ไข', en: 'Revision Required', step: 3 }
for (const key of ['submitted', 'review', 'closure']) statusConfig[key] = statusConfig[normalizeStatus(key)]
export const statusLabels = Object.fromEntries(Object.entries(statusConfig).map(([key, value]) => [key, [value.th, value.en]]))
export const timelineSteps = workflow.map(([, th, en]) => [th, en])
const canonicalLabels = [
  ['ร่างข้อเสนอโครงการ', 'Draft Proposal'], ['รอต้นสังกัดพิจารณา', 'Affiliation Review'],
  ['รอเจ้าหน้าที่ตรวจสอบ', 'Staff Review'], ['รอเสนอคณะกรรมการเพื่อทราบ', 'Committee Acknowledgement'],
  ['ดำเนินการวิจัย', 'In Progress'], ['รอตรวจเอกสารปิดโครงการ', 'Closure Review'],
  ['อยู่ระหว่างประเมินรายงาน', 'Report Evaluation'], ['ปิดโครงการแล้ว', 'Closed'], ['ยกเลิกโครงการ', 'Cancelled'],
]
export const projectStateLabels = Object.freeze(Object.fromEntries(PROJECT_STATES.map((s, i) => [s, Object.freeze({ th: canonicalLabels[i][0], en: canonicalLabels[i][1] })])))
export const statusLabel = (status, language = 'th') => (projectStateLabels[status] || statusConfig[status])?.[language === 'en' ? 'en' : 'th'] || (language === 'en' ? 'Unknown status' : 'ไม่ทราบสถานะ')
