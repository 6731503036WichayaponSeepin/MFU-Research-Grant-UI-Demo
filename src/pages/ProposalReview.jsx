import { useFormDraft } from '../utils/useFormDraft'
import { useLiveProjects } from '../utils/useLiveProjects'
import DocumentPreview from '../components/DocumentPreview'
import ProposalPDF from '../components/ProposalPDF'
import { documentUrl } from '../utils/documents'
import { statusLabels as STATUS_LABELS } from '../data/statuses'


import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  FileText,
  CheckCircle2,
  RotateCcw,
  Eye,
  ClipboardCheck
} from 'lucide-react'

import {
  getProjects,
  updateProjectStatus
} from '../utils/projectStorage'

const REVIEW_STATUSES = [
  'admin_review',
  'revision_required',
  'committee_review'
]


export default function ProposalReview({ onViewProject, projectId, focused=false, onDocuments }) {
  const { i18n } = useTranslation()
  const thai = i18n.language !== 'en'
  const t = (th, en) => thai ? th : en

  const [projects, setProjects] = useLiveProjects(getProjects)
  const [selectedId, setSelectedId] = useState(projectId || null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [note,setNote,markSaved]=useFormDraft('proposal-review-'+projectId,'')
  const [message, setMessage] = useState('')

  const reviewProjects = useMemo(
    () => projects.filter(p => REVIEW_STATUSES.includes(p.status) || p.reviewNotes?.length),
    [projects]
  )

  const visibleProjects = reviewProjects.filter(project => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch = [
      project.id, project.title, project.leader
    ].join(' ').toLowerCase().includes(keyword)

    return matchesSearch &&
      (filter === 'all' || project.status === filter || filter === 'committee_review' && project.reviewNotes?.some(n=>n.status==='committee_review'))
  })

  const selectedProject =
    projects.find(p => String(p.id) === String(selectedId)) ||
    visibleProjects[0] ||
    null

  const counts = {
    pending: reviewProjects.filter(p => p.status === 'admin_review').length,
    revision: reviewProjects.filter(p => p.status === 'revision_required').length,
    completed: reviewProjects.filter(p => p.status === 'committee_review' || p.reviewNotes?.some(n=>n.status==='committee_review')).length,
    total: reviewProjects.length
  }

  async function changeStatus(status) {
    if (!selectedProject) return

    if (status === 'revision_required' && !note.trim()) {
      setMessage(t(
        'กรุณาระบุเหตุผลที่ต้องแก้ไขก่อน',
        'Please enter a revision reason.'
      ))
      return
    }

    try {
    const success = await updateProjectStatus(
      selectedProject.id,
      status,
      note.trim()
    )

    if (success) {
      setProjects(getProjects())
      markSaved('')
      setMessage(t(
        'บันทึกสถานะโครงการเรียบร้อยแล้ว',
        'Project status updated successfully.'
      ))
    }
    } catch { setMessage(t('บันทึกไม่สำเร็จ โปรดตรวจสอบสถานะและพื้นที่จัดเก็บ', 'Unable to save. Check status and browser storage.')) }
  }

  if(focused)return <section className="panel focused-card staff-review-page">{selectedProject?<><h2>{selectedProject.title}</h2><div className="focused-facts"><p>หัวหน้าโครงการ · {selectedProject.leader}</p><p>งบประมาณ · {Number(selectedProject.budget).toLocaleString()} บาท</p><p>สถานะ · {t(...(STATUS_LABELS[selectedProject.status]||['ไม่ทราบสถานะ','Unknown']))}</p></div><div className="focused-actions"><button className="outline-button" onClick={()=>onViewProject(selectedProject.id)}>รายละเอียดข้อเสนอ →</button><button className="outline-button" onClick={onDocuments}>เปิดเอกสาร RS-1 →</button></div><form onSubmit={e=>{e.preventDefault();changeStatus('committee_review')}}><label htmlFor="review-notes">หมายเหตุ / รายการที่ต้องแก้ไข</label><textarea id="review-notes" rows={4} value={note} onChange={e=>setNote(e.target.value)}/>{message&&<p role="status">{message}</p>}<div className="focused-actions"><button type="button" className="outline-button" disabled={selectedProject.status!=='admin_review'} onClick={()=>changeStatus('revision_required')}>ส่งคืนเพื่อแก้ไข</button><button className="primary" disabled={selectedProject.status!=='admin_review'}>ตรวจสอบเสร็จสิ้น</button></div></form></>:<p>ไม่พบข้อเสนอที่รอตรวจสอบ</p>}</section>
  return (
    <div className="pr-page">
      <div className="pr-heading">
        <h1>{t('ตรวจสอบข้อเสนอ', 'Proposal Review')}</h1>
        <p>
          {t(
            'ตรวจสอบข้อเสนอโครงการวิจัย',
            'Research Proposal Review'
          )}
        </p>
      </div>

      <div className="pr-stats">
        {[
          {
            title: t('รอการตรวจสอบ', 'Pending Review'),
            value: counts.pending,
            icon: FileText
          },
          {
            title: t('ส่งคืนเพื่อแก้ไข', 'Returned for Revision'),
            value: counts.revision,
            icon: RotateCcw
          },
          {
            title: t('ตรวจสอบเสร็จสิ้น', 'Review Completed'),
            value: counts.completed,
            icon: CheckCircle2
          },
          {
            title: t('ทั้งหมด', 'Total'),
            value: counts.total,
            icon: ClipboardCheck
          }
        ].map(item => {
          const Icon = item.icon
          return (
            <div className="pr-stat" key={item.title}>
              <Icon size={24} />
              <div>
                <span>{item.title}</span>
                <strong>{item.value}</strong>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pr-layout">
        {/* LEFT: Proposal List */}
        <section className="pr-panel">
          <div className="pr-panel-heading">
            <h2>{t('รายการข้อเสนอโครงการ', 'Proposal List')}</h2>
            <p>
              {t(
                'ค้นหาและเลือกโครงการที่ต้องการตรวจสอบ',
                'Search and select a proposal'
              )}
            </p>
          </div>

          <div className="pr-search">
            <Search size={18} />
            <input
              value={search}
              onChange={e => {setSearch(e.target.value);setSelectedId(null);setNote('');setMessage('')}}
              placeholder={t(
                'ค้นหารหัสโครงการ ชื่อโครงการ หรือหัวหน้าโครงการ',
                'Search project ID, title or researcher'
              )}
            />
          </div>

          <select
            aria-label={t('กรองสถานะ','Filter status')}
            className="pr-select"
            value={filter}
            onChange={e => {setFilter(e.target.value);setSelectedId(null);setNote('');setMessage('')}}
          >
            <option value="all">{t('ทุกสถานะ', 'All Statuses')}</option>
            <option value="admin_review">
              {t('รอตรวจสอบ', 'Pending Review')}
            </option>
            <option value="revision_required">
              {t('ส่งคืนเพื่อแก้ไข', 'Returned for Revision')}
            </option>
            <option value="committee_review">
              {t('ตรวจสอบเสร็จสิ้น', 'Review Completed')}
            </option>
          </select>

          <div className="pr-table-wrap">
            <table className="pr-table">
              <thead>
                <tr>
                  <th>{t('รหัส', 'ID')}</th>
                  <th>{t('ชื่อโครงการ', 'Project')}</th>
                  <th>{t('สถานะ', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="pr-empty">
                      {t('ไม่พบข้อเสนอที่รอตรวจสอบ', 'No proposals found')}
                    </td>
                  </tr>
                ) : visibleProjects.map(project => {
                  const label = STATUS_LABELS[project.status]
                  return (
                    <tr
                      key={project.id}
                      className={
                        selectedProject?.id === project.id
                          ? 'pr-selected-row'
                          : ''
                      }
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(project.id); setNote('') } }}
                      onClick={() => {
                        setSelectedId(project.id)
                        setNote('')
                        setMessage('')
                      }}
                    >
                      <td>{String(project.id).slice(0, 14)}</td>
                      <td>
                        <strong>{(thai ? project.title : project.titleEn || project.title) || '-'}</strong>
                        <small>{project.leader || '-'}</small>
                      </td>
                      <td>
                        <span className={`pr-status pr-status-${project.status}`}>
                          {t(...(label || ['ไม่ทราบสถานะ', 'Unknown']))}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT: Proposal Details */}
        <section className="pr-panel">
          {!selectedProject ? (
            <div className="pr-empty-detail">
              <FileText size={42} />
              <h3>{t('ยังไม่ได้เลือกโครงการ', 'No Proposal Selected')}</h3>
              <p>
                {t(
                  'เลือกโครงการจากตารางด้านซ้ายเพื่อดูรายละเอียด',
                  'Select a proposal from the list'
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="pr-panel-heading">
                <h2>{t('รายละเอียดข้อเสนอ', 'Proposal Details')}</h2>
                <button
                  className="pr-secondary-btn"
                  onClick={() => onViewProject?.(selectedProject.id)}
                >
                  <Eye size={16} />
                  {t('รายละเอียดเพิ่มเติม', 'Full Details')}
                </button>
              </div>

              <h3 className="pr-project-name">
                {(thai ? selectedProject.title : selectedProject.titleEn || selectedProject.title) || '-'}
              </h3>

              <div className="pr-project-info">
                <p>
                  <b>{t('หัวหน้าโครงการ', 'Researcher')}:</b>{' '}
                  {selectedProject.leader || '-'}
                </p>
                <p>
                  <b>{t('งบประมาณ', 'Budget')}:</b>{' '}
                  {selectedProject.budget || '-'} THB
                </p>
                <p>
                  <b>{t('สถานะปัจจุบัน', 'Current Status')}:</b>{' '}
                  {t(...(STATUS_LABELS[selectedProject.status] || [
                    'ไม่ทราบสถานะ', 'Unknown'
                  ]))}
                </p>
              </div>

              <div className="pr-document">
                <div className="pr-document-heading">
                  <FileText size={18} />
                  <strong>
                    {t('เอกสารข้อเสนอโครงการ RS-1', 'RS-1 Proposal Document')}
                  </strong>
                </div>

                {documentUrl(selectedProject) ? (
                  <DocumentPreview key={documentUrl(selectedProject)} url={documentUrl(selectedProject)} />
                ) : (
                  <div className="pr-pdf-empty">
                    {t(
                      'ยังไม่มีไฟล์ PDF สำหรับแสดงตัวอย่าง',
                      'No PDF preview available'
                    )}
                  </div>
                )}
              </div>

              <div className="pr-review-form">
                <ProposalPDF proposal={selectedProject.proposal || {}} />
                {(selectedProject.reviewNotes || []).map((n,i)=><p key={i}>{n.updatedAt} · {n.note}</p>)}
                <h3>
                  {t('บันทึกผลการตรวจสอบ', 'Record Review Result')}
                </h3>

                <label htmlFor="review-notes">
                  {t('หมายเหตุ / รายการที่ต้องแก้ไข', 'Notes / Revision Requests')}
                </label>

                <textarea id="review-notes"
                  rows={4}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t(
                    'ระบุผลการตรวจสอบหรือสิ่งที่ต้องแก้ไข...',
                    'Enter review comments...'
                  )}
                />

                {message && (
                  <p className="pr-message" role="status">{message}</p>
                )}

                <div className="pr-actions">
                  <button
                    className="pr-secondary-btn"
                    disabled={selectedProject.status !== 'admin_review'}
                    onClick={() => changeStatus('revision_required')}
                  >
                    <RotateCcw size={17} />
                    {t('ส่งคืนเพื่อแก้ไข', 'Return for Revision')}
                  </button>

                  <button
                    className="pr-primary-btn"
                    disabled={selectedProject.status !== 'admin_review'}
                    onClick={() => changeStatus('committee_review')}
                  >
                    <CheckCircle2 size={17} />
                    {t('ตรวจสอบเสร็จสิ้น', 'Complete Review')}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
