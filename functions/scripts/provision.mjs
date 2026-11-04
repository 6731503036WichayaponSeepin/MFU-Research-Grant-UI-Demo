// Operator-only. Uses Application Default Credentials, never frontend credentials.
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { validId, projectView } from '../securePolicy.js'
import { createDemoProjects } from '../domain/src/data/demoProjects.js'
const args=process.argv.slice(2), value=key=>args[args.indexOf(key)+1]
const projectId=value('--project'), input=value('--file'), apply=args.includes('--apply')
if(!args.includes('--project') || !args.includes('--file'))throw new Error('Usage: node functions/scripts/provision.mjs --project PROJECT --file accounts.json [--apply --confirm-project PROJECT] [--seed-demo]')
if(apply && value('--confirm-project')!==projectId)throw new Error('Explicit --confirm-project must match target')
if(process.env.FIRESTORE_EMULATOR_HOST && !projectId.startsWith('demo-'))throw new Error('Use a demo-* project ID with emulators')
const accounts=JSON.parse(readFileSync(input,'utf8'))
if(!Array.isArray(accounts) || !accounts.length)throw new Error('Account list required')
for(const a of accounts)if(!validId(a.uid) || !validId(a.workspace) || !['researcher','staff','reviewer'].includes(a.role) || !a.email?.includes('@') || !a.displayName)throw new Error('Invalid account entry')
console.log(JSON.stringify({projectId,mode:apply?'APPLY':'DRY RUN',accounts:accounts.map(({uid,role,workspace})=>({uid,role,workspace})),seedDemo:args.includes('--seed-demo')}))
if(!apply)process.exit(0)
initializeApp({projectId})
const db=getFirestore(),auth=getAuth()
for(const account of accounts) {
  const existing=(await db.doc('users/'+account.uid).get()).data()
  if(existing && (existing.workspace!==account.workspace || existing.role!==account.role))throw new Error('Existing account permissions differ; no role migration performed: '+account.uid)
  try {const u=await auth.getUser(account.uid);if(u.email!==account.email)throw new Error('Existing Auth email differs: '+account.uid)}
  catch(e) {
    if(e.code!=='auth/user-not-found')throw e
    await auth.createUser({uid:account.uid,email:account.email,displayName:account.displayName,
      ...(account.passwordEnv && process.env[account.passwordEnv] ? {password:process.env[account.passwordEnv]} : {})})
  }
  if(!existing)await db.doc('users/'+account.uid).create({uid:account.uid,email:account.email,affiliation:account.affiliation || '',role:account.role,workspace:account.workspace,displayName:account.displayName,active:true,createdAt:new Date().toISOString()})
}
if(args.includes('--seed-demo')) {
  const users=accounts.filter(a=>a.workspace==='demo'),owner=users.find(a=>a.role==='researcher')
  if(!owner)throw new Error('Demo researcher required; no production seed is supported')
  const source=createDemoProjects()[0]
  const p={...source,id:'MFU-FIREBASE-DEMO-001',ownerUid:owner.uid,ownerUsername:owner.uid,workspace:'demo',reviewerUids:[],fictional:true,_version:1}
  const ref=db.doc('workspaces/demo/projects/'+p.id)
  await db.runTransaction(async tx=>{
    if((await tx.get(ref)).exists)return
    tx.create(ref,p)
    for(const user of users.filter(a=>a.role==='staff'||a.uid===owner.uid))tx.set(db.doc('workspaces/demo/users/'+user.uid+'/projects/'+p.id),projectView(p,user))
  })
}
console.log('Provisioned. Existing projects and account permissions were preserved.')
