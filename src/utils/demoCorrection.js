import { updateProject } from './projectStorage.js'
export function correctionAction(id,action,user,note) {
  if(!['request','approved','rejected'].includes(action))throw new Error('การดำเนินการไม่ถูกต้อง')
  if(!note?.trim())throw new Error('กรุณาระบุเหตุผลหรือความคิดเห็น')
  return updateProject(id,p=>{
    const state=p.correction?.state
    if(action==='request' && !(user.role==='researcher' && p.ownerUsername===user.username && p.certification && !['pending','approved'].includes(state)))throw new Error('ไม่สามารถขอแก้ไขได้ในขณะนี้')
    if(['approved','rejected'].includes(action) && !(user.role==='staff' && state==='pending'))throw new Error('คำขอนี้ไม่รอการพิจารณา')
    const now=new Date().toISOString()
    return {...p,correction:{...p.correction,state:action==='request'?'pending':action,reason:action==='request'?note:p.correction.reason,comment:action==='request'?'':note,updatedAt:now},statusHistory:[...p.statusHistory,{action:'correction_'+action,status:p.status,note,updatedAt:now,updatedBy:user.username,role:user.role}]}
  })
}
