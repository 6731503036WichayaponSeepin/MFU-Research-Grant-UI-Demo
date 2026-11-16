import {budgetRows,budgetPatch,BUDGET_CATEGORIES} from '../utils/rs1Budget'
import {workTasks,workPlanPatch} from '../utils/rs1WorkPlan'
import './ResearcherManualEntry.css'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Save} from 'lucide-react'
import {useUnsavedChanges} from '../utils/useFormDraft'
import {getProjects,saveProposal} from '../utils/projectStorage'
import {readProposalDraft,writeProposalDraft} from '../utils/proposalDraft'
import {projectParticipants,participantPatch,PARTICIPANT_FIELDS,PARTICIPANT_LEGACY_KEYS} from '../utils/rs1Participants'
import {rs1DocumentFields} from '../data/rs1Document'
import RS1DocumentForm from '../components/RS1DocumentForm'

const allFields=rs1DocumentFields
const initial=Object.fromEntries(allFields.map(f=>[f.key,'']))
function loadDraft(workspace) {
  try {
    const saved = workspace ? workspace.read() : readProposalDraft()
    if (saved !== null && (typeof saved !== 'object' || Array.isArray(saved))) throw new Error('Invalid draft')
    return {...initial,...saved,_projectId:saved?._projectId || crypto.randomUUID()}
  } catch {
    return {...initial,_loadError:true}
  }
}

export default function ManualEntry({onBack,onConfirm,currentUser,onSaved,workspace}){
  const {i18n}=useTranslation(),th=i18n.language!=='en',label=(a,b)=>th?a:b
  const [review,setReview]=useState(false)
  const [data, setData] = useState(() => loadDraft(workspace))
  const savedProposal=workspace ? workspace.savedProposal || {} : getProjects().find(p=>p.id===data._projectId)?.proposal||{}
  const markSaved=useUnsavedChanges(data,{...initial,...savedProposal,_projectId:data._projectId})
  const [notice, setNotice] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [saving,setSaving] = useState(false)


  const setValue = (key, value) => {
    if (workspace?.editableFields && !workspace.editableFields.includes(key)) return
    const next = {...data,[key]:value,...(key==='electronicSignatures'?{signatureDocumentId:data._projectId}:{}),...(/SignatureImage$|SignDate$|Signature$|teamSignatureName/.test(key) ? {electronicSignatureConsent:''} : {})}
    if(['startDate','endDate'].includes(key)&&(!workspace?.editableFields||workspace.editableFields.includes('workTasks'))&&(Array.isArray(data.workTasks)||workTasks(data).length))Object.assign(next,workPlanPatch(next,workTasks(data)))
    const budgetField=key.match(/^(compensation|directCost|materials|utility)(Item|Amount)([1-3])$/)
    if(budgetField){const rows=budgetRows(data,budgetField[1]).map(row=>({...row}));while(rows.length<Number(budgetField[3]))rows.push({description:'',amount:''});rows[Number(budgetField[3])-1][budgetField[2]==='Item'?'description':'amount']=value;Object.assign(next,budgetPatch(data,budgetField[1],rows))}
    const itemAmount=key.match(/^(compensation|directCost|materials|utility)Amount[1-3]$/)
    if(itemAmount&&!budgetField)next[itemAmount[1]]=String([1,2,3].reduce((sum,n)=>sum+(Number(next[itemAmount[1]+'Amount'+n])||0),0))
    if(PARTICIPANT_LEGACY_KEYS.includes(key)){const rows=projectParticipants(data).map(row=>({...row}));if(!rows.length)rows.push({});rows[0][PARTICIPANT_FIELDS[PARTICIPANT_LEGACY_KEYS.indexOf(key)]]=value;Object.assign(next,participantPatch(rows))}
    setData(next); setConfirmed(false); setNotice('')
    try { if (!data._loadError) (workspace ? workspace.write(next) : writeProposalDraft(next)) }
    catch { setNotice(label('บันทึกอัตโนมัติไม่ได้ โปรดตรวจสอบพื้นที่จัดเก็บ', 'Autosave failed. Check browser storage before leaving.')) }
  }

  function setParticipants(rows){
    if(workspace?.editableFields&&!workspace.editableFields.includes('participantRecords'))return
    const next={...data,...participantPatch(rows)};setData(next);setConfirmed(false)
    try{(workspace?workspace.write(next):writeProposalDraft(next))}catch{setNotice(label('บันทึกอัตโนมัติไม่ได้','Autosave failed'))}
  }
  function setBudget(category,rows){
    if(!BUDGET_CATEGORIES.includes(category)||workspace?.editableFields&&!workspace.editableFields.includes('budgetItems'))return
    const next={...data,...budgetPatch(data,category,rows)};setData(next);setConfirmed(false)
    try{(workspace?workspace.write(next):writeProposalDraft(next))}catch{setNotice(label('บันทึกอัตโนมัติไม่ได้','Autosave failed'))}
  }
  function setWorkPlan(rows){
    if(workspace?.editableFields&&!workspace.editableFields.includes('workTasks'))return
    const next={...data,...workPlanPatch(data,rows)};setData(next);setConfirmed(false)
    try{(workspace?workspace.write(next):writeProposalDraft(next))}catch{setNotice(label('บันทึกอัตโนมัติไม่ได้','Autosave failed'))}
  }
  async function save(redirect=true) {
    if (data._loadError) { setNotice(label('อ่านร่างเดิมไม่ได้ ข้อมูลเดิมยังคงอยู่', 'Cannot read the existing draft. Original data is preserved.')); return false }
    if (saving) return false
    setSaving(true)
    try {
      const project = await (workspace ? workspace.save(data) : saveProposal(data, currentUser))
      const saved = {...data,...project.proposal,_projectId:project.id}
      if (workspace) workspace.write(saved)
      else writeProposalDraft(saved)
      setData(saved); markSaved(saved)
      if(redirect!==false)onSaved?.(project)
    } catch (error) { setNotice(label('บันทึกร่างไม่สำเร็จ: ', 'Unable to save draft: ')+error.message); return false }
    finally { setSaving(false) }
    setNotice(label(
      'บันทึกร่างเรียบร้อยแล้ว',
      'Draft saved successfully'
    ))
    return true
  }

  return <div className="rs1-page rs1-continuous">
    {data._loadError&&<p role="alert">{label('อ่านร่างเดิมไม่ได้ กรุณาตรวจสอบข้อมูลที่จัดเก็บ','Existing draft cannot be read. Check browser storage.')}</p>}
    <div className="rs1-heading"><div className="heading-actions"><button className="outline-button" disabled={saving} onClick={save}><Save size={16}/>{label('บันทึกร่าง','Save Draft')}</button></div></div>
    <section className="rs1-form-panel"><RS1DocumentForm data={data} onChange={setValue} onParticipants={setParticipants} onBudget={setBudget} onWorkPlan={setWorkPlan} editableFields={workspace?.editableFields} readOnly={review}/></section>
    {review&&<label className="rs1-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>{label('ฉันได้ตรวจสอบข้อมูลแล้ว','I have reviewed the information')}</label>}
    {notice&&<div className="rs1-message" role="status">{notice}</div>}
    <div className="rs1-footer"><p className="rm-action-context">{workspace?.editableFields?label('ตรวจทานฉบับแก้ไขก่อนจัดทำ PDF','Review your corrections before preparing the PDF'):label('บันทึกร่างหรือทบทวนข้อเสนอเพื่อจัดทำ PDF','Save your draft or review the proposal to prepare its PDF')}</p>
    {review&&<button className="outline-button" onClick={()=>setReview(false)}>← {label('กลับไปแก้ไข','Return to Edit')}</button>}{!workspace&&!review&&<button className="outline-button" onClick={onBack}>← {label('ย้อนกลับ','Back')}</button>}
    <div className="rs1-footer-right"><button className="outline-button" disabled={saving} onClick={save}>{label('บันทึกร่าง','Save Draft')}</button>{review?<button type="button" className="primary" disabled={!confirmed||saving} onClick={async()=>{if(await save(false))onConfirm(data._projectId)}}>{label('ยืนยันการตรวจสอบ','Confirm Review')}</button>:<button className="primary" onClick={()=>{setReview(true);window.scrollTo({top:0,behavior:'smooth'})}}>{label('ตรวจสอบข้อมูล','Review')} →</button>}</div></div>
  </div>
}
