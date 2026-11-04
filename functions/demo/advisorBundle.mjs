import { jsPDF } from 'jspdf'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { advisorSpecs, advisorDocumentPlan, advisorEvaluation, ADVISOR_SEED, DEMO_MARK } from './advisorSpecs.mjs'
import { buildAdvisorProjects } from './advisorProjects.mjs'
import { evaluationQuestions, evaluationResults } from '../domain/src/utils/evaluation.js'
const regular=readFileSync(new URL('../../public/fonts/Sarabun-Regular.ttf',import.meta.url)).toString('base64')
const bold=readFileSync(new URL('../../public/fonts/Sarabun-Bold.ttf',import.meta.url)).toString('base64')
function renderDocument(spec,plan) {
  const doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true})
  doc.addFileToVFS('Sarabun-Regular.ttf',regular);doc.addFont('Sarabun-Regular.ttf','Sarabun','normal')
  doc.addFileToVFS('Sarabun-Bold.ttf',bold);doc.addFont('Sarabun-Bold.ttf','Sarabun','bold')
  doc.setCreationDate(new Date('2026-10-29T03:00:00.000Z'));doc.setFileId(createHash('md5').update(spec.id+plan.key).digest('hex'))
  doc.setProperties({title:spec.id+' '+plan.title,subject:DEMO_MARK,author:'MFU fictional demonstration',keywords:ADVISOR_SEED})
  let y=20
  const page=()=>{
    doc.setFont('Sarabun','bold');doc.setFontSize(10);doc.setTextColor(130,33,58)
    doc.text(DEMO_MARK,18,12);doc.setTextColor(35);y=23
  }
  page()
  const lines=(text,size=11.5,boldText=false)=>{
    doc.setFont('Sarabun',boldText?'bold':'normal');doc.setFontSize(size)
    for(const line of doc.splitTextToSize(String(text || '—'),174)){
      if(y>273){doc.addPage();page();doc.setFont('Sarabun',boldText?'bold':'normal');doc.setFontSize(size)}
      doc.text(line,18,y);y+=5
    }
    y+=1.5
  }
  const section=(title,text)=>{if(y>250){doc.addPage();page()}lines(title,13,true);lines(text)}
  lines(plan.title,18,true);lines(spec.title,15,true);lines(spec.titleEn,11)
  lines(`${spec.id} | ชุดสาธิต ${spec.code} | ${spec.group==='reviewer' && plan.purpose!=='feedback'?'เอกสารวิจัยสังเคราะห์':spec.demoState}`,10)
  lines('เอกสารและประวัติในชุดนี้เป็นข้อมูลสังเคราะห์ ไม่มีผู้เข้าร่วมหรือผลวิจัยจริง',10)
  const p=spec.proposal
  section('ข้อมูลโครงการ',`หัวหน้าโครงการ: ${spec.leader}\nสาขา: ${spec.field}\nหน่วยงาน: ${p.leaderAffiliation}\nอีเมลสมมติ: ${p.leaderEmail}\nระยะเวลา: ${p.startDate} ถึง ${p.endDate}`)
  if(plan.key==='proposal'){
    section('1 ความเป็นมาและเหตุผล',p.background);section('2 วัตถุประสงค์',p.objectives)
    section('3 วิธีดำเนินการวิจัย',p.methodology);section('4 ขอบเขตการศึกษา',p.scope)
    section('5 แผนงาน',p.workPlan)
    section('6 งบประมาณ',`ค่าตอบแทน ${p.compensation.toLocaleString()} บาท\nค่าใช้สอย ${p.directCost.toLocaleString()} บาท\nค่าวัสดุ ${p.materials.toLocaleString()} บาท\nค่าสาธารณูปโภค ${p.utility.toLocaleString()} บาท\nรวม ${(p.compensation+p.directCost+p.materials+p.utility).toLocaleString()} บาท`)
    section('7 ผลผลิตที่คาดหวังและความก้าวหน้า',p.outcomeDetail+'\n'+p.progress)
    section('8 ข้อจำกัดและจริยธรรม',p.scope+' ไม่มีการขอรับรองหรือการลงนามจริงในเอกสารนี้')
  } else if(plan.key==='feedback'){
    const e=advisorEvaluation(Number(spec.code.slice(-1))-3)
    section('1 การประเมินผลด้านผลผลิต',evaluationQuestions.map(([key,label,options])=>label+'\n'+options[e[key]]+(e[key+'Detail']?' '+e[key+'Detail']:'')).join('\n'))
    section('ข้อเสนอแนะรายบทและผลผลิต',e.chapters+'\n'+e.outputs)
    section('จุดเด่นของงานวิจัย',e.strengths)
    section('2 การนำผลวิจัยไปใช้ประโยชน์',Object.values(e.utilization).join('\n'))
    section('3 ข้อเสนอแนะเพื่อพัฒนางานวิจัย',e.future)
    section('4 สรุปผลการประเมิน',evaluationResults[e.result]+(e.reason?'\n'+e.reason:''))
    section('ขอบเขตของผลประเมิน','ผลประเมินตัวอย่างนี้ไม่ใช่การอนุมัติหรือการปิดโครงการ นักวิจัยจะเห็นข้อเสนอแนะเมื่อเจ้าหน้าที่ส่งคืนอย่างเป็นทางการในระบบเท่านั้น')
  } else if(plan.key==='verification'){
    section('รายการตรวจเอกสาร','ข้อเสนอและประวัติโครงการครบถ้วน\nมีหลักฐานเผยแพร่สมมติที่เปิดอ่านได้\nข้อมูลโครงการและงบประมาณสอดคล้องกัน\nเจ้าหน้าที่ต้องตรวจขั้นสุดท้ายและยืนยันปิดด้วยตนเอง')
    section('สถานะการดำเนินการ','พร้อมให้เจ้าหน้าที่ตรวจทานก่อนยืนยันปิดโครงการ ยังไม่มีการปิดอัตโนมัติ และไม่มีหนังสือราชการหรือผลพิจารณาจริง')
  } else {
    section('บทคัดย่อ',`โครงการนี้สาธิตการวิจัยด้าน${spec.field} โดยใช้ข้อมูลสังเคราะห์ทั้งหมด ${spec.results}`)
    section('1 วัตถุประสงค์',p.objectives);section('2 ระเบียบวิธีวิจัย',p.methodology)
    section('3 ผลการศึกษาและการอภิปราย',spec.results+' ผลทั้งหมดเป็นข้อมูลจำลองเพื่อทดสอบระบบ ไม่สามารถนำไปอ้างเป็นข้อค้นพบจริงได้ การอภิปรายเปรียบเทียบกับเส้นฐานที่สร้างขึ้นภายในชุดทดสอบเดียวกัน')
    section('4 ข้อสรุป',`ได้แนวทางออกแบบและรายการทดสอบสำหรับ${spec.title} การนำไปใช้จริงต้องเก็บหลักฐานและประเมินจริยธรรมตามลักษณะงาน`)
    section('5 ข้อจำกัดและงานต่อไป','ข้อจำกัดหลักคือชุดข้อมูลสังเคราะห์ยังไม่ครอบคลุมบริบทจริง ควรเพิ่มกรณีขอบ การทดสอบซ้ำ และการตรวจสอบความถูกต้องก่อนศึกษาภาคสนาม')
    section('6 ผลผลิตและความก้าวหน้า',p.outcomeDetail+'\n'+p.progress)
    if(plan.key==='publication')section('หลักฐานเผยแพร่เพื่อการสาธิต','ตัวอย่างบันทึกเผยแพร่คู่มือดิจิทัลในกิจกรรมสมมติ ไม่ใช่การตีพิมพ์ในวารสาร ไม่มี DOI และไม่มีผู้เข้าร่วมจริง เจ้าหน้าที่ใช้ตรวจตัวอย่างการปิดด้วยหลักฐานเผยแพร่')
  }
  const pages=doc.getNumberOfPages()
  for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont('Sarabun','normal');doc.setFontSize(9);doc.setTextColor(95);doc.text(`${spec.id} | ข้อมูลสมมติ | หน้า ${i} / ${pages}`,18,288)}
  return Buffer.from(doc.output('arraybuffer'))
}
export function buildAdvisorBundle(output='output/advisor-demo',{reviewerExample=false}={}) {
  const directory=resolve(output);mkdirSync(directory,{recursive:true});const documentMap={},files=[]
  for(const spec of advisorSpecs().filter(spec=>!reviewerExample || spec.code==='C01')){
    documentMap[spec.id]={}
    for(const plan of advisorDocumentPlan(spec)){
      const id='advisor-v1-'+spec.code+'-'+plan.key,name=spec.id+'-'+plan.key+'.pdf',bytes=renderDocument(spec,plan)
      if(bytes.length>2*1024*1024)throw new Error('PDF exceeds Storage limit: '+name)
      const storagePath=`workspaces/testing/projects/${spec.id}/${plan.uploader}/${id}`
      const metadata={id,name,size:bytes.length,storagePath,contentType:'application/pdf',kind:plan.kind,version:1}
      documentMap[spec.id][plan.key]=metadata
      writeFileSync(resolve(directory,name),bytes)
      files.push({projectId:spec.id,localFile:name,sha256:createHash('sha256').update(bytes).digest('hex'),purpose:plan.purpose,uploaderUid:plan.uploader,...metadata})
    }
  }
  const projects=buildAdvisorProjects(documentMap,{codes:reviewerExample?['C01']:undefined})
  const bundle={...(reviewerExample?{scope:'reviewer-example'}:{}),seedId:ADVISOR_SEED,workspace:'testing',generatedAt:'2026-10-29T03:00:00.000Z',files,projects}
  writeFileSync(resolve(directory,'manifest.json'),JSON.stringify(bundle,null,2))
  return {...bundle,directory}
}
