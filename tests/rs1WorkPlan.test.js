import test from 'node:test'
import assert from 'node:assert/strict'
import {workTasks,workPlanPatch,workPlanErrors,twoYearEnd,extractWorkPlanText} from '../src/utils/rs1WorkPlan.js'
import {proposalData} from '../src/domain/model.js'
import {extractRS1Tables} from '../src/utils/rs1FieldMapping.js'
import {executeProjectAction} from '../src/domain/actions.js'
import {createResearcherScenarios} from '../src/data/researcherScenarios.js'
import {foundationContext} from '../src/data/foundationDemo.js'

test('task chains follow project start, changed endpoints, additions and removals',()=>{
 let data={startDate:'2026-01-01',endDate:'2027-12-31'}
 const rows=Array.from({length:5},(_,i)=>({name:'Task '+i,endDate:`2026-0${i+2}-01`}))
 data={...data,...workPlanPatch(data,rows)}
 assert.equal(data.workTasks[0].startDate,data.startDate);assert.equal(data.workTasks[4].startDate,'2026-05-01')
 data.workTasks[0].endDate='2026-02-15'
 assert.equal(workTasks(data)[1].startDate,'2026-02-15')
 data={...data,startDate:'2026-01-15'};assert.equal(workTasks(data)[0].startDate,'2026-01-15')
 data={...data,...workPlanPatch(data,workTasks(data).filter((_,i)=>i!==1))}
 assert.equal(data.workTasks[1].startDate,'2026-02-15');assert.equal(data.workTasks.length,4)
 assert.deepEqual(proposalData(data).workTasks,data.workTasks)
 data={...data,...workPlanPatch(data,[])};assert.deepEqual(workTasks(data),[]);assert.equal(data.workTask1,'')
})
test('calendar validation covers two years, leap days, ordering, project boundaries and missing prior end',()=>{
 const base={startDate:'2026-01-01',endDate:'2028-01-01',workTasks:[{name:'A',endDate:'2026-02-01'}]}
 assert.deepEqual(workPlanErrors(base),[])
 assert.ok(workPlanErrors({...base,endDate:'2028-01-02'}).some(e=>e.field==='endDate'))
 assert.equal(twoYearEnd('2024-02-29'),'2026-02-28')
 for(const endDate of ['2025-12-31','2028-01-02','2026-02-30','invalid'])assert.ok(workPlanErrors({...base,workTasks:[{name:'A',endDate}]}).length)
 assert.ok(workPlanErrors({...base,workTasks:[{name:'A',endDate:''},{name:'B',endDate:'2026-03-01'}]}).length>=2)
 assert.throws(()=>proposalData({workTasks:[{name:'A',unauthorized:'x'}]}))
})
test('legacy periods remain intact; exact ISO ranges and all imported table rows are supported',()=>{
 const legacy={startDate:'2026-01-01',workTask1:'Original task',workPeriod1:'January–March 2026',workPlan:'Unstructured notes'}
 assert.equal(workTasks(legacy)[0].legacyPeriod,'January–March 2026');assert.equal(workTasks(legacy)[0].endDate,'')
 assert.equal(proposalData(legacy).workPeriod1,legacy.workPeriod1)
 const rows=Array.from({length:5},(_,i)=>['Task '+i,`2026-01-01 – 2026-0${i+2}-01`])
 const result=extractRS1Tables([[['Task','Period'],...rows]])
 assert.equal(result.workTasks.length,5);assert.equal(result.workTasks[4].endDate,'2026-06-01')
 const three=extractRS1Tables([[['Task Name','Start Date','End Date'],['A','2026-01-01','2026-03-01']]])
 assert.equal(three.workTasks[0].endDate,'2026-03-01')
 const pdf=extractWorkPlanText('Task   Period\n'+rows.map(r=>r.join('   ')).join('\n')+'\n13. Research Progress',legacy)
 assert.equal(pdf.workTasks.length,5);assert.equal(pdf.workTasks[1].startDate,'2026-02-01')
})
test('working plan correction preserves section permission, project state and all versioned rows',()=>{
 const p=createResearcherScenarios().find(p=>p.id==='V16-CORRECTION'),context=foundationContext('demo-user')
 const patch=workPlanPatch(p.proposal,Array.from({length:5},(_,i)=>({name:'Task '+i,endDate:'2026-12-01'})))
 const command={id:'task-correction',action:'save_proposal',expectedVersion:p._version,payload:{proposal:{...p.proposal,...patch}}}
 assert.throws(()=>executeProjectAction(p,command,context),{code:'EDIT_SCOPE_DENIED'})
 p.proposalReview.editableSections.push('researchPlan')
 const result=executeProjectAction(p,command,context)
 assert.equal(result.status,'STAFF_REVIEW');assert.equal(result.proposalVersions.at(-1).proposal.workTasks.length,5)
 assert.equal(p.proposal.workTasks,undefined)
})
