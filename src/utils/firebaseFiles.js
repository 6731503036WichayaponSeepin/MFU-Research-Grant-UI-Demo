import { ref, uploadBytes, getBytes } from 'firebase/storage'
import { apiRequest, firebaseServices, storageEnabled } from './firebaseClient'

const downloaded = new Map()
export function clearFileCache() { downloaded.clear() }
const toDataUrl = bytes => new Promise((resolve,reject)=>{
  const reader = new FileReader()
  reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(new Error('Cannot read attachment'))
  reader.readAsDataURL(new Blob([bytes],{type:'application/pdf'}))
})
// Strip hydrated bytes from existing references. Upload new files before sending
// metadata to Firestore; never fall back to embedding binaries in documents.
export async function prepareFiles(value, projectId, uploads = new Map()) {
  if (Array.isArray(value)) return Promise.all(value.map(v=>prepareFiles(v,projectId,uploads)))
  if (!value || typeof value !== 'object') return value
  if (value.storagePath) {
    const {dataUrl: _bytes, ...metadata} = value
    void _bytes
    return metadata
  }
  if (value.dataUrl) {
    if (!storageEnabled) throw new Error('Cloud Storage is not enabled. Save project information without attachments, or ask the administrator to enable Storage. No file was saved.')
    if (!value.dataUrl.startsWith('data:application/pdf;base64,')) throw new Error('Only PDF attachments are supported in Firebase mode')
    if (uploads.has(value.dataUrl)) return {...value,...uploads.get(value.dataUrl),dataUrl:undefined}
    const blob = await (await fetch(value.dataUrl)).blob()
    const {file} = await apiRequest({action:'prepareUpload',projectId,name:value.name,size:blob.size})
    await uploadBytes(ref(firebaseServices().storage,file.storagePath),blob,{contentType:'application/pdf',customMetadata:{ticketId:file.id}})
    const metadata={id:file.id,size:blob.size,storagePath:file.storagePath,contentType:'application/pdf'}
    uploads.set(value.dataUrl,metadata)
    return {...value,...metadata,dataUrl:undefined}
  }
  const output = {}
  for (const [key,child] of Object.entries(value)) {
    // documentUrl duplicates proposal._document. Derive it at read time instead.
    if (key === 'documentUrl') continue
    output[key] = await prepareFiles(child,projectId,uploads)
  }
  return output
}
export async function hydrateFiles(value) {
  if (Array.isArray(value)) return Promise.all(value.map(hydrateFiles))
  if (!value || typeof value !== 'object') return value
  if (value.storagePath) {
    if (!storageEnabled) return value
    if (!downloaded.has(value.storagePath)) downloaded.set(value.storagePath,getBytes(ref(firebaseServices().storage,value.storagePath),2*1024*1024).then(toDataUrl).catch(error=>{downloaded.delete(value.storagePath);throw error}))
    return {...value,dataUrl:await downloaded.get(value.storagePath)}
  }
  const output = {}
  for (const [key,child] of Object.entries(value)) output[key] = await hydrateFiles(child)
  if(output.proposal?._document?.dataUrl) output.documentUrl=output.proposal._document.dataUrl
  return output
}
