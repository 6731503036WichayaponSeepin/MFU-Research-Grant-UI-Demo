
import { FilePenLine, FileUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function ChooseSubmissionMethod({ onBack, onManual, onUpload }) {
  const { t } = useTranslation()

  return (
    <div className="choose-method-page">
      <button className="back-link" onClick={onBack}>
        ← {t('back')}
      </button>

      <div className="choose-heading">
        <span className="section-label">RS-1 · Personal Research Grant</span>
        <h1>{t('chooseMethod')}</h1>
        <p>{t('chooseDescription')}</p>
      </div>

      <div className="submission-method-grid">
        <article className="submission-method-card">
          <div className="submission-method-icon">
            <FilePenLine size={25} strokeWidth={1.8} />
          </div>
          <span className="method-type">MANUAL ENTRY</span>
          <h2>{t('manualEntry')}</h2>
          <p>{t('manualDescription')}</p>

          <div className="method-features">
            <span>✓ {t('manualFeature1')}</span>
            <span>✓ {t('manualFeature2')}</span>
            <span>✓ {t('manualFeature3')}</span>
          </div>

          <button className="primary method-action" onClick={onManual}>
            {t('startManual')} →
          </button>
        </article>

        <article className="submission-method-card">
          <div className="submission-method-icon">
            <FileUp size={25} strokeWidth={1.8} />
          </div>
          <span className="method-type">UPLOAD PDF</span>
          <h2>{t('uploadPDF')}</h2>
          <p>{t('uploadDescription')}</p>

          <div className="method-features">
            <span>✓ {t('uploadFeature1')}</span>
            <span>✓ {t('uploadFeature2')}</span>
            <span>✓ {t('uploadFeature3')}</span>
          </div>

          <button className="primary method-action" onClick={onUpload}>
            {t('startUpload')} →
          </button>
        </article>
      </div>

      <div className="method-notice">
        <strong>{t('methodNoticeTitle')}</strong>
        <p>{t('methodNoticeDescription')}</p>
      </div>
    </div>
  )
}

export default ChooseSubmissionMethod
