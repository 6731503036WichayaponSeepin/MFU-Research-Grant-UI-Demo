import { useTranslation } from 'react-i18next'
import { Check, FileText } from 'lucide-react'
import ProjectStateBadge from '../components/ProjectStateBadge'
import { projectReference, actorName } from '../utils/researchDisplay'
import './StaffReviewerAssignment.css'

export function ReviewerAssignmentSelection({draft,directory,submitControl,report}) {
 const {i18n}=useTranslation(),th=i18n.language!=='en',text=(a,b)=>th?a:b
 const selected=directory.filter(r=>[draft.reviewer1,draft.reviewer2,draft.reviewer3].includes(r.uid))
 const name=r=>actorName(r.label||r.uid)
 return <><section className="va-directory"><h2>{text('รายชื่อผู้ทรงคุณวุฒิ','Reviewer Directory')}</h2>{directory.map((r,i)=><div className="va-reviewer-row" key={r.uid}><span className="va-avatar">{i+1}</span><div><strong>{name(r)}</strong><small>{r.affiliation||text('ยังไม่ระบุสังกัด','Affiliation not provided')}</small></div><span className={'va-indicator'+(selected.some(s=>s.uid===r.uid)?' selected':'')} aria-label={selected.some(s=>s.uid===r.uid)?text('เลือกแล้ว','Selected'):text('ยังไม่ได้เลือก','Not selected')}>{selected.some(s=>s.uid===r.uid)&&<Check size={13}/>}</span></div>)}{!directory.length&&<p className="shared-note">{text('ไม่มีรายชื่อผู้ทรงคุณวุฒิที่เปิดใช้งาน','No active reviewers available')}</p>}<p className="shared-note">{text('รายชื่อที่มีอยู่ในระบบ เลือกหรือเอารายชื่อออกด้วยช่องเลือกด้านล่าง','Existing directory. Select or clear each slot using the controls below.')}</p></section>
 <aside className="va-summary"><section className="va-selected"><div className="va-selected-heading"><h2>{text('ผู้ทรงคุณวุฒิที่เลือก','Selected Reviewers')}</h2><strong className="va-count" aria-live="polite">{selected.length}/3</strong></div><div className="va-progress" aria-hidden="true"><span style={{width:`${selected.length/3*100}%`}}/></div>{selected.map((r,i)=><div className="va-reviewer-row" key={r.uid}><span className="va-avatar">{i+1}</span><div><strong>{name(r)}</strong><small>{r.affiliation||text('ยังไม่ระบุสังกัด','Affiliation not provided')}</small></div></div>)}{!selected.length&&<p className="shared-note">{text('ยังไม่ได้เลือกผู้ทรงคุณวุฒิ','No reviewers selected')}</p>}<p className="shared-note">{text('ต้องครบ 3 คนที่ไม่ซ้ำกัน','Exactly 3 distinct reviewers required')}</p>{submitControl}</section><section className="va-report"><h2><FileText size={18}/>{text('รายงานที่ส่งประเมิน','Assigned Report')}</h2>{report}</section></aside></>
}
export default function StaffReviewerAssignmentView({project:p,records,children}) {
 const {i18n}=useTranslation(),text=(a,b)=>i18n.language==='en'?b:a
 return <div className="staff-reviewer-assignment"><header className="va-heading"><div><span>{projectReference(p)}</span><h1 id="page-title" tabIndex={-1}>{text('มอบหมายผู้ทรงคุณวุฒิ','Reviewer Assignment')}</h1><p>{i18n.language==='en'&&p.titleEn||p.title}</p></div><ProjectStateBadge status={p.status}/></header><p className="shared-note">{text('เลือกผู้ทรงฯ ที่มีบัญชีอยู่แล้ว 3 คนไม่ซ้ำ การแต่งตั้งทางการอยู่นอก Web ไม่สร้างบัญชีใหม่','Select exactly 3 distinct existing reviewers. Formal appointment is external; no account is created.')}</p><div className="va-form">{children}</div><details className="va-records"><summary>{text('รายงานเวอร์ชันและประวัติการมอบหมาย','Report revision & assignment records')}</summary>{records}</details></div>
}
