import { actorId, requireDomain } from '../domain/contracts.js'
import { canAccess, hasCapability } from '../domain/permissions.js'
import { validateEvaluation, evaluationQuestions, narrativeFields, evaluationResults, utilizationOptions,utilizationFormOptions,cleanEvaluationAnswers,EVALUATION_RUBRIC_VERSION } from './evaluation.js'
export const REVIEWER_PAGES = ['assigned-report', 'evaluation', 'answers', 'my-evaluation']
export const ownAssignment = (p, actor) => p?.closure?.assignments?.find(a => a.reviewerId === actorId(actor))
export const ownEvaluation = (p, actor) => p?.closure?.evaluations?.[actorId(actor)]
export function reviewStatus(p, actor) { const e = ownEvaluation(p, actor); return e?.submitted ? 'submitted' : e ? 'draft' : 'pending' }
export function reviewerRows(projects, actor, query = {}) {
 return projects.filter(p => actor.role === 'reviewer' && p.schemaVersion === '1.6' && canAccess(p, actor) && ownAssignment(p, actor))
  .filter(p => (!query.search || `${p.id} ${p.referenceNumber || ''} ${p.title} ${p.titleEn || ''}`.toLowerCase().includes(query.search.toLowerCase())) && (!query.reviewStatus || reviewStatus(p, actor) === query.reviewStatus))
}
export function evaluationPayload(e = {}) {
 const keys = [...evaluationQuestions.flatMap(([k]) => [k, k + 'Detail']), ...narrativeFields.map(([k]) => k), 'utilization', 'result', 'reason']
 return {...cleanEvaluationAnswers(Object.fromEntries(keys.filter(k => e[k] !== undefined).map(k => [k, structuredClone(e[k])]))),rubricVersion:EVALUATION_RUBRIC_VERSION}
}
export function evaluationError(e) { try { validateEvaluation(e); return '' } catch (error) { return error.message } }
// Filter presentation without mutating historical submitted snapshots.
export function evaluationRows(e = {}) {
 const legacy=e.submitted&&e.rubricVersion!==EVALUATION_RUBRIC_VERSION
 e=cleanEvaluationAnswers(e)
 const rows = []
 for (const [key, label, options] of evaluationQuestions) {
  rows.push([label, e[key] === undefined ? '—' : options[e[key]]])
  if (e[key + 'Detail'] !== undefined) rows.push([label + ' — รายละเอียด / Details', e[key + 'Detail']])
 }
 for (const [key, label] of narrativeFields.slice(0,3)) if (e[key] !== undefined) rows.push([label, e[key]])
 for (const [key, value] of Object.entries(e.utilization || {})) rows.push([(legacy?utilizationOptions:utilizationFormOptions)[key] || key, !legacy&&key==='2'?'เลือก / Selected':value])
 if(e.future!==undefined)rows.push([narrativeFields[3][1],e.future])
 rows.push(['ผลประเมิน / Result', e.result === undefined ? '—' : evaluationResults[e.result]])
 for (const key of ['reason', 'additionalComments']) if (e[key] !== undefined) rows.push([key === 'reason' ? 'เหตุผล / Reason' : 'ข้อเสนอแนะเพิ่มเติม / Additional comments', e[key]])
 return rows
}
export function submittedPdfSnapshot(p, actor, reviewerId = actorId(actor)) {
 requireDomain(hasCapability(p, actor, 'evaluationPdf', { evaluationReviewerId: reviewerId }), 'ACCESS_DENIED', 'Submitted evaluation PDF unavailable for this account or state', 403)
 const evaluation = p.closure.evaluations[reviewerId], assignment = p.closure.assignments.find(a => a.reviewerId === reviewerId)
 requireDomain(assignment && evaluation.assignmentId === assignment.id && evaluation.reviewRound === 1, 'INVALID_ASSIGNMENT', 'Submitted assignment snapshot required')
 return structuredClone({ projectId:p.id, title:p.title, reviewerId, assignment, evaluation })
}
