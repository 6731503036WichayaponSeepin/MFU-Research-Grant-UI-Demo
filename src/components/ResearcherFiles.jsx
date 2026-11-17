import { UploadCloud } from 'lucide-react'
import { actorName, displayDate, documentLabel } from '../utils/researchDisplay'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { pdfAttachment } from '../utils/researcherWorkspace'
export default function ResearcherFiles({ project: p, kinds, selected, onSelection, commit, go, proposalVersionId, disabled, documentLabels, userFacing = false, compact = false, uploadTitle }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en', text = (a, b) => th ? a : b
  const [kind, setKind] = useState(kinds[0]), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const selectedKind = kinds.includes(kind) ? kind : kinds[0]
  const demo = p.workspace === 'local-demo-v16' && p.fictional === true && p.simulationOnly === true
  async function hideDocument(id) {
    if (!window.confirm(text('นำไฟล์นี้ออกจากรายการเลือก? ประวัติและไฟล์เดิมยังคงอยู่', 'Remove this file from the selection list? The file and history are retained.'))) return
    setBusy(true); setError('')
    try { await commit(p, 'hide_demo_document', { documentId: id }); onSelection(selected.filter(item => item !== id)) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function upload(file) {
    if (!file) return
    setBusy(true); setError('')
    try { const document = await pdfAttachment(file, selectedKind, p.documents.filter(d => d.kind === selectedKind).length + 1, proposalVersionId); const next = await commit(p, 'attach_document', { document }); const added = next.documents.filter(d => d.id === document.id); onSelection([...selected, ...added.map(d => d.id)]) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <section className={compact?"r06-files":""}><p className="shared-note">{userFacing ? text('อัปโหลด PDF ไม่เกิน 2 MB การเลือกออกจากชุดส่งไม่ลบไฟล์หรือประวัติเดิม','Upload a PDF up to 2 MB. Deselecting keeps the original file and history.') : text('PDF ไม่เกิน 2 MB ตาม adapter ปัจจุบัน ชนิดไฟล์จริงยัง OPEN การอัปโหลดไม่เปลี่ยนสถานะ และ Remove นำออกจากชุดส่งเท่านั้น ไม่ลบประวัติหรือไฟล์เดิม', 'Current adapter: PDF up to 2 MB; final file policy remains OPEN. Upload does not change state. Remove only deselects a file; history and original files remain.')}</p><fieldset className={compact?"researcher-upload r06-upload":"researcher-upload"} disabled={disabled || busy}><label className={compact?'r06-type':undefined}>{text('ประเภทเอกสาร', 'Document Type')}<select aria-label={text("ประเภทเอกสาร", "Document Type")} value={selectedKind} onChange={e => setKind(e.target.value)}>{kinds.map(k => <option key={k} value={k}>{documentLabels?.[k] || documentLabel(k, i18n.language)}</option>)}</select></label><label className={compact?'r06-dropzone':undefined}>{compact?<><UploadCloud size={26}/><strong>{uploadTitle||text('อัปโหลด PDF','Upload PDF')}</strong><small>{text('ไฟล์ PDF ไม่เกิน 2 MB','PDF up to 2 MB')}</small><span className="r06-type">{text('อัปโหลด PDF','Upload PDF')}</span></>:text('อัปโหลด PDF', 'Upload PDF')}<input aria-label={text('อัปโหลด PDF','Upload PDF')} type="file" accept="application/pdf,.pdf" onChange={e => { upload(e.target.files?.[0]); e.target.value = '' }} /></label></fieldset>{busy && <p role="status">{text('กำลังอัปโหลด…', 'Uploading…')}</p>}{error && <p role="alert">{error}</p>}<div className="shared-table-wrap"><table className="shared-table"><thead><tr><th>{text('เลือก / Remove', 'Select / Remove')}</th><th>{text('เอกสารและเวอร์ชัน', 'Document and version')}</th><th>{text('ดูไฟล์', 'Preview')}</th></tr></thead><tbody>{p.documents.filter(d => kinds.includes(d.kind) && !d.hiddenFromDemoSelection).map(d => <tr key={d.id}><td><input aria-label={`${text('เลือก', 'Select')} ${documentLabels?.[d.kind] || documentLabel(d.kind, i18n.language)} ${d.name} v${d.version}`} type="checkbox" disabled={disabled || busy} checked={selected.includes(d.id)} onChange={e => onSelection(e.target.checked ? [...selected, d.id] : selected.filter(id => id !== d.id))} /></td><td><strong>{d.name}</strong>{documentLabels?.[d.kind] || documentLabel(d.kind, i18n.language)} · v{d.version}<small>{actorName(d.uploadedBy)} · {displayDate(d.uploadedAt, i18n.language, true)}</small></td><td><a href={go.href('documents', p.id, { document: d.id })}>{text('ดู PDF', 'Preview PDF')}</a>{demo && <button type='button' disabled={disabled || busy} onClick={() => hideDocument(d.id)}>{text('นำออกจากรายการ', 'Remove from list')}</button>}</td></tr>)}</tbody></table></div>{proposalVersionId && <p>{text('ไฟล์ใหม่อ้างข้อเสนอเวอร์ชัน', 'New files reference proposal version')}: {p.proposalVersions.find(v => v.id === proposalVersionId)?.version || '—'}</p>}</section>
}
