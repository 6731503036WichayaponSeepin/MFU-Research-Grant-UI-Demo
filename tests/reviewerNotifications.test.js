import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoundationFixtures, foundationActors, foundationContext } from '../src/data/foundationDemo.js'
import { executeProjectAction } from '../src/domain/actions.js'
import { notificationReadKey, workspaceNotifications } from '../src/utils/commonWorkspace.js'

test('reviewer notifications distinguish assigned reviewers and their own submitted result', () => {
  const rows = createFoundationFixtures(), project = rows.find(p => p.id === 'V16-EVALUATION-0')
  const first = foundationActors['demo-reviewer-1'], second = foundationActors['demo-reviewer-2']
  const evaluation = { objectives: 0, consistency: 0, abstract: 0, executive: 0, result: 1, utilization: {}, chapters: 'Test' }
  const next = executeProjectAction(project, { id: 'reviewer-one-submit', action: 'submit_evaluation', expectedVersion: project._version, payload: { evaluation } }, foundationContext(first.uid))
  assert.ok(next.notifications.some(n => n.id === 'reviewer-one-submit-demo-reviewer-1'))
  assert.ok(!next.notifications.some(n => n.id === 'reviewer-one-submit-demo-reviewer-2'))
  // Simulate historical fan-out: reviewer 2 used to receive reviewer 1's submission.
  next.notifications.push({ id: 'reviewer-one-submit-demo-reviewer-2', recipientId: second.uid, projectId: next.id, action: 'submit_evaluation' })
  const one = workspaceNotifications([next], first), two = workspaceNotifications([next], second)
  assert.ok(one.some(n => n.action === 'assign_reviewers'))
  assert.ok(two.some(n => n.action === 'assign_reviewers'))
  assert.ok(one.some(n => n.id.endsWith('reviewer-one-submit-demo-reviewer-1')))
  assert.ok(!two.some(n => n.action === 'submit_evaluation'))
  assert.notEqual(notificationReadKey(first), notificationReadKey(second))
  const remote = [{ id: 'remote-event', recipientId: second.uid, actorUid: first.uid, projectId: next.id, action: 'submit_evaluation' }]
  assert.deepEqual(workspaceNotifications([next], second, remote), [])
})
