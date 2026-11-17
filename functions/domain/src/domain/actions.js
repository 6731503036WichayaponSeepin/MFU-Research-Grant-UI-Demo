import { signatureErrors } from '../utils/rs1Signatures.js'
import { ACTIONS, TRANSITIONS, TERMINAL_STATES, CANCELLATION_REASONS, actorId, requireDomain } from './contracts.js'
import { assertActor, assertCapability, hasCapability, projectProjection } from './permissions.js'
import { newProject, assertProject, clone, pick, text, validId, proposalData, syncProposalInfo, emptyClosure,
  validateDocument, assertDate, assertProposalComplete, addMonthsClamped, evaluationProgress, requiredSignatories } from './model.js'
import { validateEvaluation,cleanEvaluationAnswers,EVALUATION_RUBRIC_VERSION } from '../utils/evaluation.js'
import { localDemoPolicyEnabled, correctionFields, EDITABLE_SECTIONS, DEMO_POLICY_ID } from './localDemoPolicy.js'

const evaluationFields = ['objectives', 'objectivesDetail', 'consistency', 'consistencyDetail', 'abstract', 'abstractDetail',
  'executive', 'executiveDetail', 'chapters', 'outputs', 'strengths', 'future', 'utilization', 'result', 'reason', 'additionalComments']
function assertEvaluationTypes(e) {
  const numeric = new Set(['objectives', 'consistency', 'abstract', 'executive', 'result'])
  for (const [key, value] of Object.entries(e)) {
    if (numeric.has(key)) requireDomain(Number.isInteger(value) && value >= 0 && value <= (['abstract', 'executive'].includes(key) ? 1 : 2), 'INVALID_EVALUATION', 'Invalid categorical evaluation answer')
    else if (key === 'utilization') requireDomain(value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(v => typeof v === 'string' && v.length <= 100000), 'INVALID_EVALUATION', 'Utilization details must be text')
    else requireDomain(typeof value === 'string' && value.length <= 100000, 'INVALID_EVALUATION', 'Evaluation narrative must be text')
  }
}
const immutableProposal = (p, kind, now, uid) => {
  const version = { id: `pv-${p.proposalVersions.length + 1}`, version: p.proposalVersions.length + 1,
    kind, proposal: clone(p.proposal), createdAt: now, createdBy: uid }
  p.proposalVersions.push(version)
  return version
}
function documents(p, ids, kinds) {
  requireDomain(Array.isArray(ids) && new Set(ids).size === ids.length, 'DOCUMENTS_REQUIRED', 'Unique document IDs required')
  const found = ids.map(id => p.documents.find(d => d.id === id))
  requireDomain(found.every(Boolean), 'DOCUMENTS_REQUIRED', 'Referenced document was not attached to this project')
  for (const kind of kinds) requireDomain(found.some(d => d.kind === kind), 'DOCUMENTS_REQUIRED', `Required document: ${kind}`)
  return found
}
function submissionBundle(p, data, uid, now, demo = false) {
  if (!demo) assertProposalComplete(p.proposal)
  const version = p.proposalVersions.find(v => v.id === data.proposalVersionId)
  requireDomain(version && JSON.stringify(version.proposal) === JSON.stringify(p.proposal), 'PROPOSAL_VERSION_REQUIRED', 'Submission must reference the current proposal snapshot')
  if (!demo) documents(p, data.documentIds, ['signed_rs1', 'affiliation_evidence'])
  else documents(p, data.documentIds, [])
  if (!demo) requireDomain(data.signaturesComplete === true && typeof data.usesOthersElectronicSignatures === 'boolean', 'SIGNATURES_REQUIRED', 'Confirm all required signatures and declare electronic signature use')
  if (!demo) requireDomain(!data.usesOthersElectronicSignatures || data.consentConfirmed === true, 'CONSENT_REQUIRED', 'Consent from the other signature owners must be confirmed')
  p.signatureConsent = { projectId: p.id, proposalVersionId: version.id, signedDocumentId: data.documentIds.find(id => p.documents.find(d => d.id === id)?.kind === 'signed_rs1'),
    usesOthersElectronicSignatures: data.usesOthersElectronicSignatures, confirmed: data.usesOthersElectronicSignatures ? data.consentConfirmed === true : null,
    confirmedBy: uid, confirmedAt: now }
  p.proposalSubmission = { proposalVersionId: version.id, documentIds: clone(data.documentIds), signaturesComplete: data.signaturesComplete === true,
    requiredSignatories: requiredSignatories(p.proposal), consent: clone(p.signatureConsent), submittedAt: now, submittedBy: uid }
  // Freeze each submitted bundle in its version, preserving earlier evidence and attestations.
  version.submissions = [...(version.submissions || []), clone(p.proposalSubmission)]
  p.submittedAt = now
  p.proposalReview = { actionRequiredBy: 'staff', notes: '' }
}
function closureSubmission(p, data, uid, now, supplementary = false) {
  requireDomain(['report', 'publication'].includes(data.method), 'CLOSURE_METHOD_REQUIRED', 'Choose report or publication path')
  assertDate(data.finishedDate, 'finishedDate')
  requireDomain(text(data.summary), 'CLOSURE_INCOMPLETE', 'Research summary required')
  documents(p, data.documentIds, data.method === 'report' ? ['report'] : ['summary_report', 'publication'])
  const c = p.closure || emptyClosure()
  requireDomain(!supplementary || c.method === data.method, 'CLOSURE_PATH_LOCKED', 'Supplementary documents must retain the selected path')
  c.method = data.method; c.summary = data.summary; c.finishedDate = data.finishedDate
  c.documentIds = clone(data.documentIds); c.revision++; c.state = 'submitted'; c.actionRequiredBy = 'staff'
  c.check = null
  c.submissions.push({ revision: c.revision, documentIds: clone(data.documentIds), summary: data.summary, submittedBy: uid, submittedAt: now })
  p.closure = c
}
function validateCancellation(p, data) {
  requireDomain(p.status === 'IN_PROGRESS', 'INVALID_TRANSITION', 'Cancellation origin is limited to IN_PROGRESS')
  requireDomain(CANCELLATION_REASONS.includes(data.reason) && (data.reason !== 'OTHER' || text(data.details)), 'CANCELLATION_REASON_REQUIRED', 'Cancellation reason and OTHER details required')
  requireDomain(data.confirmed === true, 'CONFIRMATION_REQUIRED', 'Explicit cancellation confirmation required')
  documents(p, data.documentIds || [], [])
}
export { validateCancellation }

/** Pure trusted-context reducer. HTTP must construct actor/profiles/mode from server state, never body.context. */
export function executeProjectAction(previous, command, context) {
  const { actor, mode, profiles = {}, now = new Date().toISOString() } = context || {}
  assertActor(actor, mode)
  requireDomain(typeof now === 'string' && Number.isFinite(Date.parse(now)), 'INVALID_TIME', 'Trusted timestamp required')
  const contract = ACTIONS[command?.action], data = command?.payload || {}, uid = actorId(actor)
  requireDomain(contract && validId(command.id) && data && typeof data === 'object' && !Array.isArray(data), 'INVALID_ACTION', 'Known action, command ID and payload required')
  if (previous) {
    assertProject(previous)
    requireDomain(previous.statusHistory.every(e => e.id !== command.id), 'DUPLICATE_ACTION', 'This command ID has already been recorded', 409)
    requireDomain(command.expectedVersion === previous._version, 'VERSION_CONFLICT', 'Project changed; reload before retrying', 409)
    requireDomain(!TERMINAL_STATES.includes(previous.status) || contract.terminalRecord, 'TERMINAL_STATE', 'CLOSED and CANCELLED cannot enter another workflow state')
  } else requireDomain(command.action === 'create_project' && command.expectedVersion === 0, 'INVALID_TRANSITION', 'The first action must create DRAFT using TR-01')

  let ruleId = contract.rule
  if (contract.rules) ruleId = contract.rules.find(id => TRANSITIONS[id].from.includes(previous?.status))
  const rule = ruleId && TRANSITIONS[ruleId]
  if (rule) {
    requireDomain(rule.from.includes(previous?.status ?? null), 'INVALID_TRANSITION', `Invalid origin for ${ruleId}`)
    if (command.action === 'cancel_project') validateCancellation(previous, data)
    requireDomain(!rule.open || ruleId === 'TR-03' && localDemoPolicyEnabled(previous, actor, mode), 'OPEN_REQUIREMENT', `${ruleId} is disabled pending ${rule.open}`, 409)
    requireDomain(rule.roles.includes(actor.role), 'ACCESS_DENIED', `Role cannot execute ${ruleId}`, 403)
  } else requireDomain(!contract.rules && contract.states?.includes(previous?.status), 'INVALID_TRANSITION', 'Action is unavailable at this project state')
  assertCapability(previous, actor, contract.capability)

  let p = previous ? clone(previous) : newProject(data.projectId, actor, data.proposal || {}, now)
  const c = p.closure
  const eventDetails = {}
  switch (command.action) {
    case 'create_project': immutableProposal(p, 'draft', now, uid); break
    case 'save_proposal': {
      const proposal = proposalData(data.proposal || {})
      requireDomain(!(proposal.electronicSignatures?.length)||proposal.signatureDocumentId===p.id,'SIGNATURE_DOCUMENT_MISMATCH','Signature document reference must match this project')
      if (p.status === 'STAFF_REVIEW') {
        const allowed = correctionFields(p, actor, mode)
        const changed = [...new Set([...Object.keys(p.proposal), ...Object.keys(proposal)])].filter(key => JSON.stringify(p.proposal[key] ?? '') !== JSON.stringify(proposal[key] ?? ''))
        requireDomain(changed.every(key => allowed.includes(key)), 'EDIT_SCOPE_DENIED', 'Only requested Local Demo sections may be edited; production field policy remains OPEN-13', 403)
        eventDetails.correction = { fields: changed, before: pick(p.proposal, changed), after: pick(proposal, changed), temporaryDecision: DEMO_POLICY_ID }
      }
      p.proposal = proposal; syncProposalInfo(p)
      immutableProposal(p, 'draft', now, uid)
      break
    }
    case 'confirm_ready': {
      requireDomain(localDemoPolicyEnabled(p, actor, mode) && data.confirmed === true, 'CONFIRMATION_REQUIRED', 'Local Demo confirmation required')
      requireDomain(!signatureErrors(p.proposal).length, 'SIGNATURE_CONSENT_REQUIRED', 'Signature images still require valid images, names, dates and consent')
      const source = p.proposalVersions.at(-1), pdf = p.documents.find(d => d.id === data.documentId && d.kind === 'proposal_pdf')
      requireDomain(source && JSON.stringify(source.proposal) === JSON.stringify(p.proposal) && pdf?.proposalVersionId === source.id, 'LATEST_PDF_REQUIRED', 'Generate the PDF for the latest saved proposal version')
      const ready = immutableProposal(p, 'ready', now, uid)
      ready.documentId = pdf.id; ready.sourceVersionId = source.id; ready.temporaryDecision = DEMO_POLICY_ID
      p.proposalReady = { proposalVersionId: ready.id, documentId: pdf.id, sourceVersionId: source.id, confirmedBy: uid, confirmedAt: now, temporaryDecision: DEMO_POLICY_ID }
      eventDetails.document = { id: pdf.id, version: pdf.version, proposalVersionId: ready.id, temporaryDecision: DEMO_POLICY_ID }
      break
    }
    case 'submit_proposal': {
      requireDomain(p.proposalVersions.some(v => v.kind === 'ready' && (localDemoPolicyEnabled(p, actor, mode) || v.id === data.proposalVersionId)), 'READY_VERSION_REQUIRED', 'A previously confirmed ready version is required; production TR-03 remains OPEN')
      submissionBundle(p, data, uid, now, localDemoPolicyEnabled(p, actor, mode)); break
    }
    case 'request_proposal_revision':
      requireDomain(text(data.notes) && p.proposalReview?.actionRequiredBy === 'staff', 'REVISION_REASON_REQUIRED', 'Staff must record revision instructions for a pending proposal')
      if (data.editableSections !== undefined) requireDomain(localDemoPolicyEnabled(p, actor, mode) && Array.isArray(data.editableSections) && data.editableSections.length > 0 && new Set(data.editableSections).size === data.editableSections.length && data.editableSections.every(s => Object.hasOwn(EDITABLE_SECTIONS, s)), 'EDIT_SCOPE_DENIED', 'Local Demo requires explicit supported correction sections', 403)
      p.proposalReview = { actionRequiredBy: 'researcher', notes: data.notes, requestedAt: now, requestedBy: uid, ...(localDemoPolicyEnabled(p, actor, mode) ? { editableSections: clone(data.editableSections || []), temporaryDecision: DEMO_POLICY_ID } : {}) }; break
    case 'resubmit_proposal':
      requireDomain(p.proposalReview?.actionRequiredBy === 'researcher', 'REVISION_NOT_REQUESTED', 'Researcher revision was not requested')
      submissionBundle(p, data, uid, now, localDemoPolicyEnabled(p, actor, mode))
      immutableProposal(p, 'resubmitted', now, uid).submissions = [clone(p.proposalSubmission)]
      break
    case 'pass_proposal':
      requireDomain(p.proposalReview?.actionRequiredBy === 'staff' && !!p.proposalSubmission && data.confirmed === true, 'PROPOSAL_CHECK_REQUIRED', 'Confirm the submitted proposal and evidence check')
      if (!localDemoPolicyEnabled(p, actor, mode)) documents(p, p.proposalSubmission.documentIds, ['signed_rs1', 'affiliation_evidence'])
      p.proposalReview = { ...p.proposalReview, checkedBy: uid, checkedAt: now, actionRequiredBy: 'staff', passed: true }; break
    case 'record_acknowledgement':
      requireDomain(text(data.reference) && data.acknowledged === true, 'ACKNOWLEDGEMENT_REQUIRED', 'Record the external committee acknowledgement, not an approval')
      assertDate(data.date, 'acknowledgement date')
      documents(p, data.documentIds || [], [])
      p.administrativeRecords.push({ type: 'committee_acknowledgement', reference: data.reference, date: data.date, meeting: text(data.meeting) ? data.meeting : '', notes: text(data.notes) ? data.notes : '', documentIds: clone(data.documentIds || []), recordedBy: uid, recordedAt: now }); break
    case 'certify_project':
      requireDomain(data.confirmed === true, 'CERTIFICATION_REQUIRED', 'Confirm external committee acknowledgement and staff certification')
      // No universal research-standards blocker: OPEN-17 is deliberately not decided here.
      documents(p, data.documentIds || [], [])
      p.certification = { reference: text(data.reference) ? data.reference : '', externalAcknowledgementConfirmed: true, by: uid, date: now, notes: text(data.notes) ? data.notes : '', documentIds: clone(data.documentIds || []), standardsPolicy: 'OPEN-17' }; break
    case 'record_extension': {
      requireDomain(['approved', 'rejected'].includes(data.outcome) && text(data.reference) && text(data.reason), 'EXTERNAL_RESULT_REQUIRED', 'Record the e-Office result, reference and reason')
      assertDate(data.date, 'letter date')
      const before = p.endDate
      if (data.outcome === 'approved') {
        assertDate(data.endDate, 'new endDate')
        requireDomain(p.extensionRecords.filter(r => r.outcome === 'approved').length < 2, 'EXTENSION_LIMIT', 'At most two approved extensions')
        const sixMonths = addMonthsClamped(before, 6)
        requireDomain(before.slice(8) === sixMonths.slice(8), 'OPEN_REQUIREMENT', 'Month-end extension calculation awaits OPEN-10; do not impose a rollover convention', 409)
        requireDomain(data.endDate > before && data.endDate <= sixMonths, 'EXTENSION_LIMIT', 'Each extension must be positive and at most six calendar months')
        p.endDate = data.endDate; p.proposal.endDate = data.endDate
      }
      p.extensionRecords.push({ reference: data.reference, date: data.date, reason: data.reason, outcome: data.outcome,
        before, after: p.endDate, recordedBy: uid, recordedAt: now, documentIds: clone(data.documentIds || []) })
      documents(p, data.documentIds || [], [])
      eventDetails.change = { before, after: p.endDate, outcome: data.outcome, reference: data.reference }
      break
    }
    case 'record_project_change': {
      requireDomain(['approved', 'rejected'].includes(data.outcome) && text(data.reference) && text(data.reason), 'EXTERNAL_RESULT_REQUIRED', 'Record the e-Office outcome, reference and reason')
      const allowed = ['projectTitle', 'leaderName', 'methodology'] // Reuse existing change types; other field permissions remain OPEN-13.
      const changes = data.changes || {}
      requireDomain(Object.keys(changes).length > 0 && Object.keys(changes).every(k => allowed.includes(k) && text(changes[k])), 'INVALID_CHANGE', 'Use supported project change fields')
      documents(p, data.documentIds || [], [])
      const before = pick(p.proposal, Object.keys(changes))
      if (data.outcome === 'approved') { Object.assign(p.proposal, pick(changes, allowed)); syncProposalInfo(p) }
      if (data.date) assertDate(data.date, 'external letter date')
      p.changeRecords.push({ reference: data.reference, ...(data.date ? { date: data.date } : {}), reason: data.reason, outcome: data.outcome, before,
        after: pick(p.proposal, Object.keys(changes)), requested: clone(changes), recordedBy: uid, recordedAt: now, documentIds: clone(data.documentIds || []) })
      eventDetails.change = { before, after: pick(p.proposal, Object.keys(changes)), outcome: data.outcome, reference: data.reference }
      break
    }
    case 'save_closure_draft':
      p.closure = p.closure || emptyClosure()
      p.closure.draft = pick(data, ['method', 'summary', 'finishedDate', 'documentIds'])
      if (data.documentIds) documents(p, data.documentIds, [])
      break
    case 'submit_closure': closureSubmission(p, data, uid, now); break
    case 'supplement_closure': closureSubmission(p, data, uid, now, true); break
    case 'request_closure_documents':
      requireDomain(c?.actionRequiredBy === 'staff' && text(data.notes), 'REVISION_REASON_REQUIRED', 'Provide instructions for missing closure documents')
      c.actionRequiredBy = 'researcher'; c.state = 'returned'; c.check = null; c.revisionInstructions = data.notes; break
    case 'check_closure':
      requireDomain(c?.actionRequiredBy === 'staff' && data.confirmed === true, 'CLOSURE_CHECK_REQUIRED', 'Confirm the closure documents check')
      documents(p, c.documentIds, c.method === 'report' ? ['report'] : ['summary_report', 'publication'])
      c.check = { submitted: true, outcome: 'complete', by: uid, date: now, revision: c.revision, notes: text(data.notes) ? data.notes : '' }
      c.state = 'checked'; break
    case 'assign_reviewers': {
      requireDomain(c?.method === 'report' && c.check?.revision === c.revision && c.check?.submitted && !c.assignments.length, 'REPORT_CHECK_REQUIRED', 'Check the report before its one review assignment')
      const ids = data.reviewerIds
      requireDomain(Array.isArray(ids) && ids.length === 3 && ids.every(validId) && new Set(ids).size === 3, 'THREE_REVIEWERS_REQUIRED', 'Exactly three distinct reviewers required')
      for (const id of ids) requireDomain(profiles[id]?.active === true && profiles[id]?.role === 'reviewer' && profiles[id]?.workspace === p.workspace, 'INVALID_REVIEWER', 'Reviewer must be active in this workspace')
      const reports = documents(p, c.documentIds, ['report']).filter(d => d.kind === 'report').map(d => d.id)
      if (data.dueAt) assertDate(data.dueAt, 'review dueAt')
      c.reviewers = clone(ids); p.reviewerUids = clone(ids)
      c.reportDocumentIds = reports
      c.assignments = ids.map(id => ({ id: `${p.id}-${id}`, reviewerId: id, documentIds: reports, reportRevision: c.revision, assignedBy: uid, assignedAt: now, dueAt: data.dueAt || null }))
      c.state = 'awaiting_review'; c.actionRequiredBy = 'reviewer'; break
    }
    case 'close_publication':
      requireDomain(c?.method === 'publication' && c.check?.revision === c.revision && c.check?.submitted && !c.assignments.length && data.confirmed === true, 'PUBLICATION_CHECK_REQUIRED', 'Staff must check publication evidence before closing')
      c.state = 'completed'; c.closedBy = uid; c.closedAt = now; p.closedAt = now; break
    case 'save_evaluation':
    case 'submit_evaluation': {
      requireDomain(c?.method === 'report' && c.assignments.some(a => a.reviewerId === uid), 'ASSIGNMENT_REQUIRED', 'Assigned report required')
        requireDomain(c.reviewers.length === 3 && new Set(c.reviewers).size === 3 && c.assignments.length === 3 && new Set(c.assignments.map(a => a.reviewerId)).size === 3 && c.reviewers.every(id => c.assignments.some(a => a.reviewerId === id)), 'THREE_REVIEWERS_REQUIRED', 'Exactly three unique reviewer assignments required')
      const evaluation = {...cleanEvaluationAnswers(pick(data.evaluation || {}, evaluationFields)),rubricVersion:EVALUATION_RUBRIC_VERSION}
      assertEvaluationTypes(evaluation)
      const documentIds = data.documentIds || []
      requireDomain(documents(p, documentIds, []).every(d => d.kind === 'feedback' && d.uploadedBy === uid), 'ACCESS_DENIED', 'Only the evaluator’s own feedback files are allowed', 403)
      if (command.action === 'submit_evaluation') validateEvaluation({ ...evaluation, documents: [] })
      c.evaluations[uid] = { ...evaluation, documentIds: clone(documentIds), by: uid, date: now,
        submitted: command.action === 'submit_evaluation', submittedAt: command.action === 'submit_evaluation' ? now : null,
        assignmentId: c.assignments.find(a => a.reviewerId === uid).id, reviewRound: 1 }
      if (evaluationProgress(p).complete) { c.state = 'staff_decision'; c.actionRequiredBy = 'staff' }
      break
    }
    case 'release_evaluations':
      requireDomain(evaluationProgress(p).complete && !c.release && data.confirmed === true, 'RELEASE_NOT_READY', 'Release once, only after three submitted evaluations', 409)
      c.release = { id: command.id, releasedAt: now, releasedBy: uid, reviewerIds: clone(c.reviewers) }
      c.releasedFeedbackDocumentIds = c.reviewers.flatMap(id => c.evaluations[id].documentIds || [])
      c.revisionInstructions = text(data.notes) ? data.notes : ''
      c.actionRequiredBy = 'researcher'; c.state = 'awaiting_revised_report'; break
    case 'submit_revised_report': {
      const docs = documents(p, data.documentIds, ['revised_report'])
      requireDomain(data.confirmed === true && docs.some(d => d.kind === 'revised_report' && !c.submissions.some(s => s.documentIds.includes(d.id)) && !c.revisedReportVersions.some(v => v.documentIds.includes(d.id))), 'NEW_REVISED_REPORT_REQUIRED', 'A new revised-report version and explicit submission are required')
      c.revisedReportVersions.push({ id: command.id, version: c.revisedReportVersions.length + 1, documentIds: clone(data.documentIds), submittedBy: uid, submittedAt: now })
      c.finalCheck = null; c.actionRequiredBy = 'staff'; c.state = 'final_check'; break
    }
    case 'request_revised_documents':
      requireDomain(!!c?.release && c.actionRequiredBy === 'staff' && text(data.notes), 'REVISION_REASON_REQUIRED', 'Record missing revised-report documents')
      c.finalCheck = null; c.actionRequiredBy = 'researcher'; c.state = 'awaiting_revised_report'; c.revisionInstructions = data.notes; break
    case 'verify_revised_report': {
      const latest = c?.revisedReportVersions.at(-1)
      requireDomain(!!c?.release && c.actionRequiredBy === 'staff' && latest && latest.id === data.revisedReportVersionId && data.confirmed === true, 'REVISED_REPORT_REQUIRED', 'Verify the latest actually submitted revised-report version')
      documents(p, latest.documentIds, ['revised_report'])
      c.finalCheck = { by: uid, date: now, revisedReportVersionId: latest.id, complete: true, notes: text(data.notes) ? data.notes : '' }; break
    }
    case 'close_report':
      requireDomain(c?.method === 'report' && evaluationProgress(p).complete && c.release && c.finalCheck?.complete && c.finalCheck.revisedReportVersionId === c.revisedReportVersions.at(-1)?.id && data.confirmed === true, 'FINAL_CHECK_REQUIRED', 'Staff verification of the revised report is required')
      documents(p, c.revisedReportVersions.at(-1).documentIds, ['revised_report'])
      c.closedBy = uid; c.closedAt = now; c.state = 'completed'; p.closedAt = now; break
    case 'attach_document': {
      const document = validateDocument(data.document, mode)
      if (document.proposalVersionId) requireDomain(validId(document.proposalVersionId) && p.proposalVersions.some(v => v.id === document.proposalVersionId), 'PROPOSAL_VERSION_REQUIRED', 'Document must reference an existing proposal version')
      if (actor.role === 'researcher' && p.status === 'STAFF_REVIEW') {
        requireDomain(['signed_rs1', 'affiliation_evidence', 'proposal_pdf'].includes(document.kind) || localDemoPolicyEnabled(p, actor, mode) && document.kind === 'support', 'EDIT_SCOPE_DENIED', 'Only revision evidence or Local Demo supporting documents may be added', 403)
      }
      requireDomain(!p.documents.some(d => d.id === document.id), 'DOCUMENT_IMMUTABLE', 'Existing document versions cannot be overwritten')
      requireDomain(actor.role !== 'reviewer' || document.kind === 'feedback', 'ACCESS_DENIED', 'Reviewer uploads feedback only', 403)
      requireDomain(actor.role !== 'staff' || document.kind !== 'feedback', 'ACCESS_DENIED', 'Evaluation feedback belongs to its assigned reviewer', 403)
      requireDomain(actor.role !== 'researcher' || !['feedback', 'external_reference'].includes(document.kind), 'ACCESS_DENIED', 'Researcher cannot upload evaluation feedback or staff references', 403)
      p.documents.push({ ...document, uploadedBy: uid, uploadedAt: now })
      eventDetails.document = { id: document.id, kind: document.kind, version: document.version }
      break
    }
    case 'hide_demo_document': {
      requireDomain(localDemoPolicyEnabled(p, actor, mode) && actor.role === 'researcher', 'ACCESS_DENIED', 'Available only in the fictional Local Demo', 403)
      const document = p.documents.find(d => d.id === data.documentId)
      requireDomain(document && document.uploadedBy === uid && !document.hiddenFromDemoSelection, 'DOCUMENT_NOT_FOUND', 'Own visible document required')
      document.hiddenFromDemoSelection = true
      eventDetails.document = { id: document.id, kind: document.kind, version: document.version }
      break
    }
    case 'record_notice':
      requireDomain(text(data.reference), 'REFERENCE_REQUIRED', 'External letter reference required')
      assertDate(data.date, 'notice date')
      documents(p, data.documentIds || [], [])
      p.administrativeRecords.push({ type: 'external_notice', reference: data.reference, date: data.date, notes: text(data.notes) ? data.notes : '', documentIds: clone(data.documentIds || []), recordedBy: uid, recordedAt: now }); break
    default: requireDomain(false, 'OPEN_REQUIREMENT', 'This action contract is not enabled')
  }
  if (['create_project', 'save_proposal'].includes(command.action) && data.importSource) {
    requireDomain(p.status === 'DRAFT', 'INVALID_TRANSITION', 'RS-1 import is limited to DRAFT')
    const source = data.importSource
    requireDomain(validId(source.id) && text(source.name) && source.name.length <= 200 && Number.isSafeInteger(source.size) && source.size > 0 && ['pdf', 'docx'].includes(source.type) && source.reviewed === true && Array.isArray(source.fields) && source.fields.every(k => Object.hasOwn(p.proposal, k)), 'INVALID_IMPORT_SOURCE', 'Reviewed source metadata is required')
    p.importSources = p.importSources || []
    if (!p.importSources.some(s => s.id === source.id)) p.importSources.push({ ...pick(source, ['id', 'name', 'size', 'type', 'fields']), reviewedBy: uid, reviewedAt: now, proposalVersionId: p.proposalVersions.at(-1).id, extraction: 'text-patterns-not-OCR' })
  }
  if (rule) p.status = rule.to
  if (!previous && mode === 'local-demo') { p.fictional = true; p.simulationOnly = true }
  p._version = (previous?._version || 0) + 1; p.updatedAt = now
  const event = { id: command.id, projectId: p.id, action: command.action, transitionRule: ruleId || null,
    previousStatus: previous?.status || null, newStatus: p.status, status: p.status,
    updatedBy: uid, role: actor.role, updatedAt: now, projectVersion: p._version,
    note: text(data.notes) ? data.notes : text(data.reason) ? data.reason : '', details: eventDetails }
  p.statusHistory.push(event)
  if (!['create_project', 'save_proposal', 'save_closure_draft', 'save_evaluation', 'attach_document'].includes(command.action)) {
    const recipients = new Set([p.ownerUid, ...p.reviewerUids, ...Object.keys(profiles).filter(id => profiles[id]?.active && profiles[id].role === 'staff' && profiles[id].workspace === p.workspace)])
    for (const recipientId of recipients) p.notifications.push({ id: `${command.id}-${recipientId}`, projectId: p.id, recipientId,
      action: command.action, createdAt: now, readAt: null, channel: 'in_app' })
  }
  assertProject(p)
  return p
}

// Preview/download are reads, not workflow commands. No project mutation or history fabrication.
export function readProjectResource(project, actor, request, mode) {
  assertActor(actor, mode)
  assertProject(project)
  if (request.type === 'evaluationPdf') {
    assertCapability(project, actor, 'evaluationPdf', { evaluationReviewerId: request.reviewerId })
    return clone(project.closure.evaluations[request.reviewerId]) // PDF rendering belongs to the later page phase.
  }
  if (request.type === 'document') {
    const document = project.documents.find(d => d.id === request.documentId)
    requireDomain(document && hasCapability(project, actor, 'download', { document }), 'ACCESS_DENIED', 'Document unavailable for this account', 403)
    return clone(document)
  }
  assertCapability(project, actor, request.type === 'history' ? 'readHistory' : 'read')
  const view = projectProjection(project, actor)
  return request.type === 'history' ? view.statusHistory : view
}
