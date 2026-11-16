import {projectParticipants,PARTICIPANT_FIELDS} from './rs1Participants.js'
// Transport limits, not a stakeholder file policy. Images belong to this proposal version only.
export const SIGNATURE_IMAGE_KEYS = ['advisorSignatureImage','leaderSignatureImage','teamSignatureImage']
export const MAX_SIGNATURE_BYTES = 64 * 1024
export function validSignatureImage(value) {
  if (typeof value !== 'string') return false
  const match = value.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/)
  if (!match) return false
  try {
    const bytes = atob(match[2])
    return bytes.length > 0 && bytes.length <= MAX_SIGNATURE_BYTES && (match[1] === 'png' ? bytes.startsWith('\x89PNG\r\n\x1a\n') : bytes.startsWith('\xff\xd8\xff'))
  } catch { return false }
}
function validImageDate(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z')))return false
  return new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value
}
export function rs1Signers(data={}) {
  const people=projectParticipants(data)
  const signers=[{key:'advisor',role:'advisor',name:data.advisorName||'',legacy:'advisor'},{key:'leader',role:'leader',name:data.leaderName||'',legacy:'leader'},...(people.length?people.map((person,index)=>({key:'participant-'+index,role:'participants',name:person.name||'',identity:JSON.stringify(PARTICIPANT_FIELDS.map(key=>person[key]??'')),legacy:people.length===1?'team':null})): [{key:'team',role:'participants',name:'',legacy:'team'}])]
  return signers.map(s=>({...s,identity:s.identity||JSON.stringify([s.role,s.name])}))
}
export function signatureRecords(data={}) {
  if(Array.isArray(data.electronicSignatures))return data.electronicSignatures
  return rs1Signers(data).filter(s=>s.legacy&&data[s.legacy+'SignatureImage']).map(s=>{const storedName=data[s.legacy==='team'?'teamSignatureName':s.legacy+'Signature']||'';return {signerKey:s.key,identity:storedName&&s.name&&storedName!==s.name?'legacy-unmatched:'+storedName:s.identity,name:storedName||s.name,image:data[s.legacy+'SignatureImage'],date:data[s.legacy+'SignDate']||'',own:false,consent:data.electronicSignatureConsent==='confirmed',documentId:data._projectId||data.signatureDocumentId||''}})
}
export function currentSignature(data,signer){return signatureRecords(data).find(r=>r.signerKey===signer.key&&r.identity===signer.identity)}
export function signatureErrors(data = {}, consent = true) {
  const errors = []
  if(data.electronicSignatures!==undefined){
    if(!Array.isArray(data.electronicSignatures)||new Set(data.electronicSignatures.map(r=>r?.signerKey)).size!==data.electronicSignatures.length)return [{field:'electronicSignatures',message:'ข้อมูลลายเซ็นไม่ถูกต้อง',messageEn:'Invalid signature records.'}]
    for(const record of data.electronicSignatures){
      const signer=rs1Signers(data).find(s=>s.key===record?.signerKey)
      const valid=record&&typeof record==='object'&&Object.keys(record).every(key=>['signerKey','identity','name','image','date','own','consent','documentId'].includes(key))&&validSignatureImage(record.image)&&typeof record.identity==='string'&&record.identity.length<=600000&&typeof record.name==='string'&&record.name.length<=100000&&typeof record.date==='string'&&typeof record.documentId==='string'&&typeof record.own==='boolean'&&typeof record.consent==='boolean'&&/^(advisor|leader|team|participant-\d+)$/.test(record.signerKey)
      if(!valid){errors.push({field:'electronicSignatures',message:'ภาพหรือข้อมูลลายเซ็นไม่ถูกต้อง',messageEn:'Invalid image or signature metadata.'});continue}
      if(consent&&(signer&&signer.identity===record.identity&&signer.name!==record.name||!record.name.trim()||!validImageDate(record.date)||record.documentId!==data.signatureDocumentId))errors.push({field:'electronicSignatures',message:'โปรดตรวจชื่อผู้ลงนาม วันที่ และเอกสารที่อ้างอิง',messageEn:'Check signer identity, signing date and document reference.'})
      if(consent&&record.own!==true&&record.consent!==true)errors.push({field:'electronicSignatures',message:'ต้องยืนยันความยินยอมจากเจ้าของลายเซ็นของบุคคลอื่น',messageEn:'Consent from the other signature owner is required.'})
    }
    return errors
  }
  for (const key of SIGNATURE_IMAGE_KEYS) {
    if (!data[key]) continue
    if (!validSignatureImage(data[key])) errors.push({field:key,message:'ภาพลายเซ็นต้องเป็น PNG/JPG ที่ถูกต้อง ขนาดไม่เกิน 64 KB',messageEn:'Use a valid PNG/JPG signature image up to 64 KB.'})
    const prefix = key.replace('SignatureImage','')
    const name = prefix === 'team' ? data.teamSignatureName : data[prefix+'Signature']
    if (consent && (typeof name !== 'string' || !name.trim() || !validImageDate(data[prefix+'SignDate']))) errors.push({field:key,message:'กรุณาระบุชื่อผู้ลงนามและวันที่สำหรับภาพลายเซ็น',messageEn:'Enter the signatory name and date for each signature image.'})
  }
  if (consent && SIGNATURE_IMAGE_KEYS.some(key=>data[key]) && data.electronicSignatureConsent !== 'confirmed') errors.push({field:'electronicSignatureConsent',message:'ต้องยืนยันว่าได้รับความยินยอมจากเจ้าของลายเซ็นอิเล็กทรอนิกส์',messageEn:'Confirm consent from the electronic signature owners.'})
  return errors
}
