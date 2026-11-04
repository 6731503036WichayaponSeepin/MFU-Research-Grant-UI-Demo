// Isolated Emulator Suite only. Never seed or modify a live Firebase project here.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { initializeApp,deleteApp } from 'firebase/app'
import { getAuth,connectAuthEmulator,signInWithEmailAndPassword,signOut } from 'firebase/auth'
import { getFirestore,connectFirestoreEmulator,doc,getDoc,getDocs,collection,onSnapshot,query,where } from 'firebase/firestore'
import { getStorage,connectStorageEmulator,ref,getBytes,uploadBytes } from 'firebase/storage'
import { buildAdvisorBundle } from '../functions/demo/advisorBundle.mjs'
import { seedAdvisorBundle } from '../functions/demo/seedAdvisor.mjs'
import { demoActors,advisorEvaluation } from '../functions/demo/advisorSpecs.mjs'
import { transition } from '../src/utils/closure.js'
assert.ok(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST,'All three emulators required')
const projectId='demo-mfu-secure',password=randomUUID()+'!'
const require=createRequire(new URL('../functions/package.json',import.meta.url))
const adminApp=require('firebase-admin/app').initializeApp({projectId,storageBucket:projectId+'.appspot.com'})
const db=require('firebase-admin/firestore').getFirestore(adminApp),auth=require('firebase-admin/auth').getAuth(adminApp),bucket=require('firebase-admin/storage').getStorage(adminApp).bucket()
const bundle=buildAdvisorBundle(),clients={},profileTimes={};let checks=0
const check=()=>checks++
const send=async(role,body)=>{const token=await clients[role].auth.currentUser.getIdToken();const response=await fetch(`http://127.0.0.1:5001/${projectId}/asia-southeast1/researchApi`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});return {...await response.json(),httpStatus:response.status}}
const view=(role,id)=>doc(clients[role].db,`workspaces/testing/users/${demoActors[role].uid}/projects/${id}`)
async function save(role,p,action,data){const result=await send(role,{action:'save',project:transition(p,action,data,demoActors[role]),expectedVersion:p._version});assert.equal(result.httpStatus,200,JSON.stringify(result));check();return result.project}
try {
  for(const [role,actor] of Object.entries(demoActors)){
    await auth.createUser({uid:actor.uid,email:actor.email,password})
    await db.doc('users/'+actor.uid).set({...actor,active:true,displayName:'บัญชีทดสอบ '+role})
    profileTimes[role]=(await db.doc('users/'+actor.uid).get()).updateTime
    const app=initializeApp({projectId,apiKey:'demo-key',authDomain:'localhost',storageBucket:bucket.name},role)
    const clientAuth=getAuth(app);connectAuthEmulator(clientAuth,'http://127.0.0.1:9099',{disableWarnings:true})
    await signInWithEmailAndPassword(clientAuth,actor.email,password)
    const store=getFirestore(app);connectFirestoreEmulator(store,'127.0.0.1',8080)
    const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199)
    clients[role]={app,auth:clientAuth,db:store,storage}
  }
  const resources={bundle,projectId,db,auth,bucket,apply:true}
  const collision=db.doc('workspaces/testing/projects/'+bundle.projects[0].id)
  await collision.set({id:bundle.projects[0].id,isDemo:false,title:'Existing protected project'})
  await assert.rejects(seedAdvisorBundle(resources),/collision/);check()
  assert.equal((await collision.get()).data().title,'Existing protected project');check()
  assert.equal((await db.doc('workspaces/testing/projects/'+bundle.projects[1].id).get()).exists,false);check()
  await collision.delete() // Emulator-only collision fixture cleanup, never in the seed script.
  const object=bucket.file(bundle.files[0].storagePath)
  await object.save(Buffer.from('protected-existing-object'),{resumable:false,metadata:{contentType:'application/pdf'}})
  await assert.rejects(seedAdvisorBundle(resources),/collision/);check()
  assert.equal((await object.download())[0].toString(),'protected-existing-object');check()
  await object.delete() // Emulator-only fixture cleanup.
  const keep=db.doc('workspaces/testing/projects/USER-KEEP');await keep.set({id:'USER-KEEP',title:'Preserve user content',workspace:'testing',ownerUid:'test-researcher',reviewerUids:[]})
  const keepTime=(await keep.get()).updateTime
  const seeded=await seedAdvisorBundle(resources);assert.equal(seeded.created,15);check()
  const timestamps=await db.getAll(...bundle.projects.map(p=>db.doc('workspaces/testing/projects/'+p.id)))
  const again=await seedAdvisorBundle(resources);assert.equal(again.created,0);assert.equal(again.skipped,15);check()
  for(let i=0;i<timestamps.length;i++)assert.ok((await timestamps[i].ref.get()).updateTime.isEqual(timestamps[i].updateTime));check()
  assert.ok((await keep.get()).updateTime.isEqual(keepTime));check()
  for(const [role,actor] of Object.entries(demoActors)){assert.ok((await db.doc('users/'+actor.uid).get()).updateTime.isEqual(profileTimes[role]));assert.equal((await auth.getUser(actor.uid)).email,actor.email);check()}
  assert.equal((await getDocs(query(collection(clients.researcher.db,'workspaces/testing/users/test-researcher/projects'),where('viewerRole','==','researcher')))).size,15);check()
  assert.equal((await getDocs(query(collection(clients.reviewer.db,'workspaces/testing/users/test-reviewer/projects'),where('viewerRole','==','reviewer')))).size,5);check()
  assert.equal((await getDocs(collection(clients.staff.db,'workspaces/testing/projects'))).size,16);check()
  for(const p of bundle.projects){const role=p.demoGroup==='reviewer'?'reviewer':'researcher';assert.equal((await getDoc(view(role,p.id))).data().id,p.id);check()}
  for(const file of bundle.files){const role=file.purpose==='feedback'?'reviewer':'researcher';assert.equal((await getBytes(ref(clients[role].storage,file.storagePath))).byteLength,file.size);check()}
  for(const code of ['C03','C05']){const p=bundle.projects.find(p=>p.demoCode===code);const visible=(await getDoc(view('researcher',p.id))).data();assert.deepEqual(visible.closure.evaluations,{});assert.equal(visible.demoScenarioLabel,undefined);const file=bundle.files.find(f=>f.projectId===p.id && f.purpose==='feedback');await assert.rejects(getBytes(ref(clients.researcher.storage,file.storagePath)));check()}
  const released=bundle.projects.find(p=>p.demoCode==='C04');assert.equal((await getDoc(view('researcher',released.id))).data().closure.evaluations['test-reviewer'].result,1);check()
  const feedback=bundle.files.find(f=>f.projectId===released.id && f.purpose==='feedback');assert.equal((await getBytes(ref(clients.researcher.storage,feedback.storagePath))).byteLength,feedback.size);check()
  const a01=bundle.projects[0];await assert.rejects(getDoc(view('reviewer',a01.id)));await assert.rejects(getBytes(ref(clients.reviewer.storage,a01.proposal._document.storagePath)));check()
  for(const p of bundle.projects.filter(p=>p.demoGroup==='reviewer'))assert.notEqual((await db.doc('workspaces/testing/projects/'+p.id).get()).data().status,'completed');check()
  if(process.env.RUN_ADVISOR_BROWSER==='true'){
    process.env.MFU_ADVISOR_TEST_PASSWORD=password
    const {verifyAdvisorBrowser}=await import('./advisor.browser.mjs')
    await verifyAdvisorBrowser(bundle)
    delete process.env.MFU_ADVISOR_TEST_PASSWORD
  }
  const pending=bundle.projects.find(p=>p.demoCode==='C01');let p=(await getDoc(view('reviewer',pending.id))).data()
  p=await save('reviewer',p,'review_draft',{chapters:'ร่างข้อเสนอแนะที่บันทึกจริงใน Emulator',utilization:{},documents:[]})
  await signOut(clients.reviewer.auth);await signInWithEmailAndPassword(clients.reviewer.auth,demoActors.reviewer.email,password)
  p=(await getDoc(view('reviewer',p.id))).data();assert.match(p.closure.evaluations['test-reviewer'].chapters,/บันทึกจริง/);check()
  assert.deepEqual((await getDoc(view('researcher',p.id))).data().closure.evaluations,{});check()
  p=await save('reviewer',p,'review',{...advisorEvaluation(1),additionalComments:'เพิ่มเติมจากการทดสอบการบันทึกจริง'})
  assert.equal(p.status,'closure_review');assert.equal(p.closure.state,'staff_decision');check()
  p=(await getDoc(view('staff',p.id))).data();assert.equal(p.closure.evaluations['test-reviewer'].additionalComments,'เพิ่มเติมจากการทดสอบการบันทึกจริง');check()
  const update=new Promise((resolve,reject)=>{let stop;const timer=setTimeout(()=>{stop();reject(new Error('Feedback realtime timeout'))},10000);stop=onSnapshot(view('researcher',p.id),snap=>{if(snap.data()?.closure?.feedbackReleasedAt){clearTimeout(timer);stop();resolve()}},reject)})
  p=await save('staff',p,'release_feedback',{outcome:'revision',notes:'เพิ่มรายละเอียดการตรวจสอบข้อมูลและส่งฉบับแก้ไข'});await update;check()
  const file=bundle.files.find(f=>f.projectId===p.id && f.kind==='report'),bytes=(await bucket.file(file.storagePath).download())[0]
  const ticket=await send('researcher',{action:'prepareUpload',projectId:p.id,name:'revised-final.pdf',size:bytes.length});assert.equal(ticket.httpStatus,200);check()
  await uploadBytes(ref(clients.researcher.storage,ticket.file.storagePath),bytes,{contentType:'application/pdf',customMetadata:{ticketId:ticket.file.id}})
  p=(await getDoc(view('researcher',p.id))).data()
  p=await save('researcher',p,'submit',{method:'report',summary:'ฉบับแก้ไขตามผลประเมินในระบบทดสอบ',finishedDate:'2026-10-29',documents:[{id:ticket.file.id,name:'revised-final.pdf',size:bytes.length,storagePath:ticket.file.storagePath,contentType:'application/pdf',kind:'report'}]})
  p=await save('staff',p,'final_check',{outcome:'complete',checked:true,notes:'ตรวจฉบับแก้ไขครบถ้วน'})
  assert.equal(p.status,'closure_review');check()
  p=await save('staff',p,'complete',{});assert.equal(p.status,'completed');check()
  const repeat=await seedAdvisorBundle(resources);assert.equal(repeat.skipped,15);assert.equal((await getDoc(view('researcher',p.id))).data().status,'completed');check()
  console.log(`PASS: ${checks} advisor demo checks: 15 shared projects, 28 accessible PDFs, safe/idempotent seed, collisions, unchanged users, private feedback, saved/reloaded reviews, revisions and explicit closure.`)
} finally {
  delete process.env.MFU_ADVISOR_TEST_PASSWORD
  await Promise.all(Object.values(clients).map(c=>deleteApp(c.app)))
  await require('firebase-admin/app').deleteApp(adminApp)
}
