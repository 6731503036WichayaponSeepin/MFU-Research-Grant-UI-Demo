import { useEffect, useState } from 'react'
import { Download, LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ProposalPDF({ proposal }) {
  const { i18n } = useTranslation()
  const th = i18n.language !== 'en'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [file,setFile] = useState(null)
  useEffect(()=>()=>{if(file)URL.revokeObjectURL(file.url)},[file])
  async function download() {
    setBusy(true); setError('')
    try {
      const { generateRS1PDF } = await import('../utils/generateRS1PDF')
      const { blob, filename } = await generateRS1PDF(proposal)
      const url = URL.createObjectURL(blob)
      setFile({url,filename})
    } catch {
      setError(th ? 'สร้าง PDF ไม่สำเร็จ กรุณาลองอีกครั้ง' : 'Unable to create PDF. Please retry.')
    } finally { setBusy(false) }
  }
  return <div><button type="button" className="outline-button" disabled={busy} onClick={download}>
    {busy ? <LoaderCircle size={17} className="spin" /> : <Download size={17} />}
    {busy ? (th ? 'กำลังสร้าง PDF…' : 'Creating PDF…') : (th ? 'สร้าง PDF จากข้อมูลล่าสุด' : 'Generate proposal PDF')}
  </button>{file && <div className="pdf-ready" role="status"><a href={file.url} download={file.filename}>{th?'ดาวน์โหลด PDF ที่สร้างแล้ว':'Download generated PDF'}</a></div>}{error && <p role="alert" className="submission-error">{error}</p>}</div>
}
