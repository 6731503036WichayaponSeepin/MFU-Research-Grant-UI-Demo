import test from 'node:test'
import assert from 'node:assert/strict'
import {createFoundationFixtures,foundationActors,foundationContext} from '../src/data/foundationDemo.js'
import {executeProjectAction} from '../src/domain/actions.js'
import {executeFoundationCommand} from '../functions/foundationPolicy.js'
import {PROJECT_STATES,TRANSITIONS} from '../src/domain/contracts.js'
import {projectProjection} from '../src/domain/permissions.js'
import {evaluationProgress} from '../src/domain/model.js'
import {demoDocument} from '../src/data/demoAttachment.js'
import {submittedPdfSnapshot} from '../src/utils/reviewerWorkspace.js'
import {workspaceNotifications,nextRequiredAction,timelineStates} from '../src/utils/commonWorkspace.js'
const actor=id=>foundationActors[id],owner='demo-user',staff='demo-staff',reviewers=[1,2,3].map(n=>`demo-reviewer-${n}`)
const fixture=id=>createFoundationFixtures().find(p=>p.id===id)
let sequence=0
function run(p,action,payload={},uid=owner){return executeProjectAction(p,{id:`integration-${++sequence}`,action,payload,expectedVersion:p?._version||0},foundationContext(uid))}
function attach(p,kind,uid=owner,proposalVersionId){const document={...demoDocument,id:`integrated-file-${++sequence}`,kind,version:p.documents.filter(d=>d.kind===kind).length+1,...(proposalVersionId?{proposalVersionId}:{})};return [run(p,'attach_document',{document},uid),document.id]}
function bundle(p){const version=p.proposalVersions.at(-1).id;let signed,evidence;[p,signed]=attach(p,'signed_rs1',owner,version);[p,evidence]=attach(p,'affiliation_evidence',owner,version);return [p,{proposalVersionId:version,documentIds:[signed,evidence],signaturesComplete:true,usesOthersElectronicSignatures:true,consentConfirmed:true}]}
function checkAudit(p){const events=p.statusHistory.filter(e=>e.action!=='fixture_snapshot');assert.equal(events.length,p._version);assert.equal(new Set(events.map(e=>e.id)).size,p._version);for(const [i,e]of events.entries()){assert.equal(e.projectVersion,i+1);assert.ok(actor(e.updatedBy));assert.ok(e.updatedAt);assert.ok(PROJECT_STATES.includes(e.newStatus))}}
test('one Local Demo record traverses proposal, correction, certification and publication closure',()=>{
 let p=run(null,'create_project',{projectId:'integration-publication',proposal:fixture('V16-DRAFT').proposal})
 p=run(p,'save_proposal',{proposal:{...p.proposal,projectTitle:'Integration proposal'}})
 let pdf;[p,pdf]=attach(p,'proposal_pdf',owner,p.proposalVersions.at(-1).id)
 p=run(p,'confirm_ready',{documentId:pdf,confirmed:true});p=run(p,'save_proposal',{proposal:{...p.proposal,objectives:'Affiliation revision'}})
 let data;[p,data]=bundle(p);p=run(p,'submit_proposal',data)
 p=run(p,'request_proposal_revision',{notes:'Revise methodology',editableSections:['methodology']},staff)
 assert.equal(nextRequiredAction(p,actor(staff)).capability,undefined)
 p=run(p,'save_proposal',{proposal:{...p.proposal,methodology:'Corrected method'}})
 ;[p,data]=bundle(p);p=run(p,'resubmit_proposal',data);assert.equal(p.status,'STAFF_REVIEW')
 assert.equal(p.proposalReview.actionRequiredBy,'staff');p=run(p,'pass_proposal',{confirmed:true},staff)
 p=run(p,'record_acknowledgement',{reference:'External ACK',date:'2026-11-15',acknowledged:true},staff)
 p=run(p,'certify_project',{reference:'External CERT',confirmed:true},staff)
 const oldEnd=p.endDate
 p=run(p,'record_project_change',{changes:{projectTitle:'Approved title'},outcome:'approved',reason:'External outcome',reference:'CHANGE/5'},staff)
 p=run(p,'record_extension',{date:'2026-11-15',outcome:'approved',endDate:'2027-04-01',reason:'External outcome',reference:'EXT/5'},staff)
 assert.notEqual(p.endDate,oldEnd);assert.equal(p.status,'IN_PROGRESS')
 let summary,publication;[p,summary]=attach(p,'summary_report');[p,publication]=attach(p,'publication')
 p=run(p,'submit_closure',{method:'publication',summary:'Research summary',finishedDate:'2026-11-15',documentIds:[summary,publication]})
 p=run(p,'request_closure_documents',{notes:'Add publication information'},staff)
 assert.equal(nextRequiredAction(p,actor(staff)).capability,undefined)
 p=run(p,'supplement_closure',{method:'publication',summary:'Supplemented',finishedDate:'2026-11-15',documentIds:[summary,publication]})
 p=run(p,'check_closure',{confirmed:true},staff);p=run(p,'close_publication',{confirmed:true},staff)
 assert.equal(p.status,'CLOSED');assert.equal(p.closure.assignments.length,0);assert.ok(!timelineStates(p).includes('REPORT_EVALUATION'))
 for(const tr of ['TR-01','TR-02','TR-03','TR-04','TR-05','TR-06','TR-08','TR-09','TR-10','TR-11','TR-12','TR-14'])assert.ok(p.statusHistory.some(e=>e.transitionRule===tr),tr)
 checkAudit(p)
})
test('three roles share report, drafts, release, PDFs, revised report and explicit final closure',()=>{
 let p=fixture('V16-ACTIVE'),report;[p,report]=attach(p,'report')
 p=run(p,'submit_closure',{method:'report',summary:'Five chapters',finishedDate:'2026-11-15',documentIds:[report]})
 p=run(p,'check_closure',{confirmed:true},staff);p=run(p,'assign_reviewers',{reviewerIds:reviewers},staff)
 const assignments=structuredClone(p.closure.assignments),e={objectives:0,consistency:0,abstract:0,executive:0,result:1,utilization:{},additionalComments:'Submitted data'}
 for(const [i,uid]of reviewers.entries()){
  p=run(p,'save_evaluation',{evaluation:{additionalComments:`Private ${uid}`}},uid)
  assert.equal(evaluationProgress(p).submitted,i);assert.throws(()=>run(p,'release_evaluations',{confirmed:true},staff))
  p=run(p,'submit_evaluation',{evaluation:e},uid)
  assert.deepEqual(Object.keys(projectProjection(p,actor(uid)).closure.evaluations),[uid])
  assert.deepEqual(projectProjection(p,actor(owner)).closure.evaluations,{})
  assert.throws(()=>submittedPdfSnapshot(p,actor(owner),uid))
  assert.equal(submittedPdfSnapshot(p,actor(staff),uid).evaluation.submitted,true)
 }
 p=run(p,'release_evaluations',{confirmed:true,notes:'Submit revised report'},staff)
 const immutable=JSON.stringify(p.closure.evaluations),before=JSON.stringify(p)
 for(const uid of reviewers)assert.deepEqual(submittedPdfSnapshot(projectProjection(p,actor(owner)),actor(owner),uid).evaluation,p.closure.evaluations[uid])
 assert.equal(JSON.stringify(p),before);assert.throws(()=>run(p,'release_evaluations',{confirmed:true},staff))
 let revised;[p,revised]=attach(p,'revised_report');p=run(p,'submit_revised_report',{documentIds:[revised],confirmed:true})
 assert.equal(p.status,'REPORT_EVALUATION');assert.equal(nextRequiredAction(p,actor(staff)).capability,'close')
 for(const uid of reviewers)assert.throws(()=>run(p,'submit_evaluation',{evaluation:e},uid))
 p=run(p,'verify_revised_report',{revisedReportVersionId:p.closure.revisedReportVersions.at(-1).id,confirmed:true},staff)
 assert.equal(p.status,'REPORT_EVALUATION');p=run(p,'close_report',{confirmed:true},staff)
 assert.deepEqual(p.closure.assignments,assignments);assert.equal(JSON.stringify(p.closure.evaluations),immutable)
 for(const uid of reviewers)assert.throws(()=>submittedPdfSnapshot(p,actor(staff),uid))
 assert.ok(workspaceNotifications([p],actor(owner)).some(n=>n.action==='close_report'))
 for(const uid of reviewers)assert.ok(workspaceNotifications([p],actor(uid)).every(n=>n.recipientId===uid))
 checkAudit(p)
})
test('Local/backend actions retain contract parity with explicit temporary policy exclusions',()=>{
 let local=fixture('V16-CLOSURE'),remote=structuredClone(local)
 for(const [action,payload,uid]of [['check_closure',{confirmed:true},staff],['assign_reviewers',{reviewerIds:reviewers},staff],['save_evaluation',{evaluation:{additionalComments:'Partial draft'}},reviewers[0]],['submit_evaluation',{evaluation:{objectives:0,consistency:0,abstract:0,executive:0,result:0}},reviewers[0]]]){
  const command={id:`parity-${++sequence}`,action,payload,expectedVersion:local._version},context=foundationContext(uid)
  local=executeProjectAction(local,command,context);remote=executeFoundationCommand(remote,command,actor(uid),foundationActors,context.now)
  const {serverUpdatedAt,...rest}=remote;assert.equal(serverUpdatedAt,context.now);assert.deepEqual(rest,local)
 }
 for(const p of [fixture('V16-DRAFT'),fixture('V16-ACTIVE')]){
  const action=p.status==='DRAFT'?'confirm_ready':'cancel_project',payload=action==='cancel_project'?{reason:'OTHER',details:'Not authorized',confirmed:true}:{}
  const command={id:`open-${++sequence}`,action,payload,expectedVersion:p._version},uid=action==='cancel_project'?staff:owner
  assert.throws(()=>executeFoundationCommand(p,command,actor(uid),foundationActors),/OPEN-/)
 }
 assert.equal(PROJECT_STATES.length,9);assert.equal(Object.keys(TRANSITIONS).length,17)
 assert.throws(()=>run(fixture('V16-STAFF'),'return_to_affiliation'),/OPEN-05/)
 assert.throws(()=>run(fixture('V16-CANCELLED'),'submit_closure',{}),/CLOSED and CANCELLED/)
})
