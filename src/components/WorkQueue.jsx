import { assignedReviewers } from '../utils/evaluation'
import { ArrowUpRight, CheckCheck, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLiveProjects } from '../utils/useLiveProjects'
import { getProjects } from '../utils/projectStorage'
import { owns } from '../utils/closure'
import { deadlineItems } from '../utils/deadlines'
import { nextTask } from '../utils/handoff'
import { useState } from 'react'

export default function WorkQueue({ currentUser, onOpen }) {
  const [projects] = useLiveProjects(getProjects)
  const [showAll, setShowAll] = useState(false)
  const { i18n } = useTranslation()
  const th = i18n.language !== 'en'
  const word = (a,b) => th ? a : b
  const items = projects.flatMap(p => {
    const task = nextTask(p)
    const visible = currentUser.role === 'staff' || owns(p, currentUser) || (currentUser.role === 'reviewer' && assignedReviewers(p.closure).includes(currentUser.username))
    if (!visible || task.role !== currentUser.role || (currentUser.role === 'reviewer' && p.closure?.evaluations?.[currentUser.username]?.submitted)) return []
    return [{ project:p, label:task.title, route:task.route }]
  })
  const due = currentUser.role === 'reviewer' ? [] : deadlineItems(projects.filter(p=>currentUser.role === 'staff' || owns(p,currentUser)))
  return <section className="work-queue">
    <div className="queue-heading"><div><span className="section-kicker">YOUR NEXT STEP</span><h2>{word('งานที่ต้องดำเนินการ','Your next actions')} <span className="queue-count">{items.length}</span></h2></div><CheckCheck size={23}/></div>
    {items.length ? <div className="queue-grid">{items.slice(0,showAll ? items.length : 4).map(({project,label,route})=><button key={project.id} className="queue-item" onClick={()=>onOpen(project.id,route)}><span className="queue-action">{label}<ArrowUpRight size={17}/></span><strong>{th ? project.title : project.titleEn || project.title}</strong><small>{project.id}</small></button>)}</div> : <p className="queue-empty">{word('ไม่มีงานค้างในขณะนี้ ดูโครงการและติดตามสถานะได้จากเมนูด้านข้าง','You’re all caught up. Browse your projects from the navigation.')}</p>}
    {items.length > 4 && <button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'แสดงน้อยลง' : `ดูงานทั้งหมด ${items.length} รายการ`}</button>}
    {!!due.length && <div className="queue-deadlines">{due.slice(0,3).map(({project,days})=><button key={project.id} onClick={()=>onOpen(project.id)}><Clock3 size={16}/><span>{project.id} · {days < 0 ? word(`เกินกำหนด ${-days} วัน`,`Overdue by ${-days} days`) : word(`ครบกำหนดใน ${days} วัน`,`Due in ${days} days`)}</span><ArrowUpRight size={15}/></button>)}</div>}
  </section>
}

