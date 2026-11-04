import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoProjects } from '../src/data/demoProjects.js'
import { getProjects, saveProjects, saveProposal, updateProjectStatus, configureProjectStore } from '../src/utils/projectStorage.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
import { persist } from '../src/utils/closure.js'
import { nextTask } from '../src/utils/handoff.js'
import { validateProject } from '../functions/policy.js'
import { demoDocument } from '../src/data/demoAttachment.js'

test('three roles exchange a new proposal and a revised report through the shared save contract', async () => {
  let rows = []
  configureProjectStore({ read: () => structuredClone(rows), save: async projects => {
    const changed = projects.filter(p => JSON.stringify(p) !== JSON.stringify(rows.find(r => r.id === p.id)))
    assert.equal(changed.length, 1)
    const candidate = changed[0], previous = rows.find(p => p.id === candidate.id)
    const saved = validateProject(candidate, previous, previous?._version || 0)
    rows = [...rows.filter(p => p.id !== saved.id), saved]
  } })
  const researcher = { role:'researcher', username:'demo-user' }, staff = { role:'staff', username:'demo-user' }, reviewer = { role:'reviewer', username:'demo-user' }
  try {
    const p = await saveProposal({ ...createDemoProjects()[0].proposal, _demoScenario:true }, researcher)
    const read = () => getProjects().find(x => x.id === p.id)
    const recipient = role => assert.equal(nextTask(read()).role, role)
    recipient('researcher')
    await saveProposal(read().proposal, researcher, true); recipient('staff')
    const record = { date:'2026-10-21', responsible:'เจ้าหน้าที่สาธิต', notes:'บันทึกผลสมมุติ', letterNumber:'DEMO/001', unitOutcome:'endorsed', certification:'complete', outcome:'endorsed', meetingDate:'2026-10-21', meetingNumber:'DEMO/01' }
    for (const status of ['unit_review','eoffice_pending']) await saveProjects([recordAdministrativeResult(read(), record, staff, status)])
    await updateProjectStatus(p.id, 'committee_review', 'เอกสารสมมุติครบถ้วน')
    await saveProjects([recordAdministrativeResult(read(), record, staff, 'committee_review')]); recipient('researcher')
    const report = { method:'report', summary:'รายงานสมมุติ', finishedDate:'2026-10-21', documents:[{ ...demoDocument, kind:'report' }] }
    await persist(p.id, 'submit', report, researcher); recipient('staff')
    await persist(p.id, 'check', { checked:true, outcome:'complete', reviewer:'demo-user' }, staff); recipient('reviewer')
    await persist(p.id, 'review', { scores:[4,4,4,4,4,4], result:'revise', comments:'เพิ่มภาคผนวก' }, reviewer); recipient('staff')
    await persist(p.id, 'notify_revision', { notes:'เพิ่มภาคผนวกแล้วส่งอีกครั้ง' }, staff); recipient('researcher')
    await persist(p.id, 'submit', { ...report, summary:'รายงานฉบับแก้ไข' }, researcher); recipient('staff')
    await persist(p.id, 'final_check', { outcome:'complete', checked:true, notes:'ตรวจฉบับแก้ไขแล้ว' }, staff); recipient('reviewer')
    assert.throws(() => persist(p.id, 'complete', {}, staff))
    await persist(p.id, 'review', { scores:[5,5,5,5,5,5], result:'accept', comments:'รับรองฉบับแก้ไข' }, reviewer); recipient('staff')
    await persist(p.id, 'final_check', { outcome:'complete', checked:true, notes:'เอกสารครบ' }, staff)
    await persist(p.id, 'complete', {}, staff)
    await persist(p.id, 'record_notice', { reference:'DEMO/CLOSE/001', date:'2026-10-21' }, staff)
    recipient(null)
    const final = read()
    assert.equal(final.status, 'completed')
    assert.equal(final.closure.submissions.length, 2)
    assert.equal(final.registry.steps.endorsed, 'ดำเนินการแล้วเสร็จ')
    assert.equal(final.registry.steps.resubmitted, 'ดำเนินการแล้วเสร็จ')
    assert.equal(final.registry.steps.payment, 'ยังไม่ได้ดำเนินการ')
    assert.match(final.registry.firstResult, /เพิ่มภาคผนวก/)
    assert.ok(final.statusHistory.some(h => h.role === 'reviewer' && h.toRole === 'staff'))
  } finally { configureProjectStore(null) }
})
