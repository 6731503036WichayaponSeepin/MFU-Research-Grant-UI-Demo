import test from 'node:test'
import assert from 'node:assert/strict'
import { createInteractiveDemo } from '../src/data/interactiveDemo.js'
import { reviewerEvaluationRounds, reviewerTask } from '../src/utils/reviewerPresentation.js'
import { transition } from '../src/utils/closure.js'
import { initializeDemo, KEY } from '../src/utils/projectStorage.js'

const reviewer={role:'reviewer',username:'demo-reviewer'}
const evaluation={objectives:0,consistency:0,abstract:0,executive:0,chapters:'อธิบายวิธีวิเคราะห์ครบถ้วน',outputs:'คู่มือและชุดข้อมูลสังเคราะห์',strengths:'ลำดับการนำเสนอชัดเจน',future:'ทดสอบในบริบทจำลองเพิ่มเติม',utilization:{},result:0,documents:[]}
const scenarios=()=>createInteractiveDemo()

test('reviewer status scenarios map real evaluation data to the established badge tones',()=>{
  const projects=scenarios(),pending=projects.find(p=>p.id==='MFU-DEMO-018')
  assert.equal(reviewerTask(pending,reviewer.username).tone,'pending')
  const approved=structuredClone(pending);approved.closure.state='staff_decision';approved.closure.evaluations[reviewer.username]={submitted:true,result:0}
  assert.equal(reviewerTask(approved,reviewer.username).tone,'approved')
  const rejected=structuredClone(approved);rejected.closure.evaluations[reviewer.username]={submitted:true,result:2}
  assert.equal(reviewerTask(rejected,reviewer.username).tone,'required')
  const notSubmitted=structuredClone(pending);notSubmitted.closure.state='returned'
  assert.equal(reviewerTask(notSubmitted,reviewer.username).tone,'waiting')
  const revise=structuredClone(approved);revise.closure.evaluations[reviewer.username]={submitted:true,result:1}
  assert.equal(reviewerTask(revise,reviewer.username).tone,'revisions')
  assert.equal(reviewerTask({...pending,closure:{...pending.closure,evaluations:{[reviewer.username]:{submitted:false}}}},reviewer.username).tone,'draft')
  const invalid=structuredClone(approved);invalid.closure.evaluations[reviewer.username]={submitted:true,result:99}
  assert.equal(reviewerTask(invalid,reviewer.username).tone,'waiting')
})

test('reviewer result history keeps prior and current rounds separate and private',()=>{
  const project=scenarios().find(p=>p.reviewerScenarioLabel==='ส่งรายงานฉบับแก้ไขกลับมา')
  const rounds=reviewerEvaluationRounds(project.closure,reviewer.username)
  assert.equal(rounds.length,1)
  assert.equal(rounds[0].evaluation.reviewRound,1)
  assert.equal(rounds[0].evaluation.result,2)
  const reassessed=transition(project,'review',evaluation,reviewer,'2026-11-04T03:00:00.000Z')
  const after=reviewerEvaluationRounds(reassessed.closure,reviewer.username)
  assert.deepEqual(after.map(item=>item.evaluation.reviewRound),[1,2])
  assert.deepEqual(after.map(item=>item.archived),[true,false])
  assert.equal(reviewerEvaluationRounds(reassessed.closure,'another-reviewer').length,0)
})

test('new report and revised report scenarios are listed as pending reviewer work',()=>{
  const projects=scenarios(),first=projects.find(p=>p.reviewerScenarioLabel==='ส่งรายงานใหม่'),revised=projects.find(p=>p.reviewerScenarioLabel==='ส่งรายงานฉบับแก้ไขกลับมา'),notApproved=projects.find(p=>p.reviewerScenarioLabel==='ไม่เห็นชอบ'),notSubmitted=projects.find(p=>p.reviewerScenarioLabel==='ยังไม่มีการส่งข้อมูล')
  assert.ok(first)
  assert.equal(first.closure.state,'awaiting_review')
  assert.equal(reviewerTask(first,reviewer.username).state,'pending')
  assert.equal(projects.filter(p=>p.reviewerScenarioLabel==='ส่งรายงานใหม่'&&p.closure?.reviewRound===1&&p.closure?.state==='awaiting_review').length,3)
  assert.equal(revised.closure.state,'awaiting_review')
  assert.equal(revised.closure.revision,2)
  assert.equal(revised.closure.reviewRound,2)
  assert.equal(reviewerTask(revised,reviewer.username).state,'pending')
  assert.equal(revised.closure.submissions.length,2)
  assert.ok(revised.closure.history.some(item=>item.action==='review'&&item.snapshot?.result===2))
  assert.ok(revised.closure.history.some(item=>item.action==='submit'&&item.role==='researcher'))
  assert.equal(reviewerTask(notApproved,reviewer.username).tone,'required')
  assert.equal(reviewerTask(notSubmitted,reviewer.username).tone,'waiting')
  assert.equal(reviewerTask(notSubmitted,reviewer.username).label,'รอเจ้าหน้าที่ดำเนินการ')
})

test('reviewer can reassess a resubmitted report without losing earlier submissions or evaluation history',()=>{
  const revised=scenarios().find(p=>p.reviewerScenarioLabel==='ส่งรายงานฉบับแก้ไขกลับมา')
  const beforeHistory=revised.closure.history.length,beforeSubmissions=revised.closure.submissions.length
  const updated=transition(revised,'review',evaluation,reviewer,'2026-11-04T03:00:00.000Z')
  assert.equal(updated.closure.state,'staff_decision')
  assert.equal(updated.closure.evaluations[reviewer.username].submitted,true)
  assert.equal(updated.closure.evaluations[reviewer.username].reviewRound,2)
  assert.equal(updated.closure.history.length,beforeHistory+1)
  assert.equal(updated.closure.submissions.length,beforeSubmissions)
  assert.equal(updated.closure.history.find(item=>item.action==='review').snapshot.result,2)
  assert.equal(revised.closure.evaluations[reviewer.username],undefined)
})

test('existing local demo data migrates reviewer scenarios without replacing researcher data',()=>{
  const prior=globalThis.localStorage,values=new Map(),generated=scenarios(),first=structuredClone(generated.find(p=>p.id==='MFU-DEMO-018'))
  delete first.reviewerScenarioLabel;delete first.closure.submissions
  const researcherProject={id:'researcher-owned',ownerUsername:'demo-user',title:'Keep researcher project',status:'active',scenario:'researcher project',proposal:{},statusHistory:[]}
  values.set(KEY,JSON.stringify([first,researcherProject]))
  values.set('mfu-demo-seed-v1','1');values.set('mfu-demo-documents-v2','1')
  globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))}
  try{
    const migrated=initializeDemo()
    assert.equal(migrated.find(p=>p.id===researcherProject.id).title,researcherProject.title)
    assert.ok(migrated.find(p=>p.id==='MFU-DEMO-018').reviewerScenarioLabel)
    assert.equal(migrated.filter(p=>p.reviewerScenarioLabel==='ส่งรายงานใหม่'&&p.closure?.reviewRound===1&&p.closure?.state==='awaiting_review').length,3)
    assert.ok(migrated.find(p=>p.id==='MFU-DEMO-REVIEWER-REVISION'))
    assert.ok(migrated.find(p=>p.id==='MFU-DEMO-REVIEWER-NOT-APPROVED'))
    assert.ok(migrated.find(p=>p.id==='MFU-DEMO-REVIEWER-NO-SUBMISSION'))
    assert.notEqual(migrated.find(p=>p.id==='MFU-DEMO-REVIEWER-REVISION').ownerUsername,'demo-user')
  }finally{if(prior===undefined)delete globalThis.localStorage;else globalThis.localStorage=prior}
})
