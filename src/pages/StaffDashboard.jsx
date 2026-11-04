import AdvisorShowcase from '../components/AdvisorShowcase'
import { useLiveProjects } from '../utils/useLiveProjects'
import StaffRegistry from '../components/StaffRegistry'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Users,
  FolderKanban,
  ClipboardCheck,
  FileCheck2,
  Search,
  Clock3,
  CalendarDays,
  Activity,
  RefreshCw,
  Eye,
  ChevronRight,
  ListChecks
} from 'lucide-react'


import { statusLabels as STATUS, timelineSteps as WORKFLOW, workflow } from '../data/statuses'
import { getProjects } from '../utils/projectStorage'
const STEP_STATUSES = workflow.map(([key]) => key === 'admin_review' ? [key, 'revision_required'] : [key])
const readProjects = getProjects

function formatDate(value, thai) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString(thai ? 'th-TH' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function StaffDashboard({
  onViewProject,
  onProposalReview,
  currentUser,
  onOpenClosure,
  onAdministrative
}) {
  const { i18n } = useTranslation()
  const thai = i18n.language !== 'en'
  const t = (th, en) => thai ? th : en

  const [projects, setProjects] = useLiveProjects(readProjects)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [fiscalYear, setFiscalYear] = useState('all')

  const years = useMemo(() => {
    const found = projects.map(p => {
      const date = new Date(p.createdAt)
      return Number.isNaN(date.getTime()) ? null : String(date.getFullYear() + 543)
    }).filter(Boolean)
    return [...new Set(found)].sort((a, b) => Number(b) - Number(a))
  }, [projects])

  const yearProjects = useMemo(() => projects.filter(p => {
    if (fiscalYear === 'all') return true
    const date = new Date(p.createdAt)
    if (Number.isNaN(date.getTime())) return false
    // Prototype: grouping by calendar year, not official fiscal year
    return String(date.getFullYear() + 543) === fiscalYear
  }), [projects, fiscalYear])

  const count = (...statuses) =>
    yearProjects.filter(p => statuses.includes(p.status)).length

  const cards = [
    {
      title: t('รอการพิจารณาข้อเสนอ', 'Pending Proposal Reviews'),
      value: count('admin_review', 'revision_required'),
      icon: FileText, tone: 'blue', filter: 'review'
    },
    {
      title: t('รอบันทึกผลการพิจารณา', 'Waiting Committee Record'),
      value: count('committee_review'),
      icon: Users, tone: 'orange', filter: 'committee'
    },
    {
      title: t('โครงการที่อยู่ระหว่างดำเนินการ', 'Active Research Projects'),
      value: count('active'),
      icon: FolderKanban, tone: 'green', filter: 'active'
    },
    {
      title: t('รอตรวจสอบเอกสารปิดโครงการ', 'Pending Closure Check'),
      value: count('closure_review', 'closure'),
      icon: ClipboardCheck, tone: 'purple', filter: 'closure'
    },
    {
      title: t('รอพิจารณารายงานฉบับสมบูรณ์', 'Final Report Reviews Pending'),
      value: count('final_report'),
      icon: FileCheck2, tone: 'pink', filter: 'final'
    }
  ]

  const visibleProjects = yearProjects.filter(p => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch = [
      p.id, p.title, p.leader
    ].join(' ').toLowerCase().includes(keyword)

    const filterStatuses = {
      review: ['admin_review', 'revision_required'],
      committee: ['committee_review'],
      active: ['active'],
      closure: ['closure_review', 'closure'],
      final: ['final_report']
    }

    return matchesSearch &&
      (filter === 'all' || (filterStatuses[filter] || []).includes(p.status))
  }).sort((a, b) =>
    new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
  )

  const overview = STEP_STATUSES.map(statuses =>
    yearProjects.filter(p => statuses.includes(p.status)).length
  )

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const now = new Date()
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const amount = yearProjects.filter(p => {
      const created = new Date(p.createdAt)
      return !Number.isNaN(created.getTime()) &&
        created.getMonth() === date.getMonth() &&
        created.getFullYear() === date.getFullYear()
    }).length
    return {
      month: date.toLocaleDateString(thai ? 'th-TH' : 'en-US', { month: 'short' }),
      value: amount
    }
  })

  const maxMonthly = Math.max(1, ...monthly.map(m => m.value))

  return (
    <div className="ra-dashboard">
      <header className="ra-page-heading">
        <div>
          <h1>{t('ทะเบียนและติดตามโครงการวิจัย', 'Research Project Registry')}</h1>
          <p>{t('ข้อมูลทะเบียนทุนส่วนตัวและการดำเนินงานของเจ้าหน้าที่', 'Personal grant registry and staff workflow')}</p>
        </div>
        <div className="ra-header-actions">
        
            <button
              type="button"
              onClick={() => onProposalReview?.()}
            >
              <ListChecks size={17} />
              {t('งานรอตรวจสอบ', 'Review Queue')}
            </button>

            <button
              type="button"
              onClick={() => setProjects(readProjects())}
            >
              <RefreshCw size={17} />
              {t('รีเฟรชข้อมูล', 'Refresh')}
            </button>
          </div>

      </header>

      <AdvisorShowcase projects={projects} onViewProject={onViewProject} onAdministrative={onAdministrative} onOpenClosure={onOpenClosure} onProposalReview={onProposalReview}/>
      <StaffRegistry projects={projects} currentUser={currentUser} onViewProject={onViewProject} onOpenClosure={onOpenClosure} onAdministrative={onAdministrative} />
      <details><summary>ภาพรวมสถิติและงานที่รอดำเนินการ</summary>
      <div className="ra-summary-grid">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <button
              type="button"
              className="ra-summary-card"
              key={card.title}
              onClick={() => {
                setFilter(card.filter)
                document.getElementById('ra-tasks')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <div className={`ra-summary-icon ra-${card.tone}`}>
                <Icon size={23} />
              </div>
              <div className="ra-summary-body">
                <strong>{card.title}</strong>
                <div className="ra-summary-value">
                  <b>{card.value}</b>
                  <span>{t('โครงการ', 'projects')}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="ra-main-grid">
        <div className="ra-left-column">
          <section className="ra-panel">
            <div className="ra-panel-heading">
              <div>
                <h2>{t('ภาพรวมงาน','Work Overview')}</h2>
                <p>{t('ภาพรวมสถานะโครงการในระบบ', 'Project workflow overview')}</p>
              </div>
              <label className="ra-year">
                <span>{t('ปีที่บันทึกโครงการ', 'Project Year')}</span>
                <select
                  value={fiscalYear}
                  onChange={e => setFiscalYear(e.target.value)}
                >
                  <option value="all">{t('ทุกปี', 'All Years')}</option>
                  {years.map(year => (
                    <option value={year} key={year}>
                      {year} ({Number(year) - 543})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="ra-workflow-scroll">
              <div className="ra-workflow">
                {WORKFLOW.map((step, i) => (
                  <div className="ra-workflow-step" key={i}>
                    <div className={`ra-workflow-number ra-step-${i + 1}`}>
                      {i + 1}
                    </div>
                    <strong>{t(step[0], step[1])}</strong>
                    <b>{overview[i]}</b>
                    <small>{t('โครงการ', 'projects')}</small>
                    {i < WORKFLOW.length - 1 && (
                      <ChevronRight className="ra-workflow-arrow" size={17} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="ra-panel" id="ra-tasks">
            <div className="ra-panel-heading">
              <div>
                <h2>{t('งานที่รอดำเนินการ','Pending Tasks')}</h2>
                <p>{t('รายการโครงการและงานที่ต้องดำเนินการ', 'Project tasks and review queue')}</p>
              </div>
              <span className="ra-record-count">
                {visibleProjects.length} {t('รายการ', 'records')}
              </span>
            </div>

            <div className="ra-task-controls">
              <div className="ra-search">
                <Search size={17} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('ค้นหาโครงการ...', 'Search projects...')}
                />
              </div>
              <select aria-label={t('กรองสถานะ','Filter status')} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">{t('ทุกสถานะ', 'All Statuses')}</option>
                <option value="review">{t('รอตรวจสอบข้อเสนอ', 'Proposal Review')}</option>
                <option value="committee">{t('รอบันทึกผล', 'Committee Record')}</option>
                <option value="active">{t('ดำเนินการวิจัย', 'Active Research')}</option>
                <option value="closure">{t('ตรวจสอบเอกสารปิดโครงการ', 'Closure Check')}</option>
                <option value="final">{t('รายงานฉบับสมบูรณ์', 'Final Report')}</option>
              </select>
            </div>

            <div className="ra-table-scroll">
              <table className="ra-table">
                <thead>
                  <tr>
                    <th>{t('รหัสโครงการ', 'Project ID')}</th>
                    <th>{t('ชื่อโครงการ', 'Project Title')}</th>
                    <th>{t('สถานะปัจจุบัน', 'Current Status')}</th>
                    <th>{t('งานที่ต้องดำเนินการ', 'Assigned Action')}</th>
                    <th>{t('ดำเนินการ', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ra-empty">
                        {t('ยังไม่มีโครงการในรายการนี้', 'No projects found')}
                      </td>
                    </tr>
                  ) : visibleProjects.map(project => {
                    const label = STATUS[project.status] || [
                      'ไม่ทราบสถานะ', 'Unknown Status'
                    ]
                    return (
                      <tr key={project.id}>
                        <td className="ra-id">{String(project.id || '').slice(0, 16)}</td>
                        <td>
                          <strong className="ra-project-title">
                            {project.title || '-'}
                          </strong>
                          <small>{project.leader || '-'}</small>
                        </td>
                        <td>
                          <span className={`ra-status ra-status-${project.status}`}>
                            {t(label[0], label[1])}
                          </span>
                        </td>
                        <td>{t(label[0], label[1])}</td>
                        <td>
                          <button
                            className="ra-open-btn"
                            onClick={() => onViewProject?.(project.id)}
                          >
                            <Eye size={15} />
                            {t('เปิด', 'Open')}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="ra-panel">
            <div className="ra-panel-heading">
              <div>
                <h2>{t('จำนวนโครงการรายเดือน','Monthly Workload')}</h2>
                <p>{t('จำนวนข้อเสนอโครงการที่บันทึกรายเดือน', 'Monthly recorded proposals')}</p>
              </div>
            </div>
            <div className="ra-chart">
              {monthly.map((item, i) => (
                <div className="ra-chart-column" key={i}>
                  <strong>{item.value}</strong>
                  <div className="ra-chart-bar-area">
                    <div
                      className="ra-chart-bar"
                      style={{ height: `${Math.max(3, item.value / maxMonthly * 100)}%` }}
                    />
                  </div>
                  <small>{item.month}</small>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="ra-right-column">
          <section className="ra-panel">
            <div className="ra-panel-heading">
              <div>
                <h2>{t('กิจกรรมล่าสุด','Recent Activity')}</h2>
                <p>{t('โครงการที่บันทึกล่าสุด', 'Recently recorded projects')}</p>
              </div>
              <Activity size={19} color="#64748b" />
            </div>
            <div className="ra-activity-list">
              {[...yearProjects]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 5)
                .map(project => (
                  <button
                    className="ra-activity"
                    key={project.id}
                    onClick={() => onViewProject?.(project.id)}
                  >
                    <span className="ra-activity-dot" />
                    <span>
                      <strong>{project.title || '-'}</strong>
                      <small>
                        {t(
                          ...(STATUS[project.status] || ['ไม่ทราบสถานะ', 'Unknown Status'])
                        )}
                      </small>
                    </span>
                    <time>{formatDate(project.updatedAt || project.createdAt, thai)}</time>
                  </button>
                ))}
              {yearProjects.length === 0 && (
                <p className="ra-empty-text">
                  {t('ยังไม่มีกิจกรรม', 'No recent activity')}
                </p>
              )}
            </div>
          </section>

          <section className="ra-panel">
            <div className="ra-panel-heading">
              <div>
                <h2>{t('กำหนดส่งที่ใกล้ถึง','Upcoming Deadlines')}</h2>
                <p>{t('กำหนดส่งงานที่ใกล้ถึง', 'Upcoming project deadlines')}</p>
              </div>
              <CalendarDays size={19} color="#64748b" />
            </div>

            {yearProjects.filter(p=>p.status==='active' && p.endDate).sort((a,b)=>a.endDate.localeCompare(b.endDate)).slice(0,5).map(p=><button key={p.id} className="ra-activity" onClick={()=>onViewProject(p.id)}><Clock3 size={18}/><span>{p.id}<small>{formatDate(p.endDate,thai)}</small></span></button>)}
            {!yearProjects.some(p=>p.status==='active' && p.endDate) && <p>{t('ไม่มีกำหนดส่ง','No deadlines available')}</p>}
          </section>
        </div>
      </div>
      </details>
    </div>
  )
}
