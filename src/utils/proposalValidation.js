export const MAX_PROPOSAL_PDF_SIZE = 2 * 1024 * 1024
const textFields = [
  ['projectTitle','ชื่อโครงการ','Project title'],
  ['leaderName','ชื่อหัวหน้าโครงการ / นักวิจัย','Researcher name'],
  ['objectives','วัตถุประสงค์ของโครงการ','Objectives'],
  ['methodology','วิธีดำเนินการวิจัย','Methodology'],
]
const budgetFields = [
  ['compensation','ค่าตอบแทน','Compensation'],['directCost','ค่าใช้สอย','Direct cost'],
  ['materials','ค่าวัสดุ','Materials'],['utility','ค่าสาธารณูปโภค','Utilities'],
]
export function validProposalDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10) === value
}
export function proposalFieldErrors(data = {}) {
  const errors = [], add = (field,message,messageEn) => errors.push({field,message,messageEn})
  for (const [key,th,en] of textFields) if (typeof data[key] !== 'string' || !data[key].trim()) add(key,`กรุณาระบุ${th}`,`Enter ${en.toLowerCase()}.`)
  for (const [key,th,en] of [['startDate','วันที่เริ่มโครงการ','start date'],['endDate','วันที่สิ้นสุดโครงการ','end date']]) {
    if (!validProposalDate(data[key])) add(key,`กรุณาระบุ${th}ให้ถูกต้อง`,`Enter a valid ${en}.`)
  }
  if (validProposalDate(data.startDate) && validProposalDate(data.endDate) && data.endDate <= data.startDate) add('endDate','วันที่สิ้นสุดโครงการต้องอยู่หลังวันที่เริ่มโครงการ','End date must be after start date.')
  let total = 0
  for (const [key,th,en] of budgetFields) {
    const raw = data[key] ?? ''
    const amount = Number(raw)
    if (!['number','string'].includes(typeof raw) || !Number.isFinite(amount) || amount < 0) add(key,`${th}ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป`,`${en} must be a nonnegative number.`)
    else total += amount
  }
  if (!Number.isFinite(total) || total <= 0) add('budget','งบประมาณรวมต้องมากกว่า 0 บาท','Total budget must be greater than zero.')
  return errors
}
export function proposalDocumentErrors(document, {mode = 'local',field = '_document',required = true} = {}) {
  const errors = [], label = field === '_sourceDocument' ? 'เอกสารต้นฉบับ' : 'เอกสารข้อเสนอโครงการ RS-1'
  const add = (message,messageEn) => errors.push({field,message:`${label}: ${message}`,messageEn})
  if (!document) {
    if (required) add('กรุณาแนบไฟล์ PDF หรือสร้าง PDF จากแบบฟอร์ม','Attach a proposal PDF or generate it from the RS-1 form.')
    return errors
  }
  if (typeof document.name !== 'string' || !/\.pdf$/i.test(document.name) || document.name.length > 200) add('ชื่อไฟล์ต้องลงท้าย .pdf และยาวไม่เกิน 200 ตัวอักษร','Use a PDF filename of at most 200 characters.')
  if (!Number.isInteger(document.size) || document.size <= 0 || document.size > MAX_PROPOSAL_PDF_SIZE) add('ไฟล์ PDF ต้องมีขนาดมากกว่า 0 และไม่เกิน 2 MB','PDF must be nonempty and no larger than 2 MB.')
  if (mode === 'storage' || document.storagePath) {
    if (typeof document.storagePath !== 'string' || !/^workspaces\/[A-Za-z0-9_-]+\/projects\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(document.storagePath) || typeof document.id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(document.id) || document.contentType !== 'application/pdf') add('ข้อมูลอ้างอิงไฟล์ใน Storage ไม่ครบถ้วนหรือไม่ถูกต้อง','Invalid Storage path, upload ticket or PDF content type.')
  } else {
    try {
      if (typeof document.dataUrl !== 'string' || document.dataUrl.length > 3 * 1024 * 1024 || !document.dataUrl.startsWith('data:application/pdf;base64,')) throw new Error('Invalid PDF')
      const bytes = atob(document.dataUrl.slice('data:application/pdf;base64,'.length))
      if (!bytes.startsWith('%PDF-') || bytes.length !== document.size) throw new Error('Invalid PDF')
    } catch { add('ไฟล์ PDF ไม่ถูกต้อง หรือขนาดไฟล์ไม่ตรงกับข้อมูล','Invalid PDF content or mismatched file size.') }
  }
  return errors
}
export function assertProposalValid(data, {documents = false,mode = 'local'} = {}) {
  const errors = proposalFieldErrors(data)
  if (documents) {
    errors.push(...proposalDocumentErrors(data._document,{mode}))
    errors.push(...proposalDocumentErrors(data._sourceDocument,{mode,field:'_sourceDocument',required:false}))
  }
  if (errors.length) throw Object.assign(new Error(errors.map(error=>error.message).join('\n')),{code:'proposal/validation',status:400,fieldErrors:errors})
}
