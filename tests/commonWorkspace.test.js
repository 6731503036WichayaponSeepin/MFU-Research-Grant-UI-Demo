import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoundationFixtures, foundationActors } from '../src/data/foundationDemo.js'
import { visibleProject, permittedDocuments, realPdfUrl, timelineStates, nextRequiredAction, workspaceNotifications, notificationReadKey, roleNavigation, routeAllowed } from '../src/utils/commonWorkspace.js'
import { initializeFoundationDemo, resetFoundationDemo, FOUNDATION_DEMO_KEY } from '../src/utils/foundationStore.js'
import { PROJECT_STATES } from '../src/domain/contracts.js'
import { parseDemoRoute, demoHref } from '../src/utils/demoRouter.js'

const fixtures = createFoundationFixtures(), actors = foundationActors
test('common navigation has only role-level destinations; all nine states remain distinct', () => {
  for (const role of ['researcher', 'staff', 'reviewer']) {
    assert.deepEqual(roleNavigation(role), role === 'researcher' ? ['dashboard', 'projects', 'choose', 'notifications'] : ['dashboard', 'projects', 'notifications'])
    assert.equal(routeAllowed('choose', role), role === 'researcher')
    assert.equal(routeAllowed('evaluation', role), role === 'reviewer')
    assert.equal(routeAllowed('staff-review', role), role === 'staff')
    assert.equal(routeAllowed('closure', role), role !== 'reviewer')
    for (const page of ['details', 'documents', 'timeline']) assert.equal(parseDemoRoute(demoHref(role, page, 'V16-CANCELLED')).page, page)
  }
  assert.equal(new Set(fixtures.map(p => p.status)).size, PROJECT_STATES.length)
})
test('project visibility is owner/workspace/assignment scoped for each of three reviewer personas', () => {
  assert.equal(fixtures.filter(p => visibleProject(p, actors['demo-user'])).length, 14)
  assert.equal(fixtures.filter(p => visibleProject(p, actors['demo-staff'])).length, 14)
  for (let i = 1; i <= 3; i++) {
    const actor = actors[`demo-reviewer-${i}`], views = fixtures.map(p => visibleProject(p, actor)).filter(Boolean)
    assert.ok(views.length > 0 && views.length < 14)
    assert.ok(views.every(p => p.closure.assignments.every(a => a.reviewerId === actor.uid)))
    assert.ok(views.every(p => Object.keys(p.closure.evaluations).every(uid => uid === actor.uid)))
    assert.equal(visibleProject(fixtures[0], actor), null)
  }
  assert.equal(visibleProject(fixtures[0], { ...actors['demo-staff'], workspace: 'other' }), null)
})
test('document reads use real PDF bytes, forbid arbitrary URLs, and never change project/audit', () => {
  const before = JSON.stringify(fixtures)
  for (const actor of Object.values(actors)) for (const p of fixtures) {
    const docs = permittedDocuments(p, actor)
    for (const d of docs) {
      assert.ok(realPdfUrl(d))
      if (actor.role === 'reviewer') assert.ok(['report', 'feedback'].includes(d.kind))
    }
  }
  for (const dataUrl of ['https://public.example/research.pdf', 'javascript:alert(1)', 'data:application/pdf;base64,bm90IGEgcGRm', 'data:application/pdf;base64,%%%']) assert.equal(realPdfUrl({ dataUrl }), null)
  assert.equal(JSON.stringify(fixtures), before)
})
test('overview and timeline preserve two closure paths, cancellation and pending permissions', () => {
  const publication = fixtures.find(p => p.id === 'V16-CLOSED-PUBLICATION'), cancelled = fixtures.find(p => p.id === 'V16-CANCELLED')
  assert.ok(!timelineStates(publication).includes('REPORT_EVALUATION'))
  assert.ok(!timelineStates(cancelled).includes('CLOSED'))
  assert.equal(nextRequiredAction(cancelled, actors['demo-staff']).key, 'terminal')
  const evaluation = fixtures.find(p => p.id === 'V16-EVALUATION-3')
  assert.equal(nextRequiredAction(evaluation, actors['demo-staff']).capability, 'release')
  assert.notEqual(nextRequiredAction(fixtures.find(p => p.id === 'V16-EVALUATION-2'), actors['demo-staff']).capability, 'release')
})
test('notifications reject inaccessible projects and use identity-scoped read markers', () => {
  const actor = actors['demo-reviewer-1']
  assert.notEqual(notificationReadKey(actor), notificationReadKey(actors['demo-reviewer-2']))
  const notifications = workspaceNotifications(fixtures, actor)
  assert.ok(notifications.every(n => n.recipientId === actor.uid && visibleProject(fixtures.find(p => p.id === n.projectId), actor)))
  assert.deepEqual(workspaceNotifications(fixtures, actor, [{ id: 'forged', projectId: 'V16-DRAFT' }, { id: 'other', projectId: 'V16-EVALUATION-0', recipientId: 'demo-user' }]), [])
  const staffNotifications = workspaceNotifications(fixtures, actors['demo-staff'])
  assert.ok(staffNotifications.every(n => n.recipientId === 'demo-staff'))
  assert.equal(new Set(staffNotifications.map(n => n.id)).size, staffNotifications.length)
})
test('confirmed reset changes only canonical fictional namespace; corrupt records are preserved', () => {
  const values = new Map([['legacy', 'do-not-touch'], ['mfu-private-draft-user', 'private']])
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) }
  initializeFoundationDemo(storage)
  values.set(notificationReadKey(actors['demo-user']), '["old-read"]')
  resetFoundationDemo(storage)
  assert.equal(storage.getItem(notificationReadKey(actors['demo-user'])), null)
  assert.equal(values.get('legacy'), 'do-not-touch'); assert.equal(values.get('mfu-private-draft-user'), 'private')
  storage.setItem(FOUNDATION_DEMO_KEY, 'not-json')
  assert.throws(() => resetFoundationDemo(storage))
  assert.equal(values.get(FOUNDATION_DEMO_KEY), 'not-json')
})
