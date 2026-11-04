import { FolderOpen, ClipboardCheck, Clock3, CheckCircle2 } from 'lucide-react'
import { canRead } from '../utils/closure'
import { nextTask } from '../utils/handoff'
import { statusLabel } from '../data/statuses'
import { useTranslation } from 'react-i18next'
export default function RoleOverview({projects,currentUser,onNavigate,onProject}) {
  const {t,i18n}=useTranslation()
  const visible=projects.filter(p=>canRead(p,currentUser))
  const pending=visible.filter(p=>nextTask(p).role===currentUser.role)
  const stats=[[t('totalProjects'),visible.length,FolderOpen,{view:'all'}],[t('pendingTasks'),pending.length,ClipboardCheck,{view:'all',task:'pending'}],[t('activeProjects'),visible.filter(p=>p.status==='active').length,Clock3,{view:'all',status:'active'}],[t('completedProjects'),visible.filter(p=>p.status==='completed').length,CheckCircle2,{view:'all',status:'completed'}]]
  const recent=[...visible].sort((a,b)=>(b.updatedAt||b.createdAt||'').localeCompare(a.updatedAt||a.createdAt||'')).slice(0,3)
  return <div className="focused-overview"><section className="overview-stats" aria-label={t('projectSummary')}>{stats.map(([label,count,Icon,params])=><a key={label} href={onNavigate.href('projects',null,params)} className="panel overview-stat"><Icon size={22}/><span>{label}</span><strong>{count}</strong></a>)}</section><div className="overview-columns"><section className="panel focused-card"><div className="section-heading"><h2>{t('recentProjects')}</h2><a href={onNavigate.href('projects')}>{t('viewAll')} →</a></div>{recent.map(p=><a className="recent-project" key={p.id} href={onProject(p.id)}><small>{p.id}</small><strong>{i18n.language==='en'?(p.titleEn||p.title):p.title}</strong><span>{statusLabel(p.status,i18n.language)} →</span></a>)}</section></div></div>
}
