export function recordAdministrativeResult(project, form, user, expectedStatus, now = new Date().toISOString()) {
  if (user?.role !== 'staff' || !['unit_review','eoffice_pending','committee_review','active'].includes(project.status) || project.status !== expectedStatus) throw new Error('Not editable')
  const text = v => typeof v === 'string' && v.trim()
  const date = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '') && !Number.isNaN(new Date(v).getTime())
  if (!date(form.date) || !text(form.responsible) || !text(form.notes)) throw new Error('Required information missing')
  if (project.status === 'active' && !text(form.letterNumber)) throw new Error('Proceed notice reference required')
  if (form.reference && !/^https:\/\//.test(form.reference)) throw new Error('HTTPS reference required')
  if (project.status === 'committee_review' && (!['complete','pending'].includes(form.certification) || !['endorsed','revision','deferred'].includes(form.outcome) || !date(form.meetingDate) || !text(form.meetingNumber))) throw new Error('Meeting record incomplete')
  if (project.status === 'unit_review' && form.unitOutcome && !['endorsed','revision'].includes(form.unitOutcome)) throw new Error('Choose unit review outcome')
  const status = project.status === 'active' ? 'active' : project.status === 'unit_review' ? (form.unitOutcome === 'revision' ? 'revision_required' : 'eoffice_pending') : project.status === 'eoffice_pending' ? 'admin_review' : form.outcome === 'endorsed' && form.certification === 'complete' ? 'active' : form.outcome === 'revision' ? 'revision_required' : 'committee_review'
  const record = {...form,recordedAt:now,recordedBy:user.username,sourceStatus:project.status}
  return {...project,...(project.status === 'active' ? {proceedNotice:record} : {}),status,revisionReturnTo:status === 'revision_required' ? project.status : project.revisionReturnTo,updatedAt:now,...(project.status === 'committee_review' ? {certification:{outcome:form.certification,date:form.date,responsible:form.responsible},committeeRecord:record} : {}),administrativeRecords:[...(project.administrativeRecords || []),record],statusHistory:[...(project.statusHistory || []),{projectId:project.id,previousStatus:project.status,newStatus:status,action:'record_external_result',role:user.role,status,updatedAt:now,updatedBy:user.username,note:form.notes,description:'External administrative result recorded'}]}
}
