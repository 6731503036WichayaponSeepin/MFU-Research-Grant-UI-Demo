import { updateProject } from './projectStorage.js'
import { registryFields, closureSteps, stepStatuses, assessmentStatuses, registryValues } from '../data/registry.js'
import { validateProject } from '../../functions/policy.js'

export function applyRegistry(project, data, user, now = new Date().toISOString()) {
  if (user?.role !== 'staff' || !user.username) throw new Error('เฉพาะเจ้าหน้าที่เท่านั้นที่แก้ไขทะเบียนได้')
  const previous = registryValues(project)
  if (!assessmentStatuses.includes(data.assessmentStatus) || typeof data.finalReport !== 'boolean') throw new Error('สถานะทะเบียนไม่ถูกต้อง')
  const registry = { assessmentStatus: data.assessmentStatus, finalReport: data.finalReport, steps: {} }
  for (const [key] of registryFields) {
    if (typeof data[key] !== 'string' || data[key].length > 10000) throw new Error('กรุณาตรวจสอบข้อมูลทะเบียน')
    registry[key] = data[key].trim()
  }
  for (const [key] of closureSteps) {
    if (!stepStatuses.includes(data.steps?.[key])) throw new Error('สถานะย่อยไม่ถูกต้อง')
    registry.steps[key] = data.steps[key]
  }
  const changes = [...registryFields.map(([key, label]) => ({ field: key, label, before: previous[key], after: registry[key] })),
    { field: 'assessmentStatus', label: 'สถานะการประเมินรายงานจากผู้ทรงคุณวุฒิ', before: previous.assessmentStatus, after: registry.assessmentStatus },
    { field: 'finalReport', label: 'ส่งเล่ม Final Report เรียบร้อยแล้ว', before: previous.finalReport, after: registry.finalReport },
    ...closureSteps.map(([key, label]) => ({ field: key, label, before: previous.steps[key], after: registry.steps[key] }))
  ].filter(change => change.before !== change.after)
  if (!changes.length) return project
  const closureChanged = changes.some(change => change.field === 'finalReport' || closureSteps.some(([key]) => key === change.field))
  if (closureChanged && !project.closure?.submittedAt && !project.closure?.closedAt) throw new Error('ต้องยื่นคำขอปิดโครงการก่อนอัปเดตสถานะย่อย')
  return { ...project, registry, updatedAt: now,
    registryHistory: [...(project.registryHistory || []), { by: user.username, at: now, changes }],
    statusHistory: [...(project.statusHistory || []), { projectId:project.id, previousStatus:project.status, newStatus:project.status, action:'registry_edit', role:user.role, status: project.status, updatedBy: user.username, updatedAt: now, note: 'อัปเดตทะเบียน: ' + changes.map(c => c.label).join(', ') }]
  }
}
export const saveRegistry = (id, data, user) => updateProject(id, project => applyRegistry(project, data, user))

export function applyStaffStatus(project, status, note, user, now = new Date().toISOString()) {
  if (user?.role !== 'staff' || !user.username) throw new Error('เฉพาะเจ้าหน้าที่เท่านั้นที่อัปเดตสถานะได้')
  if (!note.trim()) throw new Error('กรุณาระบุรายละเอียดหรือเหตุผลการอัปเดตสถานะ')
  if (['closure_review', 'completed'].includes(status) && !project.closure?.submittedAt) throw new Error('ต้องยื่นคำขอปิดโครงการก่อน')
  const next = { ...project, status, updatedAt: now,
    ...(status === 'revision_required' ? { revisionReturnTo: project.status === 'unit_review' ? 'unit_review' : 'admin_review' } : {}),
    statusHistory: [...(project.statusHistory || []), { projectId:project.id, previousStatus:project.status, newStatus:status, action:'registry_status', role:user.role, status, note: note.trim(), updatedBy: user.username, updatedAt: now }]
  }
  validateProject(next, project, project._version || 0)
  return next
}
export const saveStaffStatus = (id, status, note, user) => updateProject(id, project => applyStaffStatus(project, status, note, user))
