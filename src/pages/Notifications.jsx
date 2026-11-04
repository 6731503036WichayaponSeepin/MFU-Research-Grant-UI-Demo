import { useSyncExternalStore } from 'react'
import { sharedMode, subscribeStore, getNotifications, markNotificationsRead } from '../utils/sharedStore'
import { deadlineItems } from '../utils/deadlines'
import { useLiveProjects } from '../utils/useLiveProjects'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getProjects } from '../utils/projectStorage'
import { canRead } from '../utils/closure'
import { statusLabel } from '../data/statuses'
export default function Notifications({currentUser,onViewProject,page=1,onPage}) {
  const remoteNotifications=useSyncExternalStore(subscribeStore,getNotifications)
  const [sharedProjects] = useLiveProjects(getProjects)
  const {i18n}=useTranslation(), th=i18n.language!=='en'
  const key='mfu-notifications-read-'+currentUser.role
  const [read,setRead]=useState(()=>localStorage.getItem(key)||'')
  const [error,setError]=useState('')
  const deadlines=deadlineItems(sharedProjects.filter(p=>canRead(p,currentUser)))
  const localEvents=sharedProjects.filter(p=>canRead(p,currentUser)).flatMap(p=>(p.statusHistory||[]).map((h,i)=>({...h,project:p,eventId:p.id+':'+i}))).sort((a,b)=>new Date(b.updatedAt||b.date)-new Date(a.updatedAt||a.date))
  const events=sharedMode ? remoteNotifications.map(n=>({...n,project:sharedProjects.find(p=>p.id===n.projectId),eventId:n.id,updatedAt:n.createdAt,note:n.action})).filter(n=>n.project).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)) : localEvents
  const pages=Math.max(1,Math.ceil(events.length/6)),active=Math.min(pages,Math.max(1,page))
  return <section className="panel card"><div className="page-heading"><h1>{th?'การแจ้งเตือนและกิจกรรม':'Notifications and activity'}</h1><button className="outline-button" onClick={async ()=>{try{if(sharedMode){await markNotificationsRead(currentUser);return}const now=new Date().toISOString();localStorage.setItem(key,now);setRead(now)}catch{setError(th?'บันทึกไม่ได้':'Unable to save')}}}>{th?'ทำเครื่องหมายว่าอ่านทั้งหมด':'Mark all read'}</button></div>{!!deadlines.length&&<section className="deadline-alerts"><h2>{th?'กำหนดส่งโครงการ':'Project deadlines'}</h2>{deadlines.slice(0,3).map(({project,days,eventId})=><button className="deadline-alert" key={eventId} onClick={()=>onViewProject(project.id)}><strong>{project.id}</strong><span>{days<0?(th?'เกินกำหนด '+(-days)+' วัน':'Overdue by '+(-days)+' days'):(th?'ครบกำหนดใน '+days+' วัน':'Due in '+days+' days')}</span></button>)}</section>}{error&&<p role="alert">{error}</p>}{!events.length&&<p>{th?'ยังไม่มีกิจกรรม':'No activity yet'}</p>}{events.slice((active-1)*6,active*6).map(h=><article className="notification-item" key={h.eventId}><span className="notification-dot" style={{opacity:sharedMode ? (h.readAt?.seconds ? .2 : 1) : (h.updatedAt||h.date)>read?1:.2}}/><div><button className="text-button" onClick={()=>onViewProject(h.project.id)}>{h.project.id} · {th?h.project.title:h.project.titleEn||h.project.title}</button><p>{statusLabel(h.status,i18n.language)} · {h.note}</p><small>{h.updatedAt||h.date} · {h.updatedBy||h.by}</small></div></article>)}{pages>1&&<nav className="pagination" aria-label="หน้าการแจ้งเตือน"><button className="outline-button" disabled={active<=1} onClick={()=>onPage(active-1)}>ก่อนหน้า</button><span>{active} / {pages}</span><button className="outline-button" disabled={active>=pages} onClick={()=>onPage(active+1)}>ถัดไป</button></nav>}</section>
}
