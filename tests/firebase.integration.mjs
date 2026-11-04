// Local emulator only. No live project, credentials, or existing database used.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, doc, getDoc, getDocs, collection, query, where, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, ref, uploadBytes, getBytes } from 'firebase/storage'
import { buildProposal } from '../src/utils/projectStorage.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
import { transition } from '../src/utils/closure.js'
import { demoDocument } from '../src/data/demoAttachment.js'
const require=createRequire(new URL('../functions/package.json',import.meta.url))
const adminApp=require('firebase-admin/app').initializeApp({projectId:'demo-mfu-secure',storageBucket:'demo-mfu-secure.appspot.com'})
const adminDb=require('firebase-admin/firestore').getFirestore(adminApp),adminAuth=require('firebase-admin/auth').getAuth(adminApp)
assert.ok(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST,'Emulators required')
const projectId='demo-mfu-secure',password='Emulator-only-password-123!'
const profiles={owner:{role:'researcher'},outsider:{role:'researcher'},staff:{role:'staff'},expert:{role:'reviewer'},second:{role:'reviewer'},third:{role:'reviewer'},demo:{role:'staff',workspace:'demo'}}
const clients={}
const api='http://127.0.0.1:5001/demo-mfu-secure/asia-southeast1/researchApi'
const send=async(uid,body)=>{
  const token=uid ? await clients[uid].auth.currentUser.getIdToken() : ''
  const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)})
  return {status:response.status,...await response.json()}
}
const actor=uid=>({uid,username:uid,role:profiles[uid].role,workspace:profiles[uid].workspace || 'testing'})
const view=(uid,id)=>doc(clients[uid].db,`workspaces/testing/users/${uid}/projects/${id}`)
let checks=0
const check=()=>{checks++}
try {
  for(const [uid,p] of Object.entries(profiles)) {
    await adminAuth.createUser({uid,email:`${uid}@example.test`,password})
    await adminDb.doc('users/'+uid).set({active:true,workspace:p.workspace || 'testing',displayName:uid,...p})
    const app=initializeApp({projectId,apiKey:'demo-key',authDomain:'localhost',storageBucket:'demo-mfu-secure.appspot.com'},uid)
    const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})
    await signInWithEmailAndPassword(auth,`${uid}@example.test`,password)
    const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080)
    const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199)
    clients[uid]={app,auth,db,storage}
  }
  assert.equal((await send(null,{action:'save'})).status,401);check()
  await assert.rejects(getDocs(collection(clients.owner.db,'demoProjects')));check()
  await assert.rejects(updateDoc(doc(clients.owner.db,'users/owner'),{role:'staff'}));check()
  await assert.rejects(getDoc(doc(clients.owner.db,'users/staff')));check()
  const proposal={projectTitle:'Emulator research',leaderName:'Owner',objectives:'Study',methodology:'Survey',startDate:'2026-01-01',endDate:'2027-01-01',compensation:1000}
  let candidate=buildProposal(null,proposal,actor('owner'),false,'secure-project')
  let result=await send('owner',{action:'save',project:candidate,expectedVersion:0})
  assert.equal(result.status,200,JSON.stringify(result));let p=result.project;check()
  assert.equal((await getDoc(view('owner',p.id))).data().ownerUid,'owner');check()
  await assert.rejects(getDoc(doc(clients.outsider.db,`workspaces/testing/users/owner/projects/${p.id}`)));check()
  await assert.rejects(getDoc(doc(clients.owner.db,`workspaces/testing/projects/${p.id}`)));check()
  await assert.rejects(setDoc(view('owner',p.id),{status:'completed'}));check()
  await assert.rejects(getDocs(collection(clients.demo.db,'workspaces/testing/projects')));check()
  assert.equal((await send('outsider',{action:'save',project:candidate,expectedVersion:1})).status,403);check()
  assert.equal((await send('owner',{action:'save',project:candidate,expectedVersion:0})).status,409);check()
  async function save(uid,next) {const r=await send(uid,{action:'save',project:next,expectedVersion:p._version});assert.equal(r.status,200,JSON.stringify(r));p=r.project;check()}
  const invalid=await send('owner',{action:'save',project:{...p,proposal:{},statusHistory:[...p.statusHistory,{action:'submit_proposal'}]},expectedVersion:p._version})
  assert.equal(invalid.status,400);assert.ok(invalid.fieldErrors.some(error=>error.field==='objectives' && error.message.includes('วัตถุประสงค์')));check()
  const noDocument=await send('owner',{action:'save',project:buildProposal(p,proposal,actor('owner'),true,p.id),expectedVersion:p._version})
  assert.equal(noDocument.status,400);assert.ok(noDocument.fieldErrors.some(error=>error.field==='_document'));check()
  assert.equal((await getDoc(view('owner',p.id))).data().status,'draft');check()
  for(const input of [{name:'not-pdf.docx',size:100},{name:'empty.pdf',size:0},{name:'large.pdf',size:3*1024*1024}]){assert.equal((await send('owner',{action:'prepareUpload',projectId:p.id,...input})).status,400);check()}
  const proposalBytes=Buffer.from(demoDocument.dataUrl.split(',')[1],'base64')
  const proposalUpload=await send('owner',{action:'prepareUpload',projectId:p.id,name:'proposal.pdf',size:proposalBytes.length})
  assert.equal(proposalUpload.status,200,JSON.stringify(proposalUpload))

  proposal._document={id:proposalUpload.file.id,name:'proposal.pdf',size:proposalBytes.length,storagePath:proposalUpload.file.storagePath,contentType:'application/pdf'}
  const missingObject=await send('owner',{action:'save',project:buildProposal(p,proposal,actor('owner'),true,p.id),expectedVersion:p._version})
  assert.equal(missingObject.status,400);assert.match(missingObject.error,/ไม่พบไฟล์/);check()
  await uploadBytes(ref(clients.owner.storage,proposalUpload.file.storagePath),proposalBytes,{contentType:'application/pdf',customMetadata:{ticketId:proposalUpload.file.id}})
  const badMetadata=await send('owner',{action:'save',project:buildProposal(p,{...proposal,_document:{...proposal._document,size:proposalBytes.length+1}},actor('owner'),true,p.id),expectedVersion:p._version})
  assert.equal(badMetadata.status,400);assert.match(badMetadata.error,/ตั๋วอัปโหลด/);check()
  assert.equal((await getDoc(view('owner',p.id))).data()._version,p._version);check()
  const staffReceivesSubmission=new Promise((resolve,reject)=>{
    let stop;const timer=setTimeout(()=>{stop();reject(new Error('Staff submission realtime timeout'))},10000)
    stop=onSnapshot(collection(clients.staff.db,'workspaces/testing/projects'),snapshot=>{if(snapshot.docs.some(d=>d.id===p.id && d.data().status==='unit_review')){clearTimeout(timer);stop();resolve()}},reject)
  })
  await save('owner',buildProposal(p,proposal,actor('owner'),true,p.id))
  await staffReceivesSubmission;check()
  assert.equal((await getDoc(view('staff',p.id))).data().workspace,'testing');check()
  assert.equal((await getDoc(doc(clients.staff.db,'projectDocuments/testing~'+proposalUpload.file.id))).data().storagePath,proposalUpload.file.storagePath);check()
  assert.equal((await getBytes(ref(clients.staff.storage,proposalUpload.file.storagePath))).byteLength,proposalBytes.length);check()
  const record={date:'2026-10-27',responsible:'Staff',notes:'External outcome',letterNumber:'EXT/1',unitOutcome:'endorsed'}
  await save('staff',recordAdministrativeResult(p,record,actor('staff'),'unit_review'))
  await save('staff',recordAdministrativeResult(p,record,actor('staff'),'eoffice_pending'))
  await save('staff',{...p,status:'revision_required',statusHistory:[...p.statusHistory,{action:'proposal_check',note:'Clarify methodology'}]})
  await save('owner',buildProposal(p,{...proposal,methodology:'Revised survey'},actor('owner'),true,p.id))
  await save('staff',{...p,status:'committee_review',statusHistory:[...p.statusHistory,{action:'proposal_check',note:'Complete'}]})
  await save('staff',recordAdministrativeResult(p,{...record,certification:'complete',outcome:'endorsed',meetingDate:'2026-10-27',meetingNumber:'1'},actor('staff'),'committee_review'))
  // Receive the real client notification on a second role after a server write.
  const realtime=new Promise((resolve,reject)=>{let stop;const timer=setTimeout(()=>{stop();reject(new Error('Realtime timeout'))},10000);stop=onSnapshot(view('owner',p.id),snapshot=>{if(snapshot.data()?.proceedNotice){clearTimeout(timer);stop();resolve()}},reject)})
  await save('staff',recordAdministrativeResult(p,record,actor('staff'),'active'));await realtime;check()
  const bytes=Buffer.from(demoDocument.dataUrl.split(',')[1],'base64')
  const upload=await send('owner',{action:'prepareUpload',projectId:p.id,name:'report.pdf',size:bytes.length})
  assert.equal(upload.status,200,JSON.stringify(upload))
  await assert.rejects(uploadBytes(ref(clients.outsider.storage,upload.file.storagePath),bytes,{contentType:'application/pdf'}));check()
  await uploadBytes(ref(clients.owner.storage,upload.file.storagePath),bytes,{contentType:'application/pdf',customMetadata:{ticketId:upload.file.id}});check()
  await assert.rejects(uploadBytes(ref(clients.owner.storage,upload.file.storagePath),bytes,{contentType:'application/pdf'}));check()
  const file={id:upload.file.id,name:'report.pdf',size:bytes.length,storagePath:upload.file.storagePath,contentType:'application/pdf',kind:'report'}
  const report={method:'report',summary:'Fictional findings',finishedDate:'2026-10-27',documents:[file]}
  await save('owner',transition(p,'submit',report,actor('owner')))
  const assigned=transition(p,'check',{outcome:'complete',checked:true,reviewers:['expert','second','third']},actor('staff'))
  const bad=structuredClone(assigned);bad.closure.check.reviewers=['outsider']
  assert.equal((await send('staff',{action:'save',project:bad,expectedVersion:p._version})).status,400);check()
  await save('staff',assigned)
  assert.equal((await getDoc(view('expert',p.id))).data().reviewerUids.length,3);check()
  assert.equal((await getDocs(query(collection(clients.expert.db,'workspaces/testing/users/expert/projects'),where('viewerRole','==','reviewer')))).size,1);check()
  await assert.rejects(getBytes(ref(clients.outsider.storage,file.storagePath)));check()
  assert.equal((await getBytes(ref(clients.expert.storage,file.storagePath))).byteLength,bytes.length);check()
  const evaluation={objectives:0,consistency:0,abstract:0,executive:0,result:1,chapters:'Private feedback',utilization:{2:''}}
  await save('expert',transition(p,'review_draft',evaluation,actor('expert')))
  assert.deepEqual((await getDoc(view('owner',p.id))).data().closure.evaluations,{});check()
  assert.deepEqual((await getDoc(view('second',p.id))).data().closure.evaluations,{});check()
  for(const uid of ['expert','second','third']) {
    // Each reviewer loads their own projection, as the UI does.
    p=(await getDoc(view(uid,p.id))).data()
    await save(uid,transition(p,'review',evaluation,actor(uid)))
  }
  p=(await getDoc(view('staff',p.id))).data()
  assert.equal(p.closure.state,'staff_decision');check()
  await save('staff',transition(p,'release_feedback',{outcome:'revision',notes:'Revise the chapter'},actor('staff')))
  assert.equal(Object.keys((await getDoc(view('owner',p.id))).data().closure.evaluations).length,3);check()
  await save('owner',transition(p,'submit',report,actor('owner')))
  await save('staff',transition(p,'final_check',{outcome:'complete',checked:true,notes:'Verified'},actor('staff')))
  await save('staff',transition(p,'complete',{},actor('staff')))
  assert.equal((await getDoc(view('owner',p.id))).data().status,'completed');check()
  assert.equal((await getDoc(doc(clients.owner.db,'projects/testing~secure-project'))).data().status,'completed');check()
  await assert.rejects(updateDoc(doc(clients.owner.db,'projects/testing~secure-project'),{status:'active'}));check()
  await assert.rejects(getDocs(collection(clients.owner.db,'activityLogs')));check()
  const notices=await getDocs(collection(clients.owner.db,'workspaces/testing/users/owner/notifications'))
  assert.ok(notices.size>0);await updateDoc(notices.docs[0].ref,{readAt:serverTimestamp()});check()
  await assert.rejects(updateDoc(notices.docs[0].ref,{action:'forged'}));check()
  await signOut(clients.owner.auth);await signInWithEmailAndPassword(clients.owner.auth,'owner@example.test',password)
  assert.equal((await getDoc(view('owner',p.id))).data().status,'completed');check()
  await adminDb.doc('users/expert').update({active:false})
  await assert.rejects(getDoc(view('expert',p.id)));check()
  await assert.rejects(getBytes(ref(clients.expert.storage,file.storagePath)));check()
  console.log(`PASS: ${checks} authenticated emulator checks: full workflow, private views, real Auth tokens, role/assignment rejection, immutable Storage, realtime, notifications, revocation and fresh sign-in persistence.`)
} finally {
  await Promise.all(Object.values(clients).map(c=>deleteApp(c.app)))
  await require('firebase-admin/app').deleteApp(adminApp)
}
