import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, LogOut } from 'lucide-react'

import { useTranslation } from 'react-i18next'

function Header({ pageTitle, page, onNavigate, currentUser, onLogout }) {
  const { t, i18n } = useTranslation()

  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)
  const triggerRef = useRef(null)
  const th = i18n.language !== 'en'
  const roleName = currentUser?.role === 'staff'
    ? (th ? 'เจ้าหน้าที่ส่วนบริหารงานวิจัย' : 'Research Administration Staff')
    : currentUser?.role === 'reviewer'
      ? (th ? 'ผู้ทรงคุณวุฒิ' : 'Reviewer')
      : (th ? 'นักวิจัย' : 'Researcher')
  const userName = currentUser?.username || roleName

  useEffect(() => {
    if (!accountOpen) return
    function closeOutside(event) {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false)
    }
    function closeEscape(event) {
      if (event.key === 'Escape') {
        setAccountOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeEscape)
    }
  }, [accountOpen])

  const titles = {
    'administrative-records': t('externalRecords'),
    'project-closure': th ? 'ปิดโครงการวิจัย' : 'Project Closure',
    'closure-document-check': th ? 'ตรวจเอกสารปิดโครงการ' : 'Closure Document Check',
    'final-report-review': th ? 'ประเมินรายงานฉบับสมบูรณ์' : 'Final Report Review',
    'closed-project-detail': th ? 'รายละเอียดโครงการที่ปิดแล้ว' : 'Closed Project Detail',
    'project-change-record': t('projectChangeRecord'),
    'active-project-detail': t('projectDetails'),
    'project-detail': t('projectDetails'),
    'proposal-review': t('proposalReview'),
    'staff-dashboard': t('dashboard'),
    'reviewer-dashboard': t('dashboard'),
    dashboard: t('dashboard'),
    projects: t('myProjects'),
    choose: t('newProposal'),
    manual: t('manualEntry'),
    upload: t('uploadPDF'),
    submission: t('confirmProposal'),
    notifications: t('notifications')
  }

  function changeLanguage(language) {
    i18n.changeLanguage(language)
    localStorage.setItem('mfu-language', language)
  }

  return (
    <header className="topbar">
      <h2>{pageTitle || titles[page] || t('dashboard')}</h2>

      <div className="topbar-actions">
        <div className="language-switch" aria-label={t('language')}>
          <button
            className={i18n.language === 'en' ? 'selected' : ''}
            aria-pressed={i18n.language === 'en'}
            onClick={() => changeLanguage('en')}
          >
            EN
          </button>
          <span className="language-divider">|</span>
          <button
            className={i18n.language === 'th' ? 'selected' : ''}
            aria-pressed={i18n.language === 'th'}
            onClick={() => changeLanguage('th')}
          >
            TH
          </button>
        </div>

        <button
          className="header-icon"
          title={t('notifications')}
          aria-label={t('notifications')}
          onClick={() => onNavigate('notifications')}
        >
          <Bell size={20} />
        </button>

        <div className="account" ref={accountRef} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false)
        }}>
          <button className="account-trigger" ref={triggerRef} type="button"
            aria-expanded={accountOpen} aria-controls="account-panel"
            aria-label={th ? 'บัญชีผู้ใช้: ' + userName + ' · ' + roleName : 'Account: ' + userName + ' · ' + roleName}
            onClick={() => setAccountOpen(value => !value)}>
            <span className="account-avatar">{Array.from(userName)[0]?.toUpperCase()}</span>
            <span className="account-identity"><strong>{userName}</strong><small>{roleName}</small></span>
            <ChevronDown size={16} className={accountOpen ? 'account-chevron open' : 'account-chevron'} />
          </button>
          {accountOpen && <div className="account-panel" id="account-panel">
            <div className="account-summary"><strong>{userName}</strong><span>{roleName}</span></div>
            <button type="button" className="account-logout" onClick={onLogout}>
              <LogOut size={17} />{th ? 'กลับไปเลือกบทบาท' : 'Choose role'}
            </button>
          </div>}
        </div>
      </div>
    </header>
  )
}

export default Header
