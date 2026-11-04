import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
const env=await initializeTestEnvironment({projectId:'demo-mfu-secure',firestore:{host:'127.0.0.1',port:8080,rules:readFileSync(new URL('../firestore.rules',import.meta.url),'utf8')}})
let checks=0
const succeeds=async p=>{await assertSucceeds(p);checks++}
const fails=async p=>{await assertFails(p);checks++}
try {
  await env.withSecurityRulesDisabled(async c=>{
    const db=c.firestore()
    for(const [uid,role] of Object.entries({owner:'researcher',outsider:'researcher',staff:'staff',expert:'reviewer'})) await setDoc(doc(db,'users/'+uid),{role,active:true,workspace:'testing'})
    await setDoc(doc(db,'workspaces/testing/projects/rules-project'),{ownerUid:'owner',reviewerUids:['expert']})
    for(const [uid,role] of Object.entries({owner:'researcher',staff:'staff',expert:'reviewer'})) await setDoc(doc(db,`workspaces/testing/users/${uid}/projects/rules-project`),{viewerRole:role})
    await setDoc(doc(db,'projects/testing~rules-project'),{workspace:'testing',researcherId:'owner'})
    await setDoc(doc(db,'reviews/rules-review'),{workspace:'testing',projectId:'rules-project',reviewerId:'expert',released:false})
    await setDoc(doc(db,'registrationRequests/owner'),{uid:'owner',status:'pending'})
    await setDoc(doc(db,'workspaces/testing/users/owner/notifications/event'),{projectId:'rules-project',isRead:false,readAt:null})
  })
  const owner=env.authenticatedContext('owner').firestore(),staff=env.authenticatedContext('staff').firestore(),expert=env.authenticatedContext('expert').firestore(),outsider=env.authenticatedContext('outsider').firestore(),anon=env.unauthenticatedContext().firestore()
  await fails(getDoc(doc(anon,'users/owner')))
  await fails(setDoc(doc(anon,'registrationRequests/anonymous'),{status:'pending'}))
  await fails(setDoc(doc(owner,'registrationRequests/new-request'),{uid:'owner',status:'pending'}))
  await fails(getDoc(doc(owner,'registrationRequests/owner')))
  await fails(updateDoc(doc(owner,'registrationRequests/owner'),{status:'approved'}))
  await fails(deleteDoc(doc(owner,'registrationRequests/owner')))
  await fails(setDoc(doc(owner,'users/new-profile'),{role:'staff',active:true,workspace:'testing'}))
  await fails(updateDoc(doc(owner,'users/owner'),{role:'staff'}))
  await succeeds(getDoc(doc(owner,'projects/testing~rules-project')))
  await fails(getDoc(doc(outsider,'projects/testing~rules-project')))
  await fails(updateDoc(doc(owner,'projects/testing~rules-project'),{status:'completed'}))
  await succeeds(getDoc(doc(expert,'workspaces/testing/users/expert/projects/rules-project')))
  await fails(getDoc(doc(expert,'workspaces/testing/users/owner/projects/rules-project')))
  await fails(getDoc(doc(owner,'workspaces/testing/projects/rules-project')))
  await succeeds(getDoc(doc(staff,'workspaces/testing/projects/rules-project')))
  await succeeds(getDoc(doc(expert,'reviews/rules-review')))
  await fails(getDoc(doc(owner,'reviews/rules-review')))
  await fails(setDoc(doc(expert,'reviews/forged'),{reviewerId:'expert'}))
  await fails(setDoc(doc(owner,'activityLogs/forged'),{actorId:'owner'}))
  await fails(deleteDoc(doc(staff,'activityLogs/event')))
  await fails(setDoc(doc(owner,'workspaces/testing/users/owner/notifications/forged'),{title:'fake'}))
  await succeeds(updateDoc(doc(owner,'workspaces/testing/users/owner/notifications/event'),{readAt:serverTimestamp(),isRead:true}))
  await fails(updateDoc(doc(owner,'workspaces/testing/users/owner/notifications/event'),{projectId:'other',readAt:serverTimestamp()}))
  await env.withSecurityRulesDisabled(async c=>{await updateDoc(doc(c.firestore(),'reviews/rules-review'),{released:true});await updateDoc(doc(c.firestore(),'users/expert'),{active:false})})
  await succeeds(getDoc(doc(owner,'reviews/rules-review')))
  await fails(getDoc(doc(expert,'reviews/rules-review')))
  console.log(`PASS: ${checks} Firestore emulator access-control checks`)
} finally { await env.cleanup() }
