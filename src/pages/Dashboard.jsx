import { useLiveProjects } from '../utils/useLiveProjects'
import { getProjects } from '../utils/projectStorage'
import { demoShowcase } from '../utils/reviewerPresentation'
import { owns } from '../utils/closure'
import { ArrowUpRight, FolderOpen, FilePenLine, Clock3, Activity, CircleCheck, FlaskConical } from 'lucide-react'

import { useTranslation } from 'react-i18next'


function Dashboard({ onNewProposal, onNavigate, currentUser, onViewProject }) {
  const [sharedProjects] = useLiveProjects(getProjects)
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'th'

  const projects = sharedProjects.filter(p=>owns(p,currentUser))
  const showcase=demoShowcase(projects,'researcher')
  const recentProjects=showcase.length?showcase:projects.slice(0,5)
  const released=projects.filter(p=>p.closure?.feedbackReleasedAt)
  const count = (...statuses) => projects.filter(p=>statuses.includes(p.status)).length
  const deadline = projects.filter(p=>p.status==='active' && p.endDate).sort((a,b)=>a.endDate.localeCompare(b.endDate))[0]
  const stats = [
    { key: 'totalProjects', icon: FolderOpen, value: projects.length },
    { key: 'draftProposals', icon: FilePenLine, value: count('draft') },
    { key: 'underReview', icon: Clock3, value: count('unit_review','eoffice_pending','admin_review','committee_review','revision_required') },
    { key: 'activeProjects', icon: Activity, value: count('active') },
    { key: 'completedProjects', icon: CircleCheck, value: count('completed') }
  ]

  const dateFormatter = new Intl.DateTimeFormat(
    lang === 'th' ? 'th-TH' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>{t('summary')}</h1>
          <p>{t('summaryDescription')}</p>
        </div>
        <button className="primary" onClick={onNewProposal}>
          + {t('newProposal')}
        </button>
      </div>

      <section className="research-banner">
        <div><span className="banner-eyebrow">MFU · RESEARCH WORKSPACE</span>
          <h2>{lang === 'th' ? 'เริ่มต้นงานวิจัย สร้างความเป็นไปได้ใหม่' : 'Your next discovery starts here.'}</h2>
          <p>{lang === 'th' ? 'เตรียมข้อเสนอ จัดการโครงการ และติดตามงานวิจัยในพื้นที่เดียว' : 'Prepare proposals, manage projects, and keep your research moving.'}</p>
          <button onClick={onNewProposal}>{t('newProposal')} <ArrowUpRight size={18} /></button>
        </div><div className="banner-art" aria-hidden="true"><FlaskConical size={76} strokeWidth={1} /></div>
      </section>
      <div className="stats-grid">
        {stats.map((item) => (
          <div className="stat-card" key={item.key}>
            <div className="stat-icon"><item.icon size={20} /></div><span>{t(item.key)}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>{showcase.length?'ชุดสาธิตนักวิจัย 5 สถานการณ์':t('recentProjects')}</h2>
          
        </div>

        {!!showcase.length&&<p className="review-demo-note">DEMO DATA — ข้อมูลสมมติสำหรับการทดสอบระบบ · แสดงชุดแนะนำ 5 โครงการ โครงการอื่นที่บัญชีนี้เป็นเจ้าของยังอยู่ในเมนูโครงการทั้งหมด</p>}
        <div className="table-scroll">
          <table className="projects-table">
            <thead>
              <tr>
                <th>{t('projectCode')}</th>
                <th>{t('projectName')}</th>
                <th>{t('submissionDate')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{lang === 'en' ? project.titleEn || project.title : project.title}</td>
                  <td>{Number.isNaN(new Date(project.submittedAt || project.createdAt).getTime()) ? '—' : dateFormatter.format(new Date(project.submittedAt || project.createdAt))}</td>
                  <td>
                    <span className={`status-badge status-${project.status}`}>
                      {t(project.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="outline-button"
                      onClick={() => onViewProject(project.id)}
                    >
                      {t('details')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!!released.length&&<section className="panel cl-card"><h2>ข้อเสนอแนะที่เจ้าหน้าที่ส่งให้นักวิจัยแล้ว</h2>{released.map(p=><div className="notification-item" key={p.id}><div><strong>{p.title}</strong><p>{p.closure.revisionInstructions}</p><button className="outline-button" onClick={()=>onViewProject(p.id)}>ดูข้อเสนอแนะและแก้ไขรายงาน</button></div></div>)}</section>}
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-heading">
            <h2>{t('recentNotifications')}</h2>
            <button
              className="text-button"
              onClick={() => onNavigate('notifications')}
            >
              {t('viewAll')}
            </button>
          </div>
          {projects.slice(0,2).map(p=><div className="notification-item" key={p.id}><span className="notification-dot"/><div><strong>{t(p.status)}</strong><p>{p.id}</p></div></div>)}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>{t('upcomingDeadlines')}</h2>
            
          </div>
          <div className="deadline-content">{deadline ? <><strong>{deadline.id}</strong><p>{lang === 'en' ? deadline.titleEn || deadline.title : deadline.title}</p><span className="deadline-days">{t('daysRemaining',{days:Math.max(0,Math.ceil((new Date(deadline.endDate)-new Date())/86400000))})}</span></> : <p>{lang === 'en' ? 'No upcoming deadlines' : 'ไม่มีกำหนดส่ง'}</p>}</div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
