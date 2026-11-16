import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {UploadCloud} from 'lucide-react'
import {validSignatureImage,MAX_SIGNATURE_BYTES,rs1Signers,signatureRecords,currentSignature} from '../utils/rs1Signatures'
import './SignatureImages.css'

export default function SignatureImages({data,onChange,editableFields,readOnly=false,showConsent=true}){
 const {i18n}=useTranslation(),th=i18n.language!=='en',text=(a,b)=>th?a:b,[error,setError]=useState('')
 const signers=rs1Signers(data),records=signatureRecords(data),locked=readOnly||!!editableFields&&!editableFields.includes('electronicSignatures')
 const roles={advisor:text('ที่ปรึกษาโครงการ','Project Advisor'),leader:text('หัวหน้าโครงการ','Project Leader'),participants:text('ผู้ร่วมวิจัย','Project Team Members')}
 const title=s=>roles[s.role]+(s.role==='participants'&&signers.filter(v=>v.role==='participants').length>1?' '+(Number(s.key.split('-')[1])+1):'')
 function update(s,patch){
  if(locked)return
  const old=currentSignature(data,s),next={signerKey:s.key,identity:s.identity,name:s.name,image:'',date:'',own:false,consent:false,documentId:data._projectId||data.signatureDocumentId||'',...old,...patch}
  onChange('electronicSignatures',[...records.filter(r=>r.signerKey!==s.key),next])
 }
 async function upload(s,file){
  if(!file)return
  try{
   if(!s.name.trim())throw Error(text('กรุณาระบุชื่อผู้ลงนามใน RS-1 ก่อน','Enter the signer name in RS-1 first.'))
   if(!['image/png','image/jpeg'].includes(file.type)||file.size>MAX_SIGNATURE_BYTES)throw Error(text('เลือก PNG/JPG ขนาดไม่เกิน 64 KB','Choose PNG/JPG up to 64 KB'))
   const image=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})
   if(!validSignatureImage(image))throw Error(text('ไฟล์ภาพไม่ถูกต้อง','Invalid image file'))
   await new Promise((resolve,reject)=>{const imageElement=new Image();imageElement.onload=resolve;imageElement.onerror=()=>reject(Error(text('ไม่สามารถอ่านภาพได้','Cannot decode image')));imageElement.src=image})
   update(s,{image,own:false,consent:false});setError('')
  }catch(e){setError(e.message)}
 }
 const applicable=signers.map(s=>currentSignature(data,s)).filter(Boolean),others=applicable.filter(r=>!r.own)
 const stale=records.filter(r=>!signers.some(s=>s.key===r.signerKey&&s.identity===r.identity))
 return <section className="rs1-signatures"><h4>{text('ลายเซ็นอิเล็กทรอนิกส์ (ไม่บังคับ)','Electronic signatures (optional)')}</h4><div className="rs1-signature-grid">{signers.map(s=>{const record=currentSignature(data,s),name=title(s);return <div className="rs1-signature" data-signer-key={s.key} key={s.key}><strong>{name}</strong><p className="signature-person">{s.name||text('ยังไม่ได้ระบุชื่อใน RS-1','Name not yet entered in RS-1')}</p>{record?.image?<img src={record.image} alt={text('ลายเซ็น','Signature')+' '+name}/>:<p className="shared-note">{text('เว้นช่องสำหรับลงนามด้วยตนเองใน PDF','Manual signature space retained in PDF')}</p>}{!readOnly&&<><label className="signature-upload"><UploadCloud size={24}/><span>{record?.image?text('เปลี่ยนภาพลายเซ็น','Replace signature image'):text('อัปโหลดภาพลายเซ็น','Upload signature image')}</span><small>PNG / JPG</small><input aria-label={(record?.image?text('เปลี่ยนภาพลายเซ็น','Replace signature image'):text('อัปโหลดภาพลายเซ็น','Upload signature image'))+' — '+name} type="file" accept="image/png,image/jpeg" disabled={locked||!s.name.trim()} onChange={e=>{upload(s,e.target.files[0]);e.target.value=''}}/></label>{record?.image&&<><label className="signature-date">{text('วันที่ลงนาม','Signing date')}<input aria-label={th?'วันที่ลงนาม — '+name:s.legacy?({advisor:'Advisor Signature Date',leader:'Leader Signature Date',team:'Team Signature Date'})[s.legacy]:'Signing date — '+name} type="date" value={record.date} disabled={locked} onChange={e=>update(s,{date:e.target.value,consent:false})}/></label><label className="signature-own"><input type="checkbox" checked={record.own} disabled={locked} onChange={e=>update(s,{own:e.target.checked,consent:false})}/>{text('เป็นลายเซ็นของฉัน','This is my own signature')}</label><button type="button" className="outline-button" disabled={locked} onClick={()=>onChange('electronicSignatures',records.filter(r=>r.signerKey!==s.key))}>{text('ลบภาพลายเซ็น','Remove signature image')} — {name}</button></>}</>}</div>})}</div>{showConsent&&others.length>0&&<label className="rs1-confirm"><input type="checkbox" checked={others.every(r=>r.consent)} disabled={locked} onChange={e=>onChange('electronicSignatures',records.map(r=>applicable.includes(r)&&!r.own?{...r,consent:e.target.checked}:r))}/>{text('ได้รับความยินยอมจากเจ้าของลายเซ็นของบุคคลอื่นทุกคนแล้ว','I obtained consent from all other signature owners')}</label>}{stale.length>0&&<p className="shared-note">{text('มีภาพที่ไม่ตรงกับรายชื่อปัจจุบัน ระบบจะไม่ใส่ภาพเหล่านั้นใน PDF','Some images do not match the current signers and will not appear in the PDF.')}{!readOnly&&<button type="button" className="text-button" disabled={locked} onClick={()=>onChange('electronicSignatures',records.filter(r=>!stale.includes(r)))}>{text('นำภาพที่ไม่ตรงกับรายชื่อออก','Remove unmatched images')}</button>}</p>}<p className="shared-note">{text('PNG/JPG ไม่เกิน 64 KB ต่อภาพ การอัปโหลดไม่ใช่การตรวจสอบตัวตนหรือความแท้จริงของลายเซ็น','PNG/JPG up to 64 KB per image. Uploading does not verify identity or signature authenticity.')}</p>{error&&<p role="alert">{error}</p>}</section>
}
