import { isPdfAttachment } from './pdfAttachment.js'
import { getProjects } from './projectStorage.js'
export { KEY as PROJECTS_KEY } from './projectStorage.js'
export const changeTypes = {
  title: ['เปลี่ยนชื่อโครงการ', 'Project title'],
  leader: ['เปลี่ยนหัวหน้าโครงการ', 'Project leader'],
  methodology: ['เปลี่ยนวิธีดำเนินการ', 'Methodology'],
  extension: ['ขยายระยะเวลา', 'Duration extension']
}

export const readChangeProjects = getProjects

export function applyChange(project, form, actor, attachment, now = new Date()) {
  if (project.status === 'completed') throw new Error('Completed projects are read-only')
  if (actor?.role !== 'staff') throw new Error('Staff only')
  const required = ['type', 'letterNumber', 'letterDate', 'reason', 'description', 'effectiveDate']
  if (required.some(k => !form[k]?.trim()) || !changeTypes[form.type]) throw new Error('Required fields')
  if (!isPdfAttachment(attachment) && !attachment?.dataUrl?.startsWith('data:application/pdf;base64,')) throw new Error('PDF required')
  const proposal = { ...project.proposal }
  const before = {}
  const after = {}
  const updates = {}
  if (form.type === 'extension') {
    const previousEnd = project.endDate || proposal.endDate
    const start = project.startDate || proposal.startDate
    if (!form.endDate || (previousEnd && form.endDate <= previousEnd) || (start && form.endDate < start) || form.endDate < form.effectiveDate) throw new Error('Invalid extension')
    before.endDate = previousEnd || ''
    after.endDate = form.endDate
    updates.endDate = form.endDate
    proposal.endDate = form.endDate
  } else {
    if (!form.newValue?.trim()) throw new Error('New value required')
    const key = form.type
    const proposalKey = { title: 'projectTitle', leader: 'leaderName', methodology: 'methodology' }[key]
    before[key] = project[key] || proposal[proposalKey] || ''
    after[key] = form.newValue.trim()
    if (before[key] === after[key]) throw new Error('Unchanged value')
    updates[key] = after[key]
    proposal[proposalKey] = after[key]
  }
  const record = {
    id: crypto.randomUUID(), type: form.type,
    title: changeTypes[form.type][0], description: form.description.trim(), reason: form.reason.trim(),
    letterNumber: form.letterNumber.trim(), letterDate: form.letterDate,
    effectiveDate: form.effectiveDate, endDate: form.endDate || '',
    date: now.toISOString(), recordedAt: now.toISOString(),
    recordedBy: actor.username || 'staff', role: actor.role,
    before, after, attachment
  }
  return { ...project, ...updates, proposal, updatedAt: now.toISOString(),
    statusHistory: [...(project.statusHistory || []), {projectId:project.id,previousStatus:project.status,newStatus:project.status,role:actor.role,status:project.status,updatedAt:now.toISOString(),updatedBy:actor.username,note:`${record.title}: ${record.description}`,action:'project_change'}],
    changeRecords: [...(Array.isArray(project.changeRecords) ? project.changeRecords : []), record] }
}
