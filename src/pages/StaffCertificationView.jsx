import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import ProjectStateBadge from '../components/ProjectStateBadge'
import { projectReference, displayDate } from '../utils/researchDisplay'
import './StaffCertification.css'

export default function StaffCertificationView({project:p,go,acknowledgement,certification,records}) {
 const {i18n}=useTranslation(),th=i18n.language!=='en',text=(a,b)=>th?a:b
 const reviewed=p.statusHistory?.some(e=>e.action==='pass_proposal'), acknowledged=p.administrativeRecords.some(r=>r.type==='committee_acknowledgement'), certified=!!p.certification
 const standards={none:text('ไม่มีการวิจัยในมนุษย์/สัตว์ หรือเทคโนโลยีชีวภาพสมัยใหม่ที่เกี่ยวข้อง','No relevant human, animal or modern biotechnology research'),human:text('วิจัยในมนุษย์','Human research'),animal:text('ใช้สัตว์ทดลอง','Experimental animals'),plants:text('ศึกษาพืชพื้นเมือง/พืชป่า/เห็ด/รา ตามกฎหมายคุ้มครองพันธุ์พืช','Native or wild plants, mushrooms or fungi under plant protection law')}
 const info=(label,value)=><div><dt>{label}</dt><dd>{value||text('ยังไม่ระบุ','Not specified')}</dd></div>
 return <div className="staff-certification">
  <header className="sc-heading"><div><span>{projectReference(p)}</span><h1 id="page-title" tabIndex={-1}>{text('บันทึกผลเพื่อทราบและรับรองโครงการ','Acknowledgement & Certification')}</h1><p>{!th&&p.titleEn||p.title}</p></div><ProjectStateBadge status={p.status}/></header>
  <ol className="sc-progress" aria-label={text('ความคืบหน้าตามข้อมูลที่บันทึก','Progress from recorded events')}>{[
   [text('ตรวจข้อเสนอผ่านแล้ว','Proposal reviewed'),reviewed],
   [text('เสนอคณะกรรมการเพื่อทราบ','Committee acknowledgement'),acknowledged],
   [text('รับรองโครงการ','Project certification'),certified],
  ].map(([label,done],i)=><li key={label} className={done?'complete':''} aria-current={!done&&(i===0||i===1&&reviewed||i===2&&acknowledged)?'step':undefined}><span>{done?<Check size={15}/>:i+1}</span><strong>{label}</strong></li>)}</ol>
  <div className="sc-grid"><div className="sc-left"><div className="sc-acknowledgement">{acknowledgement}</div><div className="sc-certification">{certification}</div><details className="panel shared-card sc-records"><summary>{text('ประวัติการเสนอเพื่อทราบและการรับรอง','Acknowledgement & certification records')}</summary>{records}</details></div>
   <aside className="sc-right"><section className="panel shared-card"><h2>{text('ข้อมูลโครงการ','Project Summary')}</h2><dl className="sc-summary">{info(text('หัวหน้าโครงการ','Project leader'),p.leader||p.proposal?.leaderName)}{info(text('หน่วยงาน','Affiliation'),p.affiliation)}{info(text('ระยะเวลาดำเนินการ','Research duration'),`${displayDate(p.startDate,i18n.language)} – ${displayDate(p.endDate,i18n.language)}`)}{info(text('งบประมาณโครงการ','Project budget'),`${new Intl.NumberFormat(th?'th-TH':'en-GB').format(p.budget||0)} ${text('บาท','THB')}`)}{info(text('ประวัติการตรวจข้อเสนอ','Proposal review record'),reviewed?text('ตรวจข้อเสนอผ่านแล้ว','Proposal review passed'):text('ยังไม่มีบันทึกตรวจผ่าน','No passed review recorded'))}</dl></section>
   <section className="panel shared-card"><h2>{text('มาตรฐานการวิจัย','Research Standards')}</h2><dl className="sc-summary">{info(text('ข้อมูลมาตรฐานการวิจัย','Research standards information'),standards[p.proposal?.standards]||p.proposal?.standards)}{info(text('คำชี้แจง','Clarifications'),p.proposal?.clarifications)}</dl><p className="shared-note">OPEN-17 · {text('ไม่บล็อกทุกโครงการเพราะขาดใบรับรอง ไม่กำหนดประเภท/ผู้บันทึกมาตรฐานแทน Stakeholder','No universal certificate blocker or assumed standards authority/types.')}</p><a href={go.href('documents',p.id)}>{text('ดูเอกสารที่เกี่ยวข้อง','View related documents')} →</a></section>
   <p className="shared-note sc-external-note">{text('คณะกรรมการไม่มีบัญชี Web และไม่ได้อนุมัติผ่าน Web แยกบันทึกเพื่อทราบจากการรับรองโดยเจ้าหน้าที่','The committee has no Web account and does not approve in Web. External acknowledgement and staff certification are separate records.')}</p></aside>
  </div>
 </div>
}
