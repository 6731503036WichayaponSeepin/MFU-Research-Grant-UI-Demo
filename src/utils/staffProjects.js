import { nextTask } from './handoff.js'
import { normalizeStatus } from '../data/statuses.js'

const statusByFilter = {
  review: 'admin_review',
  active: 'active',
  completed: 'completed'
}

export function projectCode(project) {
  const code = typeof project.projectCode === 'string' ? project.projectCode.trim() : ''
  return /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(code) ? '' : code
}

export function staffDeadlineDays(project, now = new Date()) {
  if (normalizeStatus(project.status) === 'completed') return null
  // Recording a confirmed extension updates the authoritative project end date.
  const end = project.endDate || project.proposal?.endDate
  if (!/^\d{4}-\d{2}-\d{2}$/.test(end || '')) return null
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(now)
  const due = Date.parse(end)
  if (!Number.isFinite(due) || new Date(due).toISOString().slice(0, 10) !== end) return null
  return (due - Date.parse(today)) / 86400000
}

export function matchesStaffFilter(project, filter, now) {
  if (filter === 'closure') {
    return normalizeStatus(project.status) === 'closure_review' &&
      (!project.closure?.state || nextTask(project).role === 'staff')
  }
  if (filter === 'nearDeadline') {
    const days = staffDeadlineDays(project, now)
    return days !== null && days >= 0 && days <= 30
  }
  return !Object.hasOwn(statusByFilter, filter) || normalizeStatus(project.status) === statusByFilter[filter]
}

export function recentStaffProjects(projects) {
  return projects.filter(p => Number.isFinite(Date.parse(p.submittedAt)))
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
    .slice(0, 5)
}
