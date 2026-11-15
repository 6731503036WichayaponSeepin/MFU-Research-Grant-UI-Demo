import {recordDisplay,projectReference,displayDate} from '../src/utils/researchDisplay.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import {createFoundationFixtures} from '../src/data/foundationDemo.js'
import {createResearcherScenarios} from '../src/data/researcherScenarios.js'
import {createStaffScenarios} from '../src/data/staffScenarios.js'
import {PROJECT_STATES} from '../src/domain/contracts.js'
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
