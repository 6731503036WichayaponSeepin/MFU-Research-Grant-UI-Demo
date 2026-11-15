import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export function Feedback({ kind = 'empty', title, children, onRetry, dashboardHref }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en'
  return <section className={`shared-feedback feedback-${kind}`} role={kind === 'error' ? 'alert' : kind === 'loading' || kind === 'success' ? 'status' : undefined} aria-busy={kind === 'loading'}>
    <h2>{title}</h2>{children && <p>{children}</p>}<div className="shared-actions">{onRetry && <button className="outline-button" onClick={onRetry}>{th ? 'ลองอีกครั้ง' : 'Retry'}</button>}{dashboardHref && <a className="primary" href={dashboardHref}>{th ? 'กลับหน้าหลัก' : 'Back to Dashboard'}</a>}</div>
  </section>
}
export function ConfirmationModal({ title, children, onConfirm, onCancel, confirmLabel }) {
  const ref = useRef(null), { i18n } = useTranslation(), th = i18n.language !== 'en'
  useEffect(() => { const previous = document.activeElement, dialog = ref.current; dialog.showModal(); return () => { dialog.close(); previous?.focus() } }, [])
  return <dialog className="shared-dialog" ref={ref} aria-labelledby="confirmation-title" onCancel={event => { event.preventDefault(); onCancel() }}><h2 id="confirmation-title">{title}</h2><p>{children}</p><div className="shared-actions"><button autoFocus className="outline-button" onClick={onCancel}>{th ? 'ยกเลิก' : 'Cancel'}</button><button className="primary" onClick={onConfirm}>{confirmLabel || (th ? 'ยืนยัน' : 'Confirm')}</button></div></dialog>
}
