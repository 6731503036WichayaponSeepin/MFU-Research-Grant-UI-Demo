import { canAccess, hasCapability, projectProjection } from '../domain/permissions.js'
import { evaluationProgress } from '../domain/model.js'
import { isFoundationProject } from '../domain/contracts.js'
import { canRead } from './closure.js'

export const COMMON_PAGES = ['dashboard', 'projects', 'details', 'timeline', 'documents', 'notifications', 'not-found']
export const roleNavigation = role => ['dashboard', 'projects', ...(role === 'researcher' ? ['choose'] : []), 'notifications']
export function routeAllowed(page, role) {
  if (['manual', 'submission', 'choose', 'upload', 'proposal-pdf', 'revised-report'].includes(page)) return role === 'researcher'
  if (['staff-review', 'administrative-records', 'project-change-record', 'closure-review', 'reviewer-assignment', 'evaluation-tracking', 'final-verification', 'cancellation'].includes(page)) return role === 'staff'
  if (['evaluation', 'answers', 'assigned-report', 'my-evaluation'].includes(page)) return role === 'reviewer'
  if (page === 'closure') return ['researcher', 'staff'].includes(role)
  return ['researcher', 'staff', 'reviewer'].includes(role)
}
export function visibleProject(raw, actor) {
  if (isFoundationProject(raw)) return canAccess(raw, actor) ? projectProjection(raw, actor) : null
  if (!canRead(raw, actor) || raw.workspace && raw.workspace !== actor.workspace) return null
  const p = structuredClone(raw), c = p.closure, uid = actor.uid || actor.username
  if (actor.role !== 'staff') {
    delete p.registry; delete p.registryHistory
    if (c) {
      c.evaluations = Object.fromEntries(Object.entries(c.evaluations || {}).filter(([id, e]) => actor.role === 'reviewer' ? id === uid : c.feedbackReleasedAt && e.submitted))
      delete c.reviewRounds; delete c.history; delete c.evaluation
    }
    p.statusHistory = (p.statusHistory || []).filter(e => !['review', 'review_draft'].includes(e.action) || (e.by || e.updatedBy) === uid || actor.role === 'researcher' && c?.feedbackReleasedAt)
      .map(e => { const clean = { ...e }; delete clean.snapshot; delete clean.details; return clean })
    if (actor.role === 'reviewer') {
      p.changeRecords = []; p.extensionRecords = []; p.administrativeRecords = []; p.proposalVersions = []
      p.cancellation = null; p.signatureConsent = null
      p.proposal = { objectives: p.proposal?.objectives, methodology: p.proposal?.methodology }
    }
  }
  return p
}
export function permittedDocuments(project, actor) {
  const p = visibleProject(project, actor)
  if (!p) return []
  if (isFoundationProject(p)) return p.documents.filter(d => hasCapability(project, actor, 'download', { document: d }))
  const uid = actor.uid || actor.username, c = p.closure
  const docs = [p.proposal?._document && { ...p.proposal._document, kind: 'proposal', id: 'proposal' }, ...(c?.documents || []), ...(p.documents || []),
    ...Object.values(c?.evaluations || {}).flatMap(e => e.documents || [])].filter(Boolean)
  return docs.filter((d, i) => docs.findIndex(other => (other.id || other.dataUrl || other.storagePath) === (d.id || d.dataUrl || d.storagePath)) === i)
    .filter(d => actor.role !== 'reviewer' || d.kind === 'report' || d.kind === 'feedback' && (c?.evaluations?.[uid]?.documents || []).some(f => f.id === d.id))
    .filter(d => actor.role !== 'researcher' || d.kind !== 'feedback' || !!c?.feedbackReleasedAt)
}
// Never accept arbitrary remote/public URLs in the private document viewer.
export function realPdfUrl(document) {
  const url = document?.dataUrl
  if (!url?.startsWith('data:application/pdf;base64,')) return null
  try { return atob(url.split(',')[1]).startsWith('%PDF-') ? url : null } catch { return null }
}
export function nextRequiredAction(p, actor) {
  if (!isFoundationProject(p)) return { key: 'legacy', capability: null }
  if (['CLOSED', 'CANCELLED'].includes(p.status)) return { key: 'terminal', capability: null }
  const c = p.closure
  const capabilities = actor.role === 'researcher' ? ['editProposal', 'submitProposal', 'reviseReport', 'submitClosure'] :
    actor.role === 'staff' ? ['reviewProposal', 'certify', 'changeProject', 'reviewClosure', 'release', 'close'] : ['evaluate']
  const capability = capabilities.find(cap => hasCapability(p, actor, cap) &&
    (cap !== 'reviewProposal' || p.proposalReview?.actionRequiredBy !== 'researcher') &&
    (cap !== 'reviewClosure' || c?.actionRequiredBy !== 'researcher') &&
    (cap !== 'release' || !c?.release && evaluationProgress(p).submitted === 3) &&
    (cap !== 'close' || c?.actionRequiredBy === 'staff' && (c?.method === 'publication' || c?.finalCheck || c?.revisedReportVersions?.length)))
  return { key: capability || 'waiting', capability }
}
export function timelineStates(p) {
  // Only actual events, never imply that a publication/cancellation passed evaluation.
  return (p.statusHistory || []).map(e => e.newStatus || e.status).filter((state, index, states) => state && (index === 0 || states[index - 1] !== state))
}
export const notificationReadKey = actor => `mfu-v16-notification-read:${actor.workspace || 'legacy-local'}:${actor.uid || actor.username}`
export function workspaceNotifications(projects, actor, remote = null) {
  const visible = projects.map(p => visibleProject(p, actor)).filter(Boolean), ids = new Set(visible.map(p => p.id))
  if (remote) return remote.filter(n => ids.has(n.projectId) && (!n.recipientId || n.recipientId === (actor.uid || actor.username)))
  return visible.flatMap(p => isFoundationProject(p) ? p.notifications.filter(n => n.recipientId === (actor.uid || actor.username)).map(n => ({ ...n, id: `${p.id}:${n.id}` })) : (p.statusHistory || []).map((e, i) => ({ id: `${p.id}:${e.id || i}`, projectId: p.id, action: e.action || e.note, createdAt: e.updatedAt || e.date })))
}
