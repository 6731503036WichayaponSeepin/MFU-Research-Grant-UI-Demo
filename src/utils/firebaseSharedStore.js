import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { configureProjectStore } from './projectStorage.js'
import { firebaseMode, firebaseServices, apiRequest } from './firebaseClient'
import { prepareFiles, hydrateFiles, clearFileCache } from './firebaseFiles'

export const sharedMode = firebaseMode
let records = [], reviewers = [], notifications = []
let ready = false, busy = false, generation = 0
let status = {loading:sharedMode,busy:false,error:'',shared:sharedMode}
const listeners = new Set()
export const subscribeStore = callback => {listeners.add(callback);return ()=>listeners.delete(callback)}
export const getStoreStatus = () => status
export const getReviewerDirectory = () => reviewers
export const getNotifications = () => notifications
function report(change) {status={...status,...change};listeners.forEach(fn=>fn())}
function changed() {window.dispatchEvent(new Event('mfu-projects-updated'))}
const lockedStore={read:()=>[],save:()=>{throw new Error('Sign in and wait for Firestore before saving')}}
if(sharedMode)configureProjectStore(lockedStore)
export function startSharedStore(user) {
  if(!sharedMode)return ()=>{}
  const epoch=++generation
  records=[];reviewers=[];notifications=[];ready=false;busy=false;clearFileCache()
  report({loading:true,error:'',busy:false});changed()
  if(!user?.uid){configureProjectStore(lockedStore);return ()=>{}}
  const {db}=firebaseServices(), base=`workspaces/${user.workspace}/users/${user.uid}`
  let snapshotSerial=0
  configureProjectStore({read:()=>structuredClone(records),save:async projects=>{
    if(!ready || busy || epoch!==generation)throw new Error('Projects are loading or another save is in progress')
    const updates=projects.filter(p=>JSON.stringify(p)!==JSON.stringify(records.find(r=>r.id===p.id)))
    if(!updates.length)return
    if(updates.length!==1 || projects.length<records.length)throw new Error('Save one project at a time; deletion is disabled')
    busy=true;report({busy:true,error:''})
    try {
      const candidate=updates[0],expectedVersion=records.find(p=>p.id===candidate.id)?._version || 0
      const project=await prepareFiles(candidate,candidate.id)
      if(epoch!==generation)throw new Error('Account changed; save cancelled')
      const result=await apiRequest({action:'save',project,expectedVersion})
      if (result.project?.id !== candidate.id || !Number.isInteger(result.project._version) || (!result.project.submittedAt && candidate.statusHistory?.at(-1)?.action === 'submit_proposal')) throw new Error('ไม่ได้รับคำยืนยันการบันทึกจาก backend / Invalid save acknowledgement')
      const saved=await hydrateFiles(result.project)
      if(epoch!==generation)throw new Error('บัญชีผู้ใช้เปลี่ยนระหว่างบันทึก กรุณาเข้าสู่ระบบและตรวจสอบโครงการ / Account changed during save')
      const current=records.find(p=>p.id===saved.id)
      if(!current || current._version<=saved._version)records=[...records.filter(p=>p.id!==saved.id),saved]
      changed()
      return structuredClone(saved)
    } catch(error){if(epoch===generation)report({error:error.message});throw error}
    finally{if(epoch===generation){busy=false;report({busy:false})}}
  }})
  const fail=error=>{if(epoch===generation){ready=false;records=[];changed();report({loading:false,error:error.message})}}
  const stops=[]
  const projectQuery=user.role==='staff' ? collection(db,`workspaces/${user.workspace}/projects`) : query(collection(db,`${base}/projects`),where('viewerRole','==',user.role))
  stops.push(onSnapshot(projectQuery,async snapshot=>{
    const serial=++snapshotSerial
    try {
      const rows=await Promise.all(snapshot.docs.map(d=>hydrateFiles(d.data())))
      if(epoch!==generation || serial!==snapshotSerial)return
      records=rows;ready=true;changed();report({loading:false,error:''})
    }catch(error){fail(error)}
  },fail))
  if(user.role==='staff')stops.push(onSnapshot(query(collection(db,'users'),where('workspace','==',user.workspace),where('role','==','reviewer')),snapshot=>{
    if(epoch!==generation)return
    reviewers=snapshot.docs.filter(d=>d.data().active).map(d=>({uid:d.id,label:d.data().displayName || d.id}));report({})
  },error=>report({error:error.message})))
  stops.push(onSnapshot(collection(db,`${base}/notifications`),snapshot=>{
    if(epoch!==generation)return
    notifications=snapshot.docs.map(d=>({id:d.id,...d.data()}));report({})
  },error=>{if(epoch===generation)report({error:error.message})}))
  return ()=>{stops.forEach(stop=>stop());if(epoch===generation){generation++;records=[];reviewers=[];notifications=[];ready=false;busy=false;configureProjectStore(lockedStore);clearFileCache();changed();report({loading:false,busy:false})}}
}
export async function markNotificationsRead(user) {
  const {db}=firebaseServices()
  await Promise.all(notifications.filter(n=>!n.readAt).map(n=>updateDoc(doc(db,`workspaces/${user.workspace}/users/${user.uid}/notifications/${n.id}`),{readAt:serverTimestamp(),isRead:true})))
}
