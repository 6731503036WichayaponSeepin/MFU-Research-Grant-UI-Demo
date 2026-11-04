import { buildProposal } from '../domain/src/utils/projectStorage.js'
import { transition } from '../domain/src/utils/closure.js'
import { recordAdministrativeResult } from '../domain/src/utils/administrativeRecords.js'
import { replayProject } from '../securePolicy.js'
import { ADVISOR_SEED, DEMO_MARK, advisorSpecs, advisorEvaluation, demoActors } from './advisorSpecs.mjs'
export function buildAdvisorProjects(documentMap,{codes}={}) {
  const {researcher,staff,reviewer}=demoActors
  const profiles=Object.fromEntries(Object.values(demoActors).map(actor=>[actor.uid,{...actor,active:true}]))
  return advisorSpecs().filter(spec=>!codes || codes.includes(spec.code)).map(spec=>{
    const docs=documentMap[spec.id]
    if(!docs?.proposal)throw new Error('Missing proposal document: '+spec.id)
    const early=['draft','unit_review','revision_required','admin_review','committee_review'].includes(spec.target)
    const dates=early?['2026-10-15','2026-10-16','2026-10-17','2026-10-18','2026-10-19','2026-10-20','2026-10-21']:['2025-12-01','2025-12-05','2025-12-10','2025-12-15','2025-12-20','2026-01-05','2026-01-10']
    const at=date=>date+'T03:00:00.000Z'
    const proposal={...spec.proposal,startDate:early?'2026-11-01':spec.proposal.startDate,endDate:early?'2027-10-31':spec.proposal.endDate,_document:docs.proposal}
    let p
    const save=(candidate,actor,date)=>{p=replayProject(p,candidate,actor,profiles,at(date));return p}
    const apply=(action,payload,actor,date)=>save(transition(p,action,payload,actor,at(date)),actor,date)
    const record={date:dates[2],responsible:'เจ้าหน้าที่บัญชีทดสอบ',notes:DEMO_MARK+' บันทึกผลสมมติจากกระบวนการภายนอก ไม่ได้เชื่อมต่อ e-Office',unitOutcome:'endorsed',letterNumber:'DEMO/EXT/'+spec.code}
    save(buildProposal(null,proposal,researcher,false,spec.id,at(dates[0])),researcher,dates[0])
    if(spec.target!=='draft'){
      save(buildProposal(p,proposal,researcher,true,p.id,at(dates[1])),researcher,dates[1])
      if(spec.target!=='unit_review'){
        save(recordAdministrativeResult(p,record,staff,'unit_review',at(dates[2])),staff,dates[2])
        save(recordAdministrativeResult(p,{...record,date:dates[3]},staff,'eoffice_pending',at(dates[3])),staff,dates[3])
        if(spec.target==='revision_required'){
          save({...p,status:'revision_required',statusHistory:[...p.statusHistory,{action:'proposal_check',note:'กรุณาเพิ่มรายละเอียดการคุ้มครองข้อมูล ขอบเขตการศึกษา และแผนงบประมาณในรายการที่ตรวจพบ'}]},staff,dates[4])
        } else if(spec.target!=='admin_review'){
          save({...p,status:'committee_review',statusHistory:[...p.statusHistory,{action:'proposal_check',note:'ตรวจเอกสารครบ รอรับผลพิจารณาคณะกรรมการจากภายนอก'}]},staff,dates[4])
          if(spec.target!=='committee_review'){
            save(recordAdministrativeResult(p,{...record,date:dates[5],meetingDate:dates[5],meetingNumber:'DEMO-'+spec.code,certification:'complete',outcome:'endorsed'},staff,'committee_review',at(dates[5])),staff,dates[5])
            save(recordAdministrativeResult(p,{...record,date:dates[6]},staff,'active',at(dates[6])),staff,dates[6])
          }
        }
      }
    }
    if(spec.code==='A04')p.documents=[docs.report]
    if(spec.code==='A05'){
      apply('save_draft',{method:'report',summary:spec.results,finishedDate:'2026-10-15',documents:[docs.report]},researcher,'2026-10-15')
      // Stage 7 is an existing preparation snapshot, not an official submission.
      p.status='final_report';p.statusHistory.push({projectId:p.id,action:'seed_preparation_snapshot',status:'final_report',previousStatus:'active',newStatus:'final_report',role:'researcher',updatedBy:researcher.uid,updatedAt:at('2026-10-15'),note:DEMO_MARK+' เตรียมรายงาน ยังไม่ได้ยืนยันส่งให้เจ้าหน้าที่'})
    }
    if(['B04','B05'].includes(spec.code) || spec.group==='reviewer'){
      const publication=spec.code==='B05'
      apply('submit',{method:publication?'publication':'report',summary:spec.results,publication:publication?'หลักฐานเผยแพร่สมมติสำหรับการทดสอบ ไม่ใช่วารสารหรือ DOI จริง':'',finishedDate:'2026-10-15',documents:[publication?docs.publication:docs.report]},researcher,'2026-10-16')
      if(publication){
        apply('check',{outcome:'complete',checked:true,notes:'ตรวจหลักฐานเผยแพร่สมมติครบถ้วน รอยืนยันขั้นสุดท้ายก่อนปิด'},staff,'2026-10-17')
        p.closure.documents.push(docs.verification)
      } else if(spec.group==='reviewer'){
        apply('check',{outcome:'complete',checked:true,notes:'เอกสารครบถ้วน มอบหมายบัญชีผู้ทรงคุณวุฒิทดสอบ',reviewers:[reviewer.uid],dueAt:'2026-11-12'},staff,'2026-10-17')
        if(spec.code==='C02')apply('review_draft',{...advisorEvaluation(1),abstract:undefined,chapters:'ตรวจวิธีวิจัยแล้ว กำลังทบทวนการจัดการข้อมูลที่ไม่สอดคล้อง'},reviewer,'2026-10-20')
        if(['C03','C04','C05'].includes(spec.code)){
          const result=Number(spec.code.slice(-1))-3
          apply('review',{...advisorEvaluation(result),documents:[docs.feedback]},reviewer,'2026-10-21')
          if(spec.code==='C04')apply('release_feedback',{outcome:'revision',notes:'เพิ่มคำอธิบายการสอบเทียบเซ็นเซอร์ ขยายผลความแม่นยำและข้อจำกัดของการทดลอง แล้วส่งฉบับแก้ไข'},staff,'2026-10-23')
        }
      }
    }
    p.isDemo=true;p.fictional=true;p.demoSeedId=ADVISOR_SEED;p.demoGroup=spec.group;p.demoScenarioLabel=spec.demoState;p.demoCode=spec.code;p.researchField=spec.field;p.demoOrigin='ข้อมูลสังเคราะห์ที่เตรียมไว้ ไม่ใช่การยื่นหรือผลพิจารณาจริง';p.demoResults=spec.results
    p.statusHistory=p.statusHistory.map(log=>({...log,isDemo:true,origin:ADVISOR_SEED}))
    if(p.closure)p.closure.history=p.closure.history.map(log=>({...log,isDemo:true,origin:ADVISOR_SEED}))
    return p
  })
}
