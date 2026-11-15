// Requirements v1.6, 14 November 2026. Subtasks/documents are not project states.
export const SCHEMA_VERSION = '1.6'
export const PROJECT_STATES = Object.freeze([
  'DRAFT', 'AFFILIATION_REVIEW', 'STAFF_REVIEW', 'COMMITTEE_ACKNOWLEDGEMENT',
  'IN_PROGRESS', 'CLOSURE_REVIEW', 'REPORT_EVALUATION', 'CLOSED', 'CANCELLED',
])
export const TERMINAL_STATES = Object.freeze(['CLOSED', 'CANCELLED'])
export const ROLES = Object.freeze(['researcher', 'staff', 'reviewer'])
const rule = (from, to, roles, requirements, open = null) => Object.freeze({
  from: Object.freeze(from), to, roles: Object.freeze(roles), requirements, open,
})
export const TRANSITIONS = Object.freeze({
  'TR-01': rule([null], 'DRAFT', ['researcher'], 'FR-RES-01'),
  'TR-02': rule(['DRAFT'], 'DRAFT', ['researcher'], 'FR-RES-02–08'),
  'TR-03': rule(['DRAFT'], 'AFFILIATION_REVIEW', ['researcher'], 'FR-RES-11', 'OPEN-04'),
  'TR-04': rule(['AFFILIATION_REVIEW'], 'AFFILIATION_REVIEW', ['researcher'], 'FR-RES-12'),
  'TR-05': rule(['AFFILIATION_REVIEW'], 'STAFF_REVIEW', ['researcher'], 'FR-RES-13–15; FR-SIG-02–05'),
  'TR-06': rule(['STAFF_REVIEW'], 'STAFF_REVIEW', ['staff', 'researcher'], 'FR-ADM-04; FR-RES-16–17'),
  'TR-07': rule(['STAFF_REVIEW'], 'AFFILIATION_REVIEW', ['researcher'], 'BR-10', 'OPEN-05'),
  'TR-08': rule(['STAFF_REVIEW'], 'COMMITTEE_ACKNOWLEDGEMENT', ['staff'], 'FR-ADM-05'),
  'TR-09': rule(['COMMITTEE_ACKNOWLEDGEMENT'], 'IN_PROGRESS', ['staff'], 'FR-ADM-06–07; BR-13'),
  'TR-10': rule(['IN_PROGRESS'], 'IN_PROGRESS', ['staff'], 'FR-ADM-09; BR-14'),
  'TR-11': rule(['IN_PROGRESS'], 'CLOSURE_REVIEW', ['researcher'], 'FR-CLS-01–04'),
  'TR-12': rule(['CLOSURE_REVIEW'], 'CLOSURE_REVIEW', ['staff', 'researcher'], 'FR-CLS-05–06'),
  'TR-13': rule(['CLOSURE_REVIEW'], 'REPORT_EVALUATION', ['staff'], 'FR-CLS-07; FR-REV-01'),
  'TR-14': rule(['CLOSURE_REVIEW'], 'CLOSED', ['staff'], 'FR-CLS-08'),
  'TR-15': rule(['REPORT_EVALUATION'], 'REPORT_EVALUATION', ['researcher', 'staff', 'reviewer'], 'FR-REV-04–10; FR-CLS-09'),
  'TR-16': rule(['REPORT_EVALUATION'], 'CLOSED', ['staff'], 'FR-CLS-10; FR-REV-08'),
  'TR-17': rule(['IN_PROGRESS'], 'CANCELLED', ['staff'], 'FR-CAN-01–02; FR-REG-03', 'OPEN-20'),
})
// No request-supplied flag can approve an OPEN policy.
export const ACTIONS = Object.freeze({
  create_project: { rule: 'TR-01', capability: 'create' },
  save_proposal: { rules: ['TR-02', 'TR-04', 'TR-06'], capability: 'editProposal' },
  confirm_ready: { rule: 'TR-03', capability: 'editProposal' },
  submit_proposal: { rule: 'TR-05', capability: 'submitProposal' },
  request_proposal_revision: { rule: 'TR-06', capability: 'reviewProposal' },
  resubmit_proposal: { rule: 'TR-06', capability: 'editProposal' },
  return_to_affiliation: { rule: 'TR-07', capability: 'editProposal' },
  pass_proposal: { rule: 'TR-08', capability: 'reviewProposal' },
  record_acknowledgement: { states: ['COMMITTEE_ACKNOWLEDGEMENT'], capability: 'certify' },
  certify_project: { rule: 'TR-09', capability: 'certify' },
  record_extension: { rule: 'TR-10', capability: 'changeProject' },
  record_project_change: { states: ['IN_PROGRESS'], capability: 'changeProject' },
  save_closure_draft: { states: ['IN_PROGRESS', 'CLOSURE_REVIEW'], capability: 'submitClosure' },
  submit_closure: { rule: 'TR-11', capability: 'submitClosure' },
  request_closure_documents: { rule: 'TR-12', capability: 'reviewClosure' },
  supplement_closure: { rule: 'TR-12', capability: 'submitClosure' },
  check_closure: { rule: 'TR-12', capability: 'reviewClosure' },
  assign_reviewers: { rule: 'TR-13', capability: 'assignReviewers' },
  close_publication: { rule: 'TR-14', capability: 'close' },
  save_evaluation: { rule: 'TR-15', capability: 'evaluate' },
  submit_evaluation: { rule: 'TR-15', capability: 'evaluate' },
  release_evaluations: { rule: 'TR-15', capability: 'release' },
  submit_revised_report: { rule: 'TR-15', capability: 'reviseReport' },
  verify_revised_report: { rule: 'TR-15', capability: 'close' },
  request_revised_documents: { rule: 'TR-15', capability: 'close' },
  close_report: { rule: 'TR-16', capability: 'close' },
  cancel_project: { rule: 'TR-17', capability: 'cancel' },
  attach_document: { states: PROJECT_STATES.filter(s => !TERMINAL_STATES.includes(s)), capability: 'upload' },
  record_notice: { states: ['IN_PROGRESS', 'CLOSED'], capability: 'recordNotice', terminalRecord: true },
})
for (const contract of Object.values(ACTIONS)) {
  for (const value of Object.values(contract)) if (Array.isArray(value)) Object.freeze(value)
  Object.freeze(contract)
}
export const CAPABILITY_MATRIX = Object.freeze({
  researcher: Object.freeze(['read', 'download', 'readHistory', 'create', 'editProposal', 'submitProposal', 'submitClosure', 'reviseReport', 'readEvaluations', 'evaluationPdf', 'upload']),
  staff: Object.freeze(['read', 'download', 'readHistory', 'reviewProposal', 'certify', 'changeProject', 'reviewClosure', 'assignReviewers', 'readEvaluations', 'evaluationPdf', 'release', 'close', 'recordNotice', 'upload']),
  reviewer: Object.freeze(['read', 'download', 'readHistory', 'evaluate', 'readEvaluations', 'evaluationPdf', 'upload']),
})
export const DOCUMENT_KINDS = Object.freeze([
  'rs1_source', 'proposal_pdf', 'signed_rs1', 'affiliation_evidence', 'standards_evidence',
  'report', 'summary_report', 'publication', 'support', 'feedback', 'revised_report', 'external_reference',
])
export const CANCELLATION_REASONS = Object.freeze(['RESIGNED', 'EXCEEDED_DURATION', 'OTHER'])
export function requireDomain(condition, code, message, status = 400) {
  if (!condition) throw Object.assign(new Error(message), { code, status })
}
export const actorId = actor => actor?.uid || actor?.username
export const isFoundationProject = p => p?.schemaVersion === SCHEMA_VERSION
