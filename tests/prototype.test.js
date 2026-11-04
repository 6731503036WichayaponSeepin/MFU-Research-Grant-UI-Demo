import test from 'node:test'
import assert from 'node:assert/strict'
import { initializeDemo, getProjects, saveProposal, updateProjectStatus, KEY } from '../src/utils/projectStorage.js'
import { workflow, normalizeStatus } from '../src/data/statuses.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
import { preserveWorkingDraft } from '../src/utils/projectStorage.js'
const user={username:'demo-user',role:'researcher'}
function storage(initial={}) { const data=new Map(Object.entries(initial)); globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))}; return data }
test('seed creates shared scenarios, remains idempotent, and reset restores only original examples',()=>{
 storage({[KEY]:JSON.stringify([{id:'user-1',status:'submitted',proposal:{projectTitle:'Preserve me'}}])})
 let p=initializeDemo();assert.equal(p.length,13)
 assert.equal(workflow.length,9); assert.equal(p.filter(p=>p.scenario).length,12)
 assert.equal(initializeDemo().length,13)
 assert.equal(initializeDemo(true).length,12)
 assert.equal(getProjects().find(p=>p.id==='user-1'),undefined)
 assert.equal(normalizeStatus('closure'),'closure_review')
})
test('malformed and non-array storage is never replaced by seeding',()=>{
 for(const raw of ['{broken','{}','[null]']){const data=storage({[KEY]:raw});assert.throws(()=>initializeDemo());assert.equal(data.get(KEY),raw)}
})
test('draft submission is idempotent and review revision preserves unrelated data',()=>{
 storage();initializeDemo()
 const draft={projectTitle:'Test',leaderName:'Researcher',objectives:'Study',methodology:'Survey',startDate:'2026-01-01',endDate:'2027-01-01',compensation:'100'}
 const saved=saveProposal(draft,user);assert.equal(saved.status,'draft')
 draft._projectId=saved.id
 const submitted=saveProposal(draft,user,true);assert.equal(submitted.status,'unit_review')
 saveProposal(draft,user,true);assert.equal(getProjects().length,13)
 assert.throws(()=>saveProposal(draft,user))
 const other=JSON.stringify(getProjects().find(p=>p.id==='MFU-DEMO-001'))
 assert.throws(()=>updateProjectStatus('MFU-DEMO-006','revision_required',''))
 updateProjectStatus('MFU-DEMO-006','revision_required','Clarify samples')
 let p=getProjects().find(p=>p.id==='MFU-DEMO-006');assert.equal(p.reviewNotes.at(-1).note,'Clarify samples')
 p=saveProposal({...p.proposal,_projectId:p.id},user,true);assert.equal(p.status,'admin_review')
 updateProjectStatus(p.id,'committee_review','Complete')
 assert.throws(()=>updateProjectStatus(p.id,'committee_review','Duplicate'))
 assert.equal(JSON.stringify(getProjects().find(p=>p.id==='MFU-DEMO-001')),other)
})
test('submission validates required fields and storage write failures are visible',()=>{
 storage();assert.throws(()=>saveProposal({},user,true))
 globalThis.localStorage.setItem=()=>{throw new Error('Quota exceeded')}
 assert.throws(()=>saveProposal({projectTitle:'Draft'},user),/Quota/)
})
test('external records require staff and complete outcomes; pending certification never advances',()=>{
 const staff={username:'staff',role:'staff'}, form={date:'2026-10-17',responsible:'Staff',notes:'Fictional received record',meetingNumber:'DEMO-1',meetingDate:'2026-10-16',certification:'pending',outcome:'endorsed'}
 const p={id:'p',status:'committee_review',proposal:{custom:'preserved'}}
 assert.throws(()=>recordAdministrativeResult(p,form,user,p.status))
 assert.throws(()=>recordAdministrativeResult(p,{...form,meetingNumber:''},staff,p.status))
 assert.equal(recordAdministrativeResult(p,form,staff,p.status).status,'committee_review')
 const active=recordAdministrativeResult(p,{...form,certification:'complete'},staff,p.status)
 assert.equal(active.status,'active');assert.deepEqual(active.proposal,p.proposal)
 assert.equal(active.administrativeRecords.length,1)
 assert.throws(()=>recordAdministrativeResult(active,form,staff,p.status))
 assert.equal(recordAdministrativeResult({...p,status:'unit_review'},form,staff,'unit_review').status,'eoffice_pending')
 assert.equal(recordAdministrativeResult({...p,status:'eoffice_pending'},form,staff,'eoffice_pending').status,'admin_review')
})
test('opening another proposal preserves an unsaved working copy',()=>{
 storage({'mfu-rs1-v2-draft':JSON.stringify({projectTitle:'Unfinished user proposal'})})
 preserveWorkingDraft(user)
 assert.equal(getProjects()[0].title,'Unfinished user proposal')
 const data=storage({'mfu-rs1-v2-draft':'[1,2]'})
 assert.throws(()=>preserveWorkingDraft(user));assert.equal(data.get('mfu-rs1-v2-draft'),'[1,2]')
})
