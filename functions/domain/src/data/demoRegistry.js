// Fill only fictional demo records. Existing values, false flags and tracking steps are preserved.
export function enrichDemoRegistry(project) {
  if ((!project.demoGenerated && !project.demoScenario) || project.registrySampleVersion === 1) return project
  const number = Number(String(project.id).match(/\d+$/)?.[0] || 1)
  const names = ['ดร. วรินทร์ แสงแก้ว', 'ดร. ณิชา พงศ์ไพศาล', 'ดร. ธนกร เมืองเหนือ']
  const closed = project.status === 'completed'
  const reviewing = Boolean(project.closure?.submittedAt)
  const evaluated = closed || Boolean(project.closure?.evaluation?.submitted)
  const sample = {
    coResearchers: `${names[number % 3]}\nอ. กานต์พิชชา สุขใจ`,
    period: '1 ส.ค. 2569 – 31 ก.ค. 2570 (12 เดือน)',
    publication: closed ? 'บทความวิจัยในวารสารชุมชนศึกษา ปีที่ 12 ฉบับที่ 2 (วารสารสมมุติ)' : 'แผนเผยแพร่: การประชุมวิชาการวิจัยเพื่อชุมชน พ.ศ. 2570 (งานสมมุติ)',
    evaluator: `ผู้ประสานการประเมิน: ${names[(number + 1) % 3]}`,
    expert: `รศ. ดร. ปาริชาติ วิจิตรศึกษา (บุคคลสมมุติ)`,
    firstAssessment: evaluated ? '15 ต.ค. 2569 · แบบประเมิน DEMO-' + number : reviewing ? 'กำหนดส่งผลประเมิน 30 ต.ค. 2569' : 'ยังไม่ถึงขั้นประเมินรายงาน',
    firstResult: evaluated ? 'ผ่านการประเมิน · รับรองรายงานฉบับสมบูรณ์' : reviewing ? 'อยู่ระหว่างรอผลจากผู้ทรงคุณวุฒิ' : 'รอยื่นรายงานเพื่อประเมิน',
    expertNomination: reviewing || closed ? 'เสนอชื่อแล้ว · หนังสือสมมุติ อว DEMO/' + String(number).padStart(3, '0') : 'รายชื่อเบื้องต้น: รศ. ดร. ปาริชาติ วิจิตรศึกษา · ยังไม่ส่งหนังสือ',
    notes: closed ? 'ข้อมูลสมมุติ: จัดเก็บรายงานและเอกสารปิดโครงการในแฟ้มเรียบร้อย' : 'ข้อมูลสมมุติ: เจ้าหน้าที่ติดตามเอกสารทุกวันศุกร์ และบันทึกความคืบหน้าในทะเบียน',
    assessmentStatus: closed ? 'เสร็จสิ้นกระบวนการ' : reviewing ? 'อยู่ระหว่างดำเนินการ' : 'ยังไม่ได้ดำเนินการ',
    finalReport: closed,
    steps: Object.fromEntries(['letter','received','revision','endorsed','resubmitted','payment'].map((key, i) => [key, closed ? 'ดำเนินการแล้วเสร็จ' : project.closure?.state === 'awaiting_review' && i === 0 ? 'ดำเนินการแล้วเสร็จ' : 'ยังไม่ได้ดำเนินการ']))
  }
  if (project.startDate || project.endDate) sample.period = [project.startDate, project.endDate].filter(Boolean).map(date => new Date(date + 'T12:00:00').toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })).join(' – ')
  const registry = { ...sample, ...project.registry, steps: { ...sample.steps, ...project.registry?.steps } }
  for (const key of ['coResearchers','period','publication','evaluator','expert','firstAssessment','firstResult','expertNomination','notes']) {
    if (!registry[key]?.trim()) registry[key] = sample[key]
  }
  return { ...project, registry, registrySampleVersion: 1 }
}
