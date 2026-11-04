import { LayoutDashboard, FolderOpen, CirclePlus, Bell, GraduationCap, ClipboardCheck, FilePenLine, Menu } from 'lucide-react'

import { useTranslation } from 'react-i18next'

function Sidebar({ page, onNavigate, role, collapsed, onToggle }) {
  const { t } = useTranslation()
  const toggleLabel=collapsed?t('expandSidebar'):t('collapseSidebar')

  const menus=[
    {id:'dashboard',icon:LayoutDashboard,label:t('dashboard')},
    {id:'projects',icon:FolderOpen,label:t('myProjects')},
    ...(role==='researcher'?[{id:'choose',icon:CirclePlus,label:t('newProposal')}]:[]),
    ...(role==='staff'?[{id:'staff-review',icon:ClipboardCheck,label:t('proposalReview')},{id:'closure',icon:ClipboardCheck,label:t('closureReview')},{id:'administrative-records',icon:FilePenLine,label:t('externalRecords')}]:[]),
    {id:'notifications',icon:Bell,label:t('notifications')}
  ]
  function isActive(id){return page===id || id==='projects'&&['details','timeline','documents','correction','evaluation','answers','results','project-change-record'].includes(page)||id==='choose'&&['manual','upload','submission'].includes(page)}

  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-toggle" onClick={onToggle} aria-expanded={!collapsed} aria-controls="main-sidebar-menu" aria-label={toggleLabel} title={toggleLabel}><Menu size={24} aria-hidden="true" /></button>
      <div className="brand">
        <div className="brand-logo"><GraduationCap size={27} /></div>
        <div>
          <strong>{t('appName')}</strong>
          <small>{t('appSubtitle')}</small>
        </div>
      </div>

      <nav id="main-sidebar-menu" className="sidebar-menu" aria-label={t('mainNavigation')} style={{ '--nav-count': menus.length }}>
        {menus.map((menu) => (
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

      <div className="sidebar-bottom">
        <strong>MFU Research</strong><span>Mae Fah Luang University</span><small>{t('appSubtitle')}</small>
      </div>
    </aside>
  )
}

export default Sidebar
