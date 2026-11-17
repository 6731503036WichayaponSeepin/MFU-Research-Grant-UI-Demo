import { useEffect, useState } from 'react'
import { useDemoRoute } from '../utils/useDemoRoute'
import { navigateDemo, installDemoNavigation } from '../utils/demoRouter'
import App from '../App'
import { setDraftIdentity } from '../utils/projectStorage'
import { initializeFoundationDemo, resetFoundationDemo } from '../utils/foundationStore'
import { foundationActors } from '../data/foundationDemo'
import { ConfirmationModal, Feedback } from './SharedFeedback'
import { useTranslation } from 'react-i18next'
import '../i18n'
import '../shared.css'
const roles = ['researcher', 'staff', 'reviewer']
export default function DemoEntry() {
  const { t, i18n } = useTranslation(), th = i18n.language !== 'en', text = (a, b) => th ? a : b
  const dataset = 'foundation'
  const [setup] = useState(() => { try { initializeFoundationDemo(); return {} } catch (error) { return { error: error.message } } })
  useEffect(() => installDemoNavigation(), [])
  const route = useDemoRoute(), { role } = route
  const [persona, setPersona] = useState(() => localStorage.getItem('mfu-demo-reviewer-persona') || 'demo-reviewer-1')
  const [confirm, setConfirm] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''), [revision, setRevision] = useState(0)
  function switchRole(value) { setDraftIdentity(null); navigateDemo(value, 'dashboard') }
  function reset() {
    try { resetFoundationDemo(); setMessage(text('คืนค่าข้อมูลสมมติ v1.6 แล้ว', 'Local v1.6 fictional data reset')); setRevision(n => n + 1); setConfirm(false) }
    catch { setError(text('คืนค่าไม่สำเร็จ ข้อมูลเดิมยังคงอยู่', 'Reset failed. Existing records were preserved.')); setConfirm(false) }
  }
  if (setup.error) return <main className="demo-welcome"><Feedback kind="error" title={text('เปิดข้อมูล Local Demo ไม่สำเร็จ', 'Unable to load Local Demo')} onRetry={() => window.location.reload()}>{text('ข้อมูลเดิมไม่ถูกลบ กรุณาตรวจสอบพื้นที่จัดเก็บ', 'Existing data was preserved. Check browser storage.')}</Feedback></main>
  if (!roles.includes(role)) return <main className="demo-welcome shared-entry"><section className="panel card"><span className="section-kicker">MAE FAH LUANG UNIVERSITY · 404 TEAM FOUND</span><h1>{text('ระบบบริหารจัดการทุนวิจัยส่วนตัว', 'Personal Research Grant Management')}</h1><p className="shared-demo-banner">{text('LOCAL DEMO · ข้อมูลสมมติ · ไม่มีการแก้บัญชีหรือข้อมูล Firebase จริง', 'LOCAL DEMO · Fictional data · No Firebase accounts or live records are changed')}</p>{route.page === 'not-found' && <Feedback kind="error" title={text('ไม่พบหน้า', 'Page Not Found')} />}<h2>{text('เลือกบทบาทเพื่อทดลองใช้งาน', 'Choose a role to explore')}</h2><div className="demo-role-grid">{roles.map(key => <div className="panel card shared-role" key={key}><h2>{t(`role.${key}`)}</h2><p>{key === 'staff' ? 'Research Administration Staff' : key === 'reviewer' ? 'Expert Reviewer' : 'Researcher'}</p>{key === 'reviewer' && <label>{text('ผู้ทรงคุณวุฒิสมมติ (บทบาทเดียวกัน)', 'Reviewer persona (same role)')}<select aria-label={text('ผู้ทรงคุณวุฒิสมมติ (บทบาทเดียวกัน)','Reviewer persona (same role)')} value={persona} onChange={e => { setPersona(e.target.value); localStorage.setItem('mfu-demo-reviewer-persona', e.target.value) }}>{[1, 2, 3].map(n => <option key={n} value={`demo-reviewer-${n}`}>{foundationActors[`demo-reviewer-${n}`].displayName}</option>)}</select></label>}<button className="primary" onClick={() => switchRole(key)}>{t('startDemo')} · {key} →</button></div>)}</div><div className="shared-actions"><button className="outline-button" onClick={() => setConfirm(true)}>{text('คืนค่าเฉพาะ Local Demo v1.6', 'Reset Local Demo v1.6 only')}</button>{['th', 'en'].map(language => <button className="outline-button" key={language} aria-pressed={i18n.language === language} onClick={() => { i18n.changeLanguage(language); localStorage.setItem('mfu-language', language) }}>{language.toUpperCase()}</button>)}</div>{message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}{confirm && <ConfirmationModal title={text('คืนค่าข้อมูลสมมติ v1.6?', 'Reset fictional v1.6 data?')} onCancel={() => setConfirm(false)} onConfirm={reset}>{text('แทนที่เฉพาะ namespace ของ Local Demo v1.6 ไม่ลบข้อมูลเดิม Legacy ร่างงานส่วนตัว หรือข้อมูล Firebase', 'Replace only the Local Demo v1.6 namespace. Legacy data, private drafts and Firebase records are preserved.')}</ConfirmationModal>}</section></main>
  const uid = role === 'researcher' ? 'demo-user' : role === 'staff' ? 'demo-staff' : (foundationActors[persona]?.role === 'reviewer' ? persona : 'demo-reviewer-1')
  const user = foundationActors[uid]
  return <App key={`${uid}:${dataset}:${revision}`} authenticatedUser={user} dataset={dataset} onRoleChange={switchRole} />
}
