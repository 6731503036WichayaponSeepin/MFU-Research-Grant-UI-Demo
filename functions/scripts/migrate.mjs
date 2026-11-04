// Explicit import of a reviewed export. Defaults to a no-write dry run.
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { validId, projectView, rejectInlineFiles, collectFiles } from '../securePolicy.js'
const args=process.argv.slice(2), value=key=>args[args.indexOf(key)+1]
for(const flag of ['--project','--workspace','--file','--mapping'])if(!args.includes(flag))throw new Error('Required: --project PROJECT --workspace WORKSPACE --file export.json --mapping mapping.json [--apply --confirm-project PROJECT]')
const projectId=value('--project'),workspace=value('--workspace'),apply=args.includes('--apply')
if(!validId(workspace) || apply && value('--confirm-project')!==projectId)throw new Error('Invalid workspace or missing target confirmation')
if(process.env.FIRESTORE_EMULATOR_HOST && !projectId.startsWith('demo-'))throw new Error('Use demo-* project ID with emulators')
const records=JSON.parse(readFileSync(value('--file'),'utf8')),mapping=JSON.parse(readFileSync(value('--mapping'),'utf8'))
if(!Array.isArray(records))throw new Error('Export must be a project array')
const plans=records.map(p=>{
  if(!validId(p.id) || !p.status || !Array.isArray(p.statusHistory))throw new Error('Invalid project shape')
  rejectInlineFiles(p)
  if(collectFiles(p).length)throw new Error('Storage attachments require a reviewed ticket/object migration; use the signed-in upload path first. Nothing is imported.')
  if(p.closure)throw new Error('Closure/evaluation history requires a reviewed identity and privacy migration. This importer accepts proposal/active records without closure only.')
  const ownerUid=mapping.owners?.[p.ownerUsername]
  if(!validId(ownerUid))throw new Error('Missing owner mapping for '+p.id)
  return {...p,ownerUid,ownerUsername:ownerUid,workspace,reviewerUids:[],_version:1,migration:{sourceId:p.id,importedAt:new Date().toISOString()}}
})
console.log(JSON.stringify({projectId,workspace,mode:apply?'APPLY':'DRY RUN',count:plans.length,ids:plans.map(p=>p.id)}))
if(!apply)process.exit(0)
initializeApp({projectId});const db=getFirestore()
const people=await db.collection('users').where('workspace','==',workspace).get()
const users=people.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.active)
for(const p of plans)if(!users.some(u=>u.uid===p.ownerUid&&u.role==='researcher'))throw new Error('Owner not provisioned in target workspace: '+p.id)
// Each import is atomic and create-only; retries skip existing IDs, never overwrite.
for(const p of plans)await db.runTransaction(async tx=>{
  const ref=db.doc('workspaces/'+workspace+'/projects/'+p.id)
  if((await tx.get(ref)).exists)return
  tx.create(ref,p)
  for(const user of users.filter(u=>u.role==='staff'||u.uid===p.ownerUid))tx.set(db.doc('workspaces/'+workspace+'/users/'+user.uid+'/projects/'+p.id),projectView(p,user))
})
console.log('Import finished; existing source and destination records unchanged.')
