import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { ADVISOR_SEED, demoActors } from './advisorSpecs.mjs'
import { projectView, mayRead } from '../securePolicy.js'
import { databaseRecords } from '../records.js'
export function validateAdvisorBundle(bundle) {
  const single=bundle.scope==='reviewer-example'
  if(bundle.workspace!=='testing' || bundle.seedId!==ADVISOR_SEED || (single ? bundle.projects.length!==1 || bundle.projects[0]?.id!=='MFU-ADVISOR-V1-C01' || bundle.files.length!==2 : bundle.scope!==undefined || bundle.projects.length!==15))throw new Error('Only the full testing bundle or the single C01 reviewer example is permitted')
  const ids=new Set()
  for(const p of bundle.projects){
    if(!/^MFU-ADVISOR-V1-[ABC]0[1-5]$/.test(p.id) || ids.has(p.id) || p.workspace!=='testing' || p.ownerUid!=='test-researcher' || p.isDemo!==true || p.demoSeedId!==ADVISOR_SEED || p.reviewerUids.some(uid=>uid!=='test-reviewer'))throw new Error('Invalid demo project identity')
    ids.add(p.id)
  }
  for(const file of bundle.files){
    if(!ids.has(file.projectId) || file.storagePath!==`workspaces/testing/projects/${file.projectId}/${file.uploaderUid}/${file.id}` || !Object.values(demoActors).some(a=>a.uid===file.uploaderUid))throw new Error('Invalid demo Storage path')
  }
}
export async function seedAdvisorBundle({bundle,projectId,db,auth,bucket,apply=false}) {
  validateAdvisorBundle(bundle)
  if(projectId!=='mfu-researchgrantmanagement' && !projectId.startsWith('demo-'))throw new Error('Unexpected Firebase project')
  const summary={mode:apply?'APPLY':'PREVIEW',projectId,workspace:'testing',seedId:ADVISOR_SEED,projects:bundle.projects.length,pdfs:bundle.files.length,created:0,skipped:0}
  if(!apply)return summary
  if(![projectId+'.appspot.com',projectId+'.firebasestorage.app'].includes(bucket.name))throw new Error('Bucket must belong to the confirmed project')
  // No createUser/updateUser/profile writes. Verify all existing identities first.
  for(const actor of Object.values(demoActors)){
    const user=await auth.getUser(actor.uid),profile=(await db.doc('users/'+actor.uid).get()).data()
    if(user.email!==actor.email || user.disabled || profile?.active!==true || profile.role!==actor.role || profile.workspace!=='testing')throw new Error('Existing testing account/profile mismatch: '+actor.uid)
  }
  const snapshots=await db.getAll(...bundle.projects.map(p=>db.doc('workspaces/testing/projects/'+p.id)))
  const pending=[]
  for(let i=0;i<bundle.projects.length;i++){
    const snapshot=snapshots[i],p=bundle.projects[i]
    if(snapshot.exists){
      const current=snapshot.data()
      if(current.isDemo!==true || current.demoSeedId!==ADVISOR_SEED || current.id!==p.id || current.workspace!=='testing')throw new Error('Project ID collision; nothing overwritten: '+p.id)
      summary.skipped++
    } else pending.push(p)
  }
  // Validate ALL source files and pre-existing Storage objects before writing anything.
  const uploads=[]
  for(const file of bundle.files.filter(file=>pending.some(p=>p.id===file.projectId))){
    const bytes=readFileSync(resolve(bundle.directory,file.localFile))
    if(bytes.length!==file.size || bytes.length>2*1024*1024 || bytes.subarray(0,5).toString()!=='%PDF-' || createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error('Demo PDF validation failed: '+file.localFile)
    const object=bucket.file(file.storagePath),[exists]=await object.exists()
    if(exists){
      const [metadata]=await object.getMetadata()
      if(metadata.metadata?.demoSeedId!==ADVISOR_SEED || metadata.metadata?.sha256!==file.sha256 || metadata.contentType!=='application/pdf' || Number(metadata.size)!==file.size)throw new Error('Storage collision; no existing object is overwritten: '+file.storagePath)
      const [stored]=await object.download()
      if(createHash('sha256').update(stored).digest('hex')!==file.sha256)throw new Error('Existing demo object checksum mismatch')
    } else uploads.push({object,bytes,file})
  }
  for(const {object,bytes,file} of uploads)await object.save(bytes,{resumable:false,preconditionOpts:{ifGenerationMatch:0},metadata:{contentType:'application/pdf',metadata:{demoSeedId:ADVISOR_SEED,isDemo:'true',sha256:file.sha256,projectId:file.projectId}}})
  for(const p of pending){
    const ref=db.doc('workspaces/testing/projects/'+p.id),eventId=ADVISOR_SEED+'-'+p.id
    const viewers=Object.values(demoActors).filter(actor=>mayRead(p,actor))
    const files=bundle.files.filter(file=>file.projectId===p.id)
    const created=await db.runTransaction(async tx=>{
      const current=await tx.get(ref)
      if(current.exists){if(current.data().isDemo!==true || current.data().demoSeedId!==ADVISOR_SEED)throw new Error('Concurrent project collision');return false}
      tx.create(ref,{...p,viewUids:viewers.map(actor=>actor.uid)})
      for(const file of files)tx.create(db.doc('uploadTickets/'+file.id),{id:file.id,workspace:'testing',projectId:p.id,uploaderUid:file.uploaderUid,ownerUid:p.ownerUid,purpose:file.purpose,storagePath:file.storagePath,name:file.name,size:file.size,contentType:'application/pdf',expiresAt:0,isDemo:true,demoSeedId:ADVISOR_SEED})
      const audit={id:eventId,projectId:p.id,actorId:'test-staff',actorUid:'test-staff',actorRole:'staff',action:'seed_advisor_snapshot',previousStatus:null,newStatus:p.status,workspace:'testing',timestamp:bundle.generatedAt,isDemo:true,demoSeedId:ADVISOR_SEED,origin:'synthetic_seed'}
      tx.create(ref.collection('activity').doc(eventId),audit)
      for(const row of databaseRecords(p,null,demoActors.staff,eventId))tx.create(db.collection(row.collection).doc(row.id),{...row.data,...(row.collection==='activityLogs'?audit:{}),isDemo:true,demoSeedId:ADVISOR_SEED})
      for(const actor of viewers){
        tx.create(db.doc(`workspaces/testing/users/${actor.uid}/projects/${p.id}`),projectView(p,actor))
        tx.create(db.doc(`workspaces/testing/users/${actor.uid}/notifications/${eventId}`),{notificationId:eventId,recipientId:actor.uid,projectId:p.id,title:'ข้อมูลสาธิตพร้อมทดสอบ',message:'โครงการและประวัติเป็นข้อมูลสมมติที่เตรียมไว้ ไม่ใช่การยื่นหรือผลพิจารณาจริง',action:'seed_advisor_snapshot',status:p.status,isRead:false,readAt:null,createdAt:bundle.generatedAt,isDemo:true,demoSeedId:ADVISOR_SEED})
      }
      return true
    })
    if(created)summary.created++;else summary.skipped++
  }
  return summary
}
