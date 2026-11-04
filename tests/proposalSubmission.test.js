import test from 'node:test'
import assert from 'node:assert/strict'
import { proposalFieldErrors, proposalDocumentErrors, assertProposalValid } from '../src/utils/proposalValidation.js'
import { readProposalDraft, writeProposalDraft } from '../src/utils/proposalDraft.js'
import { setDraftIdentity, configureProjectStore, saveProposal, buildProposal } from '../src/utils/projectStorage.js'
import { submitResearchProposal } from '../src/utils/proposalSubmission.js'
import { replayProject } from '../functions/securePolicy.js'
const actor={uid:'owner',username:'owner',role:'researcher',workspace:'testing'}
const form={projectTitle:'Proposal',leaderName:'Researcher',objectives:'Study',methodology:'Survey',startDate:'2026-01-01',endDate:'2027-01-01',compensation:1000}
const bytes='%PDF-1.4\nEmulator test document'
const pdf={name:'rs1.pdf',size:bytes.length,dataUrl:'data:application/pdf;base64,'+btoa(bytes),generated:true}
const reference={id:'ticket',name:'rs1.pdf',size:bytes.length,storagePath:'workspaces/testing/projects/project/owner/ticket',contentType:'application/pdf'}
const acknowledgement=(id='project')=>({id,status:'unit_review',submittedAt:'2026-10-29',_version:2,ownerUid:'owner'})

test('all required RS-1 omissions produce specific Thai field errors',()=>{
  const errors=proposalFieldErrors({})
  assert.deepEqual(errors.map(error=>error.field),['projectTitle','leaderName','objectives','methodology','startDate','endDate','budget'])
  assert.ok(errors.every(error=>/[ก-๙]/.test(error.message)))
  assert.deepEqual(proposalFieldErrors(form),[])
})
test('calendar dates, ordered ranges and each budget category are validated',()=>{
  for(const startDate of ['2026-02-30','2026-13-01','not-a-date',4])assert.ok(proposalFieldErrors({...form,startDate}).some(error=>error.field==='startDate'))
  assert.ok(proposalFieldErrors({...form,endDate:form.startDate}).some(error=>error.field==='endDate'))
  assert.deepEqual(proposalFieldErrors({...form,startDate:'2028-02-29',endDate:'2028-03-01'}),[])
  for(const key of ['compensation','directCost','materials','utility'])for(const value of [-1,'invalid',Infinity,true,{}])assert.ok(proposalFieldErrors({...form,[key]:value}).some(error=>error.field===key))
  assert.ok(proposalFieldErrors({...form,projectTitle:2}).some(error=>error.field==='projectTitle'))
})
test('proposal PDF validation rejects absent bytes, invalid formats, oversized files and forged storage metadata',()=>{
  assert.deepEqual(proposalDocumentErrors(pdf),[])
  assert.deepEqual(proposalDocumentErrors(reference,{mode:'storage'}),[])
  for(const document of [undefined,{...pdf,name:'file.docx'},{...pdf,size:3*1024*1024},{...pdf,size:1},{...pdf,dataUrl:'data:application/pdf;base64,'+btoa('bad')}])assert.ok(proposalDocumentErrors(document).length)
  for(const document of [pdf,{...reference,id:undefined},{...reference,contentType:'text/plain'},{...reference,storagePath:'forged'}])assert.ok(proposalDocumentErrors(document,{mode:'storage'}).length)
})
test('manual entry and confirmation use the current account draft key after identity changes',()=>{
  const values=new Map();globalThis.localStorage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)}
  setDraftIdentity('testing-owner');writeProposalDraft({...form,_projectId:'stable-id'})
  assert.equal(readProposalDraft()._projectId,'stable-id')
  setDraftIdentity('testing-other');assert.deepEqual(readProposalDraft(),{})
  writeProposalDraft({projectTitle:'Other user'});setDraftIdentity('testing-owner')
  assert.equal(readProposalDraft().projectTitle,form.projectTitle)
  writeProposalDraft({...form,_document:{...reference,dataUrl:pdf.dataUrl}})
  assert.equal(readProposalDraft()._document.storagePath,reference.storagePath)
  assert.equal(readProposalDraft()._document.dataUrl,undefined)
  values.set('mfu-private-draft-testing-owner','[1,2]');assert.throws(readProposalDraft)
  assert.equal(values.get('mfu-private-draft-testing-owner'),'[1,2]');setDraftIdentity(null)
})
test('incomplete proposals do not generate documents or invoke persistence; drafts remain allowed',async()=>{
  let called=false
  await assert.rejects(submitResearchProposal({},actor,{remember:()=>{},createDocument:async()=>{called=true},persist:async()=>{called=true}}),error=>error.fieldErrors.length===7)
  assert.equal(called,false)
  assert.equal(buildProposal(null,{projectTitle:'Incomplete draft'},actor).status,'draft')
})
test('submission waits for a positive backend acknowledgement and preserves the source PDF',async()=>{
  let resolve,persisted,finished=false
  const pending=new Promise(done=>{resolve=done})
  const task=submitResearchProposal({...form,_projectId:'project',_document:{...pdf,generated:false}},actor,{
    remember:()=>{},createDocument:async()=>({...pdf,name:'current-rs1.pdf'}),persist:async(data,user,submit)=>{persisted={data,user,submit};return pending},
  }).then(result=>{finished=true;return result})
  await new Promise(done=>setTimeout(done,0))
  assert.equal(finished,false);assert.equal(persisted.submit,true)
  assert.equal(persisted.data._sourceDocument.name,'rs1.pdf')
  assert.equal(persisted.data._document.name,'current-rs1.pdf')
  resolve(acknowledgement());assert.equal((await task)._version,2)
})
test('failed or unacknowledged writes cannot report success and retries retain the same project ID',async()=>{
  let remembered
  const options={remember:data=>{remembered=data},createDocument:async()=>pdf,persist:async()=>{throw new Error('Server rejected write')}}
  await assert.rejects(submitResearchProposal(form,actor,options),/Server rejected/)
  const id=remembered._projectId
  options.persist=async data=>acknowledgement(data._projectId)
  assert.equal((await submitResearchProposal(remembered,actor,options)).id,id)
  for(const result of [undefined,{id},acknowledgement('other'),{...acknowledgement(id),status:'draft'}]){
    await assert.rejects(submitResearchProposal({...form,_projectId:id},actor,{...options,persist:async()=>result}),/backend/)
  }
})
test('invalid source/generated PDFs are rejected before persistence',async()=>{
  let persisted=false
  for(const [source,generated] of [[{...pdf,name:'source.docx',generated:false},pdf],[undefined,{...pdf,size:3*1024*1024}]]){
    await assert.rejects(submitResearchProposal({...form,_document:source},actor,{remember:()=>{},createDocument:async()=>generated,persist:async()=>{persisted=true}}),error=>error.fieldErrors.length>0)
  }
  assert.equal(persisted,false)
})
test('saveProposal returns authoritative backend metadata after the write resolves',async()=>{
  configureProjectStore({read:()=>[],save:async projects=>({...projects[0],_version:4,ownerUid:'owner',submittedAt:'server-time'})})
  try {const saved=await saveProposal({...form,_projectId:'project'},actor,true);assert.equal(saved._version,4);assert.equal(saved.ownerUid,'owner');assert.equal(saved.submittedAt,'server-time')}
  finally {configureProjectStore(null)}
})
test('server requires a private Storage PDF on submit and revalidates fields independently',()=>{
  const draft=replayProject(null,buildProposal(null,form,actor,false,'project'),actor)
  const submitted=buildProposal(draft,form,actor,true,'project')
  assert.throws(()=>replayProject(draft,submitted,actor),error=>error.fieldErrors.some(error=>error.field==='_document'))
  const valid={...submitted,proposal:{...form,_document:reference}}
  assert.equal(replayProject(draft,valid,actor).status,'unit_review')
  assert.throws(()=>replayProject(draft,{...valid,proposal:{...valid.proposal,objectives:''}},actor),error=>error.fieldErrors.some(error=>error.field==='objectives'))
  assert.throws(()=>assertProposalValid({...form,_document:pdf},{documents:true,mode:'storage'}))
  assert.equal(draft.status,'draft');assert.equal(draft._version,1)
})
