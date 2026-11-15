import ReviewerNotifications from './ReviewerNotifications'
import { projectReference, displayDate, eventLabel } from '../utils/researchDisplay'
import './ResearcherNotifications.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { nextRequiredAction, notificationReadKey } from '../utils/commonWorkspace'
import { Feedback } from '../components/SharedFeedback'
export default function NotificationsTasks({ projects, currentUser, notifications, shared, markRemote, go, onReadChange, error, loading }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en', text = (a, b) => th ? a : b
  const staffView = currentUser.role === 'staff'
  const SecondarySection = staffView ? 'details' : 'section'
  const researcherView = currentUser.role === 'researcher'
  const Heading = researcherView ? 'h1' : 'h2'
  const timestamp = value => {
    const date = value ? (value.toDate ? value.toDate() : new Date(value)) : null
    return date && Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(th ? 'th-TH' : 'en-GB', { dateStyle:'medium', timeStyle:'short', timeZone:'Asia/Bangkok' }).format(date) : '—'
  }
  const key = notificationReadKey(currentUser)
  const [read, setRead] = useState(() => { try { const ids = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : [] } catch { return [] } })
  const [failure, setFailure] = useState(''), [busy, setBusy] = useState(false), [success, setSuccess] = useState(false)
  const unread = n => shared ? !n.readAt && n.isRead !== true : !read.includes(n.id)
  async function mark(ids) {
    setBusy(true); setFailure(''); setSuccess(false)
    try {
      if (shared) await markRemote(currentUser, ids)
      else { const next = [...new Set([...read, ...ids])]; localStorage.setItem(key, JSON.stringify(next)); setRead(next); onReadChange() }
      setSuccess(true)
    } catch { setFailure(text('บันทึกสถานะอ่านไม่สำเร็จ กรุณาลองใหม่', 'Unable to mark as read. Please retry.')) }
    finally { setBusy(false) }
  }
  if (currentUser.role === 'reviewer') return <ReviewerNotifications projects={projects} notifications={notifications} unread={unread} busy={busy} error={error} loading={loading} failure={failure} success={success} mark={mark} go={go} />
  return <div className={researcherView ? "researcher-notifications" : staffView ? "staff-notifications shared-stack" : "shared-stack"}>{!researcherView && <><SecondarySection className="panel shared-card sn-secondary">{staffView ? <summary>{text('งานที่ต้องดำเนินการ', 'Action required')}</summary> : <h2>{text('งานที่ต้องดำเนินการ', 'Action required')}</h2>}{projects.filter(p => nextRequiredAction(p, currentUser).capability).map(p => <a className="shared-project-row" key={p.id} href={go.href('details', p.id)}>{projectReference(p)} · {p.title} →</a>)}{!projects.some(p => nextRequiredAction(p, currentUser).capability) && <p>{text('ไม่มีงานที่ต้องดำเนินการในขณะนี้', 'No action required at this time')}</p>}</SecondarySection>
    <SecondarySection className="panel shared-card sn-secondary">{staffView ? <summary>{text('กำหนดสิ้นสุดโครงการ', 'Project deadlines')}</summary> : <h2>{text('กำหนดสิ้นสุดโครงการ', 'Project deadlines')}</h2>}<p className="shared-note">{staffView ? text('แสดงวันสิ้นสุดที่บันทึกไว้ ยังไม่มีการแจ้งเตือนอัตโนมัติ','Recorded end dates only. Automatic reminders are not configured.') : text('แสดงวันที่ที่บันทึกไว้ ยังไม่กำหนดรอบเตือนอัตโนมัติ (OPEN-10)', 'Recorded deadlines only. Automatic reminder cadence remains OPEN-10.')}</p>{projects.filter(p => !['CLOSED', 'CANCELLED', 'completed'].includes(p.status) && p.endDate).map(p => <a className="shared-project-row" key={p.id} href={go.href('details', p.id)}>{projectReference(p)} · {staffView ? displayDate(p.endDate,i18n.language) : p.endDate}</a>)}</SecondarySection>
    </>}<section className="panel shared-card"><div className="shared-project-heading"><Heading id={researcherView ? 'page-title' : undefined} tabIndex={researcherView ? -1 : undefined}>{researcherView ? text('การแจ้งเตือน','Notifications') : staffView ? text('ยังไม่อ่าน','Unread') : text('การแจ้งเตือนและอัปเดตสถานะ', 'Notifications and status updates')} ({notifications.filter(unread).length})</Heading><button className="outline-button" disabled={busy || loading || !!error || !notifications.some(unread)} onClick={() => mark(notifications.filter(unread).map(n => n.id))}>{text(researcherView ? 'ทำเครื่องหมายว่าอ่านทั้งหมด' : 'อ่านทั้งหมด', 'Mark all as read')}</button></div>{!researcherView && <p className="shared-note">{text('การแจ้งเตือนในระบบเท่านั้น ไม่มีการส่งอีเมลจริง', 'In-app notifications only. No email has been sent.')}</p>}{loading ? <Feedback kind="loading" title={text('กำลังโหลดการแจ้งเตือน…', 'Loading notifications…')} /> : error ? <Feedback kind="error" title={text('โหลดการแจ้งเตือนไม่สำเร็จ', 'Unable to load notifications')} onRetry={() => window.location.reload()} /> : !notifications.length && <Feedback title={text('ยังไม่มีการแจ้งเตือน', 'No notifications yet')} />}{failure && <Feedback kind="error" title={failure} />}{success && <p role="status">{text('บันทึกสถานะอ่านแล้ว', 'Read status saved')}</p>}{[...notifications].reverse().map(n => <article className={"shared-notification" + ((researcherView || staffView) && unread(n) ? " rn-unread" : "")} key={n.id}><div>{(researcherView || staffView) && unread(n) && <span className="rn-unread-dot" aria-hidden="true"/>}<strong>{unread(n) ? text('ยังไม่อ่าน · ', 'Unread · ') : ''}{n.message || (n.action && eventLabel(n.action, i18n.language)) || text('อัปเดตสถานะ', 'Status update')}</strong><p>{researcherView ? timestamp(n.createdAt) : displayDate(n.createdAt, i18n.language, true)}</p><a href={go.href('details', n.projectId)}>{text('เปิดโครงการ', 'Open related project')} · {projectReference(projects.find(p => p.id === n.projectId))}</a></div>{unread(n) && <button className="outline-button" disabled={busy} onClick={() => mark([n.id])}>{text('อ่านแล้ว', 'Mark as read')}</button>}</article>)}</section></div>
}
