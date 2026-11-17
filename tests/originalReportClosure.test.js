import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoundationFixtures, foundationContext } from '../src/data/foundationDemo.js'
import { executeProjectAction } from '../src/domain/actions.js'
import { canCloseOriginalReport } from '../src/domain/model.js'
import { hasCapability } from '../src/domain/permissions.js'
import { staffTask } from '../src/utils/staffWorkspace.js'

const evaluation = result => ({ objectives: 0, consistency: 0, abstract: 0, executive: 0, result, utilization: {}, chapters: 'รายงานทดสอบ' })
let sequence = 0
const act = (p, uid, action, payload = {}) => executeProjectAction(p, { id: `original-test-${++sequence}`, action, expectedVersion: p._version, payload }, foundationContext(uid))

test('three acceptances allow staff to verify and close the original report, including existing released records', () => {
  let p = createFoundationFixtures().find(item => item.id === 'V16-EVALUATION-0')
  for (let i = 1; i <= 3; i++) p = act(p, `demo-reviewer-${i}`, 'submit_evaluation', { evaluation: evaluation(0) })
  assert.equal(canCloseOriginalReport(p), false)
  p = act(p, 'demo-staff', 'release_evaluations', { confirmed: true })
  assert.equal(canCloseOriginalReport(p), true)
  assert.equal(hasCapability(p, foundationContext('demo-user').actor, 'reviseReport'), false)
  assert.equal(staffTask(p), 'final-verification')
  const existing = structuredClone(p); existing.closure.actionRequiredBy = 'researcher'; existing.closure.state = 'awaiting_revised_report'
  assert.equal(staffTask(existing), 'final-verification')
  assert.throws(() => act(existing, 'demo-user', 'close_report', { confirmed: true }))
  assert.throws(() => act(existing, 'demo-staff', 'close_report', { confirmed: false }))
  const wrongVersion = structuredClone(existing); wrongVersion.closure.assignments[0].reportRevision++
  assert.throws(() => act(wrongVersion, 'demo-staff', 'close_report', { confirmed: true }), { code: 'FINAL_CHECK_REQUIRED' })
  const missingFile = structuredClone(existing); missingFile.documents = missingFile.documents.filter(d => !missingFile.closure.reportDocumentIds.includes(d.id))
  assert.throws(() => act(missingFile, 'demo-staff', 'close_report', { confirmed: true }), { code: 'DOCUMENTS_REQUIRED' })
  const closed = act(existing, 'demo-staff', 'close_report', { confirmed: true })
  assert.equal(closed.status, 'CLOSED')
  assert.deepEqual(closed.closure.finalCheck.documentIds, p.closure.reportDocumentIds)
  assert.equal(closed.statusHistory.at(-1).transitionRule, 'TR-16')
})

test('a mixed result retains the revised-report requirement', () => {
  let p = createFoundationFixtures().find(item => item.id === 'V16-EVALUATION-0')
  for (let i = 1; i <= 3; i++) p = act(p, `demo-reviewer-${i}`, 'submit_evaluation', { evaluation: evaluation(i === 2 ? 1 : 0) })
  p = act(p, 'demo-staff', 'release_evaluations', { confirmed: true })
  assert.equal(canCloseOriginalReport(p), false)
  assert.equal(hasCapability(p, foundationContext('demo-user').actor, 'reviseReport'), true)
  assert.throws(() => act(p, 'demo-staff', 'close_report', { confirmed: true }), { code: 'FINAL_CHECK_REQUIRED' })
})
