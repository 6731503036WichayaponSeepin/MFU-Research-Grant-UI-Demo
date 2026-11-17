import { LayoutDashboard, FolderOpen, CirclePlus, GraduationCap, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { roleNavigation } from '../utils/commonWorkspace'

function Sidebar({ page, onNavigate, role, collapsed, onToggle, currentUser, overview, demoMode = false }) {
  const { t, i18n } = useTranslation()
  const toggleLabel=collapsed?t('expandSidebar'):t('collapseSidebar')

  const menus=[
    {id:'dashboard',icon:LayoutDashboard,label:role==='staff'?(i18n.language==='en'?'Staff Dashboard':'ภาพรวมงานเจ้าหน้าที่'):role==='reviewer'?(i18n.language==='en'?'Reviewer Dashboard':'ภาพรวมงานประเมิน'):t('dashboard')},
    {id:'projects',icon:FolderOpen,label:role==='reviewer'?(i18n.language==='en'?'Assigned Reviews':'งานประเมินที่ได้รับมอบหมาย'):t(role==='staff'?'staffAllProjects':'myProjects')},
    ...(role==='researcher'?[{id:'choose',icon:CirclePlus,label:t('newProposal')}]:[]),
  ].filter(menu => roleNavigation(role).includes(menu.id))
  function isActive(id){return page===id || id==='projects'&&['assigned-report','my-evaluation','details','timeline','documents','correction','evaluation','answers','results','project-change-record','proposal-pdf','revised-report','closure','staff-review','administrative-records','closure-review','reviewer-assignment','evaluation-tracking','final-verification','cancellation'].includes(page)||id==='choose'&&['manual','upload','submission'].includes(page)}

  return (
    <aside className="sidebar">
      {overview ? <div className="rd-branding">
        <div className="rd-brand-logo"><GraduationCap size={23} strokeWidth={1.8} aria-hidden="true" /></div>
        <div className="rd-brand-text"><strong>MFU Research</strong><small>ระบบบริหารจัดการทุนวิจัย</small></div>
        <button type="button" className="rd-brand-toggle" onClick={onToggle} aria-expanded={!collapsed} aria-controls="main-sidebar-menu" aria-label={toggleLabel} title={toggleLabel}>{collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}</button>
      </div> : <><button type="button" className="sidebar-toggle" onClick={onToggle} aria-expanded={!collapsed} aria-controls="main-sidebar-menu" aria-label={toggleLabel} title={toggleLabel}><Menu size={24} aria-hidden="true" /></button>
      <div className="brand">
        <div className="brand-logo"><GraduationCap size={27} /></div>
        <div>
          <strong>{t('appName')}</strong>
          <small>{t('appSubtitle')}</small>
        </div>
      </div></>}

      {demoMode && overview && <div className="rd-demo-mode"><span aria-hidden="true" />DEMO MODE</div>}
      {!overview && <div className="sidebar-role">{role === 'staff' ? 'Research Administration Staff' : role === 'reviewer' ? 'Expert Reviewer' : 'Researcher'}</div>}

      <nav id="main-sidebar-menu" className="sidebar-menu" aria-label={t('mainNavigation')} style={{ '--nav-count': menus.length }}>
        {menus.map((menu) => overview && menu.id === 'projects' ? null : (
          <a
            key={menu.id}
            aria-label={menu.label}
            className={`nav-item ${isActive(menu.id) ? 'active' : ''}`}
            aria-current={isActive(menu.id) ? 'page' : undefined}
            href={onNavigate.href(menu.id)}
          >
            <span className="nav-icon" aria-hidden="true"><menu.icon size={20} strokeWidth={1.8} /></span>
            <span className="nav-label">{menu.label}</span>
            {collapsed&&<span className="sidebar-tooltip">{menu.label}</span>}
          </a>
        ))}
      </nav>

      {overview}

      <div className="sidebar-bottom">
        <strong>{currentUser?.displayName || currentUser?.username || 'MFU Research'}</strong><span>{role === 'staff' ? 'Research Administration Staff' : role === 'reviewer' ? 'Expert Reviewer' : 'Researcher'}</span><small>Mae Fah Luang University</small>
      </div>
    </aside>
  )
}

export default Sidebar
