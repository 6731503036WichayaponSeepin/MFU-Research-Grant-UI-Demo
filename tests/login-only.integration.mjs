// Only isolated emulators. Fixtures are created by Admin, never by public sign-up.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, doc, getDoc, getDocs, collection, setDoc, updateDoc } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, ref, uploadBytes } from 'firebase/storage'
import { demoDocument } from '../src/data/demoAttachment.js'
import { buildProposal } from '../src/utils/projectStorage.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST,'Auth and Firestore emulators required')
const projectId='demo-mfu-secure',password=randomUUID()+'!',workspace='testing'
const require=createRequire(new URL('../functions/package.json',import.meta.url))
const adminApp=require('firebase-admin/app').initializeApp({projectId})
const adminAuth=require('firebase-admin/auth').getAuth(adminApp),adminDb=require('firebase-admin/firestore').getFirestore(adminApp)
const profiles={ 'test-researcher':{role:'researcher',email:'researcher@example.test'},'test-staff':{role:'staff',email:'staff@example.test'},'test-reviewer':{role:'reviewer',email:'reviewer@example.test'},unprovisioned:{email:'unprovisioned@example.test'} }
const clients={};let checks=0
const check=()=>checks++
const send=async(uid,body)=>{
  const token=uid ? await clients[uid].auth.currentUser.getIdToken() : null
  const response=await fetch(`http://127.0.0.1:5001/${projectId}/asia-southeast1/researchApi`,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)})
  return {...await response.json(),httpStatus:response.status}
}
const actor=uid=>({uid,username:uid,workspace,role:profiles[uid].role})
try {
  for(const [uid,profile] of Object.entries(profiles)){
    await adminAuth.createUser({uid,email:profile.email,password})
    if(profile.role)await adminDb.doc('users/'+uid).set({uid,email:profile.email,role:profile.role,workspace,active:true,displayName:uid})
    const app=initializeApp({projectId,apiKey:'demo-key',authDomain:'localhost',storageBucket:'demo-mfu-secure.appspot.com'},uid)
    const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})
    const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080)
    await signInWithEmailAndPassword(auth,profile.email,password)
    assert.equal(auth.currentUser.uid,uid);check()
    const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199)
    clients[uid]={app,auth,db,storage}
  }
  const legacy=adminDb.doc('registrationRequests/test-researcher')
  await legacy.set({uid:'test-researcher',status:'pending',requestedRole:'staff'})
  const beforeLegacy=await legacy.get()
  const request={action:'register',displayName:'Forbidden',affiliation:'MFU',requestedRole:'staff',role:'staff',workspace}
  assert.equal((await send(null,request)).httpStatus,401);check()
  assert.equal((await send('unprovisioned',request)).httpStatus,403);check()
  for(const uid of ['test-researcher','test-staff','test-reviewer']){
    const client=clients[uid],before=await adminDb.doc('users/'+uid).get()
    assert.equal((await send(uid,request)).httpStatus,400);check()
    const profile=(await getDoc(doc(client.db,'users/'+uid))).data()
    assert.equal(profile.role,profiles[uid].role);assert.equal(profile.workspace,workspace);check()
    await assert.rejects(setDoc(doc(client.db,'registrationRequests/'+uid),{status:'pending'}));check()
    await assert.rejects(setDoc(doc(client.db,'users/new-user'),{role:'staff',workspace,active:true}));check()
    await assert.rejects(updateDoc(doc(client.db,'users/'+uid),{role:'staff'}));check()
    await assert.rejects(getDocs(collection(client.db,'registrationRequests')));check()
    assert.ok((await adminDb.doc('users/'+uid).get()).updateTime.isEqual(before.updateTime));check()
  }
  assert.ok((await legacy.get()).updateTime.isEqual(beforeLegacy.updateTime));check()
  assert.equal((await adminDb.doc('registrationRequests/unprovisioned').get()).exists,false);check()
  assert.equal((await adminDb.doc('users/unprovisioned').get()).exists,false);check()
  await assert.rejects(getDoc(doc(clients.unprovisioned.db,'users/test-staff')));check()
  const proposal={projectTitle:'Login-only regression',leaderName:'Test researcher',objectives:'Study',methodology:'Survey',startDate:'2026-01-01',endDate:'2027-01-01',compensation:1000}
  let p
  async function save(uid,candidate){const result=await send(uid,{action:'save',project:candidate,expectedVersion:p?._version || 0});assert.equal(result.httpStatus,200,JSON.stringify(result));p=result.project;check()}
  await save('test-researcher',buildProposal(null,proposal,actor('test-researcher'),false,'login-only-project'))
  assert.equal(p.status,'draft');check()
  const bytes=Buffer.from(demoDocument.dataUrl.split(',')[1],'base64')
  const upload=await send('test-researcher',{action:'prepareUpload',projectId:p.id,name:'proposal.pdf',size:bytes.length})
  assert.equal(upload.httpStatus,200,JSON.stringify(upload))
  await uploadBytes(ref(clients['test-researcher'].storage,upload.file.storagePath),bytes,{contentType:'application/pdf',customMetadata:{ticketId:upload.file.id}})
  proposal._document={id:upload.file.id,name:'proposal.pdf',size:bytes.length,storagePath:upload.file.storagePath,contentType:'application/pdf'}
  await save('test-researcher',buildProposal(p,proposal,actor('test-researcher'),true,p.id))
  assert.equal((await getDoc(doc(clients['test-staff'].db,`workspaces/testing/projects/${p.id}`))).data().status,'unit_review');check()
  const record={date:'2026-10-29',responsible:'Staff',unitOutcome:'endorsed',notes:'External record',letterNumber:'TEST/1'}
  await save('test-staff',recordAdministrativeResult(p,record,actor('test-staff'),'unit_review'))
  await save('test-staff',recordAdministrativeResult(p,record,actor('test-staff'),'eoffice_pending'))
  await save('test-staff',{...p,status:'revision_required',statusHistory:[...p.statusHistory,{action:'proposal_check',note:'Clarify methodology'}]})
  await save('test-researcher',buildProposal(p,{...proposal,methodology:'Revised survey'},actor('test-researcher'),true,p.id))
  assert.equal(p.status,'admin_review');check()
  await assert.rejects(getDoc(doc(clients['test-reviewer'].db,`workspaces/testing/projects/${p.id}`)));check()
  assert.equal((await send('test-reviewer',{action:'save',project:p,expectedVersion:p._version})).httpStatus,403);check()
  await signOut(clients['test-researcher'].auth)
  await signInWithEmailAndPassword(clients['test-researcher'].auth,profiles['test-researcher'].email,password)
  assert.equal((await getDoc(doc(clients['test-researcher'].db,`workspaces/testing/users/test-researcher/projects/${p.id}`))).data().status,'admin_review');check()
  console.log(`PASS: ${checks} login-only emulator checks: existing-account login, three protected roles, removed API, denied signup writes, retained legacy records, proposal submission, corrections and fresh sign-in persistence.`)
} finally {
  await Promise.all(Object.values(clients).map(client=>deleteApp(client.app)))
  await require('firebase-admin/app').deleteApp(adminApp)
}
