import { isPdfAttachment } from './pdfAttachment.js'
export const evaluationTitle = 'แบบประเมินผล (ร่าง) รายงานวิจัยฉบับสมบูรณ์'
export const EVALUATION_RUBRIC_VERSION='SOURCE-DRAFT-2026-11'
export const evaluationInstruction='(กรณีที่มีข้อเสนอแนะมาก สามารถ upload ไฟล์ข้อเสนอแนะเพิ่มได้)'
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
export const evaluationOptionLabels=evaluationQuestions.map(([key,,options])=>options.map((label,i)=>label+(i>0?(['objectives','consistency'].includes(key)?' เนื่องจาก':' (ระบุ)'):'')))
evaluationOptionLabels[1][1]='เป็นไปตามข้อเสนอโครงการวิจัย เพียงบางส่วน เนื่องจาก'
export const utilizationFormOptions=['2.1 ควรวิจัยเพิ่มเติม (โปรดระบุหัวข้อวิจัย และคำแนะนำ)','2.2 ถ่ายทอดแก่ผู้ใช้ / ชุมชน ได้แก่','2.3 จดสิทธิบัตร / ลิขสิทธิ์','2.4 ยุติการวิจัยแนวนี้ เนื่องจาก','2.5 อื่น ๆ (โปรดระบุ)']
export const resultFormOptions=evaluationResults.map((value,i)=>value+(i===2?' เนื่องจาก':''))
export const narrativeFields = [['chapters','1.5 ข้อเสนอแนะเพื่อปรับปรุงแก้ไขร่างรายงานวิจัยฉบับสมบูรณ์ ในแต่ละบท'], ['outputs','1.6 ผลผลิต/ สิ่งที่ได้จากการวิจัย'], ['strengths','1.7 จุดเด่นของผลงานวิจัย'], ['future','3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป']]
export const assignedReviewers = c => c?.reviewers || (c?.reviewer ? [c.reviewer] : [])
export const allEvaluationsSubmitted = c => assignedReviewers(c).length > 0 && assignedReviewers(c).every(id => c.evaluations?.[id]?.submitted)
export function cleanEvaluationAnswers(data={}){
 const out={...data}
 for(const [key]of evaluationQuestions)if(!(Number.isInteger(out[key])&&out[key]>0))delete out[key+'Detail']
 if(out.result!==2)delete out.reason
 delete out.additionalComments
 if(out.utilization&&typeof out.utilization==='object'&&!Array.isArray(out.utilization))out.utilization=Object.fromEntries(Object.entries(out.utilization).map(([key,value])=>[key,utilizationDetails[key]?value:'']))
 return out
}
export function evaluationDocumentRows(source={}){
 const data=cleanEvaluationAnswers(source),rows=[[evaluationSections[0],'']]
 for(const [i,[key,label]]of evaluationQuestions.entries()){
  rows.push([label,evaluationOptionLabels[i][data[key]]||'—'])
  if(data[key]>0&&data[key+'Detail'])rows.push([i<2?'เนื่องจาก':'ระบุ',data[key+'Detail']])
 }
 for(const [key,label]of narrativeFields.slice(0,3))rows.push([label,data[key]||'—'])
 rows.push([evaluationSections[1],''])
 for(const [i,label]of utilizationFormOptions.entries())rows.push([label,Object.hasOwn(data.utilization||{},i)?(utilizationDetails[i]?data.utilization[i]:'เลือก / Selected'):'ไม่ได้เลือก / Not selected'])
 rows.push([narrativeFields[3][1],data.future||'—'],[evaluationSections[3],resultFormOptions[data.result]||'—'])
 if(data.result===2&&data.reason)rows.push(['เนื่องจาก',data.reason])
 return rows
}
export function evaluationFieldErrors(data={}){
 const errors=[],add=(field,message)=>errors.push({field,message})
 for(const [key,label,options]of evaluationQuestions){
  if(!Number.isInteger(data[key])||!options[data[key]])add(key,`กรุณาเลือก ${label}`)
  else if(data[key]>0&&(typeof data[key+'Detail']!=='string'||!data[key+'Detail'].trim()))add(key+'Detail',`กรุณาระบุเหตุผล / ข้อเสนอแนะ ${label}`)
 }
 for(const key of Object.keys(data.utilization||{})){
  if(!/^[0-4]$/.test(key))add('utilization','Invalid utilization option')
  else if(utilizationDetails[key]&&(typeof data.utilization[key]!=='string'||!data.utilization[key].trim()))add('utilization-'+key,'กรุณาระบุรายละเอียดการใช้ประโยชน์')
 }
 if(!Number.isInteger(data.result)||!evaluationResults[data.result])add('result','กรุณาเลือกผลประเมิน')
 else if(data.result===2&&(typeof data.reason!=='string'||!data.reason.trim()))add('reason','กรุณาระบุเหตุผลที่ไม่รับรอง')
 return errors
}
export function validateEvaluation(data) {
  const errors=evaluationFieldErrors(data);if(errors.length)throw Object.assign(new Error(errors[0].message),{field:errors[0].field,fieldErrors:errors})
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
