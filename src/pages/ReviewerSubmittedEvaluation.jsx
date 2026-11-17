import { useTranslation } from 'react-i18next'
import { Check, FileText } from 'lucide-react'
import EvaluationPdfAction from '../components/EvaluationPdfAction'
import { projectReference, actorName, displayDate } from '../utils/researchDisplay'
import './ReviewerSubmittedEvaluation.css'

export default function ReviewerSubmittedEvaluation({project:p,currentUser,evaluation,assignment,go,answers}) {
 const {i18n}=useTranslation(),text=(th,en)=>i18n.language==='en'?en:th
 return <div className="vs-submitted">
  <header className="vs-project"><div><small>{projectReference(p)}</small><h2>{i18n.language==='en'&&p.titleEn||p.title}</h2></div><span>{text('ส่งผลประเมินแล้ว','Submitted')}</span></header>
  <div className="vs-success" role="status"><Check size={18}/><div><strong>{text('ส่งผลประเมินเรียบร้อยแล้ว','Evaluation submitted successfully')}</strong><p>{text('ผลประเมินถูกบันทึกและล็อกแล้ว เจ้าหน้าที่เป็นผู้ส่งผลให้นักวิจัย','Your evaluation has been saved and locked. Staff controls release to the researcher.')}</p></div></div>
  <div className="vs-grid"><section className="vs-card vs-download"><FileText size={32} aria-hidden="true"/><h3>{text('ดาวน์โหลดผลประเมิน PDF','Download Evaluation PDF')}</h3><p>{text('ดาวน์โหลดผลประเมินรายบุคคลที่คุณยืนยันส่งแล้ว','Download the individual evaluation you submitted.')}</p><EvaluationPdfAction project={p} currentUser={currentUser} showPreview={false} buttonLabel={text('ดาวน์โหลด PDF','Download PDF')}/><details className="vs-answers"><summary>{text('ดูคำตอบและเอกสารที่ส่งแล้ว','View Submitted Answers & Attachments')}</summary>{answers}{evaluation.documentIds?.map(id=><p key={id}><a href={go.href('documents',p.id,{document:id})}>{p.documents.find(d=>d.id===id)?.name||text('ไฟล์ข้อเสนอแนะ','Feedback Attachment')}</a></p>)}</details></section>
  <aside className="vs-sidebar"><section className="vs-card"><h3>{text('ข้อมูลการส่งผลประเมิน','Submission Information')}</h3><dl><div><dt>{text('ผู้ประเมิน','Reviewer')}</dt><dd>{actorName(evaluation.by||evaluation.updatedBy||currentUser.uid)}</dd></div><div><dt>{text('วันที่และเวลาส่งผลประเมิน','Submitted At')}</dt><dd>{displayDate(evaluation.submittedAt,i18n.language,true)}</dd></div><div><dt>{text('สถานะการส่งผล','Submission Status')}</dt><dd className="vs-status">{text('ส่งผลประเมินแล้ว','Submitted')}</dd></div><div><dt>{text('สถานะเอกสาร','Document Status')}</dt><dd>{text('อ่านอย่างเดียว — แก้ไขหรือส่งซ้ำไม่ได้','Read-only — editing and resubmission are locked')}</dd></div><div><dt>{text('รายงานเวอร์ชัน','Report Revision')}</dt><dd>{assignment.reportRevision}</dd></div></dl><a href={go.href('assigned-report',p.id)}>{text('อ่านรายงานที่มอบหมาย','Read Assigned Report')}</a></section><a className="outline-button vs-return" href={go.href('projects')}>{text('← กลับไปงานประเมินของฉัน','← Return to Assigned Reviews')}</a></aside></div>
 </div>
}
