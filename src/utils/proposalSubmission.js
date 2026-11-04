import { saveProposal } from './projectStorage.js'
import { writeProposalDraft } from './proposalDraft.js'
import { assertProposalValid, proposalDocumentErrors } from './proposalValidation.js'

async function createRS1Document(draft) {
  const { generateRS1PDF } = await import('./generateRS1PDF')
  const {blob,filename} = await generateRS1PDF(draft)
  const dataUrl = await new Promise((resolve,reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('อ่านไฟล์ PDF ที่สร้างไม่สำเร็จ / Unable to read generated PDF'))
    reader.readAsDataURL(blob)
  })
  return {name:filename,size:blob.size,dataUrl,generated:true}
}

// Validate before generating/uploading. Keep one ID through network errors/retries;
// only an acknowledged server record can produce a successful submission.
export async function submitResearchProposal(draft,user,{
  createDocument = createRS1Document,
  persist = saveProposal,
  remember = writeProposalDraft,
} = {}) {
  assertProposalValid(draft)
  const source = draft._document?.generated ? draft._sourceDocument : draft._document || draft._sourceDocument
  const sourceErrors = proposalDocumentErrors(source,{field:'_sourceDocument',required:false})
  if (sourceErrors.length) throw Object.assign(new Error(sourceErrors.map(error=>error.message).join('\n')),{fieldErrors:sourceErrors})
  const prepared = {...draft,_projectId:draft._projectId || crypto.randomUUID()}
  remember(prepared)
  prepared._sourceDocument = source
  prepared._document = await createDocument(prepared)
  assertProposalValid(prepared,{documents:true})
  const saved = await persist(prepared,user,true)
  if (saved?.id !== prepared._projectId || !saved.submittedAt || ['draft','revision_required'].includes(saved.status)) {
    throw new Error('บันทึกข้อเสนอไม่สำเร็จ กรุณาตรวจสอบรายการโครงการก่อนลองอีกครั้ง / Save was not acknowledged by the local or backend adapter')
  }
  return saved
}
