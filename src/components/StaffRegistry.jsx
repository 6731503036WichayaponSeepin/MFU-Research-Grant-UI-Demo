import { useState } from 'react'
import { registryFields, closureSteps, stepStatuses, assessmentStatuses, registryValues } from '../data/registry'
import { statusLabel } from '../data/statuses'
import { saveRegistry, saveStaffStatus } from '../utils/registry'
import { stages } from '../../functions/policy'
import './StaffRegistry.css'

function RegistryEditor({ project, currentUser, onClose, onOpenClosure }) {
  const [form, setForm] = useState(() => registryValues(project))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requested = Boolean(project.closure?.submittedAt || project.closure?.closedAt)
  const field = (key, value) => setForm(current => ({ ...current, [key]: value }))
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    try { await saveRegistry(project.id, form, currentUser); onClose(true) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <section className="registry-editor" aria-label="แก้ไขทะเบียนโครงการ">
    <header><div><small>{project.id} · {statusLabel(project.status)}</small><h2>{project.title}</h2><p>หัวหน้าโครงการ: {project.leader || '—'}</p></div><button type="button" disabled={busy} onClick={() => onClose(false)}>ปิดแบบฟอร์ม</button></header>
    <form onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend>ข้อมูลทะเบียนและการประเมิน</legend>
        <label>สถานะการประเมินรายงานจากผู้ทรงคุณวุฒิ<select value={form.assessmentStatus} onChange={e => field('assessmentStatus', e.target.value)}>{assessmentStatuses.map(s => <option key={s}>{s}</option>)}</select></label>
        <div className="registry-form-grid">{registryFields.map(([key, label]) => <label key={key}>{label}<textarea rows={2} maxLength={10000} value={form[key]} onChange={e => field(key, e.target.value)} /></label>)}</div>
      </fieldset>
      <fieldset disabled={busy || !requested}>
        <legend>ติดตามการปิดโครงการ</legend>
        <p>{requested ? `ยื่นคำขอแล้ว · ${new Date(project.closure.submittedAt || project.closure.closedAt).toLocaleDateString('th-TH')}` : 'ยังไม่ได้ยื่นคำขอปิดโครงการ — นักวิจัยต้องยื่นคำขอก่อนเจ้าหน้าที่บันทึกสถานะย่อย'}</p>
        <label className="registry-check"><input type="checkbox" checked={form.finalReport} onChange={e => field('finalReport', e.target.checked)} />ส่งเล่ม Final Report เรียบร้อยแล้ว</label>
        <div className="registry-form-grid">{closureSteps.map(([key, label], index) => <label key={key}>({index + 1}) {label}<select value={form.steps[key]} onChange={e => setForm(current => ({ ...current, steps: { ...current.steps, [key]: e.target.value } }))}>{stepStatuses.map(s => <option key={s}>{s}</option>)}</select></label>)}</div>
      </fieldset>
      <p className="registry-help">สถานะย่อยใช้ติดตามงานตามทะเบียน การปิดโครงการต้องผ่านการตรวจคำขอและบันทึกผลปิดโครงการ</p>
      {error && <p role="alert" className="registry-error">{error}</p>}
      <div className="registry-actions"><button className="primary" disabled={busy} type="submit">{busy ? 'กำลังบันทึก…' : 'บันทึกทะเบียน'}</button><button type="button" disabled={busy} onClick={onOpenClosure}>เปิดคำขอปิดโครงการ</button></div>
    </form>
    <details><summary>ประวัติการแก้ไขทะเบียน ({project.registryHistory?.length || 0})</summary>{[...(project.registryHistory || [])].reverse().map((entry, i) => <article key={i}><strong>{entry.by} · {new Date(entry.at).toLocaleString('th-TH')}</strong><ul>{entry.changes.map(change => <li key={change.field}>{change.label}: {String(change.before || '—')} → {String(change.after || '—')}</li>)}</ul></article>)}</details>
  </section>
}

function StatusEditor({ project, currentUser, onClose, onAdministrative, onOpenClosure }) {
  const [status, setStatus] = useState(project.status)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <section className="registry-editor"><h2>อัปเดตสถานะโครงการ</h2><p>{project.title} · {project.leader}</p><form onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError('')
    try { await saveStaffStatus(project.id, status, note, currentUser); onClose(true) }
    catch (err) { setError('บันทึกไม่สำเร็จ: ' + err.message) }
    finally { setBusy(false) }
  }}><fieldset disabled={busy}><label>สถานะโครงการ<select value={status} onChange={e => setStatus(e.target.value)}>{(stages[project.status] || [project.status]).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></label><label>รายละเอียด / เหตุผล<textarea required value={note} onChange={e => setNote(e.target.value)} rows={3} /></label><p>เลือกได้ตามขั้นตอนปัจจุบัน การรับรองและการปิดโครงการต้องบันทึกผลที่เกี่ยวข้องให้ครบก่อน</p><div className="registry-actions"><button type="submit" className="primary">{busy ? 'กำลังบันทึก…' : 'บันทึกสถานะ'}</button><button type="button" onClick={onAdministrative}>บันทึกผลรับรอง / หนังสือ</button><button type="button" onClick={onOpenClosure}>ตรวจคำขอปิดโครงการ</button><button type="button" onClick={() => onClose(false)}>ยกเลิก</button></div></fieldset>{error && <p role="alert" className="registry-error">{error}</p>}</form></section>
}

export default function StaffRegistry({ projects, currentUser, onViewProject, onOpenClosure, onAdministrative }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [scope, setScope] = useState('all')
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [statusId, setStatusId] = useState(null)
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(0)
  const inScope = (p, key) => key === 'all' || (key === 'active' ? p.status === 'active' : key === 'completed' ? p.status === 'completed' : Boolean(p.closure?.submittedAt) && p.status !== 'completed')
  const visible = projects.filter(p => inScope(p, scope) && [p.id, p.title, p.leader, p.affiliation, registryValues(p).coResearchers].join(' ').toLowerCase().includes(search.trim().toLowerCase()) && (filter === 'all' || registryValues(p).assessmentStatus === filter))
  const pages = Math.max(1, Math.ceil(visible.length / 6))
  const currentPage = Math.min(page, pages - 1)
  const rows = visible.slice(currentPage * 6, currentPage * 6 + 6)
  const closeEditor = saved => { setSelected(null); setStatusId(null); setMessage(saved ? 'บันทึกข้อมูลเรียบร้อยแล้ว' : '') }
  return <section className="staff-registry">
    <header><h2>รายการทะเบียนทุนส่วนตัว</h2><span className="registry-total">{projects.length} โครงการ</span></header>
    {projects.some(p => p.demoGenerated || p.demoScenario) && <p className="registry-demo-note">ข้อมูลสาธิต · โครงการที่มีป้าย “สมมุติ” ใช้ข้อมูลตัวอย่างสำหรับทดลองระบบ</p>}
    <div className="registry-summary" role="group" aria-label="กลุ่มโครงการ">{[['all','โครงการทั้งหมด'],['active','กำลังดำเนินการ'],['closure','อยู่ระหว่างปิดโครงการ'],['completed','ปิดโครงการแล้ว']].map(([key, label]) => <button key={key} aria-pressed={scope === key} onClick={() => { setScope(key); setPage(0) }}><span>{label}</span><strong>{projects.filter(p => inScope(p, key)).length}</strong></button>)}</div>
    <div className="registry-controls"><label>ค้นหาโครงการหรือนักวิจัย<input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="ชื่อโครงการ รหัส หรือชื่อนักวิจัย" /></label><label>สถานะการประเมิน<select value={filter} onChange={e => { setFilter(e.target.value); setPage(0) }}><option value="all">ทุกสถานะการประเมิน</option>{assessmentStatuses.map(s => <option key={s}>{s}</option>)}</select></label></div>
    <div className="registry-list-heading"><h3>รายการโครงการ <span>{visible.length}</span></h3><small>แสดง {visible.length ? currentPage * 6 + 1 : 0}–{Math.min((currentPage + 1) * 6, visible.length)} จาก {visible.length} รายการ</small></div>
    {message && <p role="status" className="registry-success">{message}</p>}
    <div className="registry-project-list">{rows.map(project => {
      const values = registryValues(project)
      const completed = closureSteps.filter(([key]) => values.steps[key] === stepStatuses[2]).length
      const requested = Boolean(project.closure?.submittedAt || project.closure?.closedAt)
      const detailsOpen = expanded === project.id
      return <article className="registry-project-card" key={project.id}>
        <div className="registry-card-top"><div className="registry-card-identity"><div className="registry-id-line"><span>{project.id}</span>{(project.demoGenerated || project.demoScenario) && <small>สมมุติ</small>}</div><h3>{project.title || 'ไม่ระบุชื่อโครงการ'}</h3><p>{project.leader || 'ยังไม่ระบุหัวหน้าโครงการ'}</p></div><span className={`registry-status-pill ${project.status === 'completed' ? 'is-complete' : ''}`}>{statusLabel(project.status)}</span></div>
        <div className="registry-card-facts"><div><small>ระยะเวลาดำเนินการ</small><strong>{values.period || 'ยังไม่ระบุ'}</strong></div><div><small>การประเมินรายงาน</small><strong>{values.assessmentStatus}</strong></div><div><small>การปิดโครงการ</small>{requested ? <><strong>{completed} / 6 ขั้นตอนแล้วเสร็จ</strong><progress aria-label="ความคืบหน้าขั้นตอนปิดโครงการ" max={6} value={completed} /></> : <strong>ยังไม่ได้ยื่นคำขอ</strong>}</div></div>
        <div className="registry-card-footer"><button className="registry-detail-toggle" aria-expanded={detailsOpen} aria-controls={`registry-details-${project.id}`} onClick={() => setExpanded(detailsOpen ? null : project.id)}>{detailsOpen ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดทะเบียน'} <span aria-hidden="true">{detailsOpen ? '−' : '+'}</span></button><div><button onClick={() => { setSelected(selected === project.id ? null : project.id); setExpanded(null); setStatusId(null); setMessage('') }}>แก้ไขข้อมูล / สถานะย่อย</button><button className="primary" onClick={() => { setStatusId(statusId === project.id ? null : project.id); setExpanded(null); setSelected(null); setMessage('') }}>อัปเดตสถานะ</button></div></div>
        {detailsOpen && <section className="registry-detail-body" id={`registry-details-${project.id}`}>
          <h4>ข้อมูลทะเบียน</h4><dl className="registry-read-grid">{registryFields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{values[key] || 'ยังไม่ได้บันทึก'}</dd></div>)}</dl>
          <div className="registry-closure-heading"><h4>ติดตามปิดโครงการ</h4><span>{values.finalReport ? '✓ รับเล่ม Final Report แล้ว' : 'ยังไม่ได้รับเล่ม Final Report'}</span></div>
          <ol className="registry-step-list">{closureSteps.map(([key, label], i) => <li key={key}><span className={`registry-step-number tone-${stepStatuses.indexOf(values.steps[key])}`}>{values.steps[key] === stepStatuses[2] ? '✓' : i + 1}</span><span>{label}</span><strong className={`registry-step tone-${stepStatuses.indexOf(values.steps[key])}`}>{values.steps[key]}</strong></li>)}</ol>
          <div className="registry-actions"><button onClick={() => onViewProject(project.id)}>เปิดรายละเอียดโครงการ</button><button onClick={() => onOpenClosure(project.id)}>เปิดคำขอปิดโครงการ</button></div>
        </section>}
        {selected === project.id && <RegistryEditor project={project} currentUser={currentUser} onClose={closeEditor} onOpenClosure={() => onOpenClosure(project.id)} />}
        {statusId === project.id && <StatusEditor project={project} currentUser={currentUser} onClose={closeEditor} onAdministrative={() => onAdministrative(project.id)} onOpenClosure={() => onOpenClosure(project.id)} />}
      </article>
    })}</div>
    {!visible.length && <div className="registry-empty"><h3>ไม่พบโครงการที่ตรงกับการค้นหา</h3><p>ลองเปลี่ยนคำค้นหรือสถานะที่เลือก</p><button onClick={() => { setSearch(''); setFilter('all'); setScope('all'); setPage(0) }}>แสดงทุกโครงการ</button></div>}
    <nav className="registry-pagination" aria-label="หน้ารายการทะเบียน"><span>หน้า {currentPage + 1} จาก {pages}</span><div><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>ก่อนหน้า</button><button disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>ถัดไป</button></div></nav>
  </section>
}


