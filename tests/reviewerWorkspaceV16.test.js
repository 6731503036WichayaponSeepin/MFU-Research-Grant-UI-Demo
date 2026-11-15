import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoundationFixtures,foundationContext,foundationActors } from '../src/data/foundationDemo.js'
import { executeProjectAction } from '../src/domain/actions.js'
import { projectProjection,hasCapability } from '../src/domain/permissions.js'
import { evaluationProgress } from '../src/domain/model.js'
import { ownAssignment,reviewStatus,reviewerRows,evaluationPayload,evaluationRows,submittedPdfSnapshot } from '../src/utils/reviewerWorkspace.js'
const actor=foundationActors['demo-reviewer-1'], r2=foundationActors['demo-reviewer-2']
const evaluation={objectives:0,consistency:0,abstract:0,executive:0,result:1,chapters:'บทที่ 1\nแก้ไขข้อมูล',utilization:{0:'ข้อมูลเพิ่มเติม'},additionalComments:'Exact submitted comment',reason:'Preserved optional reason'}
const base=()=>createFoundationFixtures().find(p=>p.id==='V16-EVALUATION-0')
const run=(p,action,payload,uid=actor.uid)=>executeProjectAction(p,{id:crypto.randomUUID(),action,payload,expectedVersion:p._version},foundationContext(uid))
test('reviewer workspace is assigned-only and retains independent projected records',()=>{
 const p=base();assert.ok(ownAssignment(p,actor));assert.equal(reviewStatus(p,actor),'pending')
 assert.equal(reviewerRows([p],{...actor,uid:'unassigned'}).length,0)
 assert.equal(reviewerRows([p],{...actor,workspace:'other'}).length,0)
 assert.equal(reviewerRows([p],actor,{reviewStatus:'draft'}).length,0)
 const saved=run(p,'save_evaluation',{evaluation:{additionalComments:'Private draft'}})
 assert.equal(evaluationProgress(saved).label,'0/3');assert.equal(reviewStatus(saved,actor),'draft')
 assert.equal(projectProjection(saved,r2).closure.evaluations[actor.uid],undefined)
 assert.equal(reviewerRows([saved],actor,{search:p.id,reviewStatus:'draft'}).length,1)
})
test('submit validates, locks exactly once and leaves state/release unchanged',()=>{
 const p=base();assert.throws(()=>run(p,'submit_evaluation',{evaluation:{}}))
 const submitted=run(p,'submit_evaluation',{evaluation})
 assert.equal(submitted.status,'REPORT_EVALUATION');assert.equal(submitted.closure.release,null)
 assert.equal(evaluationProgress(submitted).label,'1/3');assert.equal(submitted.closure.evaluations[actor.uid].reviewRound,1)
 for(const action of ['save_evaluation','submit_evaluation'])assert.throws(()=>run(submitted,action,{evaluation}),/Capability denied/)
 assert.equal(submitted.statusHistory.at(-1).updatedBy,actor.uid)
 const duplicate=base();duplicate.closure.assignments[1].reviewerId=actor.uid
 assert.throws(()=>run(duplicate,'save_evaluation',{evaluation}),/three unique/)
 const released={...submitted,closure:{...submitted.closure,release:{releasedAt:'2026-11-15'}}}
 assert.throws(()=>run(released,'submit_evaluation',{evaluation},r2.uid),/Capability denied/)
})
test('PDF snapshot is submitted-only, private, immutable and excludes post-terminal OPEN access',()=>{
 const p=base();assert.throws(()=>submittedPdfSnapshot(p,actor),/unavailable/)
 const submitted=run(p,'submit_evaluation',{evaluation})
 const before=JSON.stringify(submitted),snapshot=submittedPdfSnapshot(submitted,actor)
 assert.deepEqual(snapshot.evaluation,submitted.closure.evaluations[actor.uid])
 assert.throws(()=>submittedPdfSnapshot(submitted,r2,actor.uid),/unavailable/)
 assert.throws(()=>submittedPdfSnapshot(submitted,foundationActors['demo-user'],actor.uid),/unavailable/)
 assert.throws(()=>submittedPdfSnapshot({...submitted,status:'CLOSED'},actor),/unavailable/)
 assert.equal(JSON.stringify(submitted),before);snapshot.evaluation.chapters='Changed';assert.notEqual(snapshot.evaluation.chapters,submitted.closure.evaluations[actor.uid].chapters)
 assert.ok(evaluationRows(evaluation).some(([k,v])=>k==='เหตุผล / Reason'&&v===evaluation.reason))
 assert.deepEqual(evaluationPayload({...evaluation,by:'spoof',result:undefined}),Object.fromEntries(Object.entries(evaluation).filter(([k])=>k!=='result')))
})
test('reviewer can read own staged feedback but never another reviewer feedback',()=>{
 const p=base(),doc={id:'feedback',kind:'feedback',uploadedBy:actor.uid}
 assert.equal(hasCapability(p,actor,'download',{document:doc}),true)
 assert.equal(hasCapability(p,r2,'download',{document:doc}),false)
})
