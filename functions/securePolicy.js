import { assertProposalValid } from './domain/src/utils/proposalValidation.js'
import { transition } from './domain/src/utils/closure.js'
import { buildProposal } from './domain/src/utils/projectStorage.js'
import { recordAdministrativeResult } from './domain/src/utils/administrativeRecords.js'
import { applyRegistry, applyStaffStatus } from './domain/src/utils/registry.js'
import { applyChange } from './domain/src/utils/projectChanges.js'
import { assignedReviewers } from './domain/src/utils/evaluation.js'

export function requireThat(condition, message, status = 403) {
  if (!condition) throw Object.assign(new Error(message), {status})
}
export const clean = value => JSON.parse(JSON.stringify(value))
const pick = (data, keys) => Object.fromEntries(keys.filter(k => data?.[k] !== undefined).map(k => [k, data[k]]))
export const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
export function authorizeProfile(profile, uid) {
  requireThat(profile?.active === true && ['researcher','staff','reviewer'].includes(profile.role) && validId(profile.workspace), 'Account is not provisioned or is disabled')
  return {uid, username:uid, role:profile.role, workspace:profile.workspace, displayName:profile.displayName || uid}
}
export function mayRead(project, actor) {
  return project?.workspace === actor.workspace && (actor.role === 'staff' ||
    actor.role === 'researcher' && project.ownerUid === actor.uid ||
    actor.role === 'reviewer' && (project.reviewerUids || []).includes(actor.uid))
}
// The candidate is only an input form envelope. Never write it or trust its ACL,
// status, history, timestamps, owner, role, or other reviewers' evaluations.
export function replayProject(previous, candidate, actor, reviewerProfiles = {}, now = new Date().toISOString()) {
  requireThat(validId(candidate?.id), 'Invalid project ID', 400)
  if (previous) requireThat(mayRead(previous, actor), 'Project access denied')
  const last = candidate.statusHistory?.at(-1) || {}
  const action = last.action
  const staff = () => requireThat(actor.role === 'staff', 'Staff required')
  let next
  if (['save_proposal','submit_proposal'].includes(action)) {
    requireThat(actor.role === 'researcher' && (!previous || previous.ownerUid === actor.uid), 'Proposal owner required')
    const proposal = {...candidate.proposal, _projectId:candidate.id}
    delete proposal._demoScenario
    if (action === 'submit_proposal') assertProposalValid(proposal,{documents:true,mode:'storage'})
    next = buildProposal(previous, proposal, actor, action === 'submit_proposal', candidate.id, now)
    next.ownerUid = actor.uid
  } else {
    requireThat(previous, 'Project not found', 404)
    const c = candidate.closure || {}
    let payload
    if (['save_draft','submit'].includes(action)) payload = pick(c,['method','summary','finishedDate','publication','documents'])
    else if (['check_draft','check'].includes(action)) {
      staff()
      payload = pick(c.check,['outcome','checked','notes','reviewers','dueAt'])
      requireThat(!payload.dueAt || /^\d{4}-\d{2}-\d{2}$/.test(payload.dueAt), 'Invalid review deadline',400)
      // Use explicit UID assignments only. Never accept legacy username role selection.
      if (payload.outcome === 'complete' && previous.closure?.method === 'report') {
        requireThat(Array.isArray(payload.reviewers) && payload.reviewers.length > 0 && payload.reviewers.length <= 10, 'Assign 1–10 reviewers',400)
        for (const uid of payload.reviewers) requireThat(validId(uid) && reviewerProfiles[uid]?.active === true && reviewerProfiles[uid]?.role === 'reviewer' && reviewerProfiles[uid]?.workspace === actor.workspace, 'Reviewer must be active in this workspace',400)
      }
    } else if (['review_draft','review'].includes(action)) {
      requireThat(previous.closure?.evaluationVersion === 2, 'Migrate legacy evaluation before reviewing',400)
      payload = pick(c.evaluations?.[actor.uid],['objectives','objectivesDetail','consistency','consistencyDetail','abstract','abstractDetail','executive','executiveDetail','chapters','outputs','strengths','future','utilization','result','reason','documents','additionalComments'])
    } else if (action === 'release_feedback') payload = pick(c.staffDisposition,['outcome','notes'])
    else if (action === 'notify_revision') payload = {notes:c.revisionInstructions}
    else if (action === 'final_check') payload = pick(c.finalCheck,['outcome','notes','checked'])
    else if (action === 'record_notice') payload = pick(c.closureNotice,['reference','date'])
    else if (action === 'complete') payload = {}
    if (payload) next = transition(previous, action, payload, actor, now)
    else if (action === 'proposal_check') {
      staff()
      requireThat(previous.status === 'admin_review' && ['revision_required','committee_review'].includes(candidate.status), 'Invalid proposal check',400)
      requireThat(candidate.status !== 'revision_required' || last.note?.trim(), 'Correction reason required',400)
      const record = {action,projectId:previous.id,previousStatus:previous.status,newStatus:candidate.status,status:candidate.status,role:actor.role,note:last.note || '',updatedBy:actor.uid,updatedAt:now}
      next = {...previous,status:candidate.status,revisionReturnTo:candidate.status === 'revision_required' ? 'admin_review' : previous.revisionReturnTo,reviewNotes:[...(previous.reviewNotes || []),record],statusHistory:[...previous.statusHistory,record]}
    } else if (action === 'record_external_result') {
      staff()
      const form = pick(candidate.administrativeRecords?.at(-1),['unitOutcome','certification','date','responsible','meetingNumber','meetingDate','outcome','notes','reference','letterNumber'])
      requireThat(previous.status !== 'eoffice_pending' || form.letterNumber?.trim(), 'External document reference required',400)
      next = recordAdministrativeResult(previous,form,actor,previous.status,now)
    } else if (action === 'registry_edit') { staff(); next = applyRegistry(previous,candidate.registry,actor,now) }
    else if (action === 'registry_status') {
      staff()
      // Registry cannot bypass administrative records, report submission or final checks.
      requireThat(candidate.status === previous.status || candidate.status === 'revision_required' && ['unit_review','admin_review','committee_review'].includes(previous.status), 'Use the workflow action to advance status',400)
      next = applyStaffStatus(previous,candidate.status,last.note || '',actor,now)
    } else if (action === 'project_change') {
      staff()
      const record = candidate.changeRecords?.at(-1)
      const form = {...pick(record,['type','letterNumber','letterDate','reason','description','effectiveDate','endDate']),newValue:record?.after?.[record.type]}
      next = applyChange(previous,form,actor,record?.attachment,new Date(now))
    } else requireThat(false, 'Unknown workflow action',400)
  }
  next = {...next,workspace:actor.workspace,ownerUid:previous?.ownerUid || actor.uid,reviewerUids:assignedReviewers(next.closure),updatedAt:now,serverUpdatedAt:now,_version:(previous?._version || 0)+1}
  requireThat((next.statusHistory?.length || 0) > (previous?.statusHistory?.length || 0), 'No workflow change',400)
  requireThat(Buffer.byteLength(JSON.stringify(next)) < 750000, 'Project metadata exceeds 750 KB; archive history before continuing',413)
  return clean(next)
}

// Firestore rules cannot hide fields in a readable document, so publish a
// deliberately restricted view per account, never the canonical draft map.
export function projectView(project, actor) {
  requireThat(mayRead(project, actor), 'Project access denied')
  const p = {...structuredClone(project),viewerRole:actor.role}
  delete p.viewUids
  if (actor.role === 'staff') return p
  if (actor.role === 'reviewer') delete p.changeRecords
  const c = p.closure
  if (actor.role === 'researcher' && p.demoGroup === 'reviewer' && !c?.feedbackReleasedAt) delete p.demoScenarioLabel
  if (c) {
    c.evaluations = Object.fromEntries(Object.entries(c.evaluations || {}).filter(([uid,e]) =>
      actor.role === 'reviewer' ? uid === actor.uid : c.feedbackReleasedAt && e.submitted))
    if (actor.role === 'researcher' && !c.feedbackReleasedAt) delete c.evaluation
    c.history = (c.history || []).filter(h => h.role !== 'reviewer' || h.by === actor.uid || actor.role === 'researcher' && c.feedbackReleasedAt).map(h => { const record = {...h}; delete record.snapshot; return record })
  }
  p.statusHistory = (p.statusHistory || []).filter(h => !['review','review_draft'].includes(h.action) || h.by === actor.uid || actor.role === 'researcher' && c?.feedbackReleasedAt)
  // Registry narrative fields can contain other reviewers' findings.
  delete p.registry; delete p.registryHistory
  return p
}

export function collectFiles(value, result = []) {
  if (!value || typeof value !== 'object') return result
  if (typeof value.storagePath === 'string') result.push(value)
  for (const child of Object.values(value)) if (child && typeof child === 'object') collectFiles(child,result)
  return result
}
export function rejectInlineFiles(value) {
  if (!value || typeof value !== 'object') return
  for (const [key,child] of Object.entries(value)) {
    requireThat(!(typeof child === 'string' && (child.startsWith('data:') || child.startsWith('blob:'))), 'Upload files to private Storage first',400)
    requireThat(!['__proto__','prototype','constructor'].includes(key), 'Invalid field',400)
    rejectInlineFiles(child)
  }
}
