import { collectFiles } from './securePolicy.js'
import { workflow } from './domain/src/data/statuses.js'

// Server-written indexes accompany the canonical aggregate and private UI views.
export function databaseRecords(project, previous, actor, eventId) {
  const p = project, c = p.closure || {}, now = p.serverUpdatedAt
  const base = {workspace:p.workspace, projectId:p.id}
  const rows = []
  const put = (collection,id,data) => rows.push({collection,id:`${p.workspace}~${id}`,data:{...base,...data}})
  put('projects',p.id,{
    projectCode:p.projectCode || p.id,titleTh:p.title,titleEn:p.titleEn,
    researcherId:p.ownerUid,researcherName:p.leader,affiliation:p.affiliation,
    status:p.status,currentStage:p.status === 'revision_required' ? (p.revisionReturnTo === 'unit_review' ? 2 : 4) : workflow.findIndex(([key])=>key===p.status)+1,
    createdAt:p.createdAt,updatedAt:now,submittedAt:p.submittedAt || null,
    // This index is readable only by staff and the owner.
    proposalData:p.proposal,
  })
  const oldFiles = new Map(collectFiles(previous).map(f=>[f.storagePath,f]))
  for (const [path,file] of new Map(collectFiles(p).map(f=>[f.storagePath,f]))) {
    if (oldFiles.has(path)) continue
    put('projectDocuments',file.id,{
      documentId:file.id,uploadedBy:path.split('/')[4],documentType:file.kind || 'proposal',
      fileName:file.name,storagePath:path,uploadedAt:now,
      version:c.revision || 1,
    })
  }
  for (const uid of p.reviewerUids) {
    const evaluation = c.evaluations?.[uid]
    // Versioned assignments preserve earlier review rounds.
    const id = `${p.id}~${c.check?.date || c.revision || 1}~${uid}`
    put('reviewAssignments',id,{
      assignmentId:id,reviewerId:uid,assignedBy:c.check?.by || actor.uid,
      status:evaluation?.submitted?'completed':'pending',
      assignedAt:c.check?.date || now,dueAt:c.check?.dueAt || null,
    })
    if (evaluation?.submitted) put('reviews',id,{
      reviewId:id,assignmentId:id,reviewerId:uid,
      result:['approved','approved_with_revisions','revision_required'][evaluation.result],
      comments:evaluation,submittedAt:evaluation.submittedAt || evaluation.date || now,
      released:!!c.feedbackReleasedAt,
    })
  }
  const event = p.statusHistory.at(-1)
  put('activityLogs',eventId,{
    logId:eventId,actorId:actor.uid,actorRole:actor.role,action:event.action,
    previousStatus:previous?.status || null,newStatus:p.status,timestamp:now,
  })
  return rows
}
