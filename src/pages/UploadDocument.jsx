import { useFormDraft,useWorkingFile } from '../utils/useFormDraft'
import { DRAFT_KEY } from '../utils/projectStorage'

import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  FileUp,
  LoaderCircle,
  RefreshCw,
  UploadCloud,
  X
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker


const MAX_SIZE = 10 * 1024 * 1024
const MAX_LOCAL_ATTACHMENT_SIZE = 2 * 1024 * 1024

const previewFields = [
  ['projectTitle', 'ชื่อโครงการ', 'Project Title'],
  ['leaderName', 'หัวหน้าโครงการ', 'Project Leader'],
  ['leaderAffiliation', 'หน่วยงาน', 'Affiliation'],
  ['leaderPhone', 'โทรศัพท์', 'Telephone'],
  ['leaderEmail', 'อีเมล', 'Email'],
  ['advisorName', 'ที่ปรึกษาโครงการ', 'Project Advisor'],
  ['researchType', 'ประเภทงานวิจัย', 'Research Type'],
  ['keywords', 'คำสำคัญ', 'Keywords'],
  ['objectives', 'วัตถุประสงค์', 'Objectives']
]

const validateFile = (file) => {
  if (!file) {
    throw new Error('กรุณาเลือกไฟล์')
  }

  const extension = '.' + file.name.split('.').pop().toLowerCase()

  if (!['.pdf', '.docx'].includes(extension)) {
    throw new Error('รองรับเฉพาะไฟล์ PDF และ DOCX')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 10 MB')
  }

  if (file.size === 0) {
    throw new Error('ไฟล์ว่างเปล่า')
  }

  return extension
}

function findValue(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern)

    if (match?.[1]?.trim()) {
      return match[1].trim()
    }
  }

  return ''
}

// Extract preliminary RS-1 fields.
// Users must review the extracted information before saving.
function extractRS1Fields(text) {
  const normalized = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')

  const result = {
    projectTitle: findValue(normalized, [
      /(?:Project Title|ชื่อโครงการ)\s*[:：]\s*([^\n]+)/i
    ]),
    leaderName: findValue(normalized, [
      /(?:Project Leader|หัวหน้าโครงการ)\s*[:：]\s*([^\n]+)/i
    ]),
    leaderAffiliation: findValue(normalized, [
      /(?:Affiliation|สังกัด|หน่วยงาน)\s*[:：]\s*([^\n]+)/i
    ]),
    leaderPhone: findValue(normalized, [
      /(?:Telephone|Mobile|โทรศัพท์)\s*[:：]\s*([+\d()\-\s]+)/i
    ]),
    leaderEmail: findValue(normalized, [
      /(?:E-mail|Email|อีเมล)\s*[:：]\s*([^\s]+)/i
    ]),
    advisorName: findValue(normalized, [
      /(?:Project Advisor|ที่ปรึกษาโครงการ)\s*[:：]\s*([^\n]+)/i
    ]),
    researchType: findValue(normalized, [
      /(?:Type of the Research|ประเภทงานวิจัย)\s*[:：]\s*([^\n]+)/i
    ]),
    keywords: findValue(normalized, [
      /(?:Keywords of the Project|Keywords|คำสำคัญ)\s*[:：]\s*([^\n]+)/i
    ]),
    objectives: findValue(normalized, [
      /(?:Objectives of the Research Project|วัตถุประสงค์)\s*[:：]\s*([^\n]+)/i
    ])
  }

  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value)
  )
}

async function extractPDFText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())

  // Verify PDF signature before parsing.
  const signature = new TextDecoder('ascii').decode(bytes.slice(0, 5))

  if (signature !== '%PDF-') {
    throw new Error('ไฟล์ PDF ไม่ถูกต้อง')
  }

  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise

  try {
    const pages = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()

      let pageText = ''
      let previousY = null

      for (const item of content.items) {
        if (!('str' in item)) continue

        const y = item.transform?.[5]

        if (
          previousY !== null &&
          y !== undefined &&
          Math.abs(y - previousY) > 3
        ) {
          pageText += '\n'
        } else if (pageText) {
          pageText += ' '
        }

        pageText += item.str

        if (y !== undefined) {
          previousY = y
        }
      }

      pages.push(pageText)
    }

    return {
      text: pages.join('\n\n'),
      pageCount: pdf.numPages
    }
  } finally {
    await pdf.loadingTask.destroy().catch(() => {})
  }
}

async function extractDOCXText(file) {
  const arrayBuffer = await file.arrayBuffer()

  // Mammoth extracts text from DOCX documents.
  const result = await mammoth.extractRawText({ arrayBuffer })

  return {
    text: result.value || '',
    pageCount: 0
  }
}

async function extractDocumentText(file) {
  const extension = validateFile(file)

  if (extension === '.pdf') {
    return extractPDFText(file)
  }

  if (extension === '.docx') {
    return extractDOCXText(file)
  }

  throw new Error('ไม่รองรับไฟล์ประเภทนี้')
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('อ่านไฟล์แนบไม่สำเร็จ'))

    reader.readAsDataURL(file)
  })
}

export default function UploadDocument({ onBack, onEdit }) {
  const { i18n } = useTranslation()
  const isThai = i18n.language !== 'en'
  const t = (th, en) => isThai ? th : en

  const fileInputRef = useRef(null)

  const [file,setFile]=useWorkingFile('proposal-upload')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draft,setDraft,markSaved]=useFormDraft('proposal-upload',{rawText:'',extracted:{},pageCount:0,done:false})
  const {rawText,extracted,pageCount,done}=draft
  const setRawText=rawText=>setDraft(d=>({...d,rawText})),setPageCount=pageCount=>setDraft(d=>({...d,pageCount})),setDone=done=>setDraft(d=>({...d,done}))
  const setExtracted=change=>setDraft(d=>({...d,extracted:typeof change==='function'?change(d.extracted):change}))

  function reset() {
    setFile(null)
    markSaved({rawText:'',extracted:{},pageCount:0,done:false})
    setError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function readDocument(selectedFile) {
    if (!selectedFile) return

    reset()

    try {
      validateFile(selectedFile)
    } catch (err) {
      setError(err.message)
      return
    }

    setFile(selectedFile)
    setLoading(true)

    try {
      const result = await extractDocumentText(selectedFile)

      setRawText(result.text)
      setPageCount(result.pageCount)

      if (!result.text.trim()) {
        setError(t(
          'ไม่พบข้อความในเอกสาร กรุณาตรวจสอบไฟล์หรือกรอกข้อมูลด้วยตนเอง',
          'No readable text was found. Check the file or enter the information manually.'
        ))
        return
      }

      setExtracted(extractRS1Fields(result.text))
      setDone(true)
    } catch (err) {
      console.error(err)

      setError(
        err.message || t(
          'ไม่สามารถอ่านเอกสารได้',
          'Unable to read the document'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)

    const selectedFile = event.dataTransfer.files?.[0]

    if (selectedFile) {
      readDocument(selectedFile)
    }
  }

  function updateExtracted(key, value) {
    setExtracted(old => ({
      ...old,
      [key]: value
    }))
  }

  async function continueToForm() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(DRAFT_KEY) || '{}'
      )

      if (
        !saved ||
        typeof saved !== 'object' ||
        Array.isArray(saved)
      ) {
        throw new Error('Invalid existing draft')
      }

      const cleaned = Object.fromEntries(
        Object.entries(extracted).filter(([, value]) =>
          String(value).trim()
        )
      )

      let attachment = saved._document

      if (file) {
        const extension = validateFile(file)

        if (extension === '.pdf') {
          const signature = await file.slice(0, 5).text()

          if (signature !== '%PDF-') {
            throw new Error('Invalid PDF')
          }
        }

        if (extension === '.pdf' && file.size <= MAX_LOCAL_ATTACHMENT_SIZE) {
          attachment = {
            name: file.name,
            size: file.size,
            type: file.type || (
              extension === '.pdf'
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ),
            dataUrl: await fileToDataURL(file)
          }
        } else {
          // DOCX/large PDFs are extraction inputs; private Storage accepts PDFs <= 2 MB.
          attachment = undefined
        }
      }

      const merged = {
        ...saved,
        ...cleaned,
        _document: attachment,
        _importSource:file ? {name:file.name,size:file.size} : saved._importSource
      }

      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(merged)
      )

      markSaved({rawText:'',extracted:{},pageCount:0,done:false});setFile(null)
      onEdit()
    } catch (err) {
      console.error(err)

      setError(t(
        'ไม่สามารถบันทึกข้อมูลลงฟอร์มได้: '+err.message,
        'Unable to transfer the data to the form: '+err.message
      ))
    }
  }

  const foundCount = Object.values(extracted)
    .filter(value => String(value).trim()).length

  // ส่วนที่ 2 จะเริ่มที่ return (...)

  return (
    <div className="upload-page">
      <p className="cl-notice">
        {t(
          'นำเข้า PDF/DOCX ไม่เกิน 10 MB เพื่ออ่านข้อความ เอกสารที่ส่งจริงเป็น PDF ไม่เกิน 2 MB ต่อไฟล์ โดยระบบจะสร้าง RS-1 PDF จากแบบฟอร์มที่ตรวจสอบแล้ว',
          'Import PDF/DOCX up to 10 MB for text extraction. Submitted PDFs must be at most 2 MB; an RS-1 PDF is generated from the reviewed form.'
        )}
      </p>

      <button
        className="outline-button"
        type="button"
        onClick={continueToForm}
        disabled={loading}
      >
        {t(
          'กรอกข้อมูลด้วยตนเองต่อ',
          'Continue with editable manual fields'
        )}
      </button>

      <button
        className="upload-back"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        {t(
          'กลับไปเลือกวิธีสร้างข้อเสนอ',
          'Back to Submission Methods'
        )}
      </button>

      <div className="upload-heading">
        <span className="upload-eyebrow">
          RS-1 · Personal Research Grant
        </span>

        <h1>
          {t(
            'อัปโหลดเอกสารข้อเสนอโครงการ',
            'Upload Research Proposal'
          )}
        </h1>

        <p>
          {t(
            'อัปโหลดไฟล์ PDF หรือ DOCX เพื่ออ่านข้อมูลเบื้องต้น ตรวจสอบ และนำไปแก้ไขในแบบฟอร์ม RS-1',
            'Upload a PDF or DOCX to extract preliminary information, review it, and edit it in the RS-1 form.'
          )}
        </p>
      </div>

      <div className="upload-flow">
        <div className="upload-flow-step active">
          <span>1</span>
          {t('อัปโหลดไฟล์', 'Upload File')}
        </div>

        <div className="upload-flow-line" />

        <div className={`upload-flow-step ${done ? 'active' : ''}`}>
          <span>2</span>
          {t('ตรวจสอบข้อมูล', 'Review Data')}
        </div>

        <div className="upload-flow-line" />

        <div className="upload-flow-step">
          <span>3</span>
          {t('แก้ไขในฟอร์ม', 'Edit in Form')}
        </div>
      </div>

      <section className="upload-card">
        <div className="upload-card-title">
          <FileUp size={20} />

          <div>
            <h2>
              {t(
                'อัปโหลดเอกสาร RS-1',
                'Upload RS-1 Document'
              )}
            </h2>

            <p>
              {t(
                'รองรับไฟล์ PDF และ DOCX ขนาดไม่เกิน 10 MB',
                'PDF and DOCX files up to 10 MB'
              )}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hidden
          onChange={event => {
            const selectedFile = event.target.files?.[0]
            if (selectedFile) {
              readDocument(selectedFile)
            }
          }}
        />

        {!file && (
          <div
            className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={event => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={event => {
              event.preventDefault()
              setDragging(false)
            }}
            onDrop={handleDrop}
          >
            <div className="upload-big-icon">
              <UploadCloud size={32} />
            </div>

            <h3>
              {t(
                'ลากไฟล์ PDF หรือ DOCX มาวางที่นี่',
                'Drag and drop your PDF or DOCX here'
              )}
            </h3>

            <p>{t('หรือ', 'or')}</p>

            <button
              className="upload-primary"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={17} />
              {t(
                'เลือกไฟล์จากเครื่อง',
                'Browse Files'
              )}
            </button>

            <small>PDF, DOCX · Max 10 MB</small>
          </div>
        )}

        {file && (
          <div className="upload-selected">
            <div className="upload-file-icon">
              <FileText size={25} />
            </div>

            <div className="upload-file-details">
              <strong>{file.name}</strong>

              <span>
                {(file.size / 1024 / 1024).toFixed(2)} MB

                {pageCount > 0 &&
                  ` · ${pageCount} ${t('หน้า', 'pages')}`}
              </span>
            </div>

            <button
              type="button"
              className="upload-icon-button"
              disabled={loading}
              onClick={reset}
              title={t('ลบไฟล์', 'Remove File')}
            >
              <X size={19} />
            </button>
          </div>
        )}

        {loading && (
          <div className="upload-loading" role="status">
            <LoaderCircle
              size={21}
              className="upload-spinner"
            />

            {t(
              'กำลังอ่านข้อความจากเอกสาร...',
              'Reading text from the document...'
            )}
          </div>
        )}

        {error && (
          <div className="upload-error" role="alert">
            {error}
          </div>
        )}

        {file && !loading && (
          <button
            className="upload-secondary"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <RefreshCw size={16} />
            {t('เปลี่ยนไฟล์', 'Change File')}
          </button>
        )}
      </section>

      {done && (
        <section className="upload-card upload-result">
          <div className="upload-result-heading">
            <div>
              <div className="upload-result-status">
                <CheckCircle2 size={19} />
                {t(
                  'อ่านเอกสารเสร็จแล้ว',
                  'Document Read Successfully'
                )}
              </div>

              <h2>
                {t(
                  'ตรวจสอบข้อมูลที่สกัดได้',
                  'Review Extracted Data'
                )}
              </h2>

              <p>
                {t(
                  'ข้อมูลที่ตรวจพบอาจไม่ครบหรือคลาดเคลื่อน กรุณาตรวจสอบและแก้ไขก่อนนำเข้าฟอร์ม',
                  'Extracted data may be incomplete or inaccurate. Please review and edit before importing.'
                )}
              </p>
            </div>

            <span className="upload-count">
              {foundCount} / {previewFields.length}{' '}
              {t('ช่องที่พบข้อมูล', 'fields found')}
            </span>
          </div>

          <div className="upload-preview-grid">
            {previewFields.map(([key, thai, english]) => (
              <label
                className="upload-preview-field"
                key={key}
              >
                <span>{t(thai, english)}</span>

                {key === 'objectives' || key === 'keywords' ? (
                  <textarea
                    rows={3}
                    value={extracted[key] || ''}
                    placeholder={t(
                      'ไม่พบข้อมูล สามารถกรอกเองได้',
                      'Not found — you can enter it manually'
                    )}
                    onChange={event =>
                      updateExtracted(key, event.target.value)
                    }
                  />
                ) : (
                  <input
                    type="text"
                    value={extracted[key] || ''}
                    placeholder={t(
                      'ไม่พบข้อมูล สามารถกรอกเองได้',
                      'Not found — you can enter it manually'
                    )}
                    onChange={event =>
                      updateExtracted(key, event.target.value)
                    }
                  />
                )}
              </label>
            ))}
          </div>

          <details className="upload-raw-text">
            <summary>
              {t(
                'ดูข้อความทั้งหมดที่อ่านจากเอกสาร',
                'View All Extracted Document Text'
              )}
            </summary>

            <pre>{rawText}</pre>
          </details>

          <div className="upload-result-actions">
            <button
              type="button"
              className="upload-secondary"
              onClick={reset}
            >
              {t('เริ่มใหม่', 'Start Over')}
            </button>

            <button
              type="button"
              className="upload-primary"
              onClick={continueToForm}
            >
              {t(
                'นำข้อมูลไปแก้ไขในฟอร์ม RS-1',
                'Continue to RS-1 Form'
              )}

              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      <div className="upload-notice">
        <strong>
          {t('หมายเหตุ', 'Note')}
        </strong>

        <p>
          {t(
            'Prototype นี้อ่านข้อความจาก PDF และ DOCX และสกัดข้อมูล RS-1 บางช่องด้วยรูปแบบข้อความเบื้องต้น ไม่รองรับ OCR หรือการอ่านข้อมูลทุกหัวข้อโดยอัตโนมัติ กรุณาตรวจสอบข้อมูลก่อนบันทึก',
            'This prototype extracts text from PDF and DOCX and identifies selected RS-1 fields using basic text patterns. OCR and complete automatic extraction are not supported. Please review the information before saving.'
          )}
        </p>
      </div>
    </div>
  )
}
