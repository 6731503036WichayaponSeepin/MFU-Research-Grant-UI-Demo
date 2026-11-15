import { useTranslation } from 'react-i18next'
import { nextTask } from '../utils/handoff'
import { statusLabel } from '../data/statuses'
import { matchesStaffFilter, projectCode } from '../utils/staffProjects'

export default function StaffProjectList({ projects, query, onNavigate, store }) {
  const { t, i18n } = useTranslation()
  if (store.loading) return <p role="status">{t('staffLoadingProjects')}</p>
  if (store.projectError) return <p role="alert">{t('staffProjectLoadError')}</p>

  const keyword = query.search?.trim().toLowerCase() || ''
  const now = new Date()
  const filtered = projects.filter(project =>
    matchesStaffFilter(project, query.filter, now) &&
    (query.task !== 'pending' || nextTask(project).role === 'staff') &&
    (!query.status || project.status === query.status) &&
    [projectCode(project), project.title, project.titleEn, project.leader].join(' ').toLowerCase().includes(keyword)
  )
  const pageSize = 6
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(pages, Math.max(1, Math.trunc(Number(query.page)) || 1))
  const href = params => onNavigate.href('projects', null, { ...query, ...params })
  const filters = [
    ['', 'totalProjects'], ['pending', 'pendingTasks'], ['review', 'staffPendingProposal'], ['active', 'staffInProgress'],
    ['nearDeadline', 'staffNearDeadline'], ['completed', 'staffCompleted'], ['closure', 'closureReview']
  ]

  return <div className="focused-project-list">
    {!store.shared && <nav className="focused-tabs" aria-label={t('staffProjectPages')}>
      <a href={onNavigate.href('projects', null, { view: 'examples' })}>{t('staffExamples')}</a>
      <a href={onNavigate.href('projects')} aria-current="page">{t('staffAllProjects')}</a>
    </nav>}
    <section className="panel focused-card">
      <form className="focused-filters" onSubmit={event => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const filter = form.get('filter')
        onNavigate('projects', null, { view: 'all', filter: filter === 'pending' ? null : filter, task: filter === 'pending' ? 'pending' : null, status: form.get('status'), search: form.get('search') })
      }}>
        <label>{t('staffSearchProjects')}<input name="search" type="search" defaultValue={query.search || ''} /></label>
        <label>{t('staffProjectFilter')}<select name="filter" defaultValue={query.task === 'pending' ? 'pending' : query.filter || ''}>
          {filters.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
        </select></label>
        <label>{t('staffProjectStatus')}<select name="status" defaultValue={query.status || ''}>
          <option value="">{t('totalProjects')}</option>
          {[...new Set(projects.map(project => project.status))].map(status =>
            <option key={status} value={status}>{statusLabel(status, i18n.language)}</option>
          )}
        </select></label>
        <button className="primary">{t('staffSearchProjects')}</button>
        <a href={onNavigate.href('projects')}>{t('staffClearFilters')}</a>
      </form>
      <p>{t('staffProjectCount', { count: filtered.length })}</p>
      <div className="focused-list-rows">
        {filtered.slice((page - 1) * pageSize, page * pageSize).map(project =>
          <a className="recent-project" key={project.id} href={onNavigate.href('details', project.id)}>
            <small>{projectCode(project) || t('staffNoProjectCode')} · {project.leader || t('staffUnspecified')}</small>
            <strong>{(i18n.language === 'en' && project.titleEn) || project.title || t('staffUnspecified')}</strong>
            <span>{statusLabel(project.status, i18n.language)} →</span>
          </a>
        )}
        {!filtered.length && <p>{t('staffNoProjects')}</p>}
      </div>
      {pages > 1 && <nav className="pagination" aria-label={t('staffProjectPages')}>
        {page > 1 && <a href={href({ page: page - 1 })}>← {t('staffPrevious')}</a>}
        <span>{page} / {pages}</span>
        {page < pages && <a href={href({ page: page + 1 })}>{t('staffNext')} →</a>}
      </nav>}
    </section>
  </div>
}
