// Fictional display identities only; UIDs, permissions and scenario IDs stay unchanged.
export const demoNames = Object.freeze({
  'demo-user': 'ดร. ณัฐวุฒิ วัฒนกุล', 'demo-staff': 'กมลชนก ศรีวิจิตร',
  'demo-reviewer-1': 'รศ. ดร. ปาริชาติ สุขเกษม', 'demo-reviewer-2': 'ผศ. ดร. ธนกฤต วงศ์วิริยะ',
  'demo-reviewer-3': 'รศ. ดร. อรพรรณ จันทร์แก้ว', 'demo-other-researcher': 'ดร. พิมพ์ชนก อินทร์ประเสริฐ',
  'fixture-setup': 'ผู้จัดเตรียมข้อมูลสมมติ',
})
const ids = ['DRAFT','AFFILIATION','STAFF','COMMITTEE','ACTIVE','CANCELLED','CLOSURE','EVALUATION-0','EVALUATION-1','EVALUATION-2','EVALUATION-3','RELEASED','CLOSED-REPORT','CLOSED-PUBLICATION','CORRECTION','PUBLICATION-ACTIVE','OTHER-OWNER','CLOSURE-MORE','PUBLICATION-REVIEW','FINAL-VERIFY','EVALUATION-DRAFT','REPORT-ASSIGN']
const topics = [
 ['การพัฒนาบรรจุภัณฑ์ย่อยสลายได้จากกากกาแฟอาราบิกา','Biodegradable Packaging from Arabica Coffee Waste','วิทยาศาสตร์'],
 ['รูปแบบการเรียนรู้ภาษาอังกฤษผ่านเรื่องเล่าชุมชนเชียงราย','Community Storytelling for English Learning in Chiang Rai','ศิลปศาสตร์'],
 ['การประเมินคุณภาพน้ำในลุ่มน้ำกกด้วยเซนเซอร์ต้นทุนต่ำ','Low-cost Sensor Assessment of Kok River Water Quality','เทคโนโลยีสารสนเทศ'],
 ['การส่งเสริมความรอบรู้ด้านสุขภาพของผู้สูงอายุในชุมชนเมือง','Health Literacy among Older Adults in Urban Communities','วิทยาศาสตร์สุขภาพ'],
 ['ระบบวิเคราะห์โรคใบชาเพื่อสนับสนุนเกษตรกรรายย่อย','Tea Leaf Disease Analysis for Smallholder Farmers','เทคโนโลยีสารสนเทศ'],
 ['ปัจจัยการคงอยู่ของบุคลากรในธุรกิจท่องเที่ยวชุมชน','Staff Retention in Community Tourism Enterprises','การจัดการ'],
 ['การใช้สมุนไพรพื้นถิ่นเพื่อพัฒนาผลิตภัณฑ์ดูแลผิว','Local Herbs for Skin-care Product Development','วิทยาศาสตร์เครื่องสำอาง'],
 ['แนวทางลดขยะอาหารในโรงอาหารมหาวิทยาลัย','Food Waste Reduction in University Canteens','วิทยาศาสตร์'],
 ['การพัฒนาทักษะดิจิทัลสำหรับผู้ประกอบการชุมชน','Digital Skills for Community Entrepreneurs','การจัดการ'],
 ['การออกแบบพื้นที่เรียนรู้ที่ส่งเสริมสุขภาวะนักศึกษา','Learning Spaces for Student Well-being','ศิลปศาสตร์'],
 ['การจัดการต้นทุนโลจิสติกส์ของเกษตรกรบนพื้นที่สูง','Logistics Cost Management for Highland Farmers','การจัดการ'],
 ['การฟื้นฟูดินเสื่อมโทรมด้วยวัสดุชีวภาพจากชุมชน','Community Biomaterials for Degraded Soil Restoration','วิทยาศาสตร์'],
 ['แนวทางป้องกันภาวะหมดไฟในนักศึกษาวิทยาศาสตร์สุขภาพ','Burnout Prevention among Health Science Students','วิทยาศาสตร์สุขภาพ'],
 ['องค์ความรู้ผ้าทอพื้นเมืองกับการออกแบบผลิตภัณฑ์ร่วมสมัย','Traditional Weaving Knowledge and Contemporary Product Design','ศิลปศาสตร์'],
 ['การประเมินคาร์บอนฟุตพริ้นท์ของกาแฟชุมชน','Carbon Footprint Assessment of Community Coffee','วิทยาศาสตร์'],
 ['พฤติกรรมการออมของนักศึกษาผ่านสื่อการเรียนรู้ทางการเงิน','Student Saving Behaviour and Financial Learning Media','การจัดการ'],
 ['การพัฒนาสื่อการเรียนรู้พหุภาษาสำหรับเด็กปฐมวัย','Multilingual Learning Media for Young Children','ศิลปศาสตร์'],
 ['การติดตามคุณภาพอากาศในห้องเรียนด้วยเครือข่ายเซนเซอร์','Classroom Air Quality Monitoring with Sensor Networks','เทคโนโลยีสารสนเทศ'],
 ['สารต้านอนุมูลอิสระจากผลไม้ท้องถิ่นเพื่ออาหารสุขภาพ','Local Fruit Antioxidants for Healthy Foods','วิทยาศาสตร์'],
 ['แนวทางพัฒนาการท่องเที่ยวเชิงสุขภาพในจังหวัดเชียงราย','Wellness Tourism Development in Chiang Rai','การจัดการ'],
 ['การอนุรักษ์ความหลากหลายพืชสมุนไพรในป่าชุมชน','Medicinal Plant Diversity in Community Forests','วิทยาศาสตร์'],
 ['การพัฒนาฐานข้อมูลภูมิปัญญาชุมชนเพื่อการเรียนรู้ตลอดชีวิต','Community Wisdom Database for Lifelong Learning','เทคโนโลยีสารสนเทศ'],
]
export const demoDocumentNames = Object.freeze({signed_rs1:'ข้อเสนอโครงการ_RS-1_ลงนามครบ',affiliation_evidence:'หนังสือรับรองความเห็นชอบจากต้นสังกัด',proposal_pdf:'ข้อเสนอโครงการ_RS-1',rs1_source:'ต้นฉบับข้อเสนอโครงการ_RS-1',report:'รายงานวิจัยฉบับสมบูรณ์_5บท',revised_report:'รายงานวิจัยฉบับแก้ไข',summary_report:'รายงานสรุปผลการวิจัย',publication:'บทความวิจัยและหลักฐานการเผยแพร่',feedback:'ข้อเสนอแนะจากผู้ทรงคุณวุฒิ',support:'เอกสารประกอบการวิจัย'})
export const demoReference = id => { const index=ids.indexOf(String(id || '').replace(/^V16-/, '')); return index < 0 ? '' : `MFU-RG-2569-${String(index+1).padStart(3,'0')}` }
export function refineDemoProject(p) {
  const index = ids.indexOf(p.id.replace(/^V16-/, ''))
  if (index < 0) return p
  const [title, titleEn, school] = topics[index], reference = `MFU-RG-2569-${String(index + 1).padStart(3,'0')}`
  const info = {projectTitle:title, projectTitleEn:titleEn, leaderName:demoNames[p.ownerUid] || demoNames['demo-user'], leaderAffiliation:`สำนักวิชา${school} มหาวิทยาลัยแม่ฟ้าหลวง`, leaderEmail:'nattawut.research@example.org',leaderPhone:'053-000-000',leaderPercent:100,
    keywords:title.split(' ').join(', '),background:`โครงการนี้ศึกษาประเด็น ${title} เพื่อพัฒนาองค์ความรู้ที่นำไปใช้ประโยชน์ในพื้นที่จังหวัดเชียงราย`,objectives:`1. ศึกษาสภาพปัญหาและความต้องการที่เกี่ยวข้องกับ${title}\n2. พัฒนาและประเมินแนวทางที่เหมาะสมกับบริบทชุมชน`,methodology:'ทบทวนเอกสาร ออกแบบเครื่องมือ เก็บข้อมูลภาคสนาม วิเคราะห์ข้อมูล และตรวจสอบผลร่วมกับผู้เกี่ยวข้อง',scope:'พื้นที่จังหวัดเชียงราย โดยใช้ข้อมูลที่ได้รับความยินยอมตามกระบวนการวิจัย',workPlan:'เดือน 1–2 ทบทวนเอกสารและเตรียมเครื่องมือ; เดือน 3–7 เก็บข้อมูล; เดือน 8–10 วิเคราะห์และสรุปผล',outcomeDetail:'บทความวิจัยและข้อเสนอแนวทางใช้ประโยชน์ในชุมชน',
    compensation:20000 + index*1000,directCost:25000,materials:15000,utility:5000}
  Object.assign(p.proposal,info)
  for(const v of p.proposalVersions) Object.assign(v.proposal,info)
  Object.assign(p,{referenceNumber:reference,title,titleEn,leader:info.leaderName,affiliation:info.leaderAffiliation,budget:info.compensation+45000,demoDisplayVersion:1})
  for(const d of p.documents) d.name=`${demoDocumentNames[d.kind] || 'เอกสารการวิจัย'}_${reference}_v${d.version}.pdf`
  for(const event of p.statusHistory) {
    const doc=p.documents.find(d=>d.id===event.details?.document?.id)
    if(doc) event.details.document.name=doc.name
  }
  if(p.closure) {
    p.closure.summary=`ผลการศึกษาเรื่อง${title} พร้อมข้อเสนอแนะเพื่อการนำไปใช้ประโยชน์`
    for(const submission of p.closure.submissions || []) if(submission.summary) submission.summary=p.closure.summary
    for(const e of Object.values(p.closure.evaluations || {})) {
      const data=e.answers || e
      if(data.chapters) data.chapters='ควรเชื่อมโยงผลการวิเคราะห์กับวัตถุประสงค์ให้ชัดเจน และเพิ่มเติมข้อจำกัดของการศึกษาในบทสรุป'
    }
  }
  return p
}
