import { useLiveProjects } from '../utils/useLiveProjects'
import { getProjects } from '../utils/projectStorage'
import { workflow, statusConfig } from '../data/statuses'
import { owns } from '../utils/closure'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'


function readProjects(currentUser) {
  try {
    const saved = getProjects()
    if (!Array.isArray(saved)) return { projects: [], error: true }
    const projects = saved.filter(p => p && typeof p.id === 'string' && (!currentUser || owns(p, currentUser))).map(p => {
      const date = typeof (p.submittedAt || p.createdAt) === 'string' ? new Date(p.submittedAt || p.createdAt) : null
      const validDate = date && !Number.isNaN(date.getTime()) ? date : null
      return {
        id: p.id,
        title: typeof p.title === 'string' ? p.title : '',
        titleEn: p.titleEn || '',
        leader: typeof p.leader === 'string' ? p.leader : '',
        budget: typeof p.budget === 'number' && Number.isFinite(p.budget) ? p.budget : null,
        date: validDate,
        year: validDate ? String(validDate.getFullYear()) : '',
        status: statusConfig[p.status] ? p.status : 'unknownStatus'
      }
    }).sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
    return { projects, error: false }
  } catch {
    return { projects: [], error: true }
  }
}

const PAGE_SIZE = 5

function MyProjects({ currentUser, onNewProposal, onViewProject, title, description }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'th'

  const [{ projects, error }] = useLiveProjects(() => readProjects(currentUser))
  const years = [...new Set(projects.map(p => p.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a))

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [year, setYear] = useState('all')
  const [page, setPage] = useState(1)

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesSearch =
        project.id.toLowerCase().includes(keyword) ||
        project.title.toLowerCase().includes(keyword)

      const matchesStatus =
        status === 'all' || project.status === status

      const matchesYear =
        year === 'all' || project.year === year

      return matchesSearch && matchesStatus && matchesYear
    })
  }, [projects, search, status, year])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / PAGE_SIZE)
  )

  const visibleProjects = filteredProjects.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const dateFormatter = new Intl.DateTimeFormat(
    lang === 'th' ? 'th-TH' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )

  function resetFilters() {
    setSearch('')
    setStatus('all')
    setYear('all')
    setPage(1)
  }

  function openDetails(project) {
    if (onViewProject) {
        onViewProject(project.id)
    }
  }

  return (
    <div className="my-projects">
      <div className="dashboard-heading">
        <div>
          <h1>{title || t('myProjects')}</h1>
          <p>{description || t('projectsDescription')}</p>
        </div>

        {onNewProposal && <button className="primary" onClick={onNewProposal}>
          + {t('newProposal')}
        </button>}
      </div>

      {error && <p className="submission-error" role="alert">{t('projectsLoadError')}</p>}
      <section className="panel project-filter-panel">
        <div className="project-filters">
          <label className="filter-search">
            <span>{t('searchProjects')}</span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={t('searchPlaceholder')}
            />
          </label>

          <label>
            <span>{t('filterStatus')}</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">{t('allStatuses')}</option>
              {workflow.map(([key]) => <option key={key} value={key}>{t(key)}</option>)}
              <option value="revision_required">{t('revision_required')}</option>
            </select>
          </label>

          <label>
            <span>{t('submissionYear')}</span>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">{t('allYears')}</option>
              {years.map(value => (
                <option key={value} value={value}>{lang === 'th' ? Number(value) + 543 : value}</option>
              ))}
            </select>
          </label>

          <button className="outline-button" onClick={resetFilters}>
            {t('clearFilters')}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{t('projectList')}</h2>
          <span className="muted">
            {t('resultsCount', { count: filteredProjects.length })}
          </span>
        </div>

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
              {visibleProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{(lang === 'en' ? project.titleEn || project.title : project.title) || t('untitledProject')}</td>
                  <td>
                    {project.date ? dateFormatter.format(project.date) : '—'}
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${project.status}`}
                    >
                      {t(project.status)}
                    </span>
                  </td>
                  <td>
                    <div className="project-actions">
                      <button
                        className="outline-button"
                        onClick={() => openDetails(project)}
                      >
                        {t('details')}
                      </button>

                      {project.status === 'draft' && (
                        <button
                          className="outline-button"
                          onClick={() => openDetails(project)}
                        >
                          {t('edit')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {visibleProjects.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-results">
                    {t('noProjectsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            {t('paginationInfo', {
              from: filteredProjects.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1,
              to: Math.min(
                page * PAGE_SIZE,
                filteredProjects.length
              ),
              total: filteredProjects.length
            })}
          </span>

          <div className="pagination-buttons">
            <button
              className="outline-button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              {t('previous')}
            </button>
            <span>{page} / {totalPages}</span>
            <button
              className="outline-button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t('next')}
            </button>
          </div>
        </div>
      </section>

         <div className="project-help">
        <strong>{t('projectHelpTitle')}</strong>
        <p>{t('projectHelpDescription')}</p>
      </div>
    </div>
  )
}

export default MyProjects
