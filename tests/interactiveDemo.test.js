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
test('correction rejection, new request, approval, edit and submission persist without changing certified stage',()=>{
 storage();initializeDemo()
 const id=getProjects().find(p=>p.correction).id
 assert.throws(()=>correctionAction(id,'approved',researcher,'unauthorized'))
 assert.throws(()=>correctionAction(id,'approved',staff,''))
 correctionAction(id,'rejected',staff,'โปรดชี้แจงขอบเขต')
 correctionAction(id,'request',researcher,'ขอชี้แจงวิธีเก็บข้อมูลเพิ่มเติม')
 assert.equal(getProjects().find(p=>p.id===id).correction.state,'pending')
 correctionAction(id,'approved',staff,'อนุญาตโดยคงงบประมาณเดิม')
 let project=getProjects().find(p=>p.id===id)
 const proposal={...project.proposal,_projectId:id,methodology:'วิธีเก็บข้อมูลที่ชี้แจงเพิ่มเติม'}
 project=saveProposal(proposal,researcher)
 assert.equal(project.correction.state,'approved');assert.equal(project.status,'active')
 project=saveProposal(proposal,researcher,true)
 assert.equal(project.correction.state,'saved');assert.equal(project.status,'active')
 assert.ok(project.certification);assert.equal(project.proposal.methodology,proposal.methodology)
 assert.throws(()=>saveProposal(proposal,researcher))
 assert.equal(getProjects().find(p=>p.id===id).statusHistory.at(-1).role,'researcher')
 initializeDemo(true)
 assert.equal(getProjects().find(p=>p.id===id).correction.state,'pending')
 assert.ok(JSON.parse(localStorage.getItem(KEY)).length===12)
})
