export const reviewOutcomeInfo = [
  {label:'เห็นชอบ',description:'รับรองคุณภาพรายงานโดยไม่มีการแก้ไข ยังต้องผ่านขั้นตอนของเจ้าหน้าที่ก่อนปิดโครงการ',tone:'approved'},
  {label:'เห็นชอบโดยมีข้อแก้ไข',description:'รับรองคุณภาพโดยเสนอให้ปรับปรุง เจ้าหน้าที่จะพิจารณาและส่งข้อเสนอแนะให้นักวิจัย',tone:'revisions'},
  {label:'ให้แก้ไขและส่งใหม่',description:'ไม่รับรองรายงานฉบับนี้ โปรดระบุเหตุผล เจ้าหน้าที่เป็นผู้แจ้งแนวทางดำเนินการต่อ',tone:'required'},
]
export function reviewerEvaluationRounds(closure,uid) {
  if(!uid)return []
  const archived=(closure?.reviewRounds||[]).flatMap(round=>{
    const evaluation=round?.evaluations?.[uid]
    if(!evaluation?.submitted)return []
    return [{id:uid,evaluation:{...evaluation,reviewRound:evaluation.reviewRound||round.round||1,reportRevision:evaluation.reportRevision||round.reportRevision},archived:true}]
  })
  const current=closure?.evaluations?.[uid]
  if(current?.submitted)archived.push({id:uid,evaluation:current,archived:false})
  return archived.sort((a,b)=>(a.evaluation.reviewRound||1)-(b.evaluation.reviewRound||1))
}
export function reviewerTask(project,uid) {
  const evaluation=project.closure?.evaluations?.[uid]
  if(evaluation?.submitted){const result=reviewOutcomeInfo[evaluation.result];return {state:'completed',label:result?.label || 'ผลประเมินไม่ถูกต้อง',tone:result?.tone || 'waiting',action:'รายละเอียด'}}
  if(project.closure?.state!=='awaiting_review')return {state:'waiting',label:'รอเจ้าหน้าที่ดำเนินการ',tone:'waiting',action:'รายละเอียด'}
  return evaluation ? {state:'draft',label:'กำลังประเมิน',tone:'draft',action:'รายละเอียด'} : {state:'pending',label:'รอประเมิน',tone:'pending',action:'รายละเอียด'}
}
export function demoShowcase(projects,role) {return projects.filter(project=>project.isDemo===true && project.demoSeedId==='mfu-advisor-v1' && project.demoGroup===role).sort((a,b)=>a.id.localeCompare(b.id))}
