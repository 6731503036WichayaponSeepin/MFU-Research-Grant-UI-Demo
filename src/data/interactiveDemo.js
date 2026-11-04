import { createDemoProjects } from './demoProjects.js'
import { demoDocument } from './demoAttachment.js'
export function createInteractiveDemo() {
  const originals=createDemoProjects()
  const indexes=[0,10,14,15,11,5,17]
  const labels=['พึ่งเริ่มยื่นข้อเสนอ','กำลังดำเนินการวิจัย','ยื่นเอกสารขอปิดโครงการ','ปิดโครงการแล้ว','ขอแก้ไขข้อมูลหลังได้รับการรับรอง','ตรวจข้อเสนอและเอกสาร','โครงการรอประเมิน']
  const projects=indexes.map((index,i)=>{
    const p=structuredClone(originals[index])
    p.reviewerScenario=i===3||i===6;p.scenario=labels[i];p.ownerUsername='demo-user';p.documentUrl=demoDocument.dataUrl;p.documentName='RS-1-ตัวอย่าง.pdf'
    Object.assign(p.proposal,{researchType:'การวิจัยประยุกต์',keywords:'ชุมชน, เชียงราย, การพัฒนาที่ยั่งยืน',background:'ชุมชนในจังหวัดเชียงรายต้องการแนวทางที่ใช้ทรัพยากรในท้องถิ่นอย่างคุ้มค่า โครงการสมมตินี้ศึกษาปัจจัยและทดลองแนวทางร่วมกับเครือข่ายชุมชน',literature:'ทบทวนกรอบการวิจัยแบบมีส่วนร่วมและแนวคิดการพัฒนาที่ยั่งยืน เพื่อกำหนดตัวชี้วัดและวางแผนเก็บข้อมูล',scope:'พื้นที่ตัวอย่างสมมติ 3 ชุมชนในจังหวัดเชียงราย กลุ่มตัวอย่างอาสาสมัคร 60 คน',outcomeDetail:'คู่มือชุมชน 1 ฉบับ ชุดข้อมูลนิรนาม และบทความวิชาการ 1 เรื่อง',_document:{...demoDocument},_projectId:p.id})
    if(i===1||i===4)p.certification={certified:true,date:'2026-07-20',reference:'MFU-DEMO/2569',by:'demo-staff'}
    if(i===4)p.correction={state:'pending',reason:'ขอปรับรายละเอียดวิธีเก็บข้อมูลให้ชัดเจน โดยไม่เปลี่ยนวัตถุประสงค์หรืองบประมาณ',requestedAt:'2026-10-20T03:00:00Z'}
    if(i===2||i===3||i===6){
      const evaluation={objectives:0,consistency:0,abstract:0,executive:0,result:0,chapters:'รายงานครบถ้วน วิธีวิเคราะห์ชัดเจน ควรเพิ่มข้อจำกัดของกลุ่มตัวอย่างในงานต่อไป',outputs:'คู่มือชุมชนและชุดข้อมูลนิรนาม',strengths:'เชื่อมโยงโจทย์ชุมชนและใช้ทรัพยากรท้องถิ่น',future:'ทดสอบซ้ำในพื้นที่อื่นและต่างฤดูกาล',additionalComments:'เห็นควรรับรองคุณภาพรายงานสมมติ',utilization:{},documents:[],submitted:true,by:'demo-reviewer',date:'2026-10-15T03:00:00Z',submittedAt:'2026-10-15T03:00:00Z'}
      p.closure={...p.closure,evaluationVersion:2,reviewers:['demo-reviewer'],reviewer:'demo-reviewer',documents:[{...demoDocument,kind:'report'}],summary:'โครงการสมมติสำรวจ 60 ครัวเรือน พบแนวทางลดการใช้ทรัพยากรเฉลี่ยร้อยละ 15 จัดทำคู่มือและคืนข้อมูลแก่ชุมชน ผลนี้ใช้สำหรับสาธิตเท่านั้น',check:{submitted:true,outcome:'complete',checked:true,by:'demo-staff',date:'2026-10-01',dueAt:'2026-10-30'},evaluations:i===6?{}:{'demo-reviewer':evaluation},state:i===6?'awaiting_review':i===3?'completed':'ready_close',feedbackReleasedAt:'2026-10-16',revisedAfterEvaluation:true,finalCheck:{submitted:true,outcome:'complete',checked:true,notes:'ตรวจเอกสารฉบับสมบูรณ์ครบแล้ว'},history:[{id:'seed-check',role:'staff',action:'check',date:'2026-10-01T03:00:00Z',by:'demo-staff',notes:'ตรวจเอกสารครบและมอบหมายผู้ทรงคุณวุฒิ'}]}
      if(i===3)p.closure.history.push({id:'seed-review',role:'reviewer',action:'review',date:evaluation.date,by:'demo-reviewer',notes:evaluation.additionalComments},{id:'seed-complete',role:'staff',action:'complete',date:'2026-10-18T03:00:00Z',by:'demo-staff',notes:'บันทึกปิดโครงการเรียบร้อย'})
    }
    return p
  })
  const firstSubmission=projects.find(project=>project.scenario==='โครงการรอประเมิน')
  if(firstSubmission){
    firstSubmission.reviewerScenarioLabel='ส่งรายงานใหม่'
    firstSubmission.closure.reviewRound=1
    firstSubmission.closure.submissions=[{revision:1,date:firstSubmission.closure.submittedAt,summary:firstSubmission.closure.summary,documents:structuredClone(firstSubmission.closure.documents)}]
    for(const [number,title] of [[2,'การพัฒนาสื่อเรียนรู้สำหรับชุมชน'],[3,'การติดตามคุณภาพสิ่งแวดล้อมในพื้นที่ศึกษา']]){
      const firstRound=structuredClone(firstSubmission)
      firstRound.id=`MFU-DEMO-REVIEWER-FIRST-${String(number).padStart(2,'0')}`
      firstRound.ownerUsername='demo-reviewer-fixture'
      firstRound.title=title
      firstRound.scenario=`รายงานใหม่รอประเมินครั้งที่ 1 · ${number}`
      firstRound.reviewerScenarioLabel='ส่งรายงานใหม่'
      firstRound.closure={...firstRound.closure,reviewRound:1,submittedAt:`2026-10-${String(16+number).padStart(2,'0')}T03:00:00Z`,submissions:[{...firstRound.closure.submissions[0],date:`2026-10-${String(16+number).padStart(2,'0')}T03:00:00Z`}]}
      projects.push(firstRound)
    }
  }
  if(firstSubmission){
    const priorEvaluation=structuredClone(projects.find(project=>project.id==='MFU-DEMO-016')?.closure?.evaluations?.['demo-reviewer']||{})
    const priorRejectedEvaluation={...priorEvaluation,result:2,reason:'หลักฐานและวิธีวิเคราะห์ยังไม่เพียงพอ ต้องแก้ไขและส่งรายงานใหม่',submitted:true,reviewRound:1,reportRevision:1,by:'demo-reviewer',date:'2026-10-12T03:00:00Z',submittedAt:'2026-10-12T03:00:00Z'}
    const revised=structuredClone(firstSubmission)
    revised.id='MFU-DEMO-REVIEWER-REVISION'
    revised.ownerUsername='demo-reviewer-fixture'
    revised.title='การจัดการพลังงานในอาคารเรียน · ฉบับแก้ไข'
    revised.scenario='ผู้ทรงคุณวุฒิตรวจรายงานฉบับแก้ไข'
    revised.reviewerScenarioLabel='ส่งรายงานฉบับแก้ไขกลับมา'
    revised.closure={...revised.closure,revision:2,reviewRound:2,reviewRounds:[{round:1,reportRevision:1,submittedAt:'2026-10-12T03:00:00Z',evaluations:{'demo-reviewer':priorRejectedEvaluation}}],submittedAt:'2026-10-25T03:00:00Z',summary:'ฉบับแก้ไข (ข้อมูลสมมติ): เพิ่มรายละเอียดวิธีวิเคราะห์และข้อจำกัดตามข้อเสนอแนะ',evaluations:{},state:'awaiting_review',feedbackReleasedAt:'2026-10-20T03:00:00Z',revisionInstructions:'เพิ่มรายละเอียดวิธีวิเคราะห์และข้อจำกัดก่อนส่งฉบับแก้ไข',submissions:[
      {revision:1,date:'2026-10-01T03:00:00Z',summary:'ฉบับก่อนแก้ไข (ข้อมูลสมมติ): รายงานผลการใช้พลังงานและแนวทางจัดการ แต่ยังอธิบายวิธีวิเคราะห์ไม่ครบ',documents:structuredClone(firstSubmission.closure.documents)},
      {revision:2,date:'2026-10-25T03:00:00Z',summary:'ฉบับแก้ไข (ข้อมูลสมมติ): เพิ่มรายละเอียดวิธีวิเคราะห์และข้อจำกัดตามข้อเสนอแนะ',documents:structuredClone(firstSubmission.closure.documents)}
    ],history:[...revised.closure.history,{id:'demo-prior-review',role:'reviewer',action:'review',date:'2026-10-12T03:00:00Z',by:'demo-reviewer',notes:'ข้อเสนอแนะเดิม: อธิบายวิธีวิเคราะห์และข้อจำกัดให้ครบ',snapshot:priorRejectedEvaluation},{id:'demo-release-revision',role:'staff',action:'release_feedback',date:'2026-10-20T03:00:00Z',by:'demo-staff',notes:'เพิ่มรายละเอียดวิธีวิเคราะห์และข้อจำกัดก่อนส่งฉบับแก้ไข'},{id:'demo-revision-submission',role:'researcher',action:'submit',date:'2026-10-25T03:00:00Z',by:'demo-user',notes:'ส่งรายงานฉบับแก้ไขกลับมาให้ผู้ทรงคุณวุฒิตรวจอีกครั้ง'}]}
    revised.statusHistory=[...revised.statusHistory,{id:'demo-revision-resubmitted',role:'researcher',action:'submit_revised_report',status:'closure_review',updatedAt:'2026-10-25T03:00:00Z',updatedBy:'demo-user',note:'DEMO DATA — ส่งรายงานฉบับแก้ไขกลับมาให้ประเมินอีกครั้ง'}]
    projects.push(revised)

    const notApproved=structuredClone(firstSubmission)
    notApproved.id='MFU-DEMO-REVIEWER-NOT-APPROVED'
    notApproved.ownerUsername='demo-reviewer-fixture'
    notApproved.title='การสื่อสารความเสี่ยงฝุ่นละออง'
    notApproved.scenario='ผู้ทรงคุณวุฒิส่งผลไม่เห็นชอบ'
    notApproved.reviewerScenarioLabel='ไม่เห็นชอบ'
    notApproved.closure={...notApproved.closure,state:'staff_decision',evaluations:{'demo-reviewer':priorRejectedEvaluation},history:[...notApproved.closure.history,{id:'demo-not-approved-review',role:'reviewer',action:'review',date:'2026-10-22T03:00:00Z',by:'demo-reviewer',notes:'ไม่เห็นชอบ: หลักฐานและวิธีวิเคราะห์ยังไม่เพียงพอ',snapshot:priorRejectedEvaluation}]}
    projects.push(notApproved)

    const notSubmitted=structuredClone(firstSubmission)
    notSubmitted.id='MFU-DEMO-REVIEWER-NO-SUBMISSION'
    notSubmitted.ownerUsername='demo-reviewer-fixture'
    notSubmitted.title='การประเมินรายงานที่ยังไม่ได้รับเอกสาร'
    notSubmitted.scenario='รอเอกสารก่อนประเมิน'
    notSubmitted.reviewerScenarioLabel='ยังไม่มีการส่งข้อมูล'
    notSubmitted.closure={...notSubmitted.closure,state:'submitted',submittedAt:null,summary:'',documents:[],submissions:[],evaluations:{},check:{submitted:false,outcome:'',by:'demo-staff',date:'2026-10-24'}}
    projects.push(notSubmitted)
  }
  return projects
}
