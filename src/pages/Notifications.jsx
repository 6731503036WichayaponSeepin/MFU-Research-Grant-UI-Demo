import { useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { sharedMode, subscribeStore, getNotifications, markNotificationsRead } from '../utils/sharedStore'
import { deadlineItems } from '../utils/deadlines'
import { useLiveProjects } from '../utils/useLiveProjects'
import { getProjects } from '../utils/projectStorage'
import { canRead } from '../utils/closure'
import { nextTask } from '../utils/handoff'
import { statusLabel } from '../data/statuses'
import { matchesStaffFilter, projectCode } from '../utils/staffProjects'

function eventTime(value) {
  return typeof value?.toMillis === 'function' ? value.toMillis() : Date.parse(value) || 0
}

export default function Notifications({ currentUser, onViewProject, page = 1, onPage, onNavigate, store }) {
  const remote = useSyncExternalStore(subscribeStore, getNotifications)
  const [projects] = useLiveProjects(getProjects)
  const { t, i18n } = useTranslation()
  const th = i18n.language !== 'en'
  const staff = currentUser.role === 'staff'
  const readKey = 'mfu-notifications-read-' + currentUser.role
  const [read, setRead] = useState(() => localStorage.getItem(readKey) || '')
  const [error, setError] = useState('')
  const visible = projects.filter(p => canRead(p, currentUser))
  const deadlines = staff ? [] : deadlineItems(visible)
  const byId = new Map(visible.map(project => [project.id, project]))
  const events = (sharedMode ? remote.filter(n => byId.has(n.projectId)).map(n => ({
    ...n, project: byId.get(n.projectId), eventId: n.id, updatedAt: n.createdAt, note: n.message || n.action
  })) : visible.flatMap(project => (project.statusHistory || []).map((entry, index) => ({
    ...entry, project, eventId: project.id + ':' + index
  })))).sort((a, b) => eventTime(b.updatedAt || b.date) - eventTime(a.updatedAt || a.date))

  const unread = event => sharedMode
    ? !event.readAt && event.isRead !== true
    : eventTime(event.updatedAt || event.date) > eventTime(read)
  const pages = Math.max(1, Math.ceil(events.length / 6))
  const active = Math.min(pages, Math.max(1, page))
  const dateFormat = new Intl.DateTimeFormat(th ? 'th-TH' : 'en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok'
  })
  const queues = [['review', 'staffPendingProposal'], ['closure', 'closureReview'], ['nearDeadline', 'staffNearDeadline']]
  const now = new Date()

  async function markAll() {
    try {
      setError('')
      if (sharedMode) {
        await markNotificationsRead(currentUser, events.filter(unread).map(event => event.eventId))
      } else {
        const timestamp = new Date().toISOString()
        localStorage.setItem(readKey, timestamp)
        setRead(timestamp)
      }
    } catch {
      setError(th ? 'บันทึกไม่ได้' : 'Unable to save')
    }
  }

  if (staff && store.loading) return <p role="status">{t('staffLoadingProjects')}</p>
  if (staff && store.projectError) return <p role="alert">{t('staffProjectLoadError')}</p>

  return <section className="panel card">
    <div className="page-heading">
      <h1>{th ? 'การแจ้งเตือนและกิจกรรม' : 'Notifications and activity'}</h1>
      <button className="outline-button" onClick={markAll}>{th ? 'ทำเครื่องหมายว่าอ่านทั้งหมด' : 'Mark all read'}</button>
    </div>
    {staff && <section className="deadline-alerts">
      <h2>{t('staffTasks')}</h2>
      {queues.map(([filter, label]) => {
        const count = visible.filter(p => matchesStaffFilter(p, filter, now)).length
        return count > 0 && <a className="recent-project" key={filter} href={onNavigate.href('projects', null, { view: 'all', filter })}>
          {t(label)} · {t('staffProjectCount', { count })}
        </a>
      })}
      {visible.filter(p => nextTask(p).role === 'staff').length > 0 &&
        <a className="recent-project" href={onNavigate.href('projects', null, { view: 'all', task: 'pending' })}>{t('pendingTasks')} →</a>}
    </section>}
    {!!deadlines.length && <section className="deadline-alerts">
      <h2>{th ? 'กำหนดส่งโครงการ' : 'Project deadlines'}</h2>
      {deadlines.slice(0, 3).map(({ project, days, eventId }) =>
        <button className="deadline-alert" key={eventId} onClick={() => onViewProject(project.id)}>
          <strong>{project.id}</strong>
          <span>{days < 0 ? (th ? 'เกินกำหนด ' + (-days) + ' วัน' : 'Overdue by ' + (-days) + ' days')
            : (th ? 'ครบกำหนดใน ' + days + ' วัน' : 'Due in ' + days + ' days')}</span>
        </button>
      )}
    </section>}
    {error && <p role="alert">{error}</p>}
    {staff && store.notificationError ? <p role="alert">{t('staffNotificationLoadError')}</p> :
      staff && !store.notificationsLoading && <p>{t('staffUnread', { count: events.filter(unread).length })}</p>}
    {!events.length && !store.notificationError && !store.notificationsLoading && <p>{th ? 'ยังไม่มีกิจกรรม' : 'No activity yet'}</p>}
    {events.slice((active - 1) * 6, active * 6).map(event => {
      const { project } = event
      const time = eventTime(event.updatedAt || event.date)
      const code = staff ? projectCode(project) || t('staffNoProjectCode') : project.id
      const title = (th ? project.title : project.titleEn || project.title) || t('staffUnspecified')
      return <article className="notification-item" key={event.eventId}>
        <span className="notification-dot" style={{ opacity: unread(event) ? 1 : .2 }} />
        <div>
          <button className="text-button" onClick={() => onViewProject(project.id)}>{code} · {title}</button>
          <p>{statusLabel(event.status, i18n.language)} · {event.note}</p>
          <small>{time ? dateFormat.format(time) : t('staffUnspecified')}</small>
        </div>
      </article>
    })}
    {pages > 1 && <nav className="pagination" aria-label={t('notifications')}>
      <button className="outline-button" disabled={active <= 1} onClick={() => onPage(active - 1)}>{t('staffPrevious')}</button>
      <span>{active} / {pages}</span>
      <button className="outline-button" disabled={active >= pages} onClick={() => onPage(active + 1)}>{t('staffNext')}</button>
    </nav>}
  </section>
}
