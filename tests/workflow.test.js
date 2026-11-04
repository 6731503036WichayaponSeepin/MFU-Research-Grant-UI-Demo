import test from 'node:test'
import assert from 'node:assert/strict'
import { getProjects, saveProjects, saveProposal, KEY } from '../src/utils/projectStorage.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
import { applyChange } from '../src/utils/projectChanges.js'
import { transition } from '../src/utils/closure.js'
import { validateProject } from '../functions/policy.js'
import { createDemoProjects } from '../src/data/demoProjects.js'
import { deadlineItems } from '../src/utils/deadlines.js'
import { demoDocument } from '../src/data/demoAttachment.js'
const researcher={role:'researcher',username:'demo-user'},staff={role:'staff',username:'demo-user'},reviewer={role:'reviewer',username:'demo-user'}
const record={date:'2026-10-20',responsible:'Staff',notes:'Unit requests corrections',unitOutcome:'revision'}
function storage(){const values=new Map();globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)}}
test('unit rejection returns revised proposal to the unit and preserves the shared history',()=>{
 storage()
 const initial=createDemoProjects()[2]
 const returned=recordAdministrativeResult(initial,record,staff,'unit_review')
 assert.equal(returned.status,'revision_required')
 assert.equal(returned.revisionReturnTo,'unit_review')
 validateProject(returned,initial,0)
 saveProjects([returned])
 const revised=saveProposal({...returned.proposal,_projectId:returned.id},researcher,true)
 assert.equal(revised.status,'unit_review')
 validateProject(revised,returned,0)
 assert.equal(getProjects().length,1)
 assert.ok(localStorage.getItem(KEY).includes('Unit requests corrections'))
})
test('project changes append history and can be saved to the shared backend',()=>{
 const original=createDemoProjects()[10]
 const form={type:'extension',letterNumber:'DEMO/12',letterDate:'2026-10-20',effectiveDate:'2026-10-20',reason:'Sample extension',description:'Extend the research period',endDate:'2028-01-31'}
 const first=applyChange(original,form,staff,demoDocument)
 validateProject(first,original,0)
 const next=applyChange(first,{...form,type:'title',newValue:'Revised study'},staff,demoDocument)
 validateProject(next,first,0)
 assert.equal(next.changeRecords.length,2)
 assert.equal(next.statusHistory.at(-1).action,'project_change')
})
test('review corrections require staff notification and final verification, including incomplete final documents',()=>{
 let p=createDemoProjects()[17]
 // Preserve coverage for records saved with the previous prototype rubric.
 delete p.closure.evaluationVersion; delete p.closure.reviewers; delete p.closure.evaluations
 const step=(action,data,user)=>{const previous=p;p=transition(p,action,data,user);validateProject(p,previous,previous._version||0)}
 step('review',{scores:[4,4,4,4,4,4],comments:'Correct the appendix',result:'revise'},reviewer)
 assert.equal(p.closure.state,'revision_pending')
 assert.throws(()=>transition(p,'notify_revision',{notes:'Corrections'},researcher))
 step('notify_revision',{notes:'Submit a corrected appendix'},staff)
 const submission={method:'report',summary:'Corrected fictional findings',finishedDate:'2026-10-20',documents:[{...demoDocument,kind:'report'}]}
 step('submit',submission,researcher)
 step('final_check',{outcome:'incomplete',notes:'Supporting document still missing'},staff)
 assert.equal(p.closure.state,'returned')
 assert.throws(()=>transition(p,'complete',{},staff))
 step('submit',submission,researcher)
 assert.equal(p.closure.finalCheck,null)
 assert.throws(()=>transition(p,'final_check',{outcome:'complete',notes:'All done',checked:false},staff))
 step('final_check',{outcome:'complete',checked:true,notes:'All final documents verified'},staff)
 assert.equal(p.closure.state,'awaiting_review')
 assert.throws(()=>transition(p,'complete',{},staff))
 step('review',{scores:[4,4,4,4,4,4],comments:'Corrected appendix accepted',result:'accept'},reviewer)
 step('final_check',{outcome:'complete',checked:true,notes:'Reviewed version verified'},staff)
 step('complete',{},staff)
 assert.equal(p.status,'completed')
 step('record_notice',{reference:'DEMO/CLOSE/01',date:'2026-10-20'},staff)
 assert.equal(p.closure.closureNotice.reference,'DEMO/CLOSE/01')
 assert.throws(()=>transition(p,'record_notice',{reference:'X',date:'2026-10-20'},researcher))
})
test('deadline alerts use Bangkok dates, include overdue and ignore completed projects',()=>{
 const now=new Date('2026-10-19T18:00:00Z')
 const rows=deadlineItems([
  {id:'today',status:'active',endDate:'2026-10-20'},
  {id:'late',status:'active',endDate:'2026-10-18'},
  {id:'future',status:'active',endDate:'2026-12-01'},
  {id:'done',status:'completed',endDate:'2026-10-20'},
  {id:'invalid',status:'active',endDate:'bad'}
 ],now)
 assert.deepEqual(rows.map(x=>[x.project.id,x.days]),[['late',-2],['today',0]])
})
