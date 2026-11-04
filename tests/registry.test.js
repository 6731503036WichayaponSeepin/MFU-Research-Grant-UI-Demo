import test from 'node:test'
import assert from 'node:assert/strict'
import { applyRegistry, applyStaffStatus } from '../src/utils/registry.js'
import { registryValues, closureSteps, stepStatuses } from '../src/data/registry.js'
import { createDemoProjects } from '../src/data/demoProjects.js'
import { validateProject } from '../functions/policy.js'
import { enrichDemoRegistry } from '../src/data/demoRegistry.js'
import { registryFields } from '../src/data/registry.js'
const staff = { role: 'staff', username: 'registry-staff' }
const base = () => structuredClone(createDemoProjects().find(p => p.status === 'active'))

test('demo enrichment fills source fields without replacing existing values or non-demo projects', () => {
  const real = { id: 'real', registry: { notes: '' } }
  assert.equal(enrichDemoRegistry(real), real)
  const old = { id: 'MFU-DEMO-015', demoGenerated: true, status: 'closure_review', closure: { submittedAt: '2026-10-01' }, registry: { notes: 'Keep this note', coResearchers: '', finalReport: false, steps: { letter: stepStatuses[1] } } }
  const enriched = enrichDemoRegistry(old)
  assert.equal(enriched.registry.notes, old.registry.notes)
  assert.equal(enriched.registry.finalReport, false)
  assert.equal(enriched.registry.steps.letter, stepStatuses[1])
  assert.equal(enrichDemoRegistry(enriched), enriched)
  assert.equal(old.registry.coResearchers, '')
  for (const p of createDemoProjects()) for (const [key] of registryFields) assert.ok(p.registry[key].trim(), `${p.id}: ${key}`)
})

test('registry edits preserve project data, record before/after and pass shared validation', () => {
  const p = base(), form = registryValues(p)
  form.coResearchers = 'ผู้ร่วมวิจัยทดสอบ'; form.firstResult = 'แก้ไขตามข้อเสนอแนะ'
  const next = applyRegistry(p, form, staff)
  assert.equal(next.title, p.title)
  assert.deepEqual(next.proposal, p.proposal)
  assert.equal(next.registryHistory[0].changes.length, 2)
  assert.equal(next.registryHistory[0].by, staff.username)
  assert.equal(validateProject(next, p, 0)._version, 1)
  assert.equal(applyRegistry(next, registryValues(next), staff), next)
})
test('only staff may update registry and closure tracking requires a submitted request', () => {
  const p = base(), form = registryValues(p)
  assert.throws(() => applyRegistry(p, form, { role: 'researcher', username: 'r' }), /เจ้าหน้าที่/)
  form.steps.letter = stepStatuses[1]
  assert.throws(() => applyRegistry(p, form, staff), /ยื่นคำขอ/)
  p.closure = { state: 'draft' }
  assert.throws(() => applyRegistry(p, form, staff), /ยื่นคำขอ/)
  p.closure = { state: 'submitted', submittedAt: '2026-10-20' }
  const next = applyRegistry(p, form, staff)
  assert.equal(next.registry.steps.letter, stepStatuses[1])
  assert.equal(next.closure.state, 'submitted')
  assert.equal(validateProject(next, p, 0)._version, 1)
  assert.throws(() => validateProject({ ...next, closure: { state: 'draft' } }, p, 0), /closure request/)
})
test('all six tracking steps never automatically close a project and invalid values are rejected', () => {
  const p = base(); p.closure = { state: 'submitted', submittedAt: '2026-10-20' }
  const form = registryValues(p)
  form.steps = Object.fromEntries(closureSteps.map(([key]) => [key, stepStatuses[2]])); form.finalReport = true
  const next = applyRegistry(p, form, staff)
  assert.equal(next.status, 'active')
  assert.equal(next.registryHistory[0].changes.length, 7)
  form.steps.payment = 'unknown'
  assert.throws(() => applyRegistry(p, form, staff), /สถานะย่อย/)
})
test('staff status changes enforce role, reason, workflow order and closure checks', () => {
  const p = base()
  assert.throws(() => applyStaffStatus(p, 'final_report', 'test', { role: 'researcher', username: 'r' }), /เจ้าหน้าที่/)
  assert.throws(() => applyStaffStatus(p, 'final_report', '', staff), /เหตุผล/)
  assert.throws(() => applyStaffStatus(p, 'closure_review', 'test', staff), /ยื่นคำขอ/)
  assert.throws(() => applyStaffStatus(p, 'completed', 'test', staff))
  const next = applyStaffStatus(p, 'final_report', 'รับแจ้งเตรียมยื่นปิด', staff)
  assert.equal(next.status, 'final_report')
  assert.equal(next.statusHistory.at(-1).updatedBy, staff.username)
  assert.throws(() => applyStaffStatus(next, 'unit_review', 'test', staff), /transition/)
})
