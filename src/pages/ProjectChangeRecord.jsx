import { useFormDraft,useWorkingFile } from '../utils/useFormDraft'
import { useLiveProjects } from '../utils/useLiveProjects'
import { saveProjects } from '../utils/projectStorage'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePenLine, History, Info, Save, FileText, Search } from 'lucide-react'
import { applyChange, changeTypes, readChangeProjects } from '../utils/projectChanges'
import './ProjectChangeRecord.css'

const emptyForm = { type: 'extension', letterNumber: '', letterDate: '', reason: '', description: '', effectiveDate: '', endDate: '', newValue: '' }
function load() {
  try { return { projects: readChangeProjects().filter(p => p.status !== 'completed'), error: false } }
  catch { return { projects: [], error: true } }
}
function pdfData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(new Blob([file], { type: 'application/pdf' }))
  })
}
export default function ProjectChangeRecord({ projectId, currentUser, onViewProject, focused=false }) {
  const { i18n } = useTranslation()
  const th = i18n.language !== 'en'
  const t = (thai, en) => th ? thai : en
  const [loaded, setLoaded] = useLiveProjects(load)
  const [selected, setSelected] = useState(projectId ? String(projectId) : '')
  const [form,setForm,markSaved]=useFormDraft('project-change-'+projectId,emptyForm)
  const [file,setFile]=useWorkingFile('project-change-'+projectId)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const fileRef = useRef(null)
  const saving = useRef(false)
  const project = loaded.projects.find(p => String(p.id) === selected)
  const records = Array.isArray(project?.changeRecords) ? [...project.changeRecords].sort((a,b)=>new Date(b.recordedAt || b.date || 0)-new Date(a.recordedAt || a.date || 0)) : []
  const filtered = records.filter(r => r && (filter === 'all' || r.type === filter) &&
    [r.title, r.description, r.letterNumber, r.recordedBy, r.letterDate].join(' ').toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / 5))
  const visible = filtered.slice((page - 1) * 5, page * 5)
  const formatDate = value => {
    if (!value) return '—'
    const date = new Date(value.length === 10 ? value + 'T12:00:00' : value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(th ? 'th-TH' : 'en-GB')
  }
  function reset() {
    markSaved(emptyForm); setFile(null); setError('')
    if (fileRef.current) fileRef.current.value = ''
  }
  function change(event) {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
    setMessage('')
  }
  async function save(event) {
    event.preventDefault()
    if (saving.current || !project || currentUser?.role !== 'staff') return
    setError(''); setMessage('')
    if (!file || file.size > 2 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf')) {
      setError(t('กรุณาแนบ PDF ขนาดไม่เกิน 2 MB', 'Attach a PDF up to 2 MB.')); return
    }
    saving.current = true; setBusy(true)
    try {
      const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer())
      if (signature !== '%PDF-') throw new Error('Invalid PDF')
      const attachment = { name: file.name, size: file.size, dataUrl: await pdfData(file) }
      const projects = readChangeProjects()
      const index = projects.findIndex(p => String(p.id) === selected)
      if (index < 0) throw new Error('Project missing')
      projects[index] = applyChange(projects[index], form, currentUser, attachment)
      await saveProjects(projects)
      setLoaded({ projects:projects.filter(p => p.status !== 'completed'), error: false }); reset(); setSearch(''); setFilter('all'); setPage(1)
      setMessage(t('บันทึกสำเร็จ ข้อมูลโครงการและประวัติได้รับการอัปเดตแล้ว', 'Saved. Project details and change history are updated.'))
    } catch (err) {
      setError(err.name === 'QuotaExceededError'
        ? t('พื้นที่จัดเก็บเบราว์เซอร์ไม่เพียงพอ กรุณาลดขนาด PDF แล้วลองใหม่ ข้อมูลยังไม่ถูกบันทึก', 'Browser storage is full. Try a smaller PDF. Nothing was saved.')
        : t('บันทึกไม่สำเร็จ โปรดตรวจสอบไฟล์ PDF และข้อมูลใหม่ให้ต่างจากเดิม สำหรับขยายเวลา วันที่สิ้นสุดใหม่ต้องหลังวันเดิมและไม่ก่อนวันที่มีผล', 'Unable to save. Check the PDF and changed value. An extension must end after the previous end date and not before its effective date.'))
    } finally { saving.current = false; setBusy(false) }
  }
  if (currentUser?.role !== 'staff') return <p>{t('หน้านี้สำหรับเจ้าหน้าที่เท่านั้น', 'This page is for staff only.')}</p>
  return <div className="pcr-page">
    <div className="dashboard-heading"><div><span className="pcr-eyebrow">RESEARCH ADMINISTRATION</span><h1>{t('บันทึกการเปลี่ยนแปลงโครงการ', 'Project Change Record')}</h1><p>{t('บันทึกการเปลี่ยนแปลงโครงการจากเอกสาร e-Office', 'Record project changes from e-Office documents')}</p></div><FilePenLine size={32} /></div>
    <div className="pcr-notice"><Info size={19} /><span>{t('เจ้าหน้าที่บันทึกข้อมูลจากหนังสือที่ได้รับ ระบบไม่ได้เชื่อมต่อ e-Office โดยตรง ใช้ข้อมูลและเอกสารสมมติเท่านั้น', 'Staff manually record received documents. There is no direct e-Office connection. Use fictional data and documents only.')}</span></div>
    {loaded.error && <p role="alert" className="submission-error">{t('อ่านข้อมูลโครงการไม่ได้ กรุณาตรวจสอบข้อมูลที่จัดเก็บแล้วโหลดหน้าใหม่', 'Unable to read stored projects. Check storage and reload.')}</p>}
    {!focused&&<label className="pcr-project-select">{t('เลือกโครงการ', 'Select project')}
      <select value={selected} disabled={busy} onChange={e => { setSelected(e.target.value); reset(); setMessage(''); setPage(1); setSearch(''); setFilter('all') }}>
        <option value="">{t('เลือกโครงการที่ต้องการบันทึกการเปลี่ยนแปลง', 'Choose a project to record changes')}</option>
        {loaded.projects.map(p => <option key={p.id} value={String(p.id)}>{p.title || '—'} · {p.id}</option>)}
      </select>
    </label>}
    {!project ? <section className="panel pcr-empty"><FileText size={36} /><h2>{loaded.projects.length ? t('เลือกโครงการเพื่อเริ่มต้น', 'Select a project to begin') : t('ยังไม่มีโครงการที่บันทึกไว้', 'No saved projects yet')}</h2><p>{t('รายละเอียดและประวัติการเปลี่ยนแปลงจะแสดงที่นี่', 'Project details and change history will appear here.')}</p></section> : <>
      <section className="panel pcr-summary"><div className="pcr-summary-top"><span className="section-label">{project.id}</span><h2>{project.title || '—'}</h2><button type="button" className="outline-button" disabled={busy} onClick={() => onViewProject(project.id)}>{t('ดูรายละเอียดโครงการ', 'View project details')}</button></div>
        <div className="pcr-facts"><div><span>{t('หัวหน้าโครงการ', 'Project leader')}</span><strong>{project.leader || project.proposal?.leaderName || '—'}</strong></div><div><span>{t('ระยะเวลาดำเนินการ', 'Project period')}</span><strong>{formatDate(project.startDate || project.proposal?.startDate)} – {formatDate(project.endDate || project.proposal?.endDate)}</strong></div><div><span>{t('งบประมาณ', 'Budget')}</span><strong>{Number(project.budget || 0).toLocaleString()} THB</strong></div></div>
      </section>
      {message && <p role="status" className="pcr-success">{message}</p>}
      <div className="pcr-layout"><section className="panel pcr-history"><div className="panel-heading"><h2><History size={19} /> {t('ประวัติการเปลี่ยนแปลง', 'Change history')}</h2><span className="muted">{filtered.length} {t('รายการ', 'records')}</span></div>
        <div className="pcr-filters"><label><span><Search size={15} /> {t('ค้นหาประวัติ', 'Search records')}</span><input value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} placeholder={t('เลขที่หนังสือ รายละเอียด หรือผู้บันทึก', 'Letter number, details or operator')} /></label><label><span>{t('ประเภท', 'Type')}</span><select value={filter} onChange={e => {setFilter(e.target.value); setPage(1)}}><option value="all">{t('ทั้งหมด', 'All')}</option>{Object.entries(changeTypes).map(([key, labels]) => <option key={key} value={key}>{labels[th ? 0 : 1]}</option>)}</select></label></div>
        <div className="table-scroll"><table className="projects-table"><thead><tr>{[t('หนังสือ e-Office', 'e-Office letter'),t('รายละเอียดการเปลี่ยนแปลง', 'Change details'),t('วันที่มีผล', 'Effective date'),t('เอกสาร / ผู้บันทึก', 'Document / operator')].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{visible.map((r, index) => <tr key={r.id || index}><td>{r.letterNumber || '—'}<small>{formatDate(r.letterDate || r.date)}</small></td><td><span className="status-badge status-review">{changeTypes[r.type]?.[th ? 0 : 1] || r.title}</span><p>{r.description}</p>{r.reason && <p className="muted">{t('เหตุผล', 'Reason')}: {r.reason}</p>}{r.after && <details><summary>{t('ดูข้อมูลก่อนและหลัง', 'Before and after')}</summary>{Object.keys(r.after).map(key => <p key={key}>{r.before?.[key] || '—'} → {r.after[key]}</p>)}</details>}</td><td>{formatDate(r.effectiveDate)}{r.endDate && <small>→ {formatDate(r.endDate)}</small>}</td><td>{r.attachment?.dataUrl?.startsWith('data:application/pdf;base64,') && <a href={r.attachment.dataUrl} download={r.attachment.name}><FileText size={14} /> {r.attachment.name}</a>}<small>{r.recordedBy || '—'}</small><small>{formatDate(r.recordedAt || r.date)}</small></td></tr>)}{!visible.length && <tr><td colSpan={4} className="empty-results">{t('ยังไม่มีรายการที่ตรงกับเงื่อนไข', 'No matching records')}</td></tr>}</tbody></table></div>
        <div className="pagination"><span>{page} / {totalPages}</span><div className="pagination-buttons"><button className="outline-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('ก่อนหน้า', 'Previous')}</button><button className="outline-button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{t('ถัดไป', 'Next')}</button></div></div>
      </section>
      <form className="panel pcr-form" onSubmit={save}><h2>{t('บันทึกการเปลี่ยนแปลงใหม่', 'New change record')}</h2><p className="muted">{t('กรอกข้อมูลตามหนังสือที่ได้รับ · * จำเป็น', 'Enter the received letter details · * Required')}</p><fieldset disabled={busy}>
        <label>{t('ประเภทการเปลี่ยนแปลง', 'Change type')} *<select name="type" value={form.type} onChange={e => {change(e); setForm(previous => ({...previous, newValue:'', endDate:''}))}}>{Object.entries(changeTypes).map(([key, labels]) => <option key={key} value={key}>{labels[th ? 0 : 1]}</option>)}</select></label>
        <label>{t('เลขที่หนังสือ', 'Letter number')} *<input required name="letterNumber" value={form.letterNumber} onChange={change} maxLength={150} placeholder="อว 7315/1234" /></label>
        <label>{t('วันที่หนังสือ', 'Letter date')} *<input required type="date" name="letterDate" value={form.letterDate} onChange={change} /></label>
        {form.type !== 'extension' && <label>{t('ข้อมูลใหม่', 'New value')} *<textarea required name="newValue" value={form.newValue} onChange={change} rows={3} /></label>}
        <label>{t('เหตุผลการเปลี่ยนแปลง', 'Reason')} *<textarea required name="reason" value={form.reason} onChange={change} rows={2} /></label>
        <label>{t('รายละเอียดตามหนังสือ', 'Change details')} *<textarea required name="description" value={form.description} onChange={change} rows={3} /></label>
        <label>{t('วันที่มีผล', 'Effective date')} *<input required type="date" name="effectiveDate" value={form.effectiveDate} onChange={change} /></label>
        {form.type === 'extension' && <label>{t('วันที่สิ้นสุดโครงการใหม่', 'New project end date')} *<input required type="date" name="endDate" value={form.endDate} onChange={change} /></label>}
        <label className="pcr-attachment"><FileText size={20} />{t('เอกสารอ้างอิง PDF (ไม่เกิน 2 MB)', 'Reference PDF (up to 2 MB)')} *<input ref={fileRef} type="file" accept="application/pdf,.pdf" required={!file} onChange={e => {setFile(e.target.files?.[0] || null); setError('')}} />{file&&<small>ไฟล์ร่าง: {file.name}</small>}</label>
        <p className="pcr-save-note">{t('การบันทึกจะปรับข้อมูลโครงการทันที วันที่มีผลใช้ระบุข้อมูลตามหนังสือ ไม่ใช่การตั้งเวลาอัปเดตอัตโนมัติ', 'Saving updates the project immediately. The effective date records the letter’s terms; it does not schedule an automatic update.')}</p>
        {error && <p role="alert" className="submission-error">{error}</p>}
        <div className="pcr-actions"><button type="button" className="outline-button" onClick={reset}>{t('ล้างแบบฟอร์ม', 'Clear form')}</button><button type="submit" className="primary"><Save size={17} />{busy ? t('กำลังบันทึก…', 'Saving…') : t('บันทึกข้อมูล', 'Save record')}</button></div>
      </fieldset></form></div>
    </>}
  </div>
}
