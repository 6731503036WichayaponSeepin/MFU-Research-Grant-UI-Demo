import { DRAFT_KEY } from './projectStorage.js'
export function readProposalDraft() {
  const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}')
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) throw new Error('อ่านร่างข้อเสนอไม่ได้ ข้อมูลเดิมยังคงอยู่ / Invalid proposal draft')
  return draft
}
export function writeProposalDraft(draft) {
  // Persist private Storage references, not hydrated copies of uploaded binaries.
  localStorage.setItem(DRAFT_KEY,JSON.stringify(draft,(_key,value)=>{
    if (value && typeof value === 'object' && value.storagePath) {
      const {dataUrl:bytes,...metadata}=value
      void bytes
      return metadata
    }
    return value
  }))
}
