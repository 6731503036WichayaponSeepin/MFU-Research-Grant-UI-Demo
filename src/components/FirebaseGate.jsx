import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { firebaseServices } from '../utils/firebaseClient'
import { setDraftIdentity } from '../utils/projectStorage'
import { clearFileCache } from '../utils/firebaseFiles'
import App from '../App'
import { installDemoNavigation, navigateDemo } from '../utils/demoRouter'
import { useDemoRoute } from '../utils/useDemoRoute'

export default function FirebaseGate() {
  const route = useDemoRoute()
  useEffect(() => installDemoNavigation(), [])
  const [setup] = useState(() => {
    try { return {services:firebaseServices()} }
    catch (error) { return {error:error.message} }
  })
  const [account,setAccount] = useState(null)
  const [loading,setLoading] = useState(!setup.error)
  const [error,setError] = useState(setup.error || '')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [busy,setBusy] = useState(false)
  const [denied,setDenied] = useState(false)
  const [attempt,setAttempt] = useState(0)

  useEffect(() => {
    if (setup.error) return
    let stopProfile = () => {}, disposed = false, session = 0, profileTimer
    const {auth,db} = setup.services
    const stopAuth = onAuthStateChanged(auth,user => {
      const currentSession = ++session
      stopProfile()
      clearTimeout(profileTimer)
      clearFileCache()
      setAccount(null)
      setError('')
      setDenied(false)
      if (!user) { setLoading(false); return }
      setLoading(true)
      profileTimer = setTimeout(() => {
        if (disposed || currentSession !== session) return
        setAccount(null)
        setError('โหลดสิทธิ์ไม่สำเร็จ กรุณาลองอีกครั้ง / Loading permissions timed out. Please retry.')
        setLoading(false)
      }, 15000)
      stopProfile = onSnapshot(doc(db,'users',user.uid),snapshot => {
        if (disposed || currentSession !== session) return
        clearTimeout(profileTimer)
        const profile = snapshot.data()
        if (profile?.active !== true || !['researcher','staff','reviewer'].includes(profile.role) || !profile.workspace) {
          setAccount(null)
          setDenied(true)
          setError('บัญชีนี้ยังไม่ได้รับอนุญาตให้ใช้งาน กรุณาติดต่อผู้ดูแลระบบ / This account is not authorized. Contact the administrator.')
          setLoading(false)
          return
        }
        setDraftIdentity(`${profile.workspace}-${user.uid}`)
        setAccount({...profile,uid:user.uid,username:user.uid,email:user.email})
        setLoading(false)
      },() => {
        if (disposed || currentSession !== session) return
        clearTimeout(profileTimer)
        setAccount(null)
        setError('ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาตรวจสอบการเชื่อมต่อ / Unable to load account permissions. Access is disabled.')
        setLoading(false)
      })
    })
    return () => { disposed = true; session++; clearTimeout(profileTimer); stopProfile(); stopAuth(); clearFileCache() }
  },[setup,attempt])

  useEffect(() => {
    if (account && route.role !== account.role) navigateDemo(account.role, 'dashboard', null, {}, true, true)
  }, [account, route.role])

  async function login(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const {auth,persistence} = firebaseServices()
      await persistence
      await signInWithEmailAndPassword(auth,email.trim(),password)
      setPassword('')
    } catch {
      setError('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมล รหัสผ่าน และการเชื่อมต่อ / Check your email, password and connection.')
    } finally { setBusy(false) }
  }

  if (loading) return <section className="panel card" role="status">กำลังตรวจสอบบัญชี / Restoring sign-in…</section>
  if (account) return route.role === account.role
    ? <App key={`${account.uid}:${account.role}:${account.workspace}`} authenticatedUser={account} onRoleChange={() => signOut(setup.services.auth)} />
    : null
  return <div className="login-page"><div className="login-container">
    <div className="login-brand"><h1>MFU Research Grant Management System</h1><p>เข้าสู่ระบบ / Sign in</p></div>
    <form className="login-card cl-form" onSubmit={login}>
      <fieldset disabled={busy || !!setup.error} aria-busy={busy}>
        <label>อีเมล / Email<input type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)}/></label>
        <label>รหัสผ่าน / Password<input type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)}/></label>
        <button className="primary">{busy?'กำลังเข้าสู่ระบบ… / Signing in…':'เข้าสู่ระบบ / Sign in'}</button>
      </fieldset>
      {error && <p role="alert">{denied && <strong>ไม่มีสิทธิ์เข้าถึง / Access Denied · </strong>}{error}</p>}
      {denied && <button type="button" className="outline-button" onClick={() => signOut(setup.services.auth)}>ใช้บัญชีอื่น / Sign out and use another account</button>}
      {error && !denied && <button type="button" className="outline-button" onClick={() => setup.error ? window.location.reload() : setAttempt(n => n + 1)}>ลองอีกครั้ง / Retry</button>}
    </form>
  </div></div>
}
