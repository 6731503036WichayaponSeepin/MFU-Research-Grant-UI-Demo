import { useState } from 'react'
import { evaluationTitle, evaluationSections, evaluationQuestions, narrativeFields, explanationLabel, utilizationOptions, utilizationDetails, validateEvaluation } from '../utils/evaluation'
import { reviewOutcomeInfo } from '../utils/reviewerPresentation'
import { EvaluationDetails } from '../pages/ReviewerEvaluation'

const steps = ['รับงาน', 'อ่านรายงานตัวอย่าง', 'กรอกแบบประเมิน', 'เลือกผลประเมิน', 'ตรวจทานและจำลองส่ง']
const sample = {
  objectives:0, consistency:0, abstract:1, executive:1,
  abstractDetail:'เพิ่มจำนวนตัวอย่างทดสอบและระบุว่าผลใช้สำหรับคัดกรองเบื้องต้นเท่านั้น',
  executiveDetail:'เพิ่มข้อจำกัดเรื่องฤดูกาลและพื้นที่ ก่อนเสนอแนวทางถ่ายทอดแก่เกษตรกร',
  chapters:'บทที่ 3 เพิ่มตารางจำนวนภาพแยกตามประเภทและแปลง บทที่ 4 เพิ่ม confusion matrix และช่วงความเชื่อมั่น เพื่อให้ตรวจสอบความน่าเชื่อถือได้',
  outputs:'ชุดข้อมูลภาพใบชาสมมติ 1,200 ภาพ แบบจำลองต้นแบบ และแนวทางถ่ายภาพสำหรับทดสอบภาคสนาม',
  strengths:'ปัญหาวิจัยชัดเจน เชื่อมโยงบริบทพื้นที่ และแยกต้นชาระหว่างชุดข้อมูลเพื่อลดข้อมูลรั่วไหล',
  future:'เก็บข้อมูลต่างฤดูกาลและทดสอบกับแปลงใหม่ร่วมกับผู้เชี่ยวชาญโรคพืช',
}
const report = [
  ['บทคัดย่อ','ศึกษาการจำแนกใบชาปกติ โรคใบจุด และโรคใบไหม้จากภาพถ่ายสมมติ 1,200 ภาพ เพื่อคัดกรองอาการเบื้องต้น ผลทดสอบได้ความถูกต้องร้อยละ 88 และ macro-F1 เท่ากับ 0.86 ยังไม่ใช่เครื่องมือวินิจฉัยโรคสำหรับใช้งานจริง'],
  ['วัตถุประสงค์','จัดทำชุดภาพที่ตรวจสอบประเภทโดยผู้เชี่ยวชาญ พัฒนาแบบจำลองจำแนกอาการ และประเมินข้อจำกัดก่อนถ่ายทอดให้เกษตรกร'],
  ['วิธีวิจัย','ข้อมูลสมมติจากแปลงชา 4 แปลง แบ่งชุดฝึก ตรวจสอบ และทดสอบ 70:15:15 โดยแยกต้นชาไม่ให้ซ้ำระหว่างชุด เปรียบเทียบแบบจำลองพื้นฐานกับ MobileNetV2 บนชุดทดสอบ 180 ภาพที่ไม่ผ่านการเพิ่มข้อมูล'],
  ['ผลการศึกษา','แบบจำลองพื้นฐานถูกต้องร้อยละ 76 และ MobileNetV2 ร้อยละ 88 ตรวจพบโรคใบจุดได้ดีที่สุด ความผิดพลาดส่วนใหญ่เกิดระหว่างโรคใบไหม้กับความเสียหายจากแสง ภาพในที่ร่มให้ผลดีกว่าภาพย้อนแสง'],
  ['อภิปรายผลและข้อจำกัด','ข้อมูลมาจากฤดูเดียว ยังไม่ทดสอบในพื้นที่ภายนอก รายงานขาดจำนวนภาพแยกตามประเภทและช่วงความเชื่อมั่น จึงยังสรุปไม่ได้ว่าใช้ได้กับทุกแปลง ควรเพิ่มหลักฐานเหล่านี้ในรายงานฉบับแก้ไข'],
  ['ผลผลิตและการใช้ประโยชน์','ได้ชุดข้อมูลสมมติและหน้าจอต้นแบบ เสนอให้ทดลองร่วมกับผู้เชี่ยวชาญโรคพืชในฤดูถัดไป พร้อมคู่มือถ่ายภาพและคำเตือนให้ตรวจยืนยันก่อนจัดการแปลง'],
]

export default function ReviewerDemoPreview({open,onClose}) {
  const [step,setStep]=useState(0),[form,setForm]=useState({utilization:{},documents:[]})
  const [error,setError]=useState(''),[message,setMessage]=useState('')
  const [confirming,setConfirming]=useState(false),[submitted,setSubmitted]=useState(false)
  function update(key,value){setForm(previous=>({...previous,[key]:value}));setError('');setMessage('');setConfirming(false)}
  function go(next){setError('');setMessage('');setConfirming(false);if(next===4){try{validateEvaluation(form)}catch(err){setError(err.message);return}}setStep(next)}
  function fill(){setForm(previous=>{const next={...previous};for(const [key,value] of Object.entries(sample))if(next[key]===undefined||next[key]==='')next[key]=value;return next});setMessage('เติมตัวอย่างในช่องว่างแล้ว สามารถแก้ไขข้อความได้');setError('')}
  if(!open)return null
  return <section className="panel cl-card review-demo-preview" aria-label="Reviewer Demo Preview">
    <div className="review-result-heading"><h2>ทดลองประเมิน</h2><button type="button" onClick={onClose}>ปิดตัวอย่าง</button></div>
    <p className="review-demo-note">DEMO PREVIEW — ข้อมูลสมมติ ไม่บันทึกลง Firebase</p>
    <p>ข้อมูลอยู่ในหน่วยความจำของหน้านี้เท่านั้น ย้อนกลับหรือปิดตัวอย่างแล้วเปิดต่อได้ แต่รีเฟรชหรือออกจาก Dashboard แล้วข้อมูลจะหาย</p>
    <nav className="review-demo-steps" aria-label="ขั้นตอนทดลองประเมิน">{steps.map((label,index)=><button type="button" key={label} aria-current={step===index?'step':undefined} disabled={submitted} onClick={()=>go(index)}>{index+1}. {label}</button>)}</nav>
    <h3>MFU-ADVISOR-V1-C01 · การจำแนกโรคใบชา</h3>
    {submitted?<div role="status"><h3>จำลองส่งสำเร็จ</h3><p>แสดงผลเฉพาะบนหน้าจอ ไม่ส่งถึงเจ้าหน้าที่ ไม่เปลี่ยนสถานะโครงการหรือขั้นตอนทั้ง 9 ระยะ</p><EvaluationDetails preview evaluation={{...form,submitted:true,date:new Date().toISOString().slice(0,10)}}/><button type="button" onClick={()=>{setSubmitted(false);setStep(2)}}>กลับไปทดลองแก้ไข</button><button type="button" onClick={()=>{setSubmitted(false);setStep(0);setForm({utilization:{},documents:[]});setMessage('');setError('')}}>เริ่มใหม่</button></div>:<>
      <h3>{step+1}. {steps[step]}</h3>
      {step===0&&<><p>หัวหน้าโครงการ: ดร. ณิชา ใจดี (บุคคลสมมติ)</p><p>เจ้าหน้าที่สมมติมอบหมายรายงานฉบับสมบูรณ์ให้ประเมินภายใน 14 วันหลังรับงาน เริ่มจากอ่านรายงาน ให้ข้อเสนอแนะตามเกณฑ์ แล้วเลือกผลประเมิน</p><button type="button" className="primary" onClick={()=>go(1)}>รับงานตัวอย่างและอ่านรายงาน</button></>}
      {step===1&&<article className="review-demo-report"><p>รายงานย่อสมมติสำหรับฝึกประเมิน ตัวเลขต่อไปนี้ไม่ใช่ผลวิจัยจริง</p>{report.map(([title,text])=><section key={title}><h4>{title}</h4><p>{text}</p></section>)}</article>}
      {step===2&&<div className="cl-form review-evaluation-form"><h3>{evaluationTitle}</h3><button type="button" onClick={fill}>เติมข้อเสนอแนะตัวอย่างในช่องว่าง</button><h4>{evaluationSections[0]}</h4>{evaluationQuestions.map(([key,label,options])=><fieldset className="review-question" key={key}><legend>{label} *</legend><div className="review-options">{options.map((option,index)=><label key={option}><input type="radio" name={'demo-'+key} checked={form[key]===index} onChange={()=>update(key,index)}/>{option}</label>)}</div><label>{form[key]>0?explanationLabel(key)+' *':'ข้อคิดเห็นเพิ่มเติม'}<textarea rows={3} value={form[key+'Detail']||''} onChange={event=>update(key+'Detail',event.target.value)}/></label></fieldset>)}{narrativeFields.slice(0,3).map(([key,label])=><label key={key}>{label}<textarea rows={3} value={form[key]||''} onChange={event=>update(key,event.target.value)}/></label>)}<h4>{evaluationSections[1]}</h4>{utilizationOptions.map((label,index)=><div className="review-utilization" key={label}><label><input type="checkbox" checked={Object.hasOwn(form.utilization,index)} onChange={event=>{const next={...form.utilization};if(event.target.checked)next[index]='';else delete next[index];update('utilization',next)}}/>{label}</label>{Object.hasOwn(form.utilization,index)&&utilizationDetails[index]&&<label>{utilizationDetails[index]} *<textarea value={form.utilization[index]} onChange={event=>update('utilization',{...form.utilization,[index]:event.target.value})}/></label>}</div>)}<label>{evaluationSections[2]}<textarea rows={3} value={form.future||''} onChange={event=>update('future',event.target.value)}/></label><button type="button" onClick={()=>setMessage('เก็บร่างไว้ในหน้านี้แล้ว — ไม่บันทึกลง Firebase')}>เก็บร่างในหน้านี้</button></div>}
      {step===3&&<div className="cl-form review-overall">{reviewOutcomeInfo.map((outcome,index)=><label key={outcome.label}><input type="radio" name="demo-result" checked={form.result===index} onChange={()=>update('result',index)}/><span><strong>{outcome.label}</strong><small>{outcome.description}</small></span></label>)}{form.result===2&&<label>เหตุผลที่ให้แก้ไขและส่งใหม่ *<textarea rows={3} value={form.reason||''} onChange={event=>update('reason',event.target.value)} placeholder="ระบุหลักฐานที่ยังขาดและข้อเสนอแนะในการแก้ไข"/></label>}</div>}
      {step===4&&<><p>ตรวจทานคำตอบ หรือย้อนกลับเพื่อแก้ไขก่อนจำลองส่ง</p><EvaluationDetails preview evaluation={{...form,submitted:true,date:new Date().toISOString().slice(0,10)}}/>{confirming?<div className="review-confirmation" role="group" aria-label="ยืนยันจำลองส่ง"><h4>ยืนยันจำลองส่งผลประเมิน?</h4><p>ไม่มีการติดต่อ Firebase หรือส่งถึงเจ้าหน้าที่</p><button type="button" className="primary" onClick={()=>{try{validateEvaluation(form);setSubmitted(true);setConfirming(false)}catch(err){setError(err.message)}}}>ยืนยันจำลองส่ง</button><button type="button" onClick={()=>setConfirming(false)}>ยกเลิก</button></div>:<button type="button" className="primary" onClick={()=>setConfirming(true)}>จำลองส่งผลประเมิน</button>}</>}
      {error&&<p role="alert" className="review-demo-note">{error}</p>}{message&&<p role="status">{message}</p>}
      <div className="review-demo-actions">{step>0&&<button type="button" onClick={()=>go(step-1)}>ย้อนกลับ</button>}{step>0&&step<4&&<button type="button" className="primary" onClick={()=>go(step+1)}>{step===3?'ตรวจทานคำตอบ':'ถัดไป'}</button>}</div>
    </>}
  </section>
}
