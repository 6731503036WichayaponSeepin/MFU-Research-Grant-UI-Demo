import { documentLabel, actorName } from '../utils/researchDisplay'
import { useTranslation } from 'react-i18next'
import DocumentPreview from '../components/DocumentPreview'
import { Feedback } from '../components/SharedFeedback'
import { permittedDocuments, realPdfUrl } from '../utils/commonWorkspace'

export default function ProjectDocuments({ project, currentUser, query = {}, onNavigate }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en', text = (a, b) => th ? a : b
  const staffView = currentUser.role === 'staff'
  const documents = permittedDocuments(project, currentUser)
  const selected = documents.find((d, i) => String(d.id || i) === query.document)
  const date = value => Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(th ? 'th-TH' : 'en-GB', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(new Date(value)) : '—'
  return <section className={"panel shared-card"+(staffView?" staff-documents":"")}>{!staffView && <h2>{text('คลังเอกสารโครงการ', 'Project document library')}</h2>}<p className="shared-note">{text('แสดงเฉพาะไฟล์ที่มีสิทธิ์ การเปิดและดาวน์โหลดไม่เปลี่ยนสถานะโครงการ', 'Only permitted files are listed. Preview and download do not change the project state.')}</p>{!documents.length ? <Feedback title={text('ยังไม่มีเอกสารที่เข้าถึงได้', 'No accessible documents')} /> : <div className="shared-table-wrap"><table className="shared-table"><thead><tr>{[text('ประเภท / ไฟล์', 'Type / file'), text('เวอร์ชัน', 'Version'), text('วันที่อัปโหลด', 'Uploaded date'), text('ผู้อัปโหลด', 'Uploaded by'), text('เปิดไฟล์', 'Open file')].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{documents.map((d, i) => <tr key={d.id || i}><td><small>{documentLabel(d.kind, i18n.language)}</small><strong>{d.name}</strong></td><td>{d.version || '—'}</td><td>{date(d.uploadedAt || d.date)}</td><td>{staffView ? actorName(d.uploadedBy) : d.uploadedBy || '—'}</td><td>{realPdfUrl(d) ? <a href={onNavigate.href('documents', project.id, { document: d.id || String(i) })}>{text('ดู PDF', 'Preview PDF')}</a> : <span>{text('ไฟล์ยังไม่พร้อมใช้งาน', 'File unavailable')}</span>}</td></tr>)}</tbody></table></div>}{selected && (realPdfUrl(selected) ? <div className="shared-document-preview"><h3>{selected.name}</h3><DocumentPreview key={selected.id} url={realPdfUrl(selected)} filename={selected.name} title={selected.name} /></div> : <Feedback kind="error" title={text('ไฟล์ไม่พร้อมใช้งาน', 'File unavailable')} onRetry={() => window.location.reload()} />)}{query.document && !selected && <Feedback kind="error" title={text('ไม่พบเอกสารหรือไม่มีสิทธิ์เข้าถึง', 'Document not found or access denied')} />}</section>
}
