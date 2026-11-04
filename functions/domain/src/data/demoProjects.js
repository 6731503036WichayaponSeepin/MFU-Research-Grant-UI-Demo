import { enrichDemoRegistry } from './demoRegistry.js'
import { workflow } from './statuses.js'
import { demoDocument } from './demoAttachment.js'
const titles = [
  ['การเรียนรู้วิทยาศาสตร์ผ่านสวนชุมชน', 'Science Learning through Community Gardens'],
  ['การอนุรักษ์ภูมิปัญญาผ้าทอเชียงราย', 'Preserving Chiang Rai Weaving Knowledge'],
  ['พฤติกรรมสุขภาพผู้สูงอายุในชุมชน', 'Community Older Adult Health Behaviors'],
  ['การจัดการน้ำเพื่อเกษตรยั่งยืน', 'Water Management for Sustainable Agriculture'],
  ['การท่องเที่ยวเชิงวัฒนธรรมบนพื้นที่สูง', 'Highland Cultural Tourism'],
  ['ระบบตรวจวัดคุณภาพอากาศต้นทุนต่ำ', 'Low Cost Air Quality Monitoring'],
  ['บรรจุภัณฑ์ชีวภาพจากวัสดุเหลือใช้', 'Biopackaging from Agricultural Residues'],
  ['ทักษะดิจิทัลของผู้ประกอบการชุมชน', 'Digital Skills of Community Entrepreneurs'],
  ['การเพิ่มมูลค่าชาสมุนไพรท้องถิ่น', 'Adding Value to Local Herbal Tea'],
  ['การเรียนรู้ภาษาไทยของนักศึกษานานาชาติ', 'Thai Language Learning for International Students'],
  ['การติดตามคุณภาพน้ำในลุ่มน้ำกก', 'Kok River Water Quality Monitoring'],
  ['การจัดการขยะอาหารในมหาวิทยาลัย', 'University Food Waste Management'],
  ['ความหลากหลายทางชีวภาพในสวนชา', 'Biodiversity in Tea Gardens'],
  ['สุขภาวะของนักศึกษามหาวิทยาลัย', 'University Student Wellbeing'],
  ['การลดการใช้พลาสติกในตลาดชุมชน', 'Reducing Plastic in Community Markets'],
  ['การพัฒนาสื่อเรียนรู้สำหรับเด็ก', 'Learning Media for Children'],
  ['การสื่อสารความเสี่ยงฝุ่นละออง', 'Particulate Air Pollution Risk Communication'],
  ['การจัดการพลังงานในอาคารเรียน', 'Energy Management in Academic Buildings']
]
const stages = ['draft','draft','unit_review','unit_review','eoffice_pending','admin_review','admin_review','admin_review','committee_review','committee_review','active','active','active','final_report','closure_review','completed','revision_required','closure_review']
const names = ['ดร. พิมพ์ชนก ใจดี', 'ดร. กิตติพงษ์ แสงคำ', 'ดร. สุธิดา วัฒนชัย', 'ดร. ณัฐพล ภูมิใจ']
export function createDemoProjects() {
  return titles.map(([title, titleEn], i) => {
    const status = stages[i], step = status === 'revision_required' ? 3 : workflow.findIndex(s => s[0] === status)
    const leader = names[i % names.length], createdAt = '2026-06-01T03:00:00.000Z'
    const statusHistory = workflow.slice(0, step + 1).map(([key], n) => ({ status: key, updatedAt: `2026-06-${String(2 + n * 3).padStart(2, '0')}T03:00:00.000Z`, updatedBy: 'Demo seed', note: 'ข้อมูลสมมติ / Fictional demonstration record' }))
    if ([6,16].includes(i)) statusHistory.push({ status:'revision_required', updatedAt:'2026-07-01T03:00:00.000Z', updatedBy:'Demo staff', note:'โปรดชี้แจงวิธีเลือกกลุ่มตัวอย่าง / Clarify sample selection' })
    if (i === 6) statusHistory.push({ status, updatedAt:'2026-07-05T03:00:00.000Z', updatedBy:'Demo researcher', note:'ส่งข้อมูลแก้ไข / Revision resubmitted' })
    const proposal = { projectTitle:title, projectTitleEn:titleEn, leaderName:leader, leaderAffiliation:'สำนักวิชาวิทยาศาสตร์ / School of Science', objectives:'ศึกษาปัญหาและพัฒนาแนวทางร่วมกับชุมชน (ข้อมูลสมมติ) / Study community needs (fictional).', methodology:'สำรวจและสัมภาษณ์โดยสมัครใจ วิเคราะห์ข้อมูลเชิงพรรณนา / Voluntary survey and descriptive analysis.', startDate:'2026-08-01', endDate:'2027-07-31', compensation:'30000', directCost:'40000', materials:'25000', utility:'5000', workPlan:'สำรวจ ออกแบบ ทดลอง และสรุปผล / Survey, design, pilot and report.' }
    const project = { id:`MFU-DEMO-${String(i+1).padStart(3,'0')}`, demoGenerated:true, ownerUsername:'demo-user', title, titleEn, leader, affiliation:proposal.leaderAffiliation, grantType:'RS-1 Personal Research Grant', fiscalYear:2569, budget:100000, status, createdAt, submittedAt:step ? '2026-06-05T03:00:00.000Z' : null, startDate:proposal.startDate, endDate:proposal.endDate, proposal, documents:[], statusHistory, reviewNotes:[], certification:null, committeeRecord:null }
    if (['final_report','closure_review','completed'].includes(status)) project.closure = { state:status==='completed'?'completed':i===17?'awaiting_review':status==='final_report'?'draft':'submitted', method:'report', submittedAt:status==='final_report'?null:'2026-10-01T03:00:00.000Z', revision:1, summary:'ข้อมูลสมมติสำหรับการสาธิต ไม่มีผลการวิจัยจริง / Fictional demonstration; no actual research findings.', finishedDate:'2026-09-30', documents:[], history:[], reviewer:i===17?'demo-user':null, check:i===17?{submitted:true,outcome:'complete',by:'Demo staff',date:'2026-10-01'}:null, closedAt:status==='completed'?'2026-10-01':null }
    if (project.closure && status !== 'completed') project.closure.documents = [{...demoDocument,kind:'report'}]
    if (i === 17) Object.assign(project.closure, {evaluationVersion:2,reviewers:['demo-user','demo-reviewer-2','demo-reviewer-3'],evaluations:{'demo-reviewer-3':{chapters:'ข้อมูลสมมุติ: ควรอธิบายวิธีวิเคราะห์ข้อมูลในบทที่ 3 ให้ชัดเจน',submitted:false}}})
    return enrichDemoRegistry(project)
  })
}

