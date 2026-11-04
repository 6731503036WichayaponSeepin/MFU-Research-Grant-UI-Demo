export const registryFields = [
  ['coResearchers', 'ผู้ร่วมวิจัย'], ['period', 'ระยะเวลา'], ['publication', 'การเผยแพร่'],
  ['evaluator', 'ผู้ประเมิน'], ['expert', 'ผู้ทรงฯ'], ['firstAssessment', 'ประเมิน ครั้งที่ 1'],
  ['firstResult', 'ผลประเมิน ครั้งที่ 1'], ['expertNomination', 'เสนอชื่อผู้ทรงคุณวุฒิอ่านรายงาน'], ['notes', 'หมายเหตุ']
]
export const closureSteps = [
  ['letter', 'นำส่งหนังสือผู้ทรงฯ + แบบฟอร์ม'],
  ['received', 'ได้รับเอกสารจากผู้ทรงฯ'],
  ['revision', 'ส่งเอกสารกลับให้นักวิจัยแก้ไขตามความเห็นผู้ทรงฯ'],
  ['endorsed', 'ผู้ทรงฯ รับรองรายงานฉบับแก้ไข'],
  ['resubmitted', 'นักวิจัยนำส่งรายงานฉบับแก้ไข + หนังสือนำส่ง'],
  ['payment', 'เบิกจ่ายค่าตอบแทนผู้ทรงฯ']
]
export const stepStatuses = ['ยังไม่ได้ดำเนินการ', 'อยู่ระหว่างดำเนินการ', 'ดำเนินการแล้วเสร็จ']
export const assessmentStatuses = ['ยังไม่ได้ดำเนินการ', 'อยู่ระหว่างดำเนินการ', 'เสร็จสิ้นกระบวนการ', 'ยกเลิก/ลาออก']
export function registryValues(project) {
  return {
    coResearchers: '', period: [project.startDate, project.endDate].filter(Boolean).join(' – '),
    publication: project.closure?.publication || '', evaluator: '', expert: '', firstAssessment: '', firstResult: '', expertNomination: '', notes: '',
    assessmentStatus: assessmentStatuses[0], finalReport: false,
    ...project.registry,
    steps: Object.fromEntries(closureSteps.map(([key]) => [key, project.registry?.steps?.[key] || stepStatuses[0]]))
  }
}
