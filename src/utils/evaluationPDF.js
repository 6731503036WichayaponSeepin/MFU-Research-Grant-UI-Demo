import { jsPDF } from 'jspdf'
import { displayDate } from './researchDisplay.js'
import {evaluationTitle,evaluationInstruction,evaluationSections,evaluationQuestions,evaluationOptionLabels,narrativeFields,utilizationFormOptions,utilizationDetails,resultFormOptions,cleanEvaluationAnswers} from './evaluation.js'
async function font(url) {
 const response=await fetch(url); if(!response.ok)throw new Error('PDF font unavailable')
 const bytes=new Uint8Array(await response.arrayBuffer()); let binary=''
 for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192))
 return btoa(binary)
}
// Only call with a capability-checked submittedPdfSnapshot. Never writes project data.
export async function generateEvaluationPDF(snapshot,display) {
 if(!snapshot?.evaluation?.submitted)throw new Error('Submitted evaluation required')
 snapshot={...snapshot,evaluation:cleanEvaluationAnswers(snapshot.evaluation)}
 const doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true})
 const regular=await font('/fonts/Sarabun-Regular.ttf'),bold=await font('/fonts/Sarabun-Bold.ttf')
 for(const [name,style,data] of [['Sarabun-Regular.ttf','normal',regular],['Sarabun-Bold.ttf','bold',bold]]){doc.addFileToVFS(name,data);doc.addFont(name,'Sarabun',style)}
 let y=20
 function text(value,heading=false,indent=0,gap=3) {
  doc.setFont('Sarabun',heading?'bold':'normal');doc.setFontSize(heading?12:10);doc.setTextColor(32,41,56)
  // Split each line explicitly to retain multiline answers, with page-safe long narratives.
  const lines=doc.splitTextToSize(String(value??'—'),170-indent)
  for(const line of lines){if(y>274){doc.addPage();y=20}doc.text(line,20+indent,y);y+=5.5}
  y+=gap
 }
 {
  const e=snapshot.evaluation
  text(evaluationTitle,true);text(evaluationInstruction,false,0,2)
  text((display?.reference||snapshot.projectId)+' | '+snapshot.title,true)
  text('ผู้ประเมิน: '+(display?.reviewerName||snapshot.reviewerId)+' | '+displayDate(e.submittedAt,display?.language||'th',true),false,0,2)
  doc.setProperties({title:evaluationTitle,author:display?.reviewerName||snapshot.reviewerId,subject:JSON.stringify(snapshot)})
  function option(label,selected){
   if(y>264){doc.addPage();y=20}
   doc.setDrawColor(70,70,70);doc.setLineWidth(.25);doc.rect(20,y-3,3,3)
   if(selected){doc.setDrawColor(147,22,56);doc.setLineWidth(.5);doc.line(20.4,y-1.5,21.3,y-.5);doc.line(21.3,y-.5,22.7,y-2.6)}
   text(label,false,6,1)
  }
  text(evaluationSections[0],true)
  for(const [i,[key,label]]of evaluationQuestions.entries()){
   text(label,true)
   for(const [index,label]of evaluationOptionLabels[i].entries()){
    option(label,e[key]===index)
    if(e[key]===index&&index>0&&e[key+'Detail'])text(e[key+'Detail'],false,6,2)
   }
  }
  for(const [key,label]of narrativeFields.slice(0,3)){text(label,true);text(e[key]||'—')}
  text(evaluationSections[1],true)
  for(const [i,label]of utilizationFormOptions.entries()){
   const selected=Object.hasOwn(e.utilization||{},i);option(label,selected)
   if(selected&&utilizationDetails[i])text(e.utilization[i],false,6,2)
  }
  if(y>25){doc.addPage();y=20}
  text(narrativeFields[3][1],true);text(e.future||'—');text(evaluationSections[3],true)
  resultFormOptions.forEach((label,i)=>{option(label,e.result===i);if(i===2&&e.result===2)text(e.reason,false,6)})
  text('ไฟล์ข้อเสนอแนะ / Feedback attachments: '+(e.documentIds||[]).length)
  text('แบบประเมินต้นทางฉบับร่าง รอการยืนยัน / Source draft, pending confirmation')
 }
 const pages=doc.getNumberOfPages()
 for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont('Sarabun','normal');doc.setFontSize(9);doc.setTextColor(102,115,134);doc.text(`${display?.reference||snapshot.projectId} | ${i}/${pages}`,20,287)}
 return {blob:doc.output('blob'),filename:`Evaluation-${snapshot.projectId}-${snapshot.reviewerId}.pdf`}
}
