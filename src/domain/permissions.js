import { CAPABILITY_MATRIX, ROLES, TERMINAL_STATES, actorId, requireDomain } from './contracts.js'
import { canCloseOriginalReport } from './model.js'

export function assertActor(actor, mode) {
  requireDomain(ROLES.includes(actor?.role) && !!actorId(actor) && !!actor.workspace && actor.active !== false,
    'ACCESS_DENIED', 'Active identity, workspace and one of the three roles are required', 403)
  requireDomain(mode === 'local-demo' ? actor.simulation === true : mode === 'backend' && actor.authenticated === true,
    'AUTH_REQUIRED', 'Local permission simulation is not backend authentication', 403)
}
export function canAccess(project, actor) {
  if (!project || project.workspace !== actor?.workspace) return false
  const uid = actorId(actor)
  return actor.role === 'staff' || actor.role === 'researcher' && project.ownerUid === uid ||
    actor.role === 'reviewer' && (project.closure?.reviewers || []).includes(uid)
}
export function hasCapability(project, actor, capability, { evaluationReviewerId, document } = {}) {
  if (!CAPABILITY_MATRIX[actor?.role]?.includes(capability)) return false
  if (capability === 'create') return !project && actor.role === 'researcher'
  if (!canAccess(project, actor)) return false
  const terminal = TERMINAL_STATES.includes(project.status)
  const uid = actorId(actor), closure = project.closure
  if (capability === 'cancel') return false // OPEN-20: no role is enabled yet.
  if (capability === 'readEvaluations' || capability === 'evaluationPdf') {
    if (capability === 'evaluationPdf' && terminal) return false // Post-CLOSED retention/access is OPEN.
    if (actor.role === 'researcher' && !closure?.release) return false
    if (actor.role === 'reviewer' && evaluationReviewerId !== uid) return false
    if (capability === 'evaluationPdf') return closure?.evaluations?.[evaluationReviewerId]?.submitted === true
    return true
  }
  if (capability === 'download') {
    if (!document) return false
    if (actor.role === 'reviewer') return document.kind === 'report' && closure?.assignments?.some(a =>
      a.reviewerId === uid && a.documentIds.includes(document.id)) ||
      document.kind === 'feedback' && (closure?.evaluations?.[uid]?.documentIds?.includes(document.id) || document.uploadedBy === uid && hasCapability(project, actor, 'evaluate'))
    if (actor.role === 'researcher' && document.kind === 'feedback') return !!closure?.release &&
      Object.values(closure.evaluations || {}).some(e => e.submitted && e.documentIds?.includes(document.id))
    return true
  }
  if (['read', 'readHistory'].includes(capability)) return true
  if (capability === 'recordNotice') return actor.role === 'staff' && ['IN_PROGRESS', 'CLOSED'].includes(project.status)
  if (terminal) return false
  if (capability === 'editProposal') return actor.role === 'researcher' &&
    (['DRAFT', 'AFFILIATION_REVIEW'].includes(project.status) || project.status === 'STAFF_REVIEW' && project.proposalReview?.actionRequiredBy === 'researcher')
  if (capability === 'submitProposal') return actor.role === 'researcher' && project.status === 'AFFILIATION_REVIEW'
  if (capability === 'submitClosure') return actor.role === 'researcher' &&
    (project.status === 'IN_PROGRESS' || project.status === 'CLOSURE_REVIEW' && closure?.actionRequiredBy === 'researcher')
  if (capability === 'reviseReport') return actor.role === 'researcher' && project.status === 'REPORT_EVALUATION' &&
    !!closure?.release && closure?.actionRequiredBy === 'researcher' && !canCloseOriginalReport(project)
  if (capability === 'evaluate') return actor.role === 'reviewer' && project.status === 'REPORT_EVALUATION' &&
    !closure?.release && !closure?.evaluations?.[uid]?.submitted
  if (capability === 'upload') {
    if (actor.role === 'staff') return ['COMMITTEE_ACKNOWLEDGEMENT', 'IN_PROGRESS', 'CLOSURE_REVIEW', 'REPORT_EVALUATION'].includes(project.status)
    if (actor.role === 'reviewer') return hasCapability(project, actor, 'evaluate')
    return hasCapability(project, actor, 'editProposal') || hasCapability(project, actor, 'submitClosure') || hasCapability(project, actor, 'reviseReport')
  }
  const staffStates = {
    reviewProposal: ['STAFF_REVIEW'], certify: ['COMMITTEE_ACKNOWLEDGEMENT'], changeProject: ['IN_PROGRESS'],
    reviewClosure: ['CLOSURE_REVIEW'], assignReviewers: ['CLOSURE_REVIEW'],
    release: ['REPORT_EVALUATION'], close: ['CLOSURE_REVIEW', 'REPORT_EVALUATION'],
  }
  return actor.role === 'staff' && !!staffStates[capability]?.includes(project.status)
}
export function assertCapability(project, actor, capability, scope) {
  requireDomain(hasCapability(project, actor, capability, scope), 'ACCESS_DENIED', `Capability denied: ${capability}`, 403)
}

// Explicit view projection: do not shallow-copy nested evaluation archives or file bytes.
export function projectProjection(project, actor) {
  requireDomain(canAccess(project, actor), 'ACCESS_DENIED', 'Project access denied', 403)
  if (actor.role === 'staff') return structuredClone(project)
  const p = structuredClone(project), uid = actorId(actor), c = p.closure
  delete p.registry
  delete p.registryHistory
  if (c) {
    c.evaluations = Object.fromEntries(Object.entries(c.evaluations || {}).filter(([id, e]) =>
      actor.role === 'reviewer' ? id === uid : !!c.release && e.submitted))
    delete c.reviewRounds // Historical legacy archives are not trusted as an ACL-filtered view.
    delete c.history
    if (actor.role === 'reviewer') {
      c.assignments = c.assignments.filter(a => a.reviewerId === uid)
      c.submissions = []
      c.revisedReportVersions = []
      delete c.finalCheck
      delete c.revisionInstructions
      delete c.release
    }
  }
  p.documents = p.documents.filter(d => hasCapability(project, actor, 'download', { document: d }))
  p.statusHistory = p.statusHistory.filter(e => !['save_evaluation', 'submit_evaluation'].includes(e.action) ||
    e.updatedBy === uid || actor.role === 'researcher' && !!project.closure?.release).map(e => {
    const { details: _details, ...event } = e
    void _details
    return event
  })
  p.notifications = p.notifications.filter(n => n.recipientId === uid)
  if (actor.role === 'reviewer') {
    // Reviewer sees assignment context, not the proposal/evidence/administrative aggregate.
    p.proposal = { objectives: p.proposal.objectives, methodology: p.proposal.methodology }
    p.proposalVersions = []
    p.extensionRecords = []
    p.changeRecords = []
    p.administrativeRecords = []
    p.signatureConsent = null
    p.proposalSubmission = null
    p.cancellation = null
  }
  return p
}
