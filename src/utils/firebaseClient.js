import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

export const firebaseMode = true
export const storageEnabled = import.meta.env.VITE_STORAGE_ENABLED === 'true'
let services
export function firebaseServices() {
  if (services) return services
  const config = {
    apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId:import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  }
  if (['apiKey','authDomain','projectId','appId'].some(k=>!config[k])) throw new Error('Firebase configuration is incomplete. Check .env.local; local demo fallback is disabled.')
  const app = getApps()[0] || initializeApp(config)
  const auth = getAuth(app), db = getFirestore(app)
  const storage = storageEnabled ? getStorage(app) : null
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    if (!['localhost','127.0.0.1'].includes(window.location.hostname)) throw new Error('Emulators are allowed only on localhost')
    connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})
    connectFirestoreEmulator(db,'127.0.0.1',8080)
    if(storage) connectStorageEmulator(storage,'127.0.0.1',9199)
  }
  services = {app,auth,db,storage,persistence:setPersistence(auth,browserLocalPersistence)}
  return services
}
export async function apiRequest(body) {
  const {auth} = firebaseServices()
  if (!auth.currentUser) throw new Error('Sign in required')
  const token = await auth.currentUser.getIdToken()
  const url = import.meta.env.VITE_RESEARCH_API_URL || '/api/research'
  const response = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)})
  const data = await response.json().catch(()=>({}))
  if(!response.ok) throw Object.assign(new Error(data.error || `บันทึกไม่สำเร็จ (${response.status})`),{status:response.status,fieldErrors:data.fieldErrors})
  if (!data || typeof data !== 'object' || !Object.keys(data).length) throw new Error('ไม่ได้รับคำยืนยันจาก researchApi กรุณาตรวจสอบ URL และการเชื่อมต่อ / Invalid backend response')
  return data
}
