import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyChange } from '../src/utils/projectChanges.js'
const project = { id: 'test', title: 'Original', leader: 'A', endDate: '2026-12-31', proposal: { projectTitle: 'Original', leaderName: 'A', methodology: 'Old method' }, changeRecords: [{ id: 'older' }] }
const actor = { role: 'staff', username: 'staff-demo' }
const file = { name: 'letter.pdf', dataUrl: 'data:application/pdf;base64,JVBERi0=' }
const form = { type: 'title', newValue: 'Updated', letterNumber: 'DOC/1', letterDate: '2026-10-17', effectiveDate: '2026-10-17', reason: 'Approved change', description: 'Official letter' }
test('updates project and proposal, preserving audit and original data', () => {
  const changed = applyChange(project, form, actor, file)
  assert.equal(changed.title, 'Updated')
  assert.equal(changed.proposal.projectTitle, 'Updated')
  assert.equal(project.title, 'Original')
  assert.equal(changed.changeRecords.length, 2)
  assert.deepEqual(changed.changeRecords[0],project.changeRecords[0])
  const record = changed.changeRecords.at(-1)
  assert.equal(record.before.title, 'Original')
  assert.equal(record.after.title, 'Updated')
  assert.equal(record.recordedBy, 'staff-demo')
  assert.equal(record.attachment.name, 'letter.pdf')
  assert.equal(record.letterNumber, 'DOC/1')
})
test('updates leader and methodology consistently', () => {
  for (const [type, key] of [['leader','leaderName'], ['methodology','methodology']]) {
    const changed = applyChange(project, {...form, type}, actor, file)
    assert.equal(changed[type], 'Updated')
    assert.equal(changed.proposal[key], 'Updated')
  }
})
test('extension updates end date and rejects invalid ranges', () => {
  const updated = applyChange(project, {...form, type:'extension', endDate:'2027-06-30'}, actor, file)
  assert.equal(updated.endDate, '2027-06-30')
  assert.equal(updated.proposal.endDate, '2027-06-30')
  for (const endDate of ['2026-12-31', '2026-01-01', '']) assert.throws(() => applyChange(project, {...form, type:'extension', endDate}, actor, file))
})
test('rejects non-staff, incomplete records, unchanged values and missing PDFs', () => {
  assert.throws(() => applyChange(project, form, {role:'researcher'}, file))
  assert.throws(() => applyChange(project, {...form, reason:' '}, actor, file))
  assert.throws(() => applyChange(project, {...form, newValue:'Original'}, actor, file))
  assert.throws(() => applyChange(project, form, actor, null))
})
