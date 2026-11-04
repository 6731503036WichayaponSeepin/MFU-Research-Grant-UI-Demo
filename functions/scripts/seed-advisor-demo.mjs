// Preview is local-only. Live APPLY requires explicit project + seed confirmation.
import { initializeApp, applicationDefault, deleteApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { buildAdvisorBundle } from '../demo/advisorBundle.mjs'
import { seedAdvisorBundle } from '../demo/seedAdvisor.mjs'
import { ADVISOR_SEED } from '../demo/advisorSpecs.mjs'
const args=process.argv.slice(2),value=flag=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1]}
const options=new Set(['--project','--output','--bucket','--confirm-project','--confirm-seed'])
for(let i=0;i<args.length;i++){if(args[i]==='--apply' || args[i]==='--preview' || args[i]==='--reviewer-example')continue;if(!options.has(args[i]) || !args[i+1] || args[i+1].startsWith('--'))throw new Error('Unknown or incomplete option: '+args[i]);i++}
if(args.includes('--apply') && args.includes('--preview'))throw new Error('Choose preview or apply, not both')
const projectId=value('--project') || 'mfu-researchgrantmanagement',apply=args.includes('--apply')
if(apply && (value('--confirm-project')!==projectId || value('--confirm-seed')!==ADVISOR_SEED))throw new Error('APPLY requires --confirm-project PROJECT --confirm-seed '+ADVISOR_SEED)
const emulators=[process.env.FIRESTORE_EMULATOR_HOST,process.env.FIREBASE_AUTH_EMULATOR_HOST,process.env.FIREBASE_STORAGE_EMULATOR_HOST]
if(emulators.some(Boolean) && (!emulators.every(Boolean) || !projectId.startsWith('demo-')))throw new Error('All three emulators and a demo-* project are required together')
const reviewerExample=args.includes('--reviewer-example')
const bundle=buildAdvisorBundle(value('--output') || (reviewerExample?'output/reviewer-example':'output/advisor-demo'),{reviewerExample})
let app
try {
  const resources=apply?(()=>{app=initializeApp({projectId,credential:applicationDefault(),storageBucket:value('--bucket') || projectId+(projectId.startsWith('demo-')?'.appspot.com':'.firebasestorage.app')});return {auth:getAuth(app),db:getFirestore(app),bucket:getStorage(app).bucket()}})():{}
  console.log(JSON.stringify(await seedAdvisorBundle({bundle,projectId,apply,...resources}),null,2))
  console.log('Local PDFs and manifest: '+bundle.directory)
  if(!apply)console.log('PREVIEW ONLY: no Firebase connection, users or live data changed.')
} finally {if(app)await deleteApp(app)}
