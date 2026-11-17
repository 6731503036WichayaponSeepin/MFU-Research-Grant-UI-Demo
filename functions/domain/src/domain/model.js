import {BUDGET_CATEGORIES} from '../utils/rs1Budget.js'
import { projectParticipants, PARTICIPANT_FIELDS } from '../utils/rs1Participants.js'
import { signatureErrors } from '../utils/rs1Signatures.js'
import { SCHEMA_VERSION, PROJECT_STATES, DOCUMENT_KINDS, requireDomain, actorId } from './contracts.js'
import { proposalFieldErrors, validProposalDate } from '../utils/proposalValidation.js'

export const text = value => typeof value === 'string' && !!value.trim()
export const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value)
export const clone = value => structuredClone(value)
export const pick = (value, keys) => Object.fromEntries(keys.filter(k => value?.[k] !== undefined).map(k => [k, clone(value[k])]))
export const PROPOSAL_FIELDS = Object.freeze([
  'projectTitle', 'projectTitleEn', 'strategy', 'leaderName', 'leaderAffiliation', 'leaderPhone', 'leaderEmail', 'leaderPercent',
  'participantRecords','participantName','participantAffiliation','participantPhone','participantEmail','participantPercent',
  ...[1,2,3].flatMap(n=>[`workTask${n}`,`workPeriod${n}`]),
  'workTasks','budgetItems','electronicSignatures','signatureDocumentId','teamSignatureName','teamSignDate','advisorSignatureImage','leaderSignatureImage','teamSignatureImage','electronicSignatureConsent',
  ...['compensation','directCost','materials','utility'].flatMap(category=>[1,2,3].flatMap(n=>[`${category}Item${n}`,`${category}Amount${n}`])),
  'participants', 'advisorName', 'advisorQualification', 'advisorPosition', 'advisorAffiliation',
  'cooperationName', 'cooperationAffiliation', 'cooperationAddress', 'cooperationType', 'researchType', 'keywords',
  'background', 'objectives', 'literature', 'references', 'methodology', 'scope', 'startDate', 'endDate', 'workPlan', 'progress',
  'outcomeType', 'outcomeDetail', 'integration', 'publicationLevel', 'compensationDetail', 'compensation',
  'directDetail', 'directCost', 'materialsDetail', 'materials', 'utilityDetail', 'utility', 'standards', 'clarifications',
  'advisorSignature', 'advisorSignDate', 'leaderSignature', 'leaderSignDate', 'teamSignatures',
  'bioName', 'bioPosition', 'bioResearchId', 'bioEducation', 'bioExperience', 'bioExpertise', 'bioPublications',
  'bioPresentations', 'bioIP', 'bioManagement', 'bioCompleted', 'bioOngoing',
  ...[1, 2, 3].flatMap(i => ['Name', 'Position', 'Affiliation', 'Email'].map(k => `reviewer${i}${k}`)),
])
export function proposalData(value) {
  const data = pick(value, PROPOSAL_FIELDS)
  requireDomain(Object.entries(data).filter(([key])=>!['workTasks','participantRecords','electronicSignatures','budgetItems'].includes(key)).every(([,v]) => ['string', 'number'].includes(typeof v) && String(v).length <= 100000),
    'INVALID_PROPOSAL', 'Proposal fields must be text or numeric values')
  if(data.participantRecords!==undefined)requireDomain(Array.isArray(data.participantRecords)&&data.participantRecords.every(row=>row&&typeof row==='object'&&!Array.isArray(row)&&Object.keys(row).every(key=>PARTICIPANT_FIELDS.includes(key))&&Object.values(row).every(v=>['string','number'].includes(typeof v)&&String(v).length<=100000)), 'INVALID_PROPOSAL', 'Invalid participant records')
  if(data.workTasks!==undefined)requireDomain(Array.isArray(data.workTasks)&&data.workTasks.every(row=>row&&typeof row==='object'&&!Array.isArray(row)&&Object.keys(row).every(key=>['name','startDate','endDate','legacyPeriod'].includes(key))&&Object.values(row).every(v=>typeof v==='string'&&v.length<=100000)), 'INVALID_PROPOSAL','Invalid working plan tasks')
  if(data.budgetItems!==undefined)requireDomain(data.budgetItems&&typeof data.budgetItems==='object'&&!Array.isArray(data.budgetItems)&&Object.entries(data.budgetItems).every(([category,rows])=>BUDGET_CATEGORIES.includes(category)&&Array.isArray(rows)&&rows.every(row=>row&&typeof row==='object'&&!Array.isArray(row)&&Object.keys(row).every(key=>['description','amount'].includes(key))&&Object.values(row).every(value=>['string','number'].includes(typeof value)&&String(value).length<=100000))), 'INVALID_PROPOSAL','Invalid budget items')
  requireDomain(!signatureErrors(data,false).length, 'INVALID_SIGNATURE_IMAGE', 'Invalid signature image')
  return data
}
export function syncProposalInfo(p) {
  p.title = p.proposal.projectTitle || ''
  p.titleEn = p.proposal.projectTitleEn || ''
  p.leader = p.proposal.leaderName || ''
  p.affiliation = p.proposal.leaderAffiliation || ''
  p.budget = ['compensation', 'directCost', 'materials', 'utility'].reduce((s, k) => s + Number(p.proposal[k] || 0), 0)
  p.startDate = p.proposal.startDate || ''
  p.endDate = p.proposal.endDate || ''
}
export function newProject(id, actor, proposal, now) {
  requireDomain(validId(id), 'INVALID_ID', 'Valid project ID required')
  const p = {
    schemaVersion: SCHEMA_VERSION, id, workspace: actor.workspace, ownerUid: actorId(actor), ownerUsername: actorId(actor),
    status: 'DRAFT', proposal: proposalData(proposal), proposalVersions: [], documents: [],
    signatureConsent: null, proposalSubmission: null, proposalReview: null,
    administrativeRecords: [], extensionRecords: [], changeRecords: [],
    closure: null, reviewerUids: [], cancellation: null, notifications: [], statusHistory: [],
    createdAt: now, updatedAt: now, _version: 0,
  }
  requireDomain(!(p.proposal.electronicSignatures?.length)||p.proposal.signatureDocumentId===id,'SIGNATURE_DOCUMENT_MISMATCH','Signature document reference must match this project')
  syncProposalInfo(p)
  return p
}
export function emptyClosure() {
  return { state: 'draft', method: null, revision: 0, documentIds: [], submissions: [], reviewers: [], assignments: [],
    evaluations: {}, release: null, revisedReportVersions: [], finalCheck: null, actionRequiredBy: 'researcher' }
}
export function assertProject(p) {
  requireDomain(p?.schemaVersion === SCHEMA_VERSION && PROJECT_STATES.includes(p.status), 'SCHEMA_REQUIRED', 'An explicit v1.6 project is required; run migration dry-run for legacy data')
  for (const k of ['proposalVersions', 'documents', 'statusHistory', 'extensionRecords', 'changeRecords', 'administrativeRecords', 'notifications']) {
    requireDomain(Array.isArray(p[k]), 'INVALID_MODEL', `Invalid project collection: ${k}`)
  }
  requireDomain(validId(p.id) && validId(p.ownerUid) && validId(p.workspace), 'INVALID_MODEL', 'Invalid project identity')
  requireDomain(Number.isSafeInteger(p._version) && p._version >= 0 && p.proposal && typeof p.proposal === 'object', 'INVALID_MODEL', 'Invalid project version or proposal')
  requireDomain(new Set(p.documents.map(d => d.id)).size === p.documents.length, 'INVALID_MODEL', 'Document IDs must be unique')
}
export function assertProposalComplete(data) {
  const errors = proposalFieldErrors(data)
  requireDomain(!errors.length, 'PROPOSAL_INCOMPLETE', errors.map(e => e.message).join('\n'))
}
export function requiredSignatories(proposal) {
  return [
    { role: 'leader', name: proposal.leaderName || '' },
    ...(text(proposal.advisorName) ? [{ role: 'advisor', name: proposal.advisorName }] : []),
    // Structured participants are user-entered; preserve legacy notes without parsing identities.
    ...projectParticipants(proposal).filter(person=>text(person.name)).map(person=>({role:'participants',name:person.name})),
    ...(text(proposal.participants) ? [{ role: 'participants', description: proposal.participants }] : []),
  ]
}
export function validateDocument(value, mode = 'local-demo') {
  requireDomain(value && validId(value.id) && DOCUMENT_KINDS.includes(value.kind) && text(value.name) && value.name.length <= 200 &&
    Number.isSafeInteger(value.size) && value.size > 0 && Number.isSafeInteger(value.version) && value.version > 0,
  'INVALID_DOCUMENT', 'Document ID, kind, name, size and version are required')
  // Retain the existing PDF transport limits as technical compatibility, not approval of OPEN-02/16.
  requireDomain(/\.pdf$/i.test(value.name) && value.size <= 2 * 1024 * 1024, 'INVALID_DOCUMENT', 'Current PDF adapter accepts files up to 2 MB; final file policy remains OPEN')
  if (mode === 'backend') {
    requireDomain(typeof value.storagePath === 'string' && /^workspaces\/[A-Za-z0-9_-]+\/projects\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(value.storagePath) && value.contentType === 'application/pdf' && !value.dataUrl,
      'INVALID_DOCUMENT', 'Private Storage reference required; ticket and object bytes are verified by the API')
  } else {
    requireDomain(typeof value.dataUrl === 'string' && value.dataUrl.startsWith('data:application/pdf;base64,'), 'INVALID_DOCUMENT', 'Local PDF bytes required')
    let bytes = ''
    try { bytes = atob(value.dataUrl.slice('data:application/pdf;base64,'.length)) } catch { /* Report a domain validation error below. */ }
    requireDomain(bytes.startsWith('%PDF-') && bytes.length === value.size, 'INVALID_DOCUMENT', 'PDF signature or size mismatch')
  }
  return pick(value, ['id', 'kind', 'name', 'size', 'version', 'dataUrl', 'storagePath', 'contentType', 'proposalVersionId'])
}
export function assertDate(value, field) {
  requireDomain(validProposalDate(value), 'INVALID_DATE', `Valid date required: ${field}`)
}
// Calendar-month addition clamps month-end rather than using a fixed number of days.
// This is a technical convention, documented for stakeholder review (OPEN-10).
export function addMonthsClamped(value, months) {
  assertDate(value, 'endDate')
  const d = new Date(value + 'T00:00:00Z'), day = d.getUTCDate()
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + months)
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, last))
  return d.toISOString().slice(0, 10)
}
export function evaluationProgress(p) {
  const ids = p.closure?.reviewers || []
  const valid = ids.length === 3 && ids.every(validId) && new Set(ids).size === 3
  const submitted = valid ? ids.filter(id => p.closure.evaluations?.[id]?.submitted === true).length : 0
  return { assigned: ids.length, submitted, remaining: 3 - submitted, label: `${submitted}/3`, complete: valid && submitted === 3 }
}
// User-confirmed path: all three submitted assessments accept the original report.
export function canCloseOriginalReport(p) {
  const c = p?.closure
  return p?.status === 'REPORT_EVALUATION' && c?.method === 'report' && !!c.release &&
    evaluationProgress(p).complete && c.reviewers.every(id => c.evaluations?.[id]?.result === 0) &&
    !c.revisedReportVersions?.length && !(p.statusHistory || []).some(e => e.action === 'request_revised_documents')
}
// Audit log and project history deliberately share the existing authoritative stream.
export const auditLogs = p => clone(p.statusHistory)
