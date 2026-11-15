import { PROJECT_STATES, requireDomain } from '../domain/contracts.js'
import { hasCapability } from '../domain/permissions.js'
import { proposalData } from '../domain/model.js'
export const RESEARCHER_PAGES = ['choose', 'manual', 'upload', 'proposal-pdf', 'submission', 'closure', 'revised-report', 'results']
export const RESEARCHER_GROUPS = Object.freeze({ total: PROJECT_STATES, draft: ['DRAFT'], review: ['AFFILIATION_REVIEW', 'STAFF_REVIEW', 'COMMITTEE_ACKNOWLEDGEMENT'], active: ['IN_PROGRESS'], closure: ['CLOSURE_REVIEW', 'REPORT_EVALUATION'], closed: ['CLOSED'], cancelled: ['CANCELLED'] })
export function researcherAction(p, actor) {
  if (p.status === 'STAFF_REVIEW' && p.proposalReview?.actionRequiredBy === 'researcher') return 'submission'
  if (hasCapability(p, actor, 'reviseReport')) return 'revised-report'
  if (hasCapability(p, actor, 'editProposal')) return 'manual'
  if (hasCapability(p, actor, 'submitClosure')) return 'closure'
  return null
}
export function researcherRows(projects, actor, query = {}) {
  return projects.filter(p => p.schemaVersion === '1.6' && PROJECT_STATES.includes(p.status) && p.ownerUid === actor.uid && p.workspace === actor.workspace)
    .filter(p => (!query.group || !RESEARCHER_GROUPS[query.group] || RESEARCHER_GROUPS[query.group].includes(p.status)) && (!query.status || p.status === query.status) &&
      (!query.action || !!researcherAction(p, actor)) && (!query.search || `${p.id} ${p.referenceNumber || ''} ${p.title} ${p.titleEn || ''}`.toLowerCase().includes(query.search.toLowerCase())))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id))
}
export function researcherDraftKey(actor, projectId = 'new') { return `mfu-researcher-v16:${actor.workspace}:${actor.uid}:${projectId}` }
export function readResearcherDraft(actor, projectId, storage = localStorage) {
  const value = JSON.parse(storage.getItem(researcherDraftKey(actor, projectId)) || '{}')
  requireDomain(value && typeof value === 'object' && !Array.isArray(value), 'INVALID_DRAFT', 'Existing private draft was preserved')
  return value
}
export function writeResearcherDraft(actor, projectId, value, storage = localStorage) { storage.setItem(researcherDraftKey(actor, projectId), JSON.stringify(value)) }
export function mergeImportedDraft(saved, extracted, source) {
  requireDomain(saved && typeof saved === 'object' && !Array.isArray(saved), 'INVALID_DRAFT', 'Existing draft is invalid')
  return { ...saved, ...proposalData(extracted), _importSource: source || saved._importSource }
}
export async function pdfAttachment(file, kind, version, proposalVersionId) {
  requireDomain(file && /\.pdf$/i.test(file.name) && file.size > 0 && file.size <= 2 * 1024 * 1024, 'INVALID_DOCUMENT', 'Current Demo PDF adapter: nonempty .pdf up to 2 MB; final file policy remains OPEN')
  requireDomain(await file.slice(0, 5).text() === '%PDF-', 'INVALID_DOCUMENT', 'Invalid PDF signature')
  const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) })
  return { id: crypto.randomUUID(), kind, version, name: file.name, size: file.size, dataUrl, ...(proposalVersionId ? { proposalVersionId } : {}) }
}
