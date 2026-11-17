import { projectReference, actorName, displayDate } from '../utils/researchDisplay'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ownAssignment, ownEvaluation, evaluationPayload, evaluationError, evaluationRows } from '../utils/reviewerWorkspace'
import { hasCapability } from '../domain/permissions'
import { useFormDraft } from '../utils/useFormDraft'
import {cleanEvaluationAnswers,evaluationFieldErrors,evaluationTitle} from '../utils/evaluation'
import EvaluationFormFields from '../components/EvaluationFormFields'
import { Feedback, ConfirmationModal } from '../components/SharedFeedback'
import ProjectDocuments from './ProjectDocuments'
import ReviewerEvaluationWorkspace from './ReviewerEvaluationWorkspace'
import ReviewerEvaluationReview from './ReviewerEvaluationReview'
import ReviewerSubmittedEvaluation from './ReviewerSubmittedEvaluation'

export function EvaluationReadOnly({evaluation}) {
 return <dl className="reviewer-answers">{evaluationRows(evaluation).map(([label,value],i)=><div key={i}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
}
export default function ReviewerPages({page,project:p,currentUser,go,commit}) {
 const {i18n}=useTranslation(), text=(a,b)=>i18n.language==='en'?b:a
 const a=ownAssignment(p,currentUser), saved=ownEvaluation(p,currentUser)
 const [draft,setDraft,markSaved]=useFormDraft(`reviewer-v16:${currentUser.workspace}:${currentUser.uid}:${p.id}:${a?.id}`,()=>({evaluation:evaluationPayload(saved),documentIds:saved?.documentIds||[]}))
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(null),lock=useRef(false)
 const canEdit=hasCapability(p,currentUser,'evaluate'), editable=canEdit&&!saved?.submitted
 const [attempted,setAttempted]=useState(false)
 const change=(key,value)=>setDraft(d=>({...d,evaluation:cleanEvaluationAnswers({...d.evaluation,[key]:value})}))
 const validate=evaluationError(draft.evaluation)
 async function save(submit=false) {
  if(lock.current)return
  lock.current=true;setBusy(true);setError('');setMessage('')
  try {
   const source=submit?pending.payload:draft, previous=submit?pending.project:p
   const payload={...structuredClone(source),evaluation:evaluationPayload(source.evaluation)}
   if(submit&&evaluationError(payload.evaluation))throw new Error(evaluationError(payload.evaluation))
   const next=await commit(previous,submit?'submit_evaluation':'save_evaluation',payload)
   markSaved(payload);setMessage(text('บันทึกสำเร็จ','Saved successfully'))
   if(submit)go('my-evaluation',next.id,{},true)
  }catch(e){setError(e.message)}finally{lock.current=false;setBusy(false);setPending(null)}
 }
 if(!a)return <Feedback kind="error" title={text('ไม่มีงานมอบหมาย','Assignment unavailable')}/>
 const context=<section className="panel shared-card"><h2>{p.title}</h2><p>{projectReference(p)} · {actorName(currentUser.uid)} · {text('ประเมินหนึ่งรอบ','One evaluation round')}</p><p>{text('รายงานเวอร์ชัน','Report revision')}: {a.reportRevision} · {text('กำหนดส่ง','Due')}: {displayDate(a.dueAt,i18n.language)}</p><div className="shared-actions"><a href={go.href('assigned-report',p.id)}>{text('อ่านรายงานที่มอบหมาย','Read assigned report')}</a><a href={go.href(saved?.submitted?'my-evaluation':'evaluation',p.id)}>{saved?.submitted?text('ผลที่ส่งแล้ว','Submitted result'):text('แบบประเมิน','Evaluation Editor')}</a></div></section>
 if(page==='assigned-report'&&!editable)return <div className="shared-stack">{context}<section className="panel shared-card"><h2>{text('ข้อมูลประกอบ','Research context')}</h2><p>{p.proposal?.objectives}</p><p>{p.proposal?.methodology}</p></section><ProjectDocuments project={{...p,documents:p.documents.filter(d=>d.kind==='report'&&a.documentIds.includes(d.id))}} currentUser={currentUser} onNavigate={go}/></div>
 if(page==='my-evaluation'||saved?.submitted)return saved?.submitted?<ReviewerSubmittedEvaluation project={p} currentUser={currentUser} evaluation={saved} assignment={a} go={go} answers={<EvaluationReadOnly evaluation={saved}/>}/>:<Feedback title={text('ยังไม่มีผลที่ยืนยันส่ง','No submitted evaluation')}/>
 return <div className={"shared-stack"+(page==='answers'?' vr-page':'')}>{page!=='answers'?<header className="ve-project-header"><div><h1 id="page-title" tabIndex={-1}>{i18n.language==='en'&&p.titleEn||p.title}</h1><p>{projectReference(p)} · {actorName(currentUser.uid)} · {text('ประเมินหนึ่งรอบ','One evaluation round')} · {text('รายงานเวอร์ชัน','Report revision')} {a.reportRevision}{a.dueAt&&<> · {text('กำหนดส่ง','Due')}: {displayDate(a.dueAt,i18n.language)}</>}</p><small>{text('อ้างอิงแบบประเมินต้นทางฉบับร่าง ยังอยู่ระหว่างยืนยัน','Based on the source draft evaluation form; pending confirmation.')}</small></div><span className={'ve-evaluation-status '+(saved?'draft':'pending')}>{saved?text('บันทึกร่าง','Draft'):text('รอประเมิน','Pending evaluation')}</span></header>:<p className="shared-notice">{text('อ้างอิงแบบประเมินต้นทางฉบับร่าง ยังอยู่ระหว่างยืนยัน','Based on the source draft evaluation form; pending confirmation.')}</p>}{page==='answers'?<ReviewerEvaluationReview project={p} currentUser={currentUser} assignment={a} evaluation={draft.evaluation} documentIds={draft.documentIds} validation={validate} saved={saved} go={go} actions={<div className="shared-actions"><a className="outline-button" href={go.href('evaluation',p.id)}>{text('กลับไปแก้คำตอบ','Back to Editor')}</a><button className="primary" disabled={busy||!editable||!!validate} onClick={()=>setPending({project:p,payload:structuredClone(draft)})}>{text('ยืนยันส่งผลประเมิน','Submit Evaluation')}</button></div>}/>:<ReviewerEvaluationWorkspace project={p} currentUser={currentUser} assignment={a}><section className="panel shared-card"><h2>{evaluationTitle}</h2><form onSubmit={e=>{e.preventDefault();if(validate){setAttempted(true);const first=evaluationFieldErrors(draft.evaluation)[0];requestAnimationFrame(()=>document.getElementById('evaluation-'+first?.field)?.focus());return}go('answers',p.id)}}><div className="ve-form-scroll"><fieldset disabled={!editable||busy} className="reviewer-form"><EvaluationFormFields data={draft.evaluation} change={change} errors={attempted?evaluationFieldErrors(draft.evaluation):[]}/></fieldset></div><div className="shared-actions ve-action-bar"><button type="button" className="outline-button" disabled={!editable||busy} onClick={()=>save()}>{text('บันทึกร่าง','Save Draft')}</button><button className="primary" disabled={!editable||busy}>{text('ตรวจคำตอบก่อนส่ง','Review Answers')}</button></div></form></section></ReviewerEvaluationWorkspace>}{!editable&&<p role="alert">{text('ไม่สามารถแก้ไขในสถานะนี้','Evaluation is locked in the current state')}</p>}{busy&&<p role="status">{text('กำลังบันทึก','Saving…')}</p>}{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}{pending&&<ConfirmationModal title={text('ยืนยันส่งครั้งเดียว?','Confirm one-time submission?')} onCancel={()=>{if(!busy)setPending(null)}} onConfirm={()=>save(true)}>{text('ตรวจคำตอบและรายงานที่มอบหมายแล้ว ผลที่ส่งจะล็อกและยังไม่เปิดเผยให้นักวิจัยจนกว่าเจ้าหน้าที่ส่งผล','Confirm the reviewed answers and assigned report. Submission locks your result; staff must release results to the researcher.')}</ConfirmationModal>}</div>
}
