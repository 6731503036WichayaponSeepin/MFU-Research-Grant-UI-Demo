import { isPdfAttachment } from './pdfAttachment.js'
export const evaluationTitle = 'แบบประเมินผล (ร่าง) รายงานวิจัยฉบับสมบูรณ์'
export const evaluationSections = ['1. การประเมินผลด้านผลผลิต', '2. ข้อเสนอแนะ และความคิดเห็นเพิ่มเติมด้านการนำผลงานวิจัยไปใช้ประโยชน์', '3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป', '4. สรุปผลการประเมินร่างรายงานวิจัยฉบับสมบูรณ์']
export const utilizationDetails = ['โปรดระบุหัวข้อวิจัย และคำแนะนำ', 'ได้แก่', null, 'เนื่องจาก', 'โปรดระบุ']
export const explanationLabel = key => ['objectives','consistency'].includes(key) ? 'เนื่องจาก' : 'ควรปรับปรุงแก้ไข (ระบุ)'
export const evaluationQuestions = [
  ['objectives', '1.1 การวิจัยบรรลุวัตถุประสงค์ของโครงการวิจัยหรือไม่', ['บรรลุวัตถุประสงค์ตามที่กำหนดไว้', 'บรรลุวัตถุประสงค์เพียงบางส่วน', 'ไม่บรรลุวัตถุประสงค์ตามที่กำหนดไว้']],
  ['consistency', '1.2 ผลการดำเนินงานเป็นไปตามข้อเสนอโครงการวิจัยหรือไม่', ['เป็นไปตามข้อเสนอโครงการวิจัย', 'เป็นไปตามข้อเสนอโครงการวิจัยเพียงบางส่วน', 'ไม่เป็นไปตามข้อเสนอโครงการวิจัย']],
  ['abstract', '1.3 บทคัดย่อ มีความสมบูรณ์ ครอบคลุมครบถ้วน ทั้งทางด้านเนื้อหา ภาษาที่ใช้', ['บทคัดย่อมีความสมบูรณ์ ครอบคลุมครบถ้วน ภาษาที่ใช้เหมาะสม', 'ควรปรับปรุงแก้ไข']],
  ['executive', '1.4 บทสรุปผู้บริหาร มีความสมบูรณ์ ครอบคลุมครบถ้วน ทั้งทางด้านเนื้อหา ภาษาที่ใช้', ['บทสรุปผู้บริหารมีความสมบูรณ์ ครอบคลุมครบถ้วน ภาษาที่ใช้เหมาะสม', 'ควรปรับปรุงแก้ไข']],
]
export const utilizationOptions = ['ควรวิจัยเพิ่มเติม', 'ถ่ายทอดแก่ผู้ใช้ / ชุมชน', 'จดสิทธิบัตร / ลิขสิทธิ์', 'ยุติการวิจัยแนวนี้', 'อื่น ๆ']
export const evaluationResults = ['รับรองด้านคุณภาพรายงานวิจัยฉบับสมบูรณ์ โดยไม่มีการแก้ไข', 'รับรองด้านคุณภาพรายงานวิจัยฉบับสมบูรณ์ แต่ควรปรับปรุงแก้ไข ตามข้อเสนอแนะเพื่อให้สมบูรณ์ยิ่งขึ้น', 'ไม่รับรอง']
export const narrativeFields = [['chapters','1.5 ข้อเสนอแนะเพื่อปรับปรุงแก้ไขร่างรายงานวิจัยฉบับสมบูรณ์ ในแต่ละบท'], ['outputs','1.6 ผลผลิต/ สิ่งที่ได้จากการวิจัย'], ['strengths','1.7 จุดเด่นของผลงานวิจัย'], ['future','3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป']]
export const assignedReviewers = c => c?.reviewers || (c?.reviewer ? [c.reviewer] : [])
export const allEvaluationsSubmitted = c => assignedReviewers(c).length > 0 && assignedReviewers(c).every(id => c.evaluations?.[id]?.submitted)
export function validateEvaluation(data) {
  if(data.additionalComments !== undefined && (typeof data.additionalComments !== 'string' || data.additionalComments.length>5000))throw new Error('ความคิดเห็นเพิ่มเติมต้องเป็นข้อความไม่เกิน 5,000 ตัวอักษร')
  for (const [key, label, options] of evaluationQuestions) {
    if (!options[data[key]] || !Number.isInteger(data[key])) throw new Error(`กรุณาเลือก ${label}`)
    if (data[key] > 0 && !data[`${key}Detail`]?.trim()) throw new Error(`กรุณาระบุเหตุผล / ข้อเสนอแนะ ${label}`)
  }
  if (!Number.isInteger(data.result) || !evaluationResults[data.result]) throw new Error('กรุณาเลือกผลประเมิน')
  if (data.result === 2 && !data.reason?.trim()) throw new Error('กรุณาระบุเหตุผลที่ไม่รับรอง')
  for (const key of Object.keys(data.utilization || {})) {
    if (!utilizationOptions[key]) throw new Error('Invalid utilization option')
    if (utilizationDetails[key] && !data.utilization[key]?.trim()) throw new Error('กรุณาระบุรายละเอียดการใช้ประโยชน์')
  }
  if (data.documents?.some(d => !isPdfAttachment(d))) throw new Error('Invalid feedback PDF')
}
