// 30 November 2026, 23:59 Bangkok. Read access remains available after this instant.
export const EDITING_EXPIRES_AT = '2026-11-30T16:59:00.000Z'
export const MAX_PROJECT_BYTES = 750000
export const stages = {
  draft: ['draft', 'unit_review'], unit_review: ['unit_review', 'eoffice_pending', 'revision_required'],
  eoffice_pending: ['eoffice_pending', 'admin_review'], admin_review: ['admin_review', 'revision_required', 'committee_review'],
  revision_required: ['revision_required', 'admin_review', 'unit_review'], committee_review: ['committee_review', 'active', 'revision_required'],
  active: ['active', 'final_report', 'closure_review'], final_report: ['final_report', 'closure_review'],
  closure_review: ['closure_review', 'completed'], completed: ['completed'],
}
export function ensure(condition, message, status = 400) {
  if (!condition) throw Object.assign(new Error(message), { status })
}
export function validateProject(project, previous, expectedVersion) {
  ensure(project && typeof project === 'object' && !Array.isArray(project), 'Project required')
  ensure(typeof project.id === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(project.id), 'Invalid project ID')
  ensure(new TextEncoder().encode(JSON.stringify(project)).length <= MAX_PROJECT_BYTES, 'Project exceeds 750 KB. Use smaller fictional PDFs; no real documents.', 413)
  ensure(typeof project.title === 'string' && project.title.length <= 1000, 'Invalid title')
  ensure(project.proposal && typeof project.proposal === 'object' && !Array.isArray(project.proposal), 'Proposal required')
  ensure(Number.isFinite(project.budget) && project.budget >= 0, 'Budget must be a nonnegative number')
  ensure(Array.isArray(project.statusHistory) && project.statusHistory.length > 0 && project.statusHistory.length <= 500, 'Invalid history')
  ensure((previous?._version || 0) === expectedVersion, 'Another participant changed this project. Review the latest data and retry.', 409)
  if (previous) {
    ensure(stages[previous.status]?.includes(project.status), 'Invalid workflow transition')
    ensure(project.createdAt === previous.createdAt && project.ownerUsername === previous.ownerUsername && project.demoGenerated === previous.demoGenerated, 'Immutable project fields changed')
    for (const field of ['statusHistory', 'reviewNotes', 'administrativeRecords', 'changeRecords', 'registryHistory']) {
      const history = previous[field] || []
      ensure(JSON.stringify((project[field] || []).slice(0, history.length)) === JSON.stringify(history), `Existing ${field} must be preserved`)
    }
    ensure(project.statusHistory.length > previous.statusHistory.length, 'Append a history record for each change')
  } else {
    ensure(['draft', 'unit_review'].includes(project.status) && !project.demoGenerated, 'New projects must start as draft or submitted proposals')
  }
  const last = project.statusHistory.at(-1)
  ensure(last && last.status === project.status, 'History must match status')
  if (JSON.stringify(project.registry) !== JSON.stringify(previous?.registry)) {
    const registry = project.registry
    const stepKeys = ['letter', 'received', 'revision', 'endorsed', 'resubmitted', 'payment']
    const stepStates = ['ยังไม่ได้ดำเนินการ', 'อยู่ระหว่างดำเนินการ', 'ดำเนินการแล้วเสร็จ']
    ensure(registry && typeof registry.finalReport === 'boolean' && ['ยังไม่ได้ดำเนินการ', 'อยู่ระหว่างดำเนินการ', 'เสร็จสิ้นกระบวนการ', 'ยกเลิก/ลาออก'].includes(registry.assessmentStatus), 'Invalid registry status')
    ensure(stepKeys.every(key => stepStates.includes(registry.steps?.[key])), 'Invalid registry closure step')
    const closureChanged = registry.finalReport !== (previous?.registry?.finalReport || false) || stepKeys.some(key => registry.steps[key] !== (previous?.registry?.steps?.[key] || stepStates[0]))
    if (closureChanged) ensure(project.closure?.submittedAt || project.closure?.closedAt, 'Submit a closure request before updating closure tracking')
    ensure(Array.isArray(project.registryHistory) && project.registryHistory.length > (previous?.registryHistory?.length || 0), 'Registry history required')
  }
  if (project.status === 'revision_required') ensure(typeof last.note === 'string' && last.note.trim(), 'Revision reason required')
  if (['unit_review','admin_review'].includes(project.status) && (!previous || ['draft','revision_required'].includes(previous.status))) {
    for (const field of ['projectTitle','leaderName','objectives','methodology']) ensure(typeof project.proposal[field] === 'string' && project.proposal[field].trim(), `Missing ${field}`)
    ensure(project.budget > 0 && Date.parse(project.proposal.endDate) > Date.parse(project.proposal.startDate), 'Valid dates and positive budget required')
  }
  if (previous?.status === 'committee_review' && project.status === 'active') ensure(project.committeeRecord?.outcome === 'endorsed' && project.certification?.outcome === 'complete', 'Record certification and committee outcome first')
  if (project.status === 'completed' && previous?.status !== 'completed') ensure(project.closure?.state === 'completed' && project.closure?.check?.submitted && project.closure.check.outcome === 'complete' && (project.closure.method === 'publication' || (project.closure.finalCheck?.outcome === 'complete' && (project.closure.evaluationVersion === 2 ? project.closure.reviewers?.length > 0 && project.closure.reviewers.every(id => project.closure.evaluations?.[id]?.submitted) && project.closure.feedbackReleasedAt && project.closure.revisedAfterEvaluation : project.closure.evaluation?.submitted && project.closure.evaluation.result === 'accept'))), 'Closure checks must be complete')
  // These are simulation constraints, never authorization based on a selected role.
  return { ...project, fictional: true, _version: (previous?._version || 0) + 1 }
}

