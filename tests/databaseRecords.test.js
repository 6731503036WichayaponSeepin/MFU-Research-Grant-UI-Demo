import test from 'node:test'
import assert from 'node:assert/strict'
import { databaseRecords } from '../functions/records.js'
import { buildProposal } from '../src/utils/projectStorage.js'
import { replayProject } from '../functions/securePolicy.js'
const actor={uid:'owner',username:'owner',role:'researcher',workspace:'testing'}
const draft=()=>replayProject(null,buildProposal(null,{projectTitle:'Test'},actor,false,'project'),actor)
test('database indexes use server identity and preserve document upload dates',()=>{
  const p=draft()
  p.proposal._document={id:'file',storagePath:'workspaces/testing/projects/project/owner/file',name:'proposal.pdf'}
  const rows=databaseRecords(p,null,actor,'event')
  assert.equal(rows.find(r=>r.collection==='projects').data.researcherId,'owner')
  assert.equal(rows.find(r=>r.collection==='projectDocuments').data.uploadedBy,'owner')
  assert.equal(rows.find(r=>r.collection==='activityLogs').data.action,'save_proposal')
  assert.ok(rows.every(r=>r.id.startsWith('testing~')))
  assert.equal(databaseRecords(p,p,actor,'event2').filter(r=>r.collection==='projectDocuments').length,0)
})
test('review indexes preserve assignment identity across revised report submissions',()=>{
  const p=draft();p.reviewerUids=['expert'];p.closure={revision:1,check:{by:'staff',date:'2026-10-28',dueAt:'2026-11-10'},evaluations:{expert:{result:1,submitted:true,submittedAt:'2026-10-29',chapters:'Revise'}}}
  const rows=databaseRecords(p,null,actor,'event')
  const assignment=rows.find(r=>r.collection==='reviewAssignments')
  assert.equal(assignment.data.assignedBy,'staff')
  assert.equal(assignment.data.dueAt,'2026-11-10')
  assert.equal(rows.find(r=>r.collection==='reviews').data.result,'approved_with_revisions')
  assert.equal(rows.find(r=>r.collection==='reviews').data.released,false)
  p.closure.revision=2;p.closure.feedbackReleasedAt='2026-10-29'
  const after=databaseRecords(p,null,actor,'next')
  assert.equal(after.find(r=>r.collection==='reviewAssignments').id,assignment.id)
  assert.equal(after.find(r=>r.collection==='reviews').data.released,true)
})
