// Read-only application verification. Normal sign-in updates Auth last-sign-in metadata.
// No account creation, password updates, profile writes, or project writes.
import { readFileSync } from 'node:fs'
import { initializeApp as initializeAdmin, applicationDefault, deleteApp as deleteAdmin } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, setPersistence, inMemoryPersistence, signOut } from 'firebase/auth'
const projectId='mfu-researchgrantmanagement'
const accounts=[
  {uid:'test-researcher',email:'researcher@example.test',role:'researcher',env:'MFU_RESEARCHER_PASSWORD'},
  {uid:'test-staff',email:'staff@example.test',role:'staff',env:'MFU_STAFF_PASSWORD'},
  {uid:'test-reviewer',email:'reviewer@example.test',role:'reviewer',env:'MFU_REVIEWER_PASSWORD'},
]
let admin,client
try {
  if(process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST)throw new Error('Emulator settings must be unset for this read-only live check')
  for(const account of accounts)if(!process.env[account.env])throw new Error('Required password environment variable is missing')
  const config=Object.fromEntries(readFileSync(new URL('../../.env.example',import.meta.url),'utf8').split(/\r?\n/).map(line=>line.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map(([,key,value])=>[key,value.trim()]))
  const apiKey=process.env.MFU_FIREBASE_API_KEY || config.VITE_FIREBASE_API_KEY
  if(!apiKey)throw new Error('Firebase web API key is missing')
  admin=initializeAdmin({projectId,credential:applicationDefault()},'existing-login-verification')
  const adminAuth=getAdminAuth(admin),db=getAdminFirestore(admin)
  client=initializeApp({projectId,apiKey,authDomain:projectId+'.firebaseapp.com'},'existing-login-verification')
  const auth=getAuth(client)
  await setPersistence(auth,inMemoryPersistence)
  for(const account of accounts){
    const beforeAuth=await adminAuth.getUser(account.uid)
    const before=await db.doc('users/'+account.uid).get()
    const profile=before.data()
    if(beforeAuth.email!==account.email || beforeAuth.disabled || profile?.role!==account.role || profile?.workspace!=='testing' || profile?.active!==true)throw new Error('Existing account/profile does not match expected identity')
    const signedIn=await signInWithEmailAndPassword(auth,account.email,process.env[account.env])
    if(signedIn.user.uid!==account.uid)throw new Error('Signed-in UID differs')
    const afterAuth=await adminAuth.getUser(account.uid),after=await db.doc('users/'+account.uid).get()
    if(afterAuth.email!==beforeAuth.email || JSON.stringify(afterAuth.customClaims || {})!==JSON.stringify(beforeAuth.customClaims || {}) || !after.updateTime.isEqual(before.updateTime))throw new Error('Identity, permissions or profile changed during verification')
    console.log(`PASS: ${account.uid}; Email/Password sign-in; role=${account.role}; workspace=testing; profile and claims unchanged.`)
    await signOut(auth)
  }
  console.log('PASS: 3/3 existing accounts authenticated. No users created, account settings changed, or Firestore writes performed.')
} catch(error){
  const code=typeof error.code==='string' && /^[a-zA-Z0-9_/-]+$/.test(error.code)?error.code:'verification-failed'
  console.error(`Existing login verification failed (${code}). No password or token details are logged.`)
  process.exitCode=1
} finally {
  for(const account of accounts)delete process.env[account.env]
  if(client)await deleteApp(client)
  if(admin)await deleteAdmin(admin)
}
