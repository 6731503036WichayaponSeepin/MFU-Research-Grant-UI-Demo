import { useLiveProjects } from '../utils/useLiveProjects'
import { getProjects } from '../utils/projectStorage'
import { statusLabel } from '../data/statuses'
export default function DemoScenarios({currentUser,onNavigate}) {
  const [projects]=useLiveProjects(getProjects)
  const researcher=currentUser.role==='researcher',staff=currentUser.role==='staff'
  const correction=projects.find(p=>p.scenario==='ขอแก้ไขข้อมูลหลังได้รับการรับรอง')
  const entries=researcher?projects.filter(p=>p.scenario&&!p.reviewerScenario&&!['ตรวจข้อเสนอและเอกสาร','โครงการรอประเมิน'].includes(p.scenario)).map(p=>[p.scenario,p,p.correction?'correction':'details']):staff?[
    ['ติดตามความคืบหน้าทั้ง 9 ระยะ',projects.find(p=>p.scenario==='กำลังดำเนินการวิจัย'),'timeline'],
    ['ตรวจข้อเสนอและเอกสารก่อนมอบหมาย',projects.find(p=>p.scenario==='ตรวจข้อเสนอและเอกสาร'),'staff-review'],
    ['ตรวจเอกสารสุดท้ายและบันทึกปิดโครงการ',projects.find(p=>p.scenario==='ยื่นเอกสารขอปิดโครงการ'),'closure'],
    ['พิจารณาคำขอแก้ไขหลังรับรอง',correction,'correction']
  ]:projects.filter(p=>p.reviewerScenario&&p.closure?.reviewers?.includes(currentUser.username)).map(p=>[p.reviewerScenarioLabel==='ส่งรายงานฉบับแก้ไขกลับมา'?'ตรวจรายงานฉบับแก้ไข':p.reviewerScenarioLabel|| (p.closure.evaluations?.[currentUser.username]?.submitted?'ส่งผลประเมินแล้ว':'รอประเมิน'),p,p.closure.evaluations?.[currentUser.username]?.submitted?'results':'details'])
  return <section className="panel focused-card demo-scenarios"><div className="section-heading"><h2>{currentUser.role==='reviewer'?'งานประเมินรายงาน':'สถานการณ์ตัวอย่าง · '+entries.length+' กรณี'}</h2><small>เลือกหนึ่งกรณีเพื่อเปิดหน้าทำงาน</small></div><div className="demo-case-grid">{entries.filter(([,p])=>p).map(([label,p,route])=><a key={p.id} className="demo-case" href={onNavigate.href(route,p.id)}><strong>{label}</strong><span>{p.title}</span><small>{p.id} · {statusLabel(p.status,'th')} →</small></a>)}</div></section>
}
