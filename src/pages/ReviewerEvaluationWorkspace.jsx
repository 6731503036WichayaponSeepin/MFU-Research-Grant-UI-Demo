import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DocumentPreview from '../components/DocumentPreview'
import { Feedback } from '../components/SharedFeedback'
import { permittedDocuments, realPdfUrl } from '../utils/commonWorkspace'
import './ReviewerEvaluationWorkspace.css'

export default function ReviewerEvaluationWorkspace({ project, currentUser, assignment, children }) {
 const { i18n } = useTranslation(), text=(th,en)=>i18n.language==='en'?en:th
 const container=useRef(null), [split,setSplit]=useState(50), [selected,setSelected]=useState('')
 const reports=permittedDocuments(project,currentUser).filter(d=>d.kind==='report'&&assignment.documentIds.includes(d.id))
 const report=reports.find(d=>d.id===selected)||reports[0]
 const resize=e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)){const rect=container.current.getBoundingClientRect();setSplit(Math.max(30,Math.min(70,(e.clientX-rect.left)/rect.width*100)))}}
 return <div className="ve-workspace" ref={container} style={{'--ve-split':`${split}%`}}>
  <section className="ve-report" aria-label={text('รายงานวิจัยที่ได้รับมอบหมาย','Assigned research report')}><header><h2>{report?.name||text('รายงานวิจัย 5 บท','Five-chapter research report')}</h2>{reports.length>1&&<label>{text('เลือกเอกสาร','Select report')}<select value={report?.id||''} onChange={e=>setSelected(e.target.value)}>{reports.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>}<details><summary>{text('ข้อมูลประกอบการวิจัย','Research context')}</summary><p>{project.proposal?.objectives}</p><p>{project.proposal?.methodology}</p></details></header><div className="ve-pdf-scroll">{report&&realPdfUrl(report)?<DocumentPreview key={report.id} url={realPdfUrl(report)} filename={report.name} title={report.name}/>:<Feedback kind="error" title={text('ไม่มีไฟล์รายงานที่เข้าถึงได้','No accessible report file')}/>}</div></section>
  <div className="ve-divider" role="separator" tabIndex={0} aria-label={text('ปรับขนาดแผงรายงานและแบบประเมิน','Resize report and evaluation panels')} aria-orientation="vertical" aria-valuemin={30} aria-valuemax={70} aria-valuenow={Math.round(split)} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);resize(e)}} onPointerMove={resize} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();setSplit(value=>e.key==='Home'?50:Math.max(30,Math.min(70,value+(e.key==='ArrowLeft'?-2:2))))}}}><span>Ⅱ</span></div>
  <div className="ve-editor">{children}</div>
 </div>
}
