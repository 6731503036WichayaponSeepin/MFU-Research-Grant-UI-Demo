import { isPdfAttachment } from './pdfAttachment.js'
import { assignedReviewers, allEvaluationsSubmitted, validateEvaluation } from './evaluation.js'
import { getProjects, saveProjects, afterSave } from './projectStorage.js'
import { syncClosureRegistry } from './closureRegistry.js'
import { nextTask, handoffActionLabels } from './handoff.js'
export { KEY } from './projectStorage.js'
export const criteria = [
  ['ความสอดคล้องกับวัตถุประสงค์', 'Alignment with objectives'],
  ['ความครบถ้วนและความถูกต้อง', 'Completeness and accuracy'],
  ['คุณภาพผลการวิจัย', 'Quality of research results'],
  ['การใช้ประโยชน์และผลกระทบ', 'Usefulness and impact'],
  ['ความเหมาะสมของวิธีดำเนินการ', 'Appropriateness of methodology'],
  ['คุณภาพการเขียนและการนำเสนอ', 'Writing and presentation']
]
export const readProjects = getProjects
export function owns(p, user) {
  return user?.role === 'researcher' && !!p.ownerUsername && p.ownerUsername === user.username
}
export function canRead(p, user) {
  return user?.role === 'staff' || owns(p, user) || (user?.role === 'reviewer' && assignedReviewers(p.closure).includes(user.username))
}
const ensure = (condition, message) => { if (!condition) throw new Error(message) }
const hasText = value => typeof value === 'string' && value.trim().length > 0
export function transition(project, action, data, user, now = new Date().toISOString()) {
  ensure(user?.username, 'Missing user')
  let p = structuredClone(project)
  let c = p.closure || { state: 'draft', revision: 0 }
  ensure(p.status !== 'completed' || action === 'record_notice', 'Completed projects are read-only')
  const log = { projectId:p.id, previousStatus:project.status, previousClosureState:c.state, id: crypto.randomUUID(), action, date: now, by: user.username, role: user.role }
  if (action === 'save_draft' || action === 'submit') {
    ensure(owns(p, user), 'Researcher access required')
    ensure(['active','closure_review','final_report','closure'].includes(p.status), 'Project is not eligible for closure')
    ensure(['draft','returned'].includes(c.state), 'Submission is locked')
    ensure(['report','publication'].includes(data.method), 'Choose a closure method')
    if (action === 'submit') {
      ensure(data.documents?.every(d => ['report','publication','support'].includes(d.kind) && isPdfAttachment(d)), 'Invalid attachment')
      ensure(hasText(data.summary) && /^\d{4}-\d{2}-\d{2}$/.test(data.finishedDate || ''), 'Summary and completion date required')
      ensure(data.documents?.some(d => d.kind === data.method && isPdfAttachment(d)), 'Required PDF missing')
    }
    const documents = (data.documents || []).filter(d => d.kind === data.method || d.kind === 'support')
    c = { ...c, method:data.method, summary:data.summary || '', finishedDate:data.finishedDate || '', publication:data.publication || '', documents, state: action === 'submit' ? 'submitted' : c.state, savedAt:now }
    if (action === 'submit') {
      const finalRevision = ['evaluation','final_check'].includes(c.returnStage)
      const nextReviewRound = finalRevision && c.evaluationVersion === 2 && c.returnStage === 'evaluation'
      const priorRound = nextReviewRound ? {round:c.reviewRound || 1, reportRevision:c.revision, submittedAt:c.submittedAt, evaluations:structuredClone(c.evaluations || {})} : null
      c = {...c, revision:c.revision + 1, submittedAt:now, submittedBy:user.username,
        state:nextReviewRound ? 'awaiting_review' : finalRevision ? 'final_check' : 'submitted',
        check:finalRevision ? c.check : null, evaluation:finalRevision ? c.evaluation : null,
        reviewer:finalRevision ? c.reviewer : null, finalCheck:null,
        revisedAfterEvaluation:finalRevision ? true : false,
        reviewRound:nextReviewRound ? (c.reviewRound || 1) + 1 : (c.reviewRound || 1),
        reviewRounds:nextReviewRound ? [...(c.reviewRounds || []),priorRound] : (c.reviewRounds || []),
        evaluations:nextReviewRound ? {} : (c.evaluations || {}),returnStage:null}
      c.submissions = [...(c.submissions || []), { revision:c.revision, date:now, method:c.method, summary:c.summary, documents:c.documents }]
      p.status = 'closure_review'
    }
  } else if (action === 'check_draft' || action === 'check') {
    ensure(user.role === 'staff', 'Staff access required')
    ensure(c.state === 'submitted', 'Documents are not awaiting check')
    if (action === 'check') {
      ensure(['complete','incomplete','more_info'].includes(data.outcome), 'Choose a document check result')
      if (data.outcome === 'complete') {
        ensure(data.checked && c.documents?.some(d => d.kind === c.method), 'Confirm required documents')
        if (c.method === 'report') ensure(data.reviewers ? data.reviewers.length > 0 && data.reviewers.every(hasText) && new Set(data.reviewers).size === data.reviewers.length : hasText(data.reviewer), 'Assign reviewer usernames')
      } else ensure(hasText(data.notes), 'Revision reason required')
    }
    c.check = {...data, by:user.username, date:now, submitted:action === 'check'}
    if (action === 'check') {
      c.state = data.outcome === 'complete' ? (c.method === 'report' ? 'awaiting_review' : 'ready_close') : 'returned'
      if (data.reviewers && c.method === 'report' && data.outcome === 'complete') { c.reviewers = [...data.reviewers]; c.evaluations = {}; c.evaluationVersion = 2; c.reviewRound = 1; c.reviewRounds = [] }
      c.reviewer = c.method === 'report' && data.outcome === 'complete' ? (data.reviewers?.[0] || data.reviewer).trim() : null
    }
  } else if ((action === 'review_draft' || action === 'review') && c.evaluationVersion === 2) {
    ensure(user.role === 'reviewer' && assignedReviewers(c).includes(user.username), 'Assigned reviewer required')
    ensure(c.state === 'awaiting_review' && !c.evaluations?.[user.username]?.submitted, 'Evaluation is locked')
    if (action === 'review') validateEvaluation(data)
    c.evaluations = {...c.evaluations, [user.username]: {...data, reviewRound:c.reviewRound || 1, reportRevision:c.revision || 1, rubricVersion:'stakeholder-draft-1', by:user.username, date:now, submitted:action === 'review', submittedAt:action === 'review' ? now : null}}
    if (allEvaluationsSubmitted(c)) c.state = 'staff_decision'
  } else if (action === 'release_feedback') {
    ensure(user.role === 'staff' && c.state === 'staff_decision' && allEvaluationsSubmitted(c), 'All assigned evaluations and staff action required')
    ensure(['revision','final'].includes(data.outcome) && hasText(data.notes), 'Record instructions and next step')
    c.feedbackReleasedAt = now
    c.revisionInstructions = data.notes
    c.returnStage = data.outcome === 'revision' ? 'evaluation' : null
    c.state = data.outcome === 'revision' ? 'returned' : 'final_check'
    if(data.outcome === 'final') c.revisedAfterEvaluation = true
    c.staffDisposition = {...data, by:user.username, date:now}
  } else if (action === 'review_draft' || action === 'review') {
    ensure(user.role === 'reviewer' && c.reviewer === user.username, 'Assigned reviewer required')
    ensure(c.state === 'awaiting_review' && c.method === 'report', 'Report is not awaiting evaluation')
    if (action === 'review') {
      ensure(criteria.every((_,i) => Number.isInteger(Number(data.scores?.[i])) && Number(data.scores[i]) >= 1 && Number(data.scores[i]) <= 5), 'Score every criterion')
      ensure(['accept','revise'].includes(data.result), 'Choose evaluation result')
      ensure(hasText(data.comments), 'Comments required')
    }
    c.evaluation = {...data, by:user.username, date:now, submitted:action === 'review', rubricVersion:'prototype-1', total:(data.scores || []).reduce((sum,n)=>sum + Number(n || 0),0)}
    if (action === 'review') c.state = data.result === 'accept' ? 'final_check' : 'revision_pending'
  } else if (action === 'notify_revision') {
    ensure(user.role === 'staff' && c.state === 'revision_pending', 'Staff must notify the researcher after evaluation')
    ensure(hasText(data.notes), 'Revision instructions required')
    c = {...c, state:'returned', returnStage:'evaluation', revisionInstructions:data.notes}
  } else if (action === 'final_check') {
    ensure(user.role === 'staff' && c.state === 'final_check', 'Final staff verification required')
    ensure(['complete','incomplete'].includes(data.outcome), 'Choose final document outcome')
    ensure(hasText(data.notes), 'Record final verification notes')
    if (data.outcome === 'complete') {
      ensure(data.checked && c.documents?.some(d => d.kind === c.method), 'Verify final documents')
      ensure(c.evaluationVersion === 2 ? allEvaluationsSubmitted(c) && c.feedbackReleasedAt && c.revisedAfterEvaluation : c.evaluation?.submitted && (c.evaluation.result === 'accept' || c.revisedAfterEvaluation), 'Evaluation or final report required')
    }
    const needsReevaluation = c.evaluationVersion !== 2 && data.outcome === 'complete' && c.evaluation?.result === 'revise'
    c = {...c, state:data.outcome === 'complete' ? (needsReevaluation ? 'awaiting_review' : 'ready_close') : 'returned',
      returnStage:data.outcome === 'complete' ? null : 'final_check',
      revisionInstructions:data.outcome === 'incomplete' ? data.notes : c.revisionInstructions,
      finalCheck:{...data, by:user.username, date:now, submitted:true}}
    if (needsReevaluation) { c.evaluation = null; c.finalCheck = null; c.revisedAfterEvaluation = false }
  } else if (action === 'complete') {
    ensure(user.role === 'staff' && c.state === 'ready_close', 'Staff can close only after completed checks')
    ensure(c.check?.submitted && c.check.outcome === 'complete', 'Document check required')
    ensure(c.method !== 'report' || (c.finalCheck?.outcome === 'complete' && (c.evaluationVersion === 2 ? allEvaluationsSubmitted(c) && c.feedbackReleasedAt && c.revisedAfterEvaluation : c.evaluation?.submitted && c.evaluation.result === 'accept')), 'Final report verification required')
    c.state = 'completed'; c.closedAt = now; c.closedBy = user.username
    p.status = 'completed'; p.closedAt = now
  } else if (action === 'record_notice') {
    ensure(user.role === 'staff' && p.status === 'completed', 'Only staff can record the external closure notice')
    ensure(hasText(data.reference) && /^\d{4}-\d{2}-\d{2}$/.test(data.date || ''), 'Letter reference and date required')
    c.closureNotice = {...data, by:user.username, recordedAt:now}
  } else throw new Error('Unknown closure action')
  c.history = [...(c.history || []), {...log, notes:data.notes || data.comments || '', snapshot: ['check','review'].includes(action) ? structuredClone(action === 'check' ? c.check : c.evaluation) : undefined}]
  p.closure = c
  p.updatedAt = now
  p.statusHistory = [...(p.statusHistory || []), { ...log, newStatus:p.status, newClosureState:c.state, status:p.status, description:action, note:handoffActionLabels[action] || action, toRole:action.endsWith('draft') ? null : nextTask(p).role, updatedAt:now, updatedBy:user.username }]
  return syncClosureRegistry(p, action, user, now)
}
export function persist(id, action, data, user) {
  const projects = readProjects()
  const index = projects.findIndex(p => String(p.id) === String(id))
  ensure(index >= 0, 'Project not found')
  projects[index] = transition(projects[index], action, data, user)
  return afterSave(saveProjects(projects), projects)
}
export async function readPdf(file, kind) {
  ensure(file.size <= 2 * 1024 * 1024 && file.name.toLowerCase().endsWith('.pdf'), 'PDF only, maximum 2 MB per file')
  ensure(new TextDecoder().decode(await file.slice(0,5).arrayBuffer()) === '%PDF-', 'Invalid PDF')
  const dataUrl = await new Promise((resolve,reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Cannot read file'))
    reader.readAsDataURL(new Blob([file],{type:'application/pdf'}))
  })
  return { id:crypto.randomUUID(), name:file.name, size:file.size, kind, dataUrl }
}
