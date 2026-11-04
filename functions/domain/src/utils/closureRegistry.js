import { registryValues, registryFields, closureSteps } from '../data/registry.js'

export function syncClosureRegistry(project, action, user, now) {
  if (!['submit','check','review','notify_revision','final_check','complete'].includes(action)) return project
  const previous = registryValues(project)
  const registry = { ...previous, steps: { ...previous.steps } }
  const c = project.closure
  const done = 'ดำเนินการแล้วเสร็จ'
  if (action === 'submit') {
    registry.finalReport = c.method === 'report'
    registry.assessmentStatus = 'อยู่ระหว่างดำเนินการ'
    if (c.revision > 1 && c.submissions?.length > 1) registry.steps.resubmitted = done
  }
  if (action === 'check' && c.state === 'awaiting_review') {
    registry.steps.letter = done
    registry.expert = c.reviewers?.join(', ') || c.reviewer
    registry.firstResult = 'รอผลประเมินจากผู้ทรงคุณวุฒิ'
  }
  if (action === 'review' && c.evaluationVersion !== 2) {
    registry.steps.received = done
    if ((c.history || []).filter(h => h.action === 'review').length <= 1) {
      registry.firstAssessment = new Date(now).toLocaleDateString('th-TH')
      registry.firstResult = c.evaluation.result === 'accept' ? 'ผ่านการประเมิน: ' + c.evaluation.comments : 'ขอแก้ไข: ' + c.evaluation.comments
    }
    registry.steps.endorsed = c.evaluation.result === 'accept' ? done : 'ยังไม่ได้ดำเนินการ'
  }
  if (action === 'review' && c.evaluationVersion === 2) {
    registry.firstResult = 'ได้รับผลประเมิน ' + Object.values(c.evaluations || {}).filter(e => e.submitted).length + '/' + c.reviewers.length + ' คน — รอเจ้าหน้าที่ดำเนินการ'
    if (c.state === 'staff_decision') registry.steps.received = done
  }
  if (action === 'notify_revision') registry.steps.revision = done
  if (action === 'complete') registry.assessmentStatus = 'เสร็จสิ้นกระบวนการ'
  const labels = Object.fromEntries([...registryFields, ...closureSteps, ['finalReport','ส่งเล่ม Final Report'], ['assessmentStatus','สถานะการประเมิน']])
  const changes = Object.keys(registry).filter(key => key !== 'steps' && registry[key] !== previous[key]).map(key => ({ field:key, label:labels[key] || key, before:previous[key], after:registry[key] }))
  for (const key of Object.keys(registry.steps)) if (registry.steps[key] !== previous.steps[key]) changes.push({ field:key, label:labels[key] || key, before:previous.steps[key], after:registry.steps[key] })
  if (!changes.length) return project
  return { ...project, registry, registryHistory: [...(project.registryHistory || []), { by:user.username, role:user.role, at:now, source:action, changes }] }
}
