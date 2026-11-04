import test from 'node:test'
import assert from 'node:assert/strict'
import { transition, canRead, persist } from '../src/utils/closure.js'
import { validateEvaluation } from '../src/utils/evaluation.js'
import { saveProposal, getProjects, updateProjectStatus } from '../src/utils/projectStorage.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
import { validateProject } from '../functions/policy.js'
import { demoDocument } from '../src/data/demoAttachment.js'

const researcher={role:'researcher',username:'alice'}, staff={role:'staff',username:'staff'}
const reviewers=['one','two','three']
const evaluation={objectives:0,consistency:0,abstract:0,executive:0,chapters:'ข้อมูลสมมุติ: เพิ่มรายละเอียดวิธีวิเคราะห์',outputs:'คู่มือชุมชน',strengths:'การมีส่วนร่วม',future:'ขยายกลุ่มตัวอย่าง',utilization:{1:'ถ่ายทอดคู่มือแก่ชุมชน'},result:1,documents:[]}
const report={method:'report',summary:'Fictional findings',finishedDate:'2026-10-27',documents:[{...demoDocument,kind:'report'}]}
function storage(){const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))};return values}
test('official draft validates choices, conditional explanations, rejection and feedback documents',()=>{
  validateEvaluation(evaluation)
  for(const key of ['objectives','consistency','abstract','executive']) {
    assert.throws(()=>validateEvaluation({...evaluation,[key]:1}))
    validateEvaluation({...evaluation,[key]:1,[`${key}Detail`]:'อธิบาย'})
    assert.throws(()=>validateEvaluation({...evaluation,[key]:99}))
  }
  assert.throws(()=>validateEvaluation({...evaluation,result:2}))
  validateEvaluation({...evaluation,result:2,reason:'วิธีวิจัยไม่ชัดเจน'})
  // The supplied Word form has no explanation field for patent/copyright.
  validateEvaluation({...evaluation,utilization:{2:''}})
  for (const key of [0,1,3,4]) {
    assert.throws(()=>validateEvaluation({...evaluation,utilization:{[key]:''}}))
    validateEvaluation({...evaluation,utilization:{[key]:'รายละเอียดตามแบบฟอร์ม'}})
  }
  assert.throws(()=>validateEvaluation({...evaluation,documents:[{dataUrl:'javascript:alert(1)'}]}))
})
test('new proposal through three independent evaluations, staff feedback, final report and closure persists',()=>{
  storage()
  let p=saveProposal({projectTitle:'Fictional garden study',leaderName:'Alice',objectives:'Study learning',methodology:'Survey',startDate:'2026-01-01',endDate:'2026-12-31',compensation:'1000'},researcher,true)
  const form={date:'2026-10-27',responsible:'Staff',notes:'Simulated external outcome',unitOutcome:'endorsed'}
  p=recordAdministrativeResult(p,form,staff,'unit_review')
  p=recordAdministrativeResult(p,form,staff,'eoffice_pending')
  // Persist administrative steps through the same store used by the UI.
  localStorage.setItem('mfu-rs1-prototype-projects',JSON.stringify([p]))
  updateProjectStatus(p.id,'committee_review','Checked')
  p=recordAdministrativeResult(getProjects()[0],{...form,certification:'complete',outcome:'endorsed',meetingDate:'2026-10-27',meetingNumber:'1/2569'},staff,'committee_review')
  assert.throws(()=>recordAdministrativeResult(p,{...form,letterNumber:'DEMO/START/1'},researcher,'active'))
  p=recordAdministrativeResult(p,{...form,letterNumber:'DEMO/START/1'},staff,'active')
  assert.equal(p.proceedNotice.letterNumber,'DEMO/START/1')
  localStorage.setItem('mfu-rs1-prototype-projects',JSON.stringify([p]))
  const act=(action,data,user)=>{persist(p.id,action,data,user);p=getProjects()[0]}
  act('submit',report,researcher)
  act('check',{outcome:'incomplete',notes:'Add appendix'},staff)
  act('submit',report,researcher)
  act('check',{outcome:'complete',checked:true,reviewers},staff)
  assert.equal(canRead(p,{role:'reviewer',username:'outsider'}),false)
  assert.throws(()=>transition(p,'review',evaluation,{role:'reviewer',username:'outsider'}))
  assert.throws(()=>transition(p,'review',evaluation,researcher))
  for(const [index,username] of reviewers.entries()) {
    const user={role:'reviewer',username}
    act('review_draft',{chapters:'Unfinished draft'},user)
    assert.equal(getProjects()[0].closure.evaluations[username].chapters,'Unfinished draft')
    act('review',evaluation,user)
    assert.equal(p.closure.state,index===2?'staff_decision':'awaiting_review')
    assert.ok(p.closure.evaluations[username].submittedAt)
    assert.throws(()=>transition(p,'review_draft',evaluation,user))
    assert.throws(()=>transition(p,'complete',{},staff))
  }
  assert.throws(()=>transition(p,'final_check',{outcome:'complete',notes:'Checked',checked:true},staff))
  act('release_feedback',{outcome:'revision',notes:'Please add analysis details; simulated notice'},staff)
  act('submit',report,researcher)
  assert.equal(p.closure.state,'awaiting_review')
  assert.equal(p.closure.reviewRound,2)
  assert.equal(Object.keys(p.closure.evaluations).length,0)
  assert.equal(p.closure.reviewRounds.length,1)
  assert.equal(Object.keys(p.closure.reviewRounds[0].evaluations).length,3)
  for(const username of reviewers) {
    act('review',evaluation,{role:'reviewer',username})
    assert.equal(p.closure.evaluations[username].reviewRound,2)
  }
  assert.equal(p.closure.state,'staff_decision')
  act('release_feedback',{outcome:'final',notes:'เจ้าหน้าที่อนุญาตให้ดำเนินการตรวจขั้นสุดท้าย'},staff)
  assert.equal(p.closure.state,'final_check')
  act('final_check',{outcome:'incomplete',notes:'Missing appendix'},staff)
  act('submit',report,researcher)
  assert.equal(p.closure.state,'final_check')
  act('final_check',{outcome:'complete',checked:true,notes:'Staff verified final documents'},staff)
  const previous=structuredClone(p)
  act('complete',{},staff)
  assert.equal(p.status,'completed')
  assert.equal(getProjects()[0].status,'completed')
  assert.equal(p.statusHistory.at(-1).previousStatus,'closure_review')
  assert.equal(p.statusHistory.at(-1).newStatus,'completed')
  assert.equal(validateProject(p,previous,0).status,'completed')
})
test('partial evaluations cannot release feedback; duplicate assignments rejected',()=>{
  let p={id:'p',ownerUsername:'alice',status:'active',statusHistory:[]}
  p=transition(p,'submit',report,researcher)
  assert.throws(()=>transition(p,'check',{outcome:'complete',checked:true,reviewers:['one','one']},staff))
  p=transition(p,'check',{outcome:'complete',checked:true,reviewers},staff)
  p=transition(p,'review',evaluation,{role:'reviewer',username:'one'})
  assert.throws(()=>transition(p,'release_feedback',{outcome:'final',notes:'Proceed'},staff))
})
