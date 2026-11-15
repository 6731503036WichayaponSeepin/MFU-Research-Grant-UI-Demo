import { CalendarDays, CheckCircle2, ClipboardCheck, Clock3, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { statusLabel } from '../data/statuses'
import { matchesStaffFilter, projectCode, recentStaffProjects } from '../utils/staffProjects'

const cards = [
  [null, 'totalProjects', FolderOpen],
  ['review', 'staffPendingProposal', ClipboardCheck],
  ['active', 'staffInProgress', Clock3],
  ['nearDeadline', 'staffNearDeadline', CalendarDays],
  ['completed', 'staffCompleted', CheckCircle2]
]

export default function StaffOverview({ projects, onNavigate, onProject, store }) {
  const { t, i18n } = useTranslation()
  if (store.loading) return <p role="status">{t('staffLoadingProjects')}</p>
  if (store.projectError) return <p role="alert">{t('staffProjectLoadError')}</p>

  const recent = recentStaffProjects(projects)
  const now = new Date()
  const dateFormat = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-GB' : 'th-TH', {
    dateStyle: 'medium', timeZone: 'Asia/Bangkok'
  })
  const missing = t('staffUnspecified')

  return <div className="focused-overview">
    <section className="overview-stats staff-overview-stats" aria-label={t('projectSummary')}>
      {cards.map(([filter, label, Icon]) =>
        <a key={label} href={onNavigate.href('projects', null, { view: 'all', filter })} className="panel overview-stat">
          <Icon size={22} aria-hidden="true" />
          <span>{t(label)}</span>
          <strong>{projects.filter(p => matchesStaffFilter(p, filter, now)).length}</strong>
        </a>
      )}
    </section>
    <section className="panel focused-card">
      <div className="section-heading">
        <h2>{t('staffRecentProjects')}</h2>
        <a href={onNavigate.href('projects')}>{t('viewAll')} →</a>
      </div>
      {!recent.length && <p>{t('staffNoRecentProjects')}</p>}
      {recent.map(project =>
        <a className="recent-project" key={project.id} href={onProject(project.id)}>
          <small>{projectCode(project) || t('staffNoProjectCode')}</small>
          <strong>{(i18n.language === 'en' && project.titleEn) || project.title || project.proposal?.projectTitle || missing}</strong>
          <span>{t('staffProjectLeader')} · {project.leader || project.proposal?.leaderName || missing}</span>
          <span>{t('staffAffiliation')} · {project.affiliation || project.proposal?.leaderAffiliation || missing}</span>
          <span>{t('staffLastSubmitted')} · <time dateTime={project.submittedAt}>{dateFormat.format(new Date(project.submittedAt))}</time></span>
          <span>{statusLabel(project.status, i18n.language)} · {t('projectDetails')} →</span>
        </a>
      )}
    </section>
  </div>
}
