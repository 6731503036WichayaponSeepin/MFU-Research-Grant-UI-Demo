import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { initializeApp,deleteApp } from 'firebase/app'
import { getAuth,connectAuthEmulator,signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore,connectFirestoreEmulator,query,where,collection,getDocs } from 'firebase/firestore'
import { getStorage,connectStorageEmulator,ref,getBytes } from 'firebase/storage'
import { buildAdvisorBundle } from '../functions/demo/advisorBundle.mjs'
import { seedAdvisorBundle } from '../functions/demo/seedAdvisor.mjs'
import { demoActors,advisorEvaluation } from '../functions/demo/advisorSpecs.mjs'
import { transition } from '../src/utils/closure.js'
assert.ok(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST,'Isolated emulators required')
const projectId='demo-mfu-secure',password=randomUUID()+'!',require=createRequire(new URL('../functions/package.json',import.meta.url))
const admin=require('firebase-admin/app').initializeApp({projectId,storageBucket:projectId+'.appspot.com'})
const auth=require('firebase-admin/auth').getAuth(admin),db=require('firebase-admin/firestore').getFirestore(admin),bucket=require('firebase-admin/storage').getStorage(admin).bucket()
const bundle=buildAdvisorBundle('output/reviewer-example',{reviewerExample:true})
let app,checks=0
const check=()=>checks++
try {
  for(const actor of Object.values(demoActors)){await auth.createUser({uid:actor.uid,email:actor.email,password});await db.doc('users/'+actor.uid).set({...actor,active:true})}
  const before=await db.getAll(...Object.values(demoActors).map(a=>db.doc('users/'+a.uid)))
  const keep=db.doc('workspaces/testing/projects/EXISTING-KEEP');await keep.set({id:'EXISTING-KEEP',isDemo:false,title:'Existing user project'});const keepTime=(await keep.get()).updateTime
  const resources={bundle,projectId,auth,db,bucket,apply:true}
  const result=await seedAdvisorBundle(resources);assert.equal(result.created,1);assert.equal(result.projects,1);check()
  assert.equal((await db.collection('workspaces/testing/projects').get()).size,2);check()
  assert.ok((await keep.get()).updateTime.isEqual(keepTime));check()
  for(const snapshot of before){assert.ok((await snapshot.ref.get()).updateTime.isEqual(snapshot.updateTime));check()}
  assert.equal((await db.doc('workspaces/testing/projects/MFU-ADVISOR-V1-C02').get()).exists,false);check()
  const repeated=await seedAdvisorBundle(resources);assert.equal(repeated.created,0);assert.equal(repeated.skipped,1);check()
  app=initializeApp({projectId,apiKey:'demo-key',authDomain:'localhost',storageBucket:bucket.name})
  const clientAuth=getAuth(app);connectAuthEmulator(clientAuth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(clientAuth,'reviewer@example.test',password)
  const clientDb=getFirestore(app);connectFirestoreEmulator(clientDb,'127.0.0.1',8080)
  const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199)
  assert.equal((await getDocs(query(collection(clientDb,'workspaces/testing/users/test-reviewer/projects'),where('viewerRole','==','reviewer')))).size,1);check()
  for(const file of bundle.files){assert.equal((await getBytes(ref(storage,file.storagePath))).byteLength,file.size);check()}
  let p=(await db.doc('workspaces/testing/projects/MFU-ADVISOR-V1-C01').get()).data()
  async function save(action,data){const token=await clientAuth.currentUser.getIdToken();const response=await fetch(`http://127.0.0.1:5001/${projectId}/asia-southeast1/researchApi`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'save',project:transition(p,action,data,demoActors.reviewer),expectedVersion:p._version})});const body=await response.json();assert.equal(response.status,200,JSON.stringify(body));p=body.project;check()}
  await save('review_draft',{chapters:'ตัวอย่างบันทึกร่างจากผู้ประเมิน',utilization:{},documents:[]})
  assert.equal(p.closure.evaluations['test-reviewer'].submitted,false);check()
  await save('review',advisorEvaluation(1))
  assert.equal(p.closure.state,'staff_decision');assert.equal(p.status,'closure_review');check()
  assert.equal((await db.doc('workspaces/testing/users/test-staff/projects/'+p.id).get()).data().closure.evaluations['test-reviewer'].submitted,true);check()
  assert.deepEqual((await db.doc('workspaces/testing/users/test-researcher/projects/'+p.id).get()).data().closure.evaluations,{});check()
  assert.equal((await seedAdvisorBundle(resources)).skipped,1);check()
  assert.equal((await db.doc('workspaces/testing/projects/'+p.id).get()).data().closure.state,'staff_decision');check()
  console.log(`PASS: ${checks} single-project checks; exactly one reviewer example, two readable PDFs, draft and final evaluation, no automatic closure, idempotence and existing-data preservation.`)
} finally {if(app)await deleteApp(app);await require('firebase-admin/app').deleteApp(admin)}
