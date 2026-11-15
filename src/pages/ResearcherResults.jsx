import { evaluationRows } from '../utils/reviewerWorkspace'
import { displayDate, actorName } from '../utils/researchDisplay'
import { useTranslation } from 'react-i18next'
import { hasCapability } from '../domain/permissions'
import { Feedback } from '../components/SharedFeedback'
import EvaluationPdfAction from '../components/EvaluationPdfAction'
export default function ResearcherResults({ project: p, currentUser, go }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en', text = (a, b) => th ? a : b
  if (!p.closure?.release || !hasCapability(p, currentUser, 'readEvaluations')) return <Feedback title={text('ผลประเมินยังไม่เปิดเผย', 'Evaluations have not been released')}>{text('ต้องรอเจ้าหน้าที่ส่งผลครบทั้ง 3 คนก่อน', 'Wait for staff to release all three submitted evaluations.')}</Feedback>
  const evaluations = Object.entries(p.closure.evaluations || {}).filter(([, e]) => e.submitted)
  return <div className="shared-stack"><section className="panel shared-card"><h2>{text('ผลประเมินที่เจ้าหน้าที่ส่งแล้ว', 'Released Evaluation Results')}</h2><p>{text('ผู้ส่งผล', 'Released by')}: {actorName(p.closure.release.releasedBy)} · {displayDate(p.closure.release.releasedAt, i18n.language, true)}</p><p>{p.closure.revisionInstructions}</p>{hasCapability(p, currentUser, 'reviseReport') && <a className="primary" href={go.href('revised-report', p.id)}>{text('ส่งรายงานฉบับแก้ไข', 'Go to Revised Report Submission')} →</a>}</section>{evaluations.map(([id, e]) => <section className="panel shared-card" key={id}><h2>{text('ผู้ทรงคุณวุฒิ', 'Expert Reviewer')} · {actorName(id)}</h2><p>{text('ยืนยันส่งเมื่อ', 'Submitted at')}: {displayDate(e.submittedAt, i18n.language, true)}</p><dl className="shared-fields">{evaluationRows(e.answers || e).map(([label, value], index) => <div key={index}><dt>{label}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</dd></div>)}</dl>{e.documentIds?.map(docId => <p key={docId}><a href={go.href('documents', p.id, { document: docId })}>{text('ไฟล์ข้อเสนอแนะ', 'Feedback attachment')} · {p.documents.find(d => d.id === docId)?.name || text('เอกสารประกอบ','Attachment')}</a></p>)}<EvaluationPdfAction project={p} currentUser={currentUser} reviewerId={id}/></section>)}</div>
}
