import { readProposalDraft } from '../utils/proposalDraft'
import { statusLabel } from '../data/statuses'
import ProposalPDF from '../components/ProposalPDF'
import { submitResearchProposal } from '../utils/proposalSubmission'
import { proposalFieldErrors } from '../utils/proposalValidation'

import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Download,
  UserRound,
  Wallet
} from 'lucide-react'



function readDraft() {
  try {
    const data = readProposalDraft()
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid draft')
    return {...data,_projectId:data._projectId || crypto.randomUUID()}
  } catch {
    return {_loadError:true}
  }
}

export default function SubmissionConfirmation({
  currentUser,
  onBack,
  onProjects
}) {
  const { i18n } = useTranslation()
  const th = i18n.language !== 'en'
  const t = (thai, english) => th ? thai : english

  const [draft] = useState(readDraft)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result,setResult] = useState(null)
  const [error, setError] = useState('')
  const [validationErrors,setValidationErrors] = useState([])
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)

  const budget = [
    'compensation',
    'directCost',
    'materials',
    'utility'
  ].reduce(
    (sum, key) => sum + (Number(draft[key]) || 0),
    0
  )

  async function submitProposal() {
    if (!agreed || submitted || submitting.current) return
    const missing = proposalFieldErrors(draft)
    if (draft._loadError) { setError(t('อ่านร่างข้อเสนอไม่ได้ กรุณากลับไปตรวจสอบแบบฟอร์ม','Unable to read the draft. Return to the form.')); return }
    if (missing.length) { setValidationErrors(missing); setError(''); return }
    submitting.current = true
    setBusy(true)
    setError('')
    setValidationErrors([])
    try {
      const saved = await submitResearchProposal(draft,currentUser)
      setResult(saved)
      setSubmitted(true)
    } catch (err) {
      setValidationErrors(err.fieldErrors || [])
      setError(err.fieldErrors?.length ? '' : t('ส่งข้อเสนอไม่สำเร็จ: ','Submission failed: ') + err.message)
    } finally { submitting.current = false; setBusy(false) }
  }

  return (
    <div className="submission-page">

      {!submitted ? (
        <>
          <button
            type="button"
            className="submission-back"
            onClick={onBack}
            disabled={busy}
          >
            <ArrowLeft size={17} />
            {t('กลับไปแก้ไขข้อมูล', 'Back to Edit')}
          </button>

          <div className="submission-heading">
            <div className="submission-heading-icon">
              <ClipboardCheck size={29} />
            </div>

            <span className="submission-eyebrow">
              RS-1 · Personal Research Grant
            </span>

            <h1>
              {t(
                'ยืนยันการยื่นข้อเสนอโครงการ',
                'Confirm Proposal Submission'
              )}
            </h1>

            <p>
              {t(
                'ตรวจสอบข้อมูลสรุปและเอกสารก่อนยืนยัน',
                'Review your proposal and document before submitting.'
              )}
            </p>
          </div>

          {/* ===== Project Summary ===== */}
          <section className="submission-card">
            <div className="submission-card-header">
              <FileText size={19} />
              <h2>
                {t(
                  'สรุปข้อเสนอโครงการ',
                  'Proposal Summary'
                )}
              </h2>
            </div>

            <div className="submission-detail">
              <span>{t('ชื่อโครงการ', 'Project Title')}</span>
              <strong>{draft.projectTitle || '-'}</strong>
            </div>

            <div className="submission-detail">
              <span>
                <UserRound size={15} />
                {t('หัวหน้าโครงการ', 'Project Leader')}
              </span>
              <strong>{draft.leaderName || '-'}</strong>
            </div>

            <div className="submission-detail">
              <span>{t('ประเภททุน', 'Grant Type')}</span>
              <strong>Personal Research Grant (RS-1)</strong>
            </div>

            <div className="submission-detail">
              <span>
                <Wallet size={15} />
                {t('งบประมาณรวม', 'Total Budget')}
              </span>
              <strong>{budget.toLocaleString()} THB</strong>
            </div>
          </section>

          {/* ===== Proposal PDF document ===== */}
          <section className="submission-card">
            <div className="submission-card-header">
              <FileText size={19} />
              <h2>
                {t(
                  'เอกสารข้อเสนอโครงการ',
                  'Research Proposal Document'
                )}
              </h2>
            </div>

            <div className="submission-document-file">
              <div className="submission-document-file-icon">
                <FileText size={26} />
              </div>

              <div className="submission-document-file-info">
                <strong>{draft._document?.name || t('PDF RS-1 จะสร้างจากแบบฟอร์มเมื่อยืนยันส่ง', 'RS-1 PDF will be generated when you submit')}</strong>
                <span>
                  {t(
                    'ระบบจะสร้าง PDF จากแบบฟอร์มที่ตรวจสอบแล้วและเก็บไว้ในเบราว์เซอร์นี้ (PDF ไม่เกิน 2 MB ต่อไฟล์)',
                    'The reviewed form generates a PDF saved in this browser (up to 2 MB per PDF).'
                  )}
                </span>
              </div>

              {draft._document?.dataUrl && <a
                href={draft._document.dataUrl}
                download="RS-1-Research-Proposal.pdf"
                className="submission-primary"
              >
                <Download size={17} />
                {t('ดาวน์โหลด PDF', 'Download PDF')}
              </a>}
            </div>
          </section>

          <ProposalPDF proposal={draft} />
          {/* ===== Confirmation ===== */}
          <section className="submission-card">
            <div className="submission-card-header">
              <CheckCircle2 size={19} />
              <h2>
                {t(
                  'ยืนยันข้อมูลก่อนยื่นข้อเสนอ',
                  'Confirm Proposal Information'
                )}
              </h2>
            </div>

            <label className="submission-agreement">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <span>
                {t(
                  'ฉันได้ตรวจสอบข้อมูลและเอกสารข้อเสนอโครงการเรียบร้อยแล้ว',
                  'I have reviewed the proposal information and document.'
                )}
              </span>
            </label>
          </section>

          <p className="submission-note">
            {t(
              'เมื่อจำลองส่งสำเร็จ ข้อเสนอจะถูกเก็บในเบราว์เซอร์นี้และแสดงในบทบาทเจ้าหน้าที่ โดยเริ่มที่ขั้นตอนรอส่วนงานต้นสังกัดพิจารณา',
              'After simulated submission, the proposal is saved in this browser and visible in the staff role, beginning with affiliated-unit review.'
            )}
          </p>

          {validationErrors.length > 0 && <section className="submission-error" role="alert"><strong>{t('กรุณาแก้ไขข้อมูลต่อไปนี้ก่อนส่งข้อเสนอ','Correct the following fields before submission')}</strong><ul>{validationErrors.map((item,index)=><li key={item.field+index}>{th ? item.message : item.messageEn || item.message}</li>)}</ul></section>}
          {error && (
            <p className="submission-error" role="alert">
              {error}
            </p>
          )}

          {/* ===== Buttons ===== */}
          <div className="submission-actions">
            <button
              type="button"
              className="submission-outline"
              onClick={onBack}
            >
              <ArrowLeft size={17} />
              {t('กลับไปแก้ไข', 'Back to Edit')}
            </button>

            <button
              type="button"
              className="submission-primary"
              disabled={!agreed || busy}
              onClick={submitProposal}
            >
              {busy ? t('กำลังสร้าง PDF และยื่นข้อเสนอ…','Generating PDF and submitting…') : t(
                'ยืนยันการยื่นข้อเสนอ',
                'Confirm Submission'
              )}
              <ArrowRight size={17} />
            </button>
          </div>
        </>
      ) : (
        /* ===== Success Page ===== */
        <div className="submission-success">
          <div className="submission-success-icon">
            <CheckCircle2 size={43} />
          </div>

          <h1>
            {t(
              'ยื่นข้อเสนอสำเร็จ',
              'Proposal Submitted'
            )}
          </h1>

          <p>
            {t(
              'จำลองยื่นข้อเสนอสำเร็จ ข้อมูลและเอกสารเก็บไว้ในเบราว์เซอร์นี้ เปลี่ยนเป็นบทบาทเจ้าหน้าที่เพื่อดูโครงการได้',
              'The demo proposal and documents were saved in this browser. Switch to staff to view this project.'
            )}
          </p>

          <div className="submission-success-summary">
            <span>{t('รหัสโครงการ','Project ID')}</span><strong>{result?.id}</strong><span>{t('พื้นที่งาน','Workspace')}</span><strong>{currentUser.workspace || 'MFU Demo'}</strong>
            <span>{t('ชื่อโครงการ', 'Project Title')}</span>
            <strong>{draft.projectTitle || '-'}</strong>

            <span>{t('สถานะ', 'Status')}</span>
            <strong>
              {statusLabel(result?.status,i18n.language)}
            </strong>
          </div>

          <button
            type="button"
            className="submission-primary"
            onClick={onProjects}
          >
            {t('ไปยัง My Projects', 'Go to My Projects')}
            <ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  )
}
