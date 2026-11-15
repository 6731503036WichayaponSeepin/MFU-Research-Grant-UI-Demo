import { actorName, displayDate } from '../utils/researchDisplay'
import { statusLabel } from '../data/statuses'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormDraft } from '../utils/useFormDraft'
import { ConfirmationModal } from './SharedFeedback'
export default function StaffActionForm({ project, currentUser, title, action, fields = [], initial = {}, buildPayload = value => value, enabled = true, commit, children, readableResult = false, customSubmitPlacement = false }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en'
  const [draft, setDraft, markSaved] = useFormDraft(`staff-v16:${currentUser.workspace}:${currentUser.uid}:${project.id}:${action}`, initial)
  const [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(null)
  const [pending, setPending] = useState(null)
  const allowed = typeof enabled === 'function' ? enabled(draft) : enabled
  async function execute() {
    setBusy(true); setError(''); setSaved(null)
    try { const next = await commit(pending.project, action, pending.payload); markSaved(draft); setSaved(next.statusHistory.at(-1)) }
    catch (e) { setError(e.message) } finally { setBusy(false); setConfirm(false) }
  }
  return <section className="panel shared-card"><h2>{title}</h2><form onSubmit={event => { event.preventDefault(); if (busy || !allowed) return; setPending({ project, payload: structuredClone({ ...buildPayload(draft), confirmed: true }) }); setConfirm(true) }}><fieldset disabled={busy || !allowed && typeof enabled !== 'function'}>{fields.map(field => <label key={field.name}>{field.label}{field.type === 'select' ? <select aria-label={field.label} value={draft[field.name] ?? ''} onChange={e => setDraft(d => ({ ...d, [field.name]: e.target.value }))}>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : field.type === 'textarea' ? <textarea value={draft[field.name] ?? ''} onChange={e => setDraft(d => ({ ...d, [field.name]: e.target.value }))} /> : <input type={field.type || 'text'} value={draft[field.name] ?? ''} onChange={e => setDraft(d => ({ ...d, [field.name]: e.target.value }))} />}</label>)}{children?.({ draft, setDraft, busy, submitControl: customSubmitPlacement ? <button className="primary" disabled={busy || !allowed}>{title}</button> : null })}</fieldset>{!customSubmitPlacement && <button className="primary" disabled={busy || !allowed}>{title}</button>}</form>{saved && <p role="status">{th ? 'บันทึกแล้ว' : 'Recorded'} · {readableResult ? actorName(saved.updatedBy) : saved.updatedBy} · {readableResult ? displayDate(saved.updatedAt,i18n.language,true) : saved.updatedAt} · {readableResult ? statusLabel(saved.newStatus,i18n.language) : saved.newStatus}</p>}{error && <p role="alert">{error}</p>}{confirm && <ConfirmationModal title={title + '?'} onCancel={() => setConfirm(false)} onConfirm={execute}>{th ? 'ยืนยันบันทึก Business Action นี้ ระบบตรวจ Role, State, Version และเงื่อนไขอีกครั้งก่อนบันทึกประวัติ' : 'Confirm this business action. Role, state, version and prerequisites are revalidated before recording history.'}</ConfirmationModal>}</section>
}
