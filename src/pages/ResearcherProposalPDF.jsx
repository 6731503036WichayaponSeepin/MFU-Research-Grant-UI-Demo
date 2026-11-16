import { projectReference, displayDate } from '../utils/researchDisplay'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmationModal } from '../components/SharedFeedback'
import DocumentPreview from '../components/DocumentPreview'
import { proposalFieldErrors } from '../utils/proposalValidation'
import { pdfAttachment } from '../utils/researcherWorkspace'
import { requiredSignatories } from '../domain/model'
import { realPdfUrl } from '../utils/commonWorkspace'
import { hasCapability } from '../domain/permissions'

export default function ResearcherProposalPDF({ project: p, currentUser, commit, go, local }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en', text = (a, b) => th ? a : b
  const [versionId, setVersion] = useState(p.proposalVersions.at(-1)?.id), [file, setFile] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirm, setConfirm] = useState(false)
  const [reviewedVersion,setReviewedVersion]=useState(null)
  const reviewKey=p.id+':'+versionId
  const reviewed=reviewedVersion===reviewKey
  const version = p.proposalVersions.find(v => v.id === versionId), latest = p.proposalVersions.at(-1)
  const errors = proposalFieldErrors(version?.proposal), attached = p.documents.findLast(d => d.kind === 'proposal_pdf' && d.proposalVersionId === latest?.id)
  async function generate() {
    setBusy(true); setError('')
    try { const { generateRS1PDF } = await import('../utils/generateRS1PDF'); const result = await generateRS1PDF(version.proposal); const doc = await pdfAttachment(new File([result.blob], `RS1-${projectReference(p)}-v${version.version}.pdf`, { type: 'application/pdf' }), 'proposal_pdf', p.documents.filter(d => d.kind === 'proposal_pdf').length + 1, version.id); setFile(doc) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function savePdf() { setBusy(true); setError(''); try { await commit(p, 'attach_document', { document: file }); setFile(null) } catch (e) { setError(e.message) } finally { setBusy(false) } }
  async function ready() {
    if(!reviewed || busy || !local || p.status!=='DRAFT' || versionId!==latest?.id)return
    setBusy(true);setError('')
    try {
      let next=p, document=attached
      if(!document){
        if(file?.proposalVersionId===latest.id)document=file
        else {
          const {generateRS1PDF}=await import('../utils/generateRS1PDF')
          const result=await generateRS1PDF(version.proposal)
          document=await pdfAttachment(new File([result.blob],`RS1-${projectReference(p)}-v${version.version}.pdf`,{type:'application/pdf'}),'proposal_pdf',p.documents.filter(d=>d.kind==='proposal_pdf').length+1,version.id)
        }
        next=await commit(next,'attach_document',{document});setFile(null)
      }
      next=await commit(next,'confirm_ready',{documentId:document.id,confirmed:true})
      go('details',next.id,{},true)
    }catch(e){setError(e.message)}finally{setBusy(false);setConfirm(false)}
  }

  return <section className="panel shared-card"><h2>{text('PDF และเตรียมยื่นต้นสังกัด', 'PDF & Affiliation Preparation')}</h2><p>{text('Preview / Generate / Download ไม่เปลี่ยน State; สถานะรอต้นสังกัดพิจารณาไม่ยืนยันว่าต้นสังกัดได้รับเอกสารแล้ว', 'Preview / Generate / Download do not change state. Awaiting affiliation review does not prove receipt by the affiliation.')}</p><label>{text('เวอร์ชันข้อเสนอ', 'Proposal Version')}<select value={versionId} onChange={e => { setVersion(e.target.value); setFile(null); setReviewedVersion(null) }}>{p.proposalVersions.map(v => <option key={v.id} value={v.id}>v{v.version} · {v.kind === 'ready' ? text('พร้อมยื่น','Ready') : text('ข้อเสนอ','Proposal')} · {displayDate(v.createdAt, i18n.language, true)}</option>)}</select></label><h3>{text('ข้อมูลที่ยังไม่ครบ (แก้ไขเพิ่มเติมภายหลังได้)', 'Incomplete information (can be completed later)')}</h3>{errors.length ? <ul>{errors.map(e => <li key={e.field}>{th ? e.message : e.messageEn}</li>)}</ul> : <p>{text('ข้อมูลผ่าน Validation ที่ใช้ใน Demo', 'Demo validation passed')}</p>}<h3>{text('ส่วนลงนามที่เกี่ยวข้อง', 'Required signatories')}</h3><ul>{requiredSignatories(version?.proposal || {}).map((s, i) => <li key={i}>{s.role} · {s.name || s.description}</li>)}</ul><div className="shared-actions"><button className="outline-button" disabled={busy || !version} onClick={generate}>{text('สร้าง Preview PDF', 'Generate PDF Preview')}</button>{file && <button className="outline-button" disabled={busy || !hasCapability(p, currentUser, 'upload') || version.id !== latest.id} onClick={savePdf}>{text('เก็บ PDF เวอร์ชันล่าสุดในคลังเอกสาร', 'Save latest PDF to library')}</button>}</div>{file && <DocumentPreview url={realPdfUrl(file)} filename={file.name} />}{attached && !file && <><p>{text('PDF ล่าสุดที่จัดเก็บ', 'Latest stored PDF')}: {attached.name} · v{attached.version}</p><a href={go.href('documents', p.id, { document: attached.id })}>{text('เปิด PDF จริง', 'Open stored PDF')}</a></>}{local && p.status==='DRAFT' && <label className="rs1-confirm"><input type="checkbox" checked={reviewed} disabled={busy || versionId!==latest?.id} onChange={e=>setReviewedVersion(e.target.checked?reviewKey:null)}/>{text('ฉันตรวจสอบข้อมูลแล้ว และยืนยันว่าข้อมูลที่กรอกถูกต้อง','I have reviewed the entered information and confirm it is correct')}</label>}<p className="shared-note">{text('Local Demo: ยืนยันได้แม้ข้อมูลยังไม่ครบ ระบบจะสร้างและเก็บ PDF เวอร์ชันล่าสุดให้อัตโนมัติ ก่อนยื่นข้อเสนอถึงเจ้าหน้าที่ต้องผ่านการตรวจข้อมูลและเอกสารตามเดิม','Local Demo: incomplete information does not block this step. The latest PDF is generated and saved automatically. Submission to Staff still requires the existing data and document checks.')}</p><div className="shared-actions"><button className="primary" disabled={busy || !local || p.status !== 'DRAFT' || !reviewed || versionId !== latest?.id} onClick={() => setConfirm(true)}>{text('ยืนยันเอกสารพร้อมยื่นต้นสังกัด', 'Confirm Ready for Affiliation')}</button>{p.status === 'AFFILIATION_REVIEW' && <a href={go.href('submission', p.id)}>{text('แนบเอกสารลงนามและส่งข้อเสนอ', 'Signed Proposal Submission')} →</a>}</div><p className="shared-note">{local ? text('Temporary Local Demo Design: OPEN-04 ยังไม่ใช่ Stakeholder CONFIRMED', 'Temporary Local Demo Design: OPEN-04 is not Stakeholder CONFIRMED') : text('TR-03 ยังปิดใน Firebase: OPEN-04', 'Firebase TR-03 remains disabled: OPEN-04')}</p>{busy && <p role="status">{text('กำลังดำเนินการ…', 'Working…')}</p>}{error && <p role="alert">{error}</p>}{confirm && <ConfirmationModal title={text('ยืนยันเอกสารพร้อมยื่นต้นสังกัด?', 'Confirm Ready for Affiliation?')} onCancel={() => setConfirm(false)} onConfirm={ready}>{text('ใช้ PDF ล่าสุดของเวอร์ชันนี้ บันทึก Actor และ Timestamp แล้วเปลี่ยนจากร่างเป็นรอต้นสังกัดพิจารณา เฉพาะ Local Demo', 'Use this latest PDF, record actor/time and transition from draft to affiliation review in Local Demo only.')}</ConfirmationModal>}</section>
}
