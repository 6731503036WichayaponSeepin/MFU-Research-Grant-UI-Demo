import test from 'node:test'
import assert from 'node:assert/strict'
import { createInteractiveDemo } from '../src/data/interactiveDemo.js'
import { createDemoProjects } from '../src/data/demoProjects.js'
import { initializeDemo, getProjects, saveProposal, KEY } from '../src/utils/projectStorage.js'
import { correctionAction } from '../src/utils/demoCorrection.js'
import { validateEvaluation } from '../src/utils/evaluation.js'
const researcher={role:'researcher',username:'demo-user'},staff={role:'staff',username:'demo-staff'}
function storage(){const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};return data}
test('shared examples contain researcher projects and all reviewer workflow scenarios with local documents',()=>{
 const projects=createInteractiveDemo()
 const baseIds=new Set(createDemoProjects().map(p=>p.id))
 assert.equal(projects.length,12)
 assert.equal(projects.filter(p=>baseIds.has(p.id)).length,7)
 assert.equal(projects.filter(p=>p.reviewerScenario).length,7)
 assert.equal(projects.filter(p=>p.reviewerScenarioLabel==='ส่งรายงานใหม่').length,3)
 for(const p of projects){if(baseIds.has(p.id))assert.equal(p.ownerUsername,'demo-user');else assert.equal(p.ownerUsername,'demo-reviewer-fixture');assert.ok(p.proposal.background);assert.ok(p.proposal._document.dataUrl.startsWith('data:application/pdf;base64,'));assert.ok(p.statusHistory.length)}
 for(const p of projects.filter(p=>p.closure?.evaluations?.['demo-reviewer']))validateEvaluation(p.closure.evaluations['demo-reviewer'])
})
// Phase 3 retires Web Correction Approval and preserves its historical records.
test('retired correction actions reject mutation and preserve legacy records',()=>{
 storage();initializeDemo()
 const id=getProjects().find(p=>p.correction).id
 const before=localStorage.getItem(KEY)
 for(const action of ['request','approved','rejected']) for(const actor of [researcher,staff]) {
  assert.throws(()=>correctionAction(id,action,actor,'Legacy request'),/Correction Approval is retired/)
 }
 assert.equal(localStorage.getItem(KEY),before)
 const records=getProjects().map(p=>p.id===id?{...p,status:'active',correction:{...p.correction,state:'approved'}}:p)
 localStorage.setItem(KEY,JSON.stringify(records))
 const approvedBefore=localStorage.getItem(KEY)
 const project=records.find(p=>p.id===id)
 const proposal={...project.proposal,_projectId:id,methodology:'Blocked edit'}
 assert.throws(()=>saveProposal(proposal,researcher),/Correction Approval is retired/)
 assert.throws(()=>saveProposal(proposal,researcher,true),/Correction Approval is retired/)
 assert.equal(localStorage.getItem(KEY),approvedBefore)
})
