import { PROJECT_STATES } from '../domain/contracts.js'
import { canAccess } from '../domain/permissions.js'
import { evaluationProgress } from '../domain/model.js'
import { validProposalDate } from './proposalValidation.js'
export const STAFF_PAGES = ['staff-review', 'administrative-records', 'project-change-record', 'closure-review', 'closure', 'reviewer-assignment', 'evaluation-tracking', 'final-verification', 'cancellation']
export function staffTask(p) {
  if (p.status === 'STAFF_REVIEW' && p.proposalReview?.actionRequiredBy === 'staff') return 'staff-review'
  if (p.status === 'COMMITTEE_ACKNOWLEDGEMENT') return 'administrative-records'
  if (p.status === 'CLOSURE_REVIEW' && p.closure?.actionRequiredBy === 'staff') return p.closure.method === 'report' && p.closure.check?.revision === p.closure.revision ? 'reviewer-assignment' : 'closure-review'
  if (p.status === 'REPORT_EVALUATION') return p.closure?.release ? p.closure.actionRequiredBy === 'staff' ? 'final-verification' : null : 'evaluation-tracking'
  return null
}
export function bangkokToday(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Bangkok' }).format(now) }
export function staffActionRequired(p) {
  if (!staffTask(p)) return false
  if (p.status !== 'REPORT_EVALUATION') return true
  return p.closure?.release ? p.closure.actionRequiredBy === 'staff' : evaluationProgress(p).complete
}
export function staffRows(projects, actor, query = {}, now = new Date()) {
  const today = bangkokToday(now)
  const rows = projects.filter(p => actor.role === 'staff' && p.schemaVersion === '1.6' && PROJECT_STATES.includes(p.status) && canAccess(p, actor))
    .filter(p => (!query.search || `${p.id} ${p.referenceNumber || ''} ${p.title} ${p.titleEn || ''} ${p.leader} ${p.affiliation}`.toLowerCase().includes(query.search.toLowerCase())) && (!query.status || p.status === query.status))
    .filter(p => !query.queue || query.queue === 'total' || query.queue === 'upcoming' && !['CLOSED', 'CANCELLED'].includes(p.status) && validProposalDate(p.endDate) && p.endDate >= today || query.queue === 'action' && staffActionRequired(p) || query.queue === 'final' && p.status === 'REPORT_EVALUATION' && !!p.closure?.release && p.closure.actionRequiredBy === 'staff' || query.queue === p.status || query.queue === staffTask(p))
  const keys = { updated: 'updatedAt', submitted: 'submittedAt', id: 'id', title: 'title', deadline: 'endDate' }, key = keys[query.sort] || 'submitted', direction = query.direction === 'asc' ? 1 : -1
  return rows.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')) * direction || a.id.localeCompare(b.id))
}
export const STAFF_QUEUES = Object.freeze(['total', 'staff-review', 'COMMITTEE_ACKNOWLEDGEMENT', 'IN_PROGRESS', 'upcoming', 'closure-review', 'REPORT_EVALUATION', 'final', 'CLOSED', 'CANCELLED', 'action'])
