import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoundationFixtures, foundationContext } from '../src/data/foundationDemo.js'
import { executeProjectAction } from '../src/domain/actions.js'

test('fictional local staff can cancel an active project with confirmation and audit', () => {
  const p = createFoundationFixtures().find(row => row.id === 'V16-ACTIVE')
  const context = { ...foundationContext('demo-staff'), now: '2026-11-17T12:00:00.000Z' }
  const command = { id: 'test-cancellation', action: 'cancel_project', expectedVersion: p._version, payload: { reason: 'OTHER', details: 'เหตุผลทดสอบ', documentIds: [], confirmed: true } }
  assert.throws(() => executeProjectAction(p, { ...command, payload: { ...command.payload, details: '' } }, context), { code: 'CANCELLATION_REASON_REQUIRED' })
  assert.throws(() => executeProjectAction(p, { ...command, payload: { ...command.payload, confirmed: false } }, context), { code: 'CONFIRMATION_REQUIRED' })
  assert.throws(() => executeProjectAction(p, command, { ...foundationContext('demo-user'), now: context.now }))
  assert.throws(() => executeProjectAction(p, command, { ...context, mode: 'backend', actor: { ...context.actor, authenticated: true } }), { code: 'OPEN_REQUIREMENT' })
  const next = executeProjectAction(p, command, context)
  assert.equal(next.status, 'CANCELLED')
  assert.equal(next.cancellation.previousState, 'IN_PROGRESS')
  assert.equal(next.cancellation.cancelledBy, 'demo-staff')
  assert.equal(next.statusHistory.at(-1).transitionRule, 'TR-17')
  assert.deepEqual(next.documents, p.documents)
  assert.throws(() => executeProjectAction(next, { ...command, id: 'again', expectedVersion: next._version }, context), { code: 'TERMINAL_STATE' })
})
