import {recordDisplay,projectReference,displayDate} from '../src/utils/researchDisplay.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import {createFoundationFixtures} from '../src/data/foundationDemo.js'
import {createResearcherScenarios} from '../src/data/researcherScenarios.js'
import {createStaffScenarios} from '../src/data/staffScenarios.js'
import {PROJECT_STATES} from '../src/domain/contracts.js'
import {foundationActors,foundationContext} from '../src/data/foundationDemo.js'
import {readProjectResource} from '../src/domain/actions.js'
import {refineDemoProject} from '../src/data/researchDemoProfiles.js'

test('shared fictional identities and display refinements preserve workflow relationships and role views',()=>{
 for(const actor of Object.values(foundationActors)) {
  assert.match(actor.displayName,/[ก-๙]/)
  assert.match(actor.affiliation,/มหาวิทยาลัยแม่ฟ้าหลวง/)
 }
 const rows=[...createFoundationFixtures(),...createResearcherScenarios(),...createStaffScenarios()]
 const shape=p=>JSON.stringify({id:p.id,status:p.status,owner:p.ownerUid,reviewers:p.reviewerUids,version:p._version,documents:p.documents.map(d=>[d.id,d.kind,d.version,d.dataUrl]),history:p.statusHistory.map(e=>[e.id,e.projectId,e.action,e.previousStatus,e.newStatus,e.updatedAt]),closure:p.closure&&{assignments:p.closure.assignments,release:p.closure.release,state:p.closure.state},notifications:p.notifications})
 for(const p of rows){
  const before=shape(p)
  refineDemoProject(p)
  assert.equal(shape(p),before)
  assert.ok(p.statusHistory.every(e=>!e.note?.includes('Synthetic setup')))
  for(const uid of ['demo-staff',...(p.ownerUid==='demo-user'?['demo-user']:[]),...p.reviewerUids]){
   const view=readProjectResource(p,foundationContext(uid).actor,{type:'project'},'local-demo')
   assert.equal(view.title,p.title)
   assert.equal(view.referenceNumber,p.referenceNumber)
   assert.equal(view.status,p.status)
  }
 }
})
test('fictional fixture consent references always belong to their cloned project',()=>{
 for(const p of [...createFoundationFixtures(),...createResearcherScenarios(),...createStaffScenarios()]){
  for(const consent of [p.signatureConsent,p.proposalSubmission?.consent,...p.proposalVersions.flatMap(v=>(v.submissions||[]).map(s=>s.consent))].filter(Boolean)) assert.equal(consent.projectId,p.id)
  assert.ok(p.fictional&&p.simulationOnly)
  assert.ok(p.statusHistory.every(e=>e.projectId===p.id))
 }
})
test('default fictional demo covers exactly nine states and excludes automatic cancellation',()=>{
 const rows=createFoundationFixtures()
 assert.deepEqual([...new Set(rows.map(p=>p.status))].sort(),[...PROJECT_STATES].sort())
 const p=rows.find(p=>p.status==='CANCELLED')
 assert.equal(p.fixtureSetup.notExecutedTransition,'TR-17')
 assert.ok(!p.statusHistory.some(e=>e.transitionRule==='TR-17'))
 assert.equal(rows.length,14)
})


test('realistic fictional display profiles retain canonical relationships and all scenario identities',()=>{
 const rows=[...createFoundationFixtures(),...createResearcherScenarios(),...createStaffScenarios()]
 assert.equal(new Set(rows.map(p=>p.id)).size,rows.length)
 assert.equal(new Set(rows.map(p=>p.title)).size,rows.length)
 assert.equal(new Set(rows.map(p=>p.referenceNumber)).size,rows.length)
 for(const p of rows){
  assert.match(p.referenceNumber,/^MFU-RG-2569-\d{3}$/)
  assert.doesNotMatch(p.title,/Phase|Fixture|ตัวอย่าง Phase/)
  assert.equal(p.title,p.proposal.projectTitle)
  assert.equal(p.budget,['compensation','directCost','materials','utility'].reduce((n,k)=>n+Number(p.proposal[k]||0),0))
  assert.ok(p.affiliation.includes('มหาวิทยาลัยแม่ฟ้าหลวง'))
  for(const v of p.proposalVersions)assert.equal(v.proposal.projectTitle,p.title)
  for(const d of p.documents){assert.ok(d.name.includes(p.referenceNumber));assert.ok(d.dataUrl.startsWith('data:application/pdf;base64,'))}
  for(const a of p.closure?.assignments||[]){assert.ok(a.documentIds.every(id=>p.documents.some(d=>d.id===id)));assert.equal(p.closure.evaluations[a.reviewerId]?.assignmentId || a.id,a.id)}
 }
})

test('readable reference/state/date formatting never mutates source audit values',()=>{
 const record={projectId:'V16-ACTIVE',previousState:'IN_PROGRESS',updatedAt:'2026-11-15T03:00:00.000Z',actor:'demo-user',version:2}
 const before=JSON.stringify(record),view=recordDisplay(record,'en')
 assert.equal(JSON.stringify(record),before)
 assert.equal(view.projectId,'MFU-RG-2569-005')
 assert.equal(view.previousState,'In Progress')
 assert.ok(!view.updatedAt.includes('T03:'))
 assert.equal(view.version,2)
 assert.equal(projectReference({id:'new-internal-uuid'}),'—')
 assert.equal(displayDate('not-a-date'),'—')
})
