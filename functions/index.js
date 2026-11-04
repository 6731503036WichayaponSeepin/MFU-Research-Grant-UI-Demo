import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { onRequest } from 'firebase-functions/v2/https'
import { randomUUID } from 'node:crypto'
import { databaseRecords } from './records.js'
import { authorizeProfile, requireThat, validId, mayRead, replayProject, projectView, collectFiles, rejectInlineFiles } from './securePolicy.js'

initializeApp()
const db = getFirestore()
const origins = (process.env.APP_ORIGINS || 'http://127.0.0.1:5173,http://localhost:5173').split(',')
const options = {region:'asia-southeast1',maxInstances:5,concurrency:20,cors:origins}

// Retire the unauthenticated workshop endpoint without deleting its data.
export const demoApi = onRequest(options, (_req,res) => res.status(410).json({error:'Workshop API retired. Sign in with Firebase Authentication.'}))

export const researchApi = onRequest(options, async (req,res) => {
  res.set('Cache-Control','no-store')
  try {
    requireThat(req.method === 'POST', 'POST required',405)
    requireThat(req.is('application/json'), 'JSON required',415)
    const token = req.get('Authorization')?.match(/^Bearer (.+)$/)?.[1]
    requireThat(token, 'Sign in required',401)
    let identity
    try { identity = await getAuth().verifyIdToken(token,true) } catch { requireThat(false,'Invalid or expired sign-in',401) }
    const body = req.body || {}
    const actor = authorizeProfile((await db.doc('users/'+identity.uid).get()).data(),identity.uid)
    if (body.action === 'prepareUpload') {
      requireThat(process.env.STORAGE_ENABLED === 'true', 'Cloud Storage is not enabled. Contact the administrator; no file was saved.',409)
      requireThat(validId(body.projectId) && typeof body.name === 'string' && body.name.length <= 200 && /\.pdf$/i.test(body.name) && Number.isInteger(body.size) && body.size > 0 && body.size <= 2*1024*1024,'PDF up to 2 MB required',400)
      const p = (await db.doc('workspaces/'+actor.workspace+'/projects/'+body.projectId).get()).data()
      requireThat(p ? mayRead(p,actor) : actor.role === 'researcher','Project access denied')
      const purpose = actor.role === 'reviewer' ? 'feedback' : actor.role === 'staff' ? 'administrative' : 'research'
      if (actor.role === 'reviewer') requireThat(p.closure?.state === 'awaiting_review' && !p.closure?.evaluations?.[actor.uid]?.submitted,'Evaluation is locked')
      const ticketId = randomUUID()
      const storagePath = 'workspaces/'+actor.workspace+'/projects/'+body.projectId+'/'+actor.uid+'/'+ticketId
      const ticket = {id:ticketId,workspace:actor.workspace,projectId:body.projectId,uploaderUid:actor.uid,ownerUid:p?.ownerUid || actor.uid,purpose,storagePath,name:body.name,size:body.size,contentType:'application/pdf',expiresAt:Date.now()+15*60*1000}
      await db.doc('uploadTickets/'+ticketId).create(ticket)
      return res.json({file:ticket})
    }
    requireThat(body.action === 'save' && validId(body.project?.id),'Invalid operation',400)
    requireThat(Number.isInteger(body.expectedVersion) && body.expectedVersion >= 0,'Expected version required',400)
    rejectInlineFiles(body.project)
    const result = await db.runTransaction(async tx => {
      // Re-read authoritative roles inside the transaction to handle revocation races.
      const profile = (await tx.get(db.doc('users/'+identity.uid))).data()
      const currentActor = authorizeProfile(profile,identity.uid)
      requireThat(currentActor.workspace === actor.workspace,'Workspace changed; sign in again')
      const ref = db.doc('workspaces/'+actor.workspace+'/projects/'+body.project.id)
      const previous = (await tx.get(ref)).data()
      requireThat((previous?._version || 0) === body.expectedVersion,'This project changed. Reload the latest data before saving again.',409)
      const profiles = await tx.get(db.collection('users').where('workspace','==',actor.workspace).limit(101))
      requireThat(profiles.size <= 100,'Workspace account limit reached; configure scalable projection fanout before adding accounts',409)
      const users = Object.fromEntries(profiles.docs.map(d => [d.id,d.data()]))
      const next = replayProject(previous,body.project,currentActor,users)
      const oldFiles = new Set(collectFiles(previous).map(f=>f.storagePath))
      const files = [...new Map(collectFiles(next).map(f=>[f.storagePath,f])).values()]
      requireThat(files.length <= 100,'Too many attachments',400)
      for (const file of files) {
        requireThat(validId(file.id),'Invalid attachment ticket',400)
        const ticket = (await tx.get(db.doc('uploadTickets/'+file.id))).data()
        requireThat(ticket && ticket.storagePath === file.storagePath && ticket.workspace === actor.workspace && ticket.projectId === next.id && ticket.name === file.name && ticket.size === file.size && file.contentType === 'application/pdf','ข้อมูลไฟล์ไม่ตรงกับตั๋วอัปโหลด กรุณาตรวจสอบชื่อไฟล์ ขนาด ที่เก็บ และโครงการ / Invalid attachment reference',400)
        if (!oldFiles.has(file.storagePath)) {
          requireThat(ticket.uploaderUid === actor.uid,'Attachment belongs to another user')
          requireThat(process.env.STORAGE_ENABLED === 'true','Storage is disabled',409)
          const object = getStorage().bucket(process.env.STORAGE_BUCKET).file(file.storagePath)
          let metadata
          try { [metadata] = await object.getMetadata() }
          catch { requireThat(false,'ไม่พบไฟล์ใน Firebase Storage กรุณาอัปโหลดเอกสารให้เสร็จก่อนส่ง / Uploaded file is missing',400) }
          requireThat(Number(metadata.size) === ticket.size && metadata.contentType === 'application/pdf','ขนาดหรือชนิดของไฟล์ไม่ตรงกับข้อมูลอัปโหลด / Uploaded file does not match its ticket',400)
          const [header] = await object.download({start:0,end:4})
          requireThat(header.toString() === '%PDF-','เนื้อหาเอกสารไม่ใช่ไฟล์ PDF ที่ถูกต้อง / Invalid PDF content',400)
          // Use authenticated SDK reads, never persistent bearer download URLs.
          if (metadata.metadata?.firebaseStorageDownloadTokens) await object.setMetadata({metadata:{firebaseStorageDownloadTokens:null}})
        }
      }
      // All transaction reads above precede writes below.
      tx.set(ref,next)
      const recipients = new Set([...(previous?.viewUids || []),next.ownerUid,...next.reviewerUids,...Object.keys(users).filter(uid=>users[uid].role === 'staff')])
      const viewUids = []
      const eventId = randomUUID(), event = {...next.statusHistory.at(-1),id:eventId,actorUid:actor.uid,workspace:actor.workspace,at:next.serverUpdatedAt}
      tx.create(ref.collection('activity').doc(eventId),event)
      for (const row of databaseRecords(next,previous,currentActor,eventId)) tx.set(db.collection(row.collection).doc(row.id),row.data)
      for (const uid of recipients) {
        const user = users[uid]
        const viewRef = db.doc('workspaces/'+actor.workspace+'/users/'+uid+'/projects/'+next.id)
        if (!user?.active || !mayRead(next,{uid,role:user.role,workspace:actor.workspace})) { tx.delete(viewRef); continue }
        viewUids.push(uid)
        const view = projectView(next,{uid,role:user.role,workspace:actor.workspace})
        delete view.viewUids
        tx.set(viewRef,view)
        if (!['save_proposal','save_draft','review_draft','check_draft'].includes(event.action)) {
          tx.create(db.doc('workspaces/'+actor.workspace+'/users/'+uid+'/notifications/'+eventId),{notificationId:eventId,recipientId:uid,projectId:next.id,title:event.action,message:event.note || event.action,isRead:false,action:event.action,status:next.status,createdAt:next.serverUpdatedAt,readAt:null})
        }
      }
      tx.update(ref,{viewUids})
      return {project:projectView(next,currentActor)}
    })
    return res.json(result)
  } catch(error) {
    const status = error.status || (error.code === 5 || error.code === 404 ? 400 : 400)
    res.status(status).json({error:error.status || status === 400 ? error.message : 'Unable to save. Please retry.',fieldErrors:error.fieldErrors})
  }
})
