import assert from 'node:assert/strict'
import test from 'node:test'
import { workflow } from '../src/data/statuses.js'
import { matchesStaffFilter, projectCode, recentStaffProjects } from '../src/utils/staffProjects.js'
import { demoHref, parseDemoRoute } from '../src/utils/demoRouter.js'

test('staff cards and refreshed URLs use the same workflow filters', () => {
  const statuses = [...workflow.map(([status]) => status), 'revision_required', 'review', 'closure']
  const projects = statuses.map(status => ({ status }))
  for (const [filter, expected] of [
    [null, statuses],
    ['review', ['admin_review', 'review']],
    ['active', ['active']],
    ['completed', ['completed']],
    ['closure', ['closure_review', 'closure']]
  ]) {
    const { query } = parseDemoRoute(demoHref('staff', 'projects', null, { view: 'all', filter }))
    assert.deepEqual(projects.filter(p => matchesStaffFilter(p, query.filter)).map(p => p.status), expected)
  }
})

test('deadline cards use the confirmed date and include today through day 30 in Bangkok', () => {
  const now = new Date('2026-11-04T17:01:00Z')
  const matches = (endDate, status = 'active') => matchesStaffFilter({ status, endDate }, 'nearDeadline', now)
  assert.equal(matches('2026-11-04'), false)
  assert.equal(matches('2026-11-05'), true)
  assert.equal(matches('2026-12-05', 'closure_review'), true)
  assert.equal(matches('2026-12-06'), false)
  assert.equal(matches('2026-11-05', 'completed'), false)
  assert.equal(matches('2026-11-31'), false)
  assert.equal(matchesStaffFilter({ status: 'active', endDate: '2026-12-06', proposal: { endDate: '2026-11-05' } }, 'nearDeadline', now), false)
})

test('recent projects sort by submission, and project codes never fall back to internal IDs', () => {
  const uuid = 'fa4329d3-1234-4321-1234-0123456789ab'
  assert.equal(projectCode({ id: uuid }), '')
  assert.equal(projectCode({ projectCode: uuid }), '')
  assert.equal(projectCode({ projectCode: ' RS-1/2569 ' }), 'RS-1/2569')
  const first = { id: uuid, submittedAt: '2026-11-04' }
  const second = { id: 'old', submittedAt: '2026-11-02', updatedAt: '2026-11-05' }
  assert.deepEqual(recentStaffProjects([second, { status: 'draft', createdAt: '2026-11-05' }, first]), [first, second])
  assert.deepEqual(recentStaffProjects([]), [])
})
