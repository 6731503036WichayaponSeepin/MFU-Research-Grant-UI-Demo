import ResearchDocuments from '../components/ResearchDocuments'
import { useLiveProjects } from '../utils/useLiveProjects'
import { documentUrl } from '../utils/documents'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Download,
  History,
  FolderOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import './ActiveProjectDetail.css'


import { statusLabels as STATUS, timelineSteps as STEPS, statusConfig } from '../data/statuses'
import { getProjects } from '../utils/projectStorage'
const STEP_BY_STATUS = Object.fromEntries(Object.entries(statusConfig).map(([k,v]) => [k,v.step]))
function findField(data, keys) {
  for (const key of keys) {
    const value = data?.[key]

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return value
    }
  }

  return null
}

function validDate(value) {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function dateText(date, thai) {
  if (!date) return '-'

  return date.toLocaleDateString(
    thai ? 'th-TH' : 'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  )
}

function calculateTime(start, end) {
  if (!start || !end || end <= start) return null

  const now = new Date()
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()

  const percent = Math.max(
    0,
    Math.min(100, Math.round(elapsed / total * 100))
  )

  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / 86400000)
  )

  return {
    percent,
    daysRemaining,
    overdue: now > end
  }
}

export default function ActiveProjectDetail({
  projectId,
  onBack,
  onChangeRecord,
  onClosure,
  role = 'researcher'
}) {
  const { i18n } = useTranslation()
  const thai = i18n.language !== 'en'
  const t = (th, en) => thai ? th : en

  const [tab, setTab] = useState('overview')
  const [projects, setProjects] = useLiveProjects(getProjects)

  const project = useMemo(() => {
    return projects.find(
      item => String(item.id) === String(projectId)
    )
  }, [projectId, projects])

  if (!project) {
    return (
      <div className="apd-page">
        <button className="apd-back" onClick={onBack}>
          <ArrowLeft size={17} />
          {t('ย้อนกลับ', 'Back')}
        </button>

        <section className="apd-card apd-empty">
          <FolderOpen size={36} />
          <h2>
            {t('ไม่พบข้อมูลโครงการ', 'Project not found')}
          </h2>
          <p>
            {t(
              'กรุณาเลือกโครงการที่มีอยู่ในระบบ',
              'Please select an existing project.'
            )}
          </p>
        </section>
      </div>
    )
  }

  const proposal = project.proposal || {}
  const overview = proposal.overview || {}

  const combined = {
    ...overview,
    ...proposal,
    ...project
  }

  const start = validDate(
    findField(combined, [
      'startDate',
      'projectStartDate',
      'researchStartDate'
    ])
  )

  const end = validDate(
    findField(combined, [
      'endDate',
      'projectEndDate',
      'researchEndDate'
    ])
  )

  const time = calculateTime(start, end)

  const budgetValue = findField(combined, [
    'budget',
    'totalBudget',
    'requestedBudget'
  ])

  const numericBudget = Number(
    String(budgetValue ?? '').replace(/,/g, '')
  )

  const budgetText = budgetValue == null
    ? '-'
    : Number.isFinite(numericBudget)
      ? numericBudget.toLocaleString('en-US') +
        ' ' + t('บาท', 'THB')
      : String(budgetValue)

  const history = Array.isArray(project.statusHistory)
    ? [...project.statusHistory].reverse()
    : []

  const currentStep = STEP_BY_STATUS[project.status] ?? 0

  const tabs = [
    ['overview', 'ภาพรวม', 'Overview'],
    ['plan', 'แผนการดำเนินงาน', 'Research Plan'],
    ['documents', 'เอกสารที่เกี่ยวข้อง', 'Documents'],
    ['history', 'ประวัติการดำเนินการ', 'History']
  ]

  const docUrl = documentUrl(project)

  const isSafeDocument =
    typeof docUrl === 'string' &&
    (
      docUrl.startsWith('https://') || docUrl.startsWith('/') ||
      docUrl.startsWith('blob:') ||
      docUrl.startsWith('data:application/pdf')
    )

  return (
    <div className="apd-page">

      {/* HEADER */}
      <div className="apd-header">
        <div>
          <button
            className="apd-back"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            {t('ย้อนกลับ', 'Back')}
          </button>

          <h1>{t('รายละเอียดโครงการที่ดำเนินการ', 'Active Project Detail')}</h1>

          <p>
            {t(
              'รายละเอียดและระยะเวลาดำเนินงานของโครงการวิจัย',
              'Research project details and timeline'
            )}
          </p>
        </div>

        <button
          className="apd-outline"
          onClick={() =>
            setProjects(getProjects())
          }
        >
          {t('อัปเดตข้อมูล', 'Refresh Data')}
        </button>
      </div>

      {role === 'staff' && onChangeRecord && <button className="primary" onClick={onChangeRecord} style={{ marginBottom: 20 }}>{t('บันทึกการเปลี่ยนแปลงโครงการ', 'Record project change')}</button>}
      {role === 'researcher' && onClosure && <button className="primary" onClick={onClosure} style={{ marginBottom:20 }}>{t('เตรียมข้อมูลปิดโครงการ', 'Prepare project closure')}</button>}
      {/* PROJECT INFORMATION */}
      <section className="apd-card apd-project-header">
        <div className="apd-project-badges">
          <span className="apd-id">
            {String(project.id).slice(0, 20)}
          </span>

          <span className="apd-status">
            {t(...(
              STATUS[project.status] ||
              ['ไม่ทราบสถานะ', 'Unknown']
            ))}
          </span>
        </div>

        <h2>
          {project.title ||
            t('ไม่ระบุชื่อโครงการ', 'Untitled Project')}
        </h2>

        <div className="apd-facts">
          <div>
            <small>{t('หัวหน้าโครงการ', 'Project Leader')}</small>
            <strong>{project.leader || '-'}</strong>
          </div>

          <div>
            <small>{t('ประเภททุน', 'Grant Type')}</small>
            <strong>
              {t('ทุนวิจัยส่วนตัว', 'Personal Research Grant')}
            </strong>
          </div>

          <div>
            <small>{t('งบประมาณ', 'Budget')}</small>
            <strong>{budgetText}</strong>
          </div>

          <div>
            <small>{t('วันเริ่มต้น', 'Start Date')}</small>
            <strong>{dateText(start, thai)}</strong>
          </div>

          <div>
            <small>{t('วันสิ้นสุด', 'End Date')}</small>
            <strong>{dateText(end, thai)}</strong>
          </div>
        </div>
      </section>

      {/* PROJECT STATUS TIMELINE */}
      <section className="apd-card">
        <h3>
          {t(
            'ลำดับสถานะโครงการ (9 ขั้นตอน)',
            'Project Status (9 Steps)'
          )}
        </h3>

        <div className="apd-steps-scroll">
          <div className="apd-steps">
            {STEPS.map((step, index) => {
              const state =
                project.status === 'revision_required' &&
                index === 3
                  ? 'revision'
                  : index < currentStep
                    ? 'done'
                    : index === currentStep
                      ? 'current'
                      : 'pending'

              return (
                <div className="apd-step" key={index}>
                  <span
                    className={`apd-step-number apd-${state}`}
                  >
                    {state === 'done'
                      ? <CheckCircle2 size={18} />
                      : index + 1}
                  </span>

                  <strong>
                    {t(step[0], step[1])}
                  </strong>
                </div>
              )
            })}
          </div>
        </div>

        <div className="apd-legend">
          <span>
            <i className="apd-dot apd-done" />
            {t('ดำเนินการแล้ว', 'Completed')}
          </span>

          <span>
            <i className="apd-dot apd-current" />
            {t('กำลังดำเนินการ', 'Current')}
          </span>

          <span>
            <i className="apd-dot apd-pending" />
            {t('รอดำเนินการ', 'Upcoming')}
          </span>

          <span>
            <i className="apd-dot apd-revision" />
            {t('มีประเด็นต้องแก้ไข', 'Needs Revision')}
          </span>
        </div>
      </section>

      {/* TABS */}
      <nav
        className="apd-tabs"
        aria-label="Project sections"
      >
        {tabs.map(([key, th, en]) => (
          <button
            key={key}
            className={
              tab === key ? 'apd-tab-active' : ''
            }
            onClick={() => setTab(key)}
          >
            {t(th, en)}
          </button>
        ))}
      </nav>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="apd-two-column">
          <section className="apd-card">
            <h3>
              {t(
                'ความคืบหน้าด้านระยะเวลา',
                'Time Progress'
              )}
            </h3>

            {time ? (
              <>
                <div className="apd-progress-row">
                  <strong>{time.percent}%</strong>
                  <span>
                    {t(
                      'ระยะเวลาที่ผ่านไป',
                      'Time elapsed'
                    )}
                  </span>
                </div>

                <div className="apd-progress-track">
                  <div
                    style={{
                      width: `${time.percent}%`
                    }}
                  />
                </div>

                <div className="apd-progress-info">
                  <div>
                    <CalendarDays size={18} />
                    <span>
                      {dateText(start, thai)}
                      {' – '}
                      {dateText(end, thai)}
                    </span>
                  </div>

                  <div>
                    <Clock3 size={18} />
                    <span>
                      {time.overdue
                        ? t(
                            'เลยกำหนดสิ้นสุดโครงการ',
                            'Project end date passed'
                          )
                        : `${t('เหลือ', 'Remaining')} ${time.daysRemaining} ${t('วัน', 'days')}`}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="apd-no-data">
                <AlertCircle size={22} />
                {t(
                  'ยังไม่มีวันที่เริ่มต้นและสิ้นสุดที่สามารถคำนวณได้',
                  'Project dates are not available for calculation.'
                )}
              </div>
            )}

            <div className="apd-notice">
              {t(
                'ตัวเลขนี้แสดงความคืบหน้าด้านเวลา ไม่ใช่เปอร์เซ็นต์ความสำเร็จของงานวิจัย',
                'This represents time elapsed, not research completion.'
              )}
            </div>
          </section>

          <section className="apd-card">
            <h3>
              {t('ข้อมูลการดำเนินงาน', 'Project Overview')}
            </h3>

            <div className="apd-info-list">
              <div>
                <span>
                  {t('สถานะปัจจุบัน', 'Current Status')}
                </span>
                <strong>
                  {t(...(
                    STATUS[project.status] ||
                    ['ไม่ทราบสถานะ', 'Unknown']
                  ))}
                </strong>
              </div>

              <div>
                <span>
                  {t('วันที่ยื่นข้อเสนอ', 'Submitted On')}
                </span>
                <strong>
                  {dateText(
                    validDate(project.createdAt),
                    thai
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {t('งบประมาณที่ขอ', 'Requested Budget')}
                </span>
                <strong>{budgetText}</strong>
              </div>

              <div>
                <span>
                  {t('บทบาทที่เข้าดู', 'Viewing As')}
                </span>
                <strong>
                  {role === 'staff'
                    ? t('เจ้าหน้าที่', 'Staff')
                    : t('นักวิจัย', 'Researcher')}
                </strong>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* RESEARCH PLAN */}
      {tab === 'plan' && (
        <section className="apd-card">
          <h3>
            {t(
              'แผนการดำเนินงานจากข้อเสนอ RS-1',
              'Research Plan from RS-1'
            )}
          </h3>

          <p className="apd-muted">
            {t(
              'แสดงข้อมูลแผนงานเมื่อมีการจัดเก็บเป็นข้อมูลโครงสร้างในระบบ',
              'Structured research activities will appear when available.'
            )}
          </p>

          <div className="apd-no-data">
            <FolderOpen size={22} />
            {t(
              'ยังไม่มีข้อมูลกิจกรรมที่แสดงได้ในรูปแบบตาราง',
              'No structured activity data available.'
            )}
          </div>
        </section>
      )}

      {/* DOCUMENTS */}
      {tab === 'documents' && <ResearchDocuments documents={project.documents || []}/>}
      {tab === 'documents' && (
        <section className="apd-card">
          <h3>
            {t('เอกสารที่เกี่ยวข้อง', 'Related Documents')}
          </h3>

          {isSafeDocument ? (
            <div className="apd-document">
              <FileText size={22} />
              <span>RS-1 Research Proposal (PDF)</span>

              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={16} />
                {t('เปิดเอกสาร', 'Open Document')}
              </a>
            </div>
          ) : (
            <div className="apd-no-data">
              <FileText size={22} />
              {t(
                'ยังไม่มีไฟล์เอกสารที่เปิดดูได้',
                'No document available.'
              )}
            </div>
          )}
        </section>
      )}

      {/* STATUS HISTORY */}
      {tab === 'history' && (
        <section className="apd-card">
          <h3>
            {t(
              'ประวัติการดำเนินการ',
              'Status History'
            )}
          </h3>

          {history.length ? (
            history.map((entry, index) => (
              <div
                className="apd-history-item"
                key={`${entry.updatedAt}-${index}`}
              >
                <History size={18} />

                <div>
                  <strong>
                    {t(...(
                      STATUS[entry.status] ||
                      ['อัปเดตสถานะ', 'Status Updated']
                    ))}
                  </strong>

                  <p>{entry.note || '-'}</p>

                  <small>
                    {entry.updatedBy || '-'}
                    {' · '}
                    {dateText(
                      validDate(entry.updatedAt),
                      thai
                    )}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className="apd-no-data">
              <History size={22} />
              {t(
                'ยังไม่มีประวัติการอัปเดตสถานะ',
                'No status history recorded.'
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
