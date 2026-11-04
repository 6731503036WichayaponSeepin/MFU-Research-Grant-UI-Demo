import { canRead } from '../utils/closure'
import { nextTask } from '../utils/handoff'
import { statusLabel } from '../data/statuses'
import DemoScenarios from '../components/DemoScenarios'
export default function ProjectList({projects,currentUser,query,onNavigate,target}) {
  const visible=projects.filter(p=>canRead(p,currentUser))
  const mode=(target||query.task)?'all':query.view||'examples'
  const filtered=visible.filter(p=>{
    if(query.search&&!`${p.id} ${p.title}`.toLowerCase().includes(query.search.toLowerCase()))return false
    if(query.task==='pending'&&nextTask(p).role!==currentUser.role)return false
    if(target==='staff-review'&&!['admin_review','revision_required','committee_review'].includes(p.status))return false
    if(target==='administrative-records'&&!['unit_review','eoffice_pending','committee_review','active'].includes(p.status))return false
    if(target==='project-change-record'&&p.status==='completed')return false
    if(target==='correction'&&!p.certification&&!p.correction)return false
    if(target==='closure'&&!['active','final_report','closure_review','completed'].includes(p.status))return false
    return !query.status||p.status===query.status
  })
  const page=Math.max(1,Number(query.page)||1),pages=Math.max(1,Math.ceil(filtered.length/6)),active=Math.min(page,pages)
  function href(params){return onNavigate.href(target||'projects',null,{...query,...params})}
  return <div className="focused-project-list">{!target&&<nav className="focused-tabs" aria-label="รูปแบบรายการ"><a href={href({view:'examples',page:null,task:null})} aria-current={mode==='examples'?'page':undefined}>สถานการณ์ตัวอย่าง</a><a href={href({view:'all',page:null})} aria-current={mode==='all'?'page':undefined}>โครงการทั้งหมด ({visible.length})</a></nav>}{mode==='examples'&&!query.task?<DemoScenarios currentUser={currentUser} onNavigate={onNavigate}/>:<section className="panel focused-card"><form className="focused-filters" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);onNavigate(target||'projects',null,{...query,view:'all',search:data.get('search'),status:data.get('status'),page:null})}}><label>ค้นหาโครงการ<input name="search" type="search" defaultValue={query.search||''} placeholder="ชื่อโครงการ หรือรหัส"/></label><label>สถานะ<select name="status" defaultValue={query.status||''}><option value="">ทั้งหมด</option>{[...new Set(visible.map(p=>p.status))].map(status=><option key={status} value={status}>{statusLabel(status,'th')}</option>)}</select></label><button className="primary">ค้นหา</button><a href={onNavigate.href(target||'projects',null,{view:'all'})}>ล้างตัวกรอง</a></form><div className="focused-list-rows">{filtered.slice((active-1)*6,active*6).map(p=><a className="recent-project" key={p.id} href={onNavigate.href(target||'details',p.id)}><small>{p.id} · {p.leader}</small><strong>{p.title}</strong><span>{statusLabel(p.status,'th')} →</span></a>)}{!filtered.length&&<p>ไม่พบโครงการที่ตรงกับเงื่อนไข <a href={onNavigate.href('projects')}>กลับสถานการณ์ตัวอย่าง</a></p>}</div>{pages>1&&<nav className="pagination" aria-label="หน้ารายการโครงการ">{active>1&&<a href={href({page:active-1})}>← ก่อนหน้า</a>}<span>หน้า {active} / {pages}</span>{active<pages&&<a href={href({page:active+1})}>ถัดไป →</a>}</nav>}</section>}</div>
}
