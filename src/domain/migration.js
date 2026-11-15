import { isFoundationProject, PROJECT_STATES } from './contracts.js'

/** Read-only planning. No persistence, automatic state rename, or Firebase access. */
export function migrationDryRun(records) {
  if (!Array.isArray(records)) throw new Error('Migration dry-run expects an array')
  const seen = new Set()
  const results = records.map(record => {
    const original = structuredClone(record)
    const reasons = [], warnings = []
    let suggestedState = null
    if (!record || typeof record !== 'object' || Array.isArray(record) || !record.id || seen.has(record.id)) {
      return { projectId: record?.id ?? null, status: 'invalid', suggestedState, reasons: ['Missing or duplicate project identity'], original }
    }
    seen.add(record.id)
    if (isFoundationProject(record)) {
      return { projectId: record.id, status: PROJECT_STATES.includes(record.status) ? 'already_current' : 'invalid', suggestedState: PROJECT_STATES.includes(record.status) ? record.status : null,
        reasons: PROJECT_STATES.includes(record.status) ? [] : ['Invalid v1.6 state'], original }
    }
    const c = record.closure, status = record.status
    switch (status) {
      case 'draft':
        if (record.submittedAt || c?.submittedAt || record.certification) reasons.push('Draft conflicts with submitted/certified evidence')
        else suggestedState = 'DRAFT'
        break
      case 'unit_review':
        if (record.proposalVersions?.some(v => v.kind === 'ready')) suggestedState = 'AFFILIATION_REVIEW'
        else reasons.push('No ready confirmation/version proving TR-03')
        break
      case 'submitted':
      case 'eoffice_pending': reasons.push('Ambiguous affiliation vs confirmed staff submission; inspect signed evidence and explicit submission'); break
      case 'review':
      case 'admin_review':
        if (record.proposalSubmission?.consent && record.proposalSubmission.documentIds?.length >= 2) suggestedState = 'STAFF_REVIEW'
        else reasons.push('Legacy staff queue does not prove signed RS-1, affiliation evidence and consent')
        break
      case 'revision_required':
        reasons.push('Revision is a subtask; inspect revisionReturnTo and authoritative history before selecting a main state')
        break
      case 'committee_review':
        if (record.reviewNotes?.some(n => n.status === 'committee_review') || record.proposalReview?.passed) suggestedState = 'COMMITTEE_ACKNOWLEDGEMENT'
        else reasons.push('No staff check-passed evidence for TR-08')
        break
      case 'active':
        if (record.certification && record.committeeRecord) suggestedState = 'IN_PROGRESS'
        else reasons.push('Missing external acknowledgement/certification evidence for TR-09')
        break
      case 'final_report':
        if (c?.submittedAt) reasons.push('Legacy preparation stage conflicts with an existing closure submission')
        else if (record.certification && record.committeeRecord) suggestedState = 'IN_PROGRESS'
        else reasons.push('Report preparation alone does not prove certified IN_PROGRESS')
        break
      case 'closure':
      case 'closure_review': {
        if (!c?.submittedAt || !c.documents?.length) reasons.push('No confirmed closure submission with source documents')
        else if (['awaiting_review', 'staff_decision', 'final_check', 'revision_pending'].includes(c.state)) {
          if (c.method === 'report' && c.reviewers?.length === 3 && new Set(c.reviewers).size === 3 && c.check?.submitted) suggestedState = 'REPORT_EVALUATION'
          else reasons.push('Evaluation stage lacks exactly three valid assignments and checked report')
        } else if (c.method === 'publication' || ['submitted', 'returned', 'draft'].includes(c.state)) suggestedState = 'CLOSURE_REVIEW'
        else reasons.push('Ambiguous closure subtask: inspect assignment, release and revised report')
        break
      }
      case 'completed':
        if (c?.closedAt && c.closedBy && c.check?.submitted && (c.method === 'publication' || c.finalCheck?.outcome === 'complete')) suggestedState = 'CLOSED'
        else reasons.push('Legacy completed label lacks staff closure audit/check evidence')
        break
      default: reasons.push('Unknown legacy state; do not infer a new enum value')
    }
    if (record.registry?.assessmentStatus === 'ยกเลิก/ลาออก') {
      suggestedState = null; reasons.push('Registry label is not a TR-17 cancellation record; permission remains OPEN-20')
    }
    if (c?.reviewRound > 1 || c?.reviewRounds?.length) {
      reasons.push('Legacy repeated evaluation must be preserved and reviewed; never fabricate a one-round history')
    }
    if (!record.ownerUid && !record.ownerUsername) reasons.push('Missing authoritative project owner')
    if (!record.workspace) warnings.push('Workspace binding requires explicit review before any migration')
    warnings.push('All original fields, document bytes and histories retained in original; no write performed')
    return { projectId: record.id, status: reasons.length || !suggestedState ? 'needs_review' : 'candidate',
      suggestedState, reasons, warnings, original }
  })
  return { dryRun: true, writes: 0, applyAllowed: false, total: results.length,
    counts: Object.fromEntries(['candidate', 'needs_review', 'already_current', 'invalid'].map(s => [s, results.filter(r => r.status === s).length])),
    results }
}
