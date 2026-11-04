import test from 'node:test'
import assert from 'node:assert/strict'
import { authorizeWorkshop } from '../functions/access.js'
import { EDITING_EXPIRES_AT, validateProject } from '../functions/policy.js'
import { createDemoProjects } from '../src/data/demoProjects.js'
import { recordAdministrativeResult } from '../src/utils/administrativeRecords.js'
import { configureProjectStore, saveProposal, getProjects, updateProjectStatus, updateProject } from '../src/utils/projectStorage.js'
import { persist } from '../src/utils/closure.js'

test('backend access code and Bangkok expiration are enforced at the exact boundary', () => {
  const secret = 'test-only-workshop-secret-with-entropy'
  const cutoff = Date.parse('2026-11-30T23:59:00+07:00')
  assert.equal(cutoff, Date.parse(EDITING_EXPIRES_AT))
  authorizeWorkshop(secret, secret, cutoff - 1)
  for (const code of ['', 'wrong', 'x'.repeat(257)]) assert.throws(() => authorizeWorkshop(code, secret, cutoff - 1), /Invalid/)
  assert.throws(() => authorizeWorkshop(secret, secret, cutoff), /expired/)
  assert.throws(() => authorizeWorkshop(secret, secret, cutoff + 1), /expired/)
  assert.throws(() => authorizeWorkshop('short', 'short', cutoff - 1), /Invalid/)
})

test('backend rejects stale versions, history tampering, stage skips and oversized data', () => {
  const previous = { ...createDemoProjects()[5], _version: 1 }
  const next = { ...previous, status: 'committee_review', statusHistory: [...previous.statusHistory, { status: 'committee_review', note: 'Fictional review' }] }
  assert.equal(validateProject(next, previous, 1)._version, 2)
  assert.throws(() => validateProject(next, previous, 0), /Another participant/)
  assert.throws(() => validateProject({ ...next, statusHistory: [{ status: 'committee_review' }] }, previous, 1), /preserved/)
  assert.throws(() => validateProject({ ...next, status: 'active' }, previous, 1), /transition/)
  assert.throws(() => validateProject({ ...next, extra: 'x'.repeat(750000) }, previous, 1), /750 KB/)
})

test('async shared adapter supports proposal → staff → researcher and reviewer persistence', async () => {
  let records = createDemoProjects().map(p => ({ ...p, _version: 1 }))
  let reject = false
  configureProjectStore({ read: () => structuredClone(records), save: async projects => {
    await Promise.resolve()
    if (reject) throw new Error('Server rejected write')
    for (const project of projects) {
      const previous = records.find(p => p.id === project.id)
      if (JSON.stringify(project) === JSON.stringify(previous)) continue
      const next = validateProject(JSON.parse(JSON.stringify(project)), previous, previous?._version || 0)
      records = [...records.filter(p => p.id !== next.id), next]
    }
  } })
  try {
    const researcher = { role: 'researcher', username: 'demo-user' }, staff = { ...researcher, role: 'staff' }
    const proposal = { ...createDemoProjects()[0].proposal, projectTitle: 'Fictional async test' }
    const draft = await saveProposal(proposal, researcher)
    assert.equal(getProjects().find(p => p.id === draft.id).status, 'draft')
    await saveProposal({ ...proposal, _projectId: draft.id }, researcher, true)
    const form = { date: '2026-10-19', responsible: 'Demo staff', notes: 'Fictional external result' }
    for (const status of ['unit_review', 'eoffice_pending']) await updateProject(draft.id, p => recordAdministrativeResult(p, form, staff, status))
    await updateProjectStatus(draft.id, 'revision_required', 'Fictional revision reason')
    assert.equal(getProjects().find(p => p.id === draft.id).status, 'revision_required')
    await saveProposal({ ...proposal, _projectId: draft.id }, researcher, true)
    await updateProjectStatus(draft.id, 'committee_review', 'Fictional review complete')
    assert.equal(getProjects().find(p => p.id === draft.id).reviewNotes.length, 2)
    await persist('MFU-DEMO-018', 'review_draft', { chapters: 'Fictional review only' }, { ...researcher, role: 'reviewer' })
    assert.equal(getProjects().find(p => p.id === 'MFU-DEMO-018').closure.evaluations['demo-user'].chapters, 'Fictional review only')
    reject = true
    await assert.rejects(saveProposal({ ...proposal, projectTitle: 'Must not save' }, researcher), /Server rejected/)
    assert.ok(!getProjects().some(p => p.title === 'Must not save'))
  } finally { configureProjectStore(null) }
})
