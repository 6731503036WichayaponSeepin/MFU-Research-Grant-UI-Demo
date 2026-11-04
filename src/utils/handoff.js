export const demoRoles = { researcher: 'นักวิจัย', staff: 'เจ้าหน้าที่', reviewer: 'ผู้ทรงคุณวุฒิ' }
export const handoffActionLabels = { save_draft:'บันทึกร่างคำขอ', submit:'ส่งคำขอปิดโครงการให้เจ้าหน้าที่', check_draft:'บันทึกร่างตรวจเอกสาร', check:'บันทึกผลตรวจและส่งต่องาน', review_draft:'บันทึกร่างผลประเมิน', review:'ส่งผลประเมินให้เจ้าหน้าที่', notify_revision:'ส่งข้อเสนอแนะให้นักวิจัยแก้ไข', final_check:'ตรวจฉบับสมบูรณ์และส่งต่อขั้นตอนถัดไป', complete:'เจ้าหน้าที่ปิดโครงการ', record_notice:'บันทึกหนังสือแจ้งปิดโครงการ' }
export function nextTask(project) {
  const task = (role, route, title, detail) => ({ role, route, title, detail })
  const c = project.closure
  if (project.status === 'completed') return c?.closureNotice ? task(null, 'closed-project-detail', 'เสร็จสิ้นกระบวนการ', 'ทุกบทบาทสามารถติดตามผลที่บันทึกไว้ได้') : task('staff', 'closed-project-detail', 'บันทึกหนังสือแจ้งปิดโครงการ', 'นักวิจัยเห็นผลปิดโครงการแล้ว เจ้าหน้าที่บันทึกหนังสือแจ้งเพื่อจบกระบวนการ')
  if (c?.state && c.state !== 'draft') {
    const actions = {staff_decision:['staff','closure-document-check','ตรวจผลประเมินและแจ้งนักวิจัย','ครบทุกคนแล้ว รอเจ้าหน้าที่เลือกขั้นตอนถัดไป'],
      submitted: ['staff', 'closure-document-check', 'ตรวจเอกสารและส่งให้ผู้ทรงคุณวุฒิ', 'ได้รับคำขอจากนักวิจัยแล้ว ตรวจเอกสารหรือส่งกลับพร้อมข้อเสนอแนะ'],
      returned: ['researcher', 'project-closure', 'แก้ไขและส่งเอกสารกลับ', c.revisionInstructions || c.check?.notes || 'แก้ไขตามข้อเสนอแนะของเจ้าหน้าที่'],
      awaiting_review: ['reviewer', 'final-report-review', 'ประเมินรายงานและส่งผลกลับเจ้าหน้าที่', 'อ่านรายงานและกรอกแบบประเมิน'],
      revision_pending: ['staff', 'closure-document-check', 'ส่งข้อเสนอแนะให้นักวิจัยแก้ไข', c.evaluation?.comments || 'ได้รับผลประเมินแล้ว โปรดแจ้งนักวิจัย'],
      final_check: ['staff', 'closure-document-check', c.evaluation?.result === 'revise' ? 'ตรวจฉบับแก้ไขและส่งกลับผู้ทรงคุณวุฒิ' : 'ตรวจเอกสารขั้นสุดท้าย', 'ตรวจความครบถ้วนก่อนส่งต่อหรือยืนยันพร้อมปิดโครงการ'],
      ready_close: ['staff', 'closure-document-check', 'ยืนยันปิดโครงการ', 'ตรวจเอกสารและผลประเมินครบแล้ว รอเจ้าหน้าที่บันทึกปิดโครงการ']
    }
    if (actions[c.state]) return task(...actions[c.state])
  }
  if (['active', 'final_report'].includes(project.status)) return task('researcher', 'project-closure', 'ยื่นคำขอปิดโครงการ', 'เตรียมสรุปผลและรายงาน PDF แล้วส่งให้เจ้าหน้าที่ตรวจสอบ')
  if (['draft', 'revision_required'].includes(project.status)) return task('researcher', 'project-detail', project.status === 'draft' ? 'ตรวจร่างและยื่นข้อเสนอ' : 'แก้ไขข้อเสนอและยื่นอีกครั้ง', project.status === 'draft' ? 'ตรวจชื่อโครงการ ทีมวิจัย แผนงาน และงบประมาณ ก่อนยื่นให้เจ้าหน้าที่' : project.statusHistory?.at(-1)?.note || 'แก้ไขตามข้อเสนอแนะก่อนยื่นอีกครั้ง')
  if (project.status === 'admin_review') return task('staff', 'proposal-review', 'ตรวจสอบข้อเสนอโครงการ', 'ส่งกลับแก้ไข หรือส่งต่อเพื่อบันทึกการรับรอง')
  return task('staff', 'administrative-records', 'รับเอกสารและบันทึกผลรับรอง', 'บันทึกผลจากต้นสังกัด หนังสือ e-Office หรือคณะกรรมการตามขั้นตอนปัจจุบัน')
}
