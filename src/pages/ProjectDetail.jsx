import ResearchDocuments from '../components/ResearchDocuments'
import { useLiveProjects } from '../utils/useLiveProjects'
import { documentUrl } from '../utils/documents'
import ProposalPDF from '../components/ProposalPDF'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Database,
  Download,
  FileText,
  Flag,
  FolderOpen,
  History,
  Pencil,
  Wallet
} from 'lucide-react'


import { timelineSteps, statusConfig, statusLabel } from '../data/statuses'
import { getProjects } from '../utils/projectStorage'
const getSavedProjects = getProjects

function formatDate(value, thai = true) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString(
    thai ? 'th-TH' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return String(value)
}

export default function ProjectDetail({
  focused = false, view = 'details', initialTab, onTabChange, historyPage=1, onHistoryPage,
  onChangeRecord,
  projectId,
  onBack,
  onEdit
}) {
  const { i18n } = useTranslation()
  const th = i18n.language !== 'en'
  const t = (thai, english) => th ? thai : english

  const [tab, setTab] = useState(initialTab || 'information')

  const [saved] = useLiveProjects(getSavedProjects)
  const project = useMemo(() => {

    if (projectId) {
      return saved.find(p => p.id === projectId)
    }

    return saved[0]
  }, [projectId, saved])

  if (!project) return <section className="panel card"><p>{t('ไม่พบโครงการ', 'Project not found')}</p><button onClick={onBack}>{t('ย้อนกลับ', 'Back')}</button></section>
  const canEdit = onEdit && (['draft','revision_required'].includes(project.status)||project.correction?.state==='approved')
  const proposal = project.proposal || {}
  const status = statusConfig[project.status] || statusConfig.submitted
  const currentStep = project.status === 'revision_required' ? (statusConfig[project.revisionReturnTo]?.step ?? status.step) : status.step

  const totalBudget = [
    'compensation',
    'directCost',
    'materials',
    'utility'
  ].reduce(
    (sum, key) => sum + (Number(proposal[key]) || 0),
    0
  )

  const budget = Number(project.budget) || totalBudget

  const startDate = project.startDate || proposal.startDate
  const endDate = project.endDate || proposal.endDate

  const tabs = [
    ['information', 'ข้อมูลโครงการ', 'Project Information', FileText],
    ['research', 'รายละเอียดวิจัย', 'Research Details', FileText],
    ['budget', 'งบประมาณ', 'Budget', Database],
    ['changes', 'ประวัติการเปลี่ยนแปลง', 'Change Records', History],
    ['documents', 'เอกสาร', 'Documents', FolderOpen]
  ]

  const infoRows = [
    [t('รหัสโครงการ', 'Project ID'), project.id],
    [t('ชื่อโครงการ', 'Project Title'), project.title],
    [t('ชื่อโครงการภาษาอังกฤษ', 'English Title'), project.titleEn],
    [t('ประเภททุน', 'Grant Type'), 'Personal Research Grant (RS-1)'],
    [t('หัวหน้าโครงการ', 'Project Leader'), project.leader || proposal.leaderName],
    [t('สังกัด', 'Affiliation'), project.affiliation || proposal.leaderAffiliation],
    [t('วันที่เริ่มโครงการ', 'Start Date'), formatDate(startDate, th)],
    [t('วันที่สิ้นสุดโครงการ', 'End Date'), formatDate(endDate, th)],
    [t('งบประมาณตามข้อเสนอ', 'Proposed Budget'), `${budget.toLocaleString()} THB`]
  ]

  const researchRows = [
    [t('ประเภทงานวิจัย', 'Research Type'), proposal.researchType],
    [t('คำสำคัญ', 'Keywords'), proposal.keywords],
    [t('ความเป็นมาและกรอบแนวคิด', 'Background'), proposal.background],
    [t('วัตถุประสงค์', 'Objectives'), proposal.objectives],
    [t('การทบทวนวรรณกรรม', 'Literature Review'), proposal.literature],
    [t('ระเบียบวิธีวิจัย', 'Methodology'), proposal.methodology],
    [t('ขอบเขตการวิจัย', 'Scope'), proposal.scope],
    [t('แผนการดำเนินงาน', 'Working Plan'), proposal.workPlan],
    [t('ผลผลิตที่คาดว่าจะได้รับ', 'Expected Outcomes'), proposal.outcomeDetail]
  ]

  const budgetRows = [
    [t('ค่าตอบแทน', 'Compensation'), proposal.compensation],
    [t('ค่าใช้สอย', 'Direct Cost'), proposal.directCost],
    [t('ค่าวัสดุ', 'Materials and Supplies'), proposal.materials],
    [t('ค่าสาธารณูปโภค', 'Utility'), proposal.utility]
  ]

  const documents = documentUrl(project) ? [
    {
      name: project.documentName || 'RS-1 Research Proposal.pdf',
      type: 'PDF',
      url: documentUrl(project)
    }
  ] : []

  const changes = Array.isArray(project.changeRecords)
    ? project.changeRecords
    : []

  function renderTable(rows) {
    return (
      <div className="pd-table">
        {rows.map(([label, value], index) => (
          <div className="pd-table-row" key={index}>
            <div className="pd-table-label">{label}</div>
            <div className="pd-table-value">
              {displayValue(value)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if(focused && view==='timeline')return <ProjectTimeline project={project} currentStep={currentStep} t={t} th={th} historyPage={historyPage} onHistoryPage={onHistoryPage}/>
  return (
    <div className="pd-page">
      {project.isDemo&&<p className="review-demo-note">DEMO DATA — ข้อมูลสมมติที่เตรียมไว้สำหรับสาธิต ไม่ใช่การยื่นหรือผลพิจารณาจริง การบันทึกครั้งต่อไปจะเก็บเฉพาะในเบราว์เซอร์นี้</p>}
      <button className="pd-back" onClick={onBack}>
        <ArrowLeft size={17} />
        {t('กลับไป My Projects', 'Back to My Projects')}
      </button>

      <div className="pd-heading">
        <div>
          {!focused&&<h1>{t('รายละเอียดและสถานะโครงการ', 'Project Detail / Status')}</h1>}
          <p>{t('รายละเอียดโครงการ / สถานะโครงการ', 'Project Details / Status')}</p>
        </div>

        <div className="pd-heading-actions">
          <ProposalPDF proposal={proposal} />
          {onChangeRecord && <button className="primary" onClick={onChangeRecord}>{t('บันทึกการเปลี่ยนแปลง', 'Record change')}</button>}
          {documentUrl(project) && <a
            className="pd-outline"
            href={documentUrl(project)}
            download="RS-1-Research-Proposal.pdf"
          >
            <Download size={17} />
            {t('ดาวน์โหลด PDF', 'Download PDF')}
          </a>}

          {(!focused||canEdit)&&<button
            className="pd-outline"
            disabled={!canEdit}
            onClick={() => onEdit?.(project)}
          >
            <Pencil size={17} />
            {t('แก้ไขข้อเสนอ', 'Edit Proposal')}
          </button>}


        </div>
      </div>

      {/* ===== Project Summary ===== */}
      <section className="pd-card pd-summary">
        <div className="pd-summary-top">
          <div>
            <h2>{project.title || proposal.projectTitle || '-'}</h2>
            {project.titleEn && <p>{project.titleEn}</p>}
          </div>

          <span className={`pd-status pd-status-${project.status || 'submitted'}`}>
            <span className="pd-status-dot" />
            {t(status.th, status.en)}
          </span>
        </div>

        {!focused&&<div className="pd-summary-grid">
          <div className="pd-summary-column">
            <div>
              <span>{t('รหัสโครงการ', 'Project ID')}</span>
              <strong>{project.id}</strong>
            </div>
            <div>
              <span>{t('ประเภททุน', 'Grant Type')}</span>
              <strong>Personal Research Grant</strong>
            </div>
            <div>
              <span>{t('หัวหน้าโครงการ', 'Project Leader')}</span>
              <strong>{project.leader || proposal.leaderName || '-'}</strong>
            </div>
            <div>
              <span>{t('สังกัด', 'Affiliation')}</span>
              <strong>{project.affiliation || proposal.leaderAffiliation || '-'}</strong>
            </div>
          </div>

          <div className="pd-summary-column">
            <div>
              <span>{t('วันที่เริ่มโครงการ', 'Start Date')}</span>
              <strong>{formatDate(startDate, th)}</strong>
            </div>
            <div>
              <span>{t('วันที่สิ้นสุดโครงการ', 'End Date')}</span>
              <strong>{formatDate(endDate, th)}</strong>
            </div>
            <div>
              <span>{t('วันที่บันทึก', 'Created Date')}</span>
              <strong>{formatDate(project.createdAt, th)}</strong>
            </div>
            <div>
              <span>{t('งบประมาณตามข้อเสนอ', 'Proposed Budget')}</span>
              <strong>{budget.toLocaleString()} THB</strong>
            </div>
          </div>
        </div>}
      </section>

      {!focused&&<ProjectTimeline project={project} currentStep={currentStep} t={t} th={th}/>}
      {/* ===== Tabs ===== */}
      <div className="pd-tabs">
        {tabs.filter(([key])=>!focused||!['documents','changes'].includes(key)).map(([key, thai, english, Icon]) => (
          <button
            type="button"
            key={key}
            className={tab === key ? 'pd-tab active' : 'pd-tab'}
            onClick={() => onTabChange ? onTabChange(key) : setTab(key)}
          >
            <Icon size={17} />
            {t(thai, english)}
          </button>
        ))}
      </div>

      <div className={focused?"pd-focused-content":"pd-content-grid"}>
        <section className="pd-card pd-main-content">

          {tab === 'information' && (
            <>
              <div className="pd-section-heading">
                <h3>{t('ข้อมูลโครงการ', 'Project Information')}</h3>
                {(!focused||canEdit)&&<button
                  className="pd-outline"
                  disabled={!canEdit}
            onClick={() => onEdit?.(project)}
                >
                  <Pencil size={15} />
                  {t('แก้ไขข้อมูล', 'Edit Information')}
                </button>}
              </div>
              {renderTable(infoRows)}
            </>
          )}

          {tab === 'research' && (
            <>
              <h3>{t('รายละเอียดการวิจัย', 'Research Details')}</h3>
              {renderTable(researchRows)}
            </>
          )}

          {tab === 'budget' && (
            <>
              <h3>{t('รายละเอียดงบประมาณ', 'Budget Details')}</h3>
              <div className="pd-budget-total">
                <Wallet size={22} />
                <div>
                  <span>{t('งบประมาณรวมตามข้อเสนอ', 'Total Proposed Budget')}</span>
                  <strong>{budget.toLocaleString()} THB</strong>
                </div>
              </div>

              {renderTable(
                budgetRows.map(([label, value]) => [
                  label,
                  `${(Number(value) || 0).toLocaleString()} THB`
                ])
              )}
            </>
          )}

          {tab === 'changes' && (
            <>
              <h3>{t('ประวัติการเปลี่ยนแปลง', 'Change Records')}</h3>

              {changes.length === 0 ? (
                <div className="pd-empty">
                  <History size={29} />
                  <p>
                    {t(
                      'ยังไม่มีประวัติการเปลี่ยนแปลงโครงการ',
                      'No change records available'
                    )}
                  </p>
                </div>
              ) : (
                changes.map((change, index) => (
                  <div className="pd-change-item" key={index}>
                    <strong>{change.title || '-'}</strong>
                    <p>{change.description || '-'}</p>
                    <small>{formatDate(change.date, th)}</small>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'documents' && <ResearchDocuments documents={project.documents || []}/>}
      {tab === 'documents' && (
            <>
              <h3>{t('เอกสารที่เกี่ยวข้อง', 'Project Documents')}</h3>

              {!documents.length && <p>{t('ยังไม่มีเอกสารแนบ', 'No document attached')}</p>}
              {documents.map((doc, index) => (
                <div className="pd-document" key={index}>
                  <div className="pd-document-icon">
                    <FileText size={24} />
                  </div>
                  <div className="pd-document-info">
                    <strong>{doc.name}</strong>
                    <span>{doc.type} · {t('เอกสารที่แนบ', 'Attached document')}</span>
                  </div>
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="pd-outline"
                  >
                    <Download size={16} />
                    {t('ดาวน์โหลด', 'Download')}
                  </a>
                </div>
              ))}
            </>
          )}

        </section>

        {/* ===== Right Side ===== */}
        {!focused&&<aside className="pd-side">
          <section className="pd-card">
            <h3>{t('สถานะปัจจุบัน', 'Current Status')}</h3>
            <div className="pd-current-box">
              <div className="pd-current-title">
                <Clock3 size={19} />
                <strong>{t(status.th, status.en)}</strong>
              </div>
              <p>
                {t(
                  'ติดตามความคืบหน้าของโครงการตามขั้นตอนที่กำหนด',
                  'Track your project progress through the workflow.'
                )}
              </p>
            </div>
          </section>

          <section className="pd-card">
            <h3>{t('ขั้นตอนถัดไป', 'Next Milestone')}</h3>

            <div className="pd-next-box">
              <Flag size={22} />
              <div>
                <strong>
                  {currentStep < timelineSteps.length - 1
                    ? t(...timelineSteps[currentStep + 1])
                    : t('เสร็จสิ้นทุกขั้นตอน', 'All Steps Completed')}
                </strong>
                <small>
                  {t(
                    'ขั้นตอนถัดไปในกระบวนการ',
                    'Next step in the process'
                  )}
                </small>
              </div>
              <ChevronRight size={18} />
            </div>
          </section>

          <section className="pd-card">
            <h3>{t('ข้อมูลสำคัญ', 'Quick Information')}</h3>
            <div className="pd-quick-row">
              <CalendarDays size={17} />
              <span>{t('วันที่สร้างรายการ', 'Created')}</span>
              <strong>{formatDate(project.createdAt, th)}</strong>
            </div>
            <div className="pd-quick-row">
              <Wallet size={17} />
              <span>{t('งบประมาณ', 'Budget')}</span>
              <strong>{budget.toLocaleString()} ฿</strong>
            </div>
          </section>
        </aside>}
      </div>
    </div>
  )
}

function ProjectTimeline({project,currentStep,t,th,historyPage=1,onHistoryPage}){return <div className="pd-page focused-timeline">      {/* ===== Timeline ===== */}
      <section className="pd-card">
        <h3>{t('ลำดับสถานะโครงการ', 'Project Status Timeline')}</h3>

        <div className="pd-timeline-scroll">
          <div className="pd-timeline">
            {timelineSteps.map(([thai, english], index) => {
              const completed = index < currentStep || project.status === 'completed'
              const current = index === currentStep

              return (
                <div className="pd-timeline-item" key={index}>
                  <div className="pd-timeline-track">
                    <div
                      className={
                        'pd-timeline-circle ' +
                        (completed ? 'done' : current ? (project.status === 'revision_required' ? 'revision' : 'current') : '')
                      }
                    >
                      {completed ? <Check size={16} /> : index + 1}
                    </div>
                  </div>

                  <strong className={current ? 'pd-active-text' : ''}>
                    {t(thai, english)}
                  </strong>

                  <small>
                    {completed
                      ? t('ผ่านขั้นตอนแล้ว', 'Completed')
                      : current
                        ? t('สถานะปัจจุบัน', 'Current Status')
                        : t('ยังไม่ถึงขั้นตอน', 'Upcoming')}
                  </small>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pd-card"><h3>{t('ประวัติสถานะ', 'Status history')}</h3>{[...(project.statusHistory || [])].reverse().slice((historyPage-1)*5,historyPage*5).map((h,i) => <p key={i}><strong>{statusLabel(h.status,th?'th':'en')}</strong> · {formatDate(h.updatedAt || h.date,th)} · {h.updatedBy || h.by}<br/>{h.note}</p>)}</section>{onHistoryPage&&project.statusHistory.length>5&&<nav className="pagination" aria-label="หน้าประวัติโครงการ"><button className="outline-button" disabled={historyPage<=1} onClick={()=>onHistoryPage(historyPage-1)}>ก่อนหน้า</button><span>{historyPage} / {Math.ceil(project.statusHistory.length/5)}</span><button className="outline-button" disabled={historyPage>=Math.ceil(project.statusHistory.length/5)} onClick={()=>onHistoryPage(historyPage+1)}>ถัดไป</button></nav>}
</div>}
