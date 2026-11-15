import { jsPDF } from 'jspdf'
import { evaluationRows } from './reviewerWorkspace.js'
async function font(url) {
 const response=await fetch(url); if(!response.ok)throw new Error('PDF font unavailable')
 const bytes=new Uint8Array(await response.arrayBuffer()); let binary=''
 for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192))
 return btoa(binary)
}
// Only call with a capability-checked submittedPdfSnapshot. Never writes project data.
export async function generateEvaluationPDF(snapshot) {
 if(!snapshot?.evaluation?.submitted)throw new Error('Submitted evaluation required')
 const doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true})
 const regular=await font('/fonts/Sarabun-Regular.ttf'),bold=await font('/fonts/Sarabun-Bold.ttf')
 for(const [name,style,data] of [['Sarabun-Regular.ttf','normal',regular],['Sarabun-Bold.ttf','bold',bold]]){doc.addFileToVFS(name,data);doc.addFont(name,'Sarabun',style)}
 let y=20
 function text(value,heading=false) {
  doc.setFont('Sarabun',heading?'bold':'normal');doc.setFontSize(heading?12:10);doc.setTextColor(32,41,56)
  // Split each line explicitly to retain multiline answers, with page-safe long narratives.
  const lines=doc.splitTextToSize(String(value??'—'),170)
  for(const line of lines){if(y>274){doc.addPage();y=20}doc.text(line,20,y);y+=5.5}
  y+=3
 }
 text('MFU Research - Individual Evaluation',true)
 text('Demo rubric / แบบประเมิน Demo - official template OPEN-11')
 text(snapshot.projectId+' | '+snapshot.title,true)
 text('Reviewer: '+snapshot.reviewerId)
 text('Submitted: '+snapshot.evaluation.submittedAt)
 text('Assignment: '+snapshot.assignment.id+' | Report revision: '+snapshot.assignment.reportRevision)
 text('Assigned document IDs: '+snapshot.assignment.documentIds.join(', '))
 for(const [label,value] of evaluationRows(snapshot.evaluation)){text(label,true);text(value)}
 text('Submission metadata',true)
 // Include exact recorded fields in addition to human-readable labels, without inventing signatures.
 for(const [key,value] of Object.entries(snapshot.evaluation))text(key+': '+(typeof value==='object'?JSON.stringify(value):String(value)))
 text('No generated signature / ไม่มีการสร้างลายเซ็นแทนผู้ประเมิน')
 const pages=doc.getNumberOfPages()
 for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont('Sarabun','normal');doc.setFontSize(9);doc.setTextColor(102,115,134);doc.text(`${snapshot.projectId} | ${i}/${pages}`,20,287)}
 return {blob:doc.output('blob'),filename:`Evaluation-${snapshot.projectId}-${snapshot.reviewerId}.pdf`}
}
