import { clearWorkingFiles } from '../utils/useFormDraft'
import { useEffect, useState } from 'react'
import { useDemoRoute } from '../utils/useDemoRoute'
import { navigateDemo,installDemoNavigation } from '../utils/demoRouter'
import App from '../App'
import { initializeDemo, DRAFT_KEY, setDraftIdentity } from '../utils/projectStorage'
import { useTranslation } from 'react-i18next'
import '../i18n'
const roles = {researcher:['นักวิจัย','Researcher','demo-user'],staff:['เจ้าหน้าที่','Research Administration Staff','demo-staff'],reviewer:['ผู้ทรงคุณวุฒิ','Reviewer','demo-reviewer']}
export default function DemoEntry() {
  const {t,i18n}=useTranslation()
  useState(()=>{initializeDemo();if(!window.location.hash)navigateDemo(localStorage.getItem('mfu-demo-role')||'','dashboard',null,{},true);return null})
  useEffect(()=>installDemoNavigation(),[])
  const {role}=useDemoRoute()
  useEffect(()=>{localStorage.setItem('mfu-demo-role',role)},[role])
  const [revision,setRevision]=useState(0)
  function switchRole(value){setDraftIdentity(null);navigateDemo(value,'dashboard')}
  function reset(){if(!window.confirm('คืนค่าข้อมูลตัวอย่างทั้งหมด? การเปลี่ยนแปลงในเดโมจะถูกล้าง'))return;initializeDemo(true);clearWorkingFiles();localStorage.removeItem(DRAFT_KEY);Object.keys(localStorage).filter(k=>k.startsWith('mfu-review-working-')||k.startsWith('mfu-navigation-draft-')).forEach(k=>localStorage.removeItem(k));navigateDemo(role,'dashboard',null,{},true,true);setRevision(n=>n+1)}
  if(!roles[role])return <main className="demo-welcome"><section className="panel card"><span className="section-kicker">MAE FAH LUANG UNIVERSITY</span><h1>{t('rolePageTitle')}</h1><p>{t('roleDemoNotice')}</p><h2>{t('chooseRole')}</h2><p>{t('rolePageDescription')}</p><div className="demo-role-grid">{Object.entries(roles).map(([key])=><button className="panel card" key={key} onClick={()=>switchRole(key)}><h2>{t(`role.${key}`)}</h2><p>{key==='staff'?'Research Administration Staff':key==='reviewer'?'Reviewer':'Researcher'}</p><span>{t('startDemo')} →</span></button>)}</div><div className="role-language-switch" aria-label="Language"><button type="button" aria-pressed={i18n.language==='en'} onClick={()=>{i18n.changeLanguage('en');localStorage.setItem('mfu-language','en')}}>EN</button><button type="button" aria-pressed={i18n.language==='th'} onClick={()=>{i18n.changeLanguage('th');localStorage.setItem('mfu-language','th')}}>TH</button></div></section></main>
  const user={role,username:roles[role][2],uid:roles[role][2],displayName:roles[role][0]}
  return <App key={role+revision} authenticatedUser={user} onRoleChange={switchRole} onReset={reset}/>
}
