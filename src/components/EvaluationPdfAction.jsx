import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { submittedPdfSnapshot } from '../utils/reviewerWorkspace'
import { getProjects } from '../utils/projectStorage'
import { readFoundationProjects } from '../utils/foundationStore'
import { sharedMode } from '../utils/sharedStore'
import { hasCapability } from '../domain/permissions'
import { actorName, projectReference } from '../utils/researchDisplay'
export default function EvaluationPdfAction({project,currentUser,reviewerId=currentUser.uid,onGenerated,buttonLabel}) {
 const {i18n}=useTranslation(),text=(a,b)=>i18n.language==='en'?b:a
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 const active=useRef(false)
 useEffect(()=>{active.current=true;return()=>{active.current=false}},[])
 const allowed=hasCapability(project,currentUser,'evaluationPdf',{evaluationReviewerId:reviewerId})
 async function download(){setBusy(true);setError('');try{
  const fresh=()=> {if(!active.current)throw new Error('Account or page changed; PDF download cancelled');return (sharedMode?getProjects():readFoundationProjects()).find(p=>p.id===project.id)}
  const source=fresh(),snapshot=submittedPdfSnapshot(source,currentUser,reviewerId)
  const display=!sharedMode&&source.fictional&&source.simulationOnly&&source.workspace==='local-demo-v16'?{
   reference:projectReference(source),reviewerName:actorName(reviewerId),language:i18n.language,
   reportNames:snapshot.assignment.documentIds.map(id=>source.documents.find(d=>d.id===id)?.name||text('รายงานที่ได้รับมอบหมาย','Assigned report')),
  }:undefined
  const {generateEvaluationPDF}=await import('../utils/evaluationPDF')
  const result=await generateEvaluationPDF(snapshot,display)
  // Recheck access/immutable result after asynchronous font loading, before exposing bytes.
  if(JSON.stringify(submittedPdfSnapshot(fresh(),currentUser,reviewerId))!==JSON.stringify(snapshot))throw new Error('Evaluation changed; reload before generating PDF')
  onGenerated?.(result)
  const url=URL.createObjectURL(result.blob),link=document.createElement('a');link.href=url;link.download=result.filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }catch(e){if(active.current)setError(e.message)}finally{if(active.current)setBusy(false)}}
 return <div className="shared-actions"><button className="outline-button" disabled={busy||!allowed} onClick={download}>{busy?text('กำลังสร้าง PDF…','Generating PDF…'):buttonLabel||text('สร้างและดาวน์โหลด PDF รายบุคคล','Generate Individual PDF')}</button>{!allowed&&<p className="shared-note">{text('ดาวน์โหลดหลัง CLOSED ยัง OPEN; ต้องเป็นผลที่ส่งแล้วตามสิทธิ์','Post-CLOSED PDF access remains OPEN; an authorized submitted result is required.')}</p>}{error&&<p role="alert">{error}</p>}</div>
}
