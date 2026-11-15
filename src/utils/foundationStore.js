import { createFoundationFixtures, FOUNDATION_DEMO_WORKSPACE, foundationContext, foundationActors } from '../data/foundationDemo.js'
import { executeProjectAction, readProjectResource } from '../domain/actions.js'
import { migrationDryRun } from '../domain/migration.js'
import { requireDomain } from '../domain/contracts.js'
import { createResearcherScenarios } from '../data/researcherScenarios.js'
import { createStaffScenarios } from '../data/staffScenarios.js'

export const FOUNDATION_DEMO_KEY = 'mfu-foundation-v16-demo-projects'
// No migration writer. Reset is confined to this explicitly fictional namespace.
export function resetFoundationDemo(storage = localStorage) {
  readFoundationProjects(storage) // Preserve malformed/unrecognized data; never erase it.
  const fixtures = createFoundationFixtures()
  storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(fixtures))
  for (const uid of Object.keys(foundationActors)) storage.removeItem?.(`mfu-v16-notification-read:${FOUNDATION_DEMO_WORKSPACE}:${uid}`)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
  return fixtures
}
export function initializeFoundationDemo(storage = localStorage) {
  if (storage.getItem(FOUNDATION_DEMO_KEY) === null) {
    storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(createFoundationFixtures()))
  }
  return readFoundationProjects(storage)
}
export function readFoundationProjects(storage = localStorage) {
  const rows = JSON.parse(storage.getItem(FOUNDATION_DEMO_KEY) || '[]')
  requireDomain(Array.isArray(rows) && rows.every(p => p.schemaVersion === '1.6' && p.fictional === true && p.simulationOnly === true && p.workspace === FOUNDATION_DEMO_WORKSPACE),
    'INVALID_DEMO_STORE', 'Only explicitly fictional v1.6 records may use the foundation demo namespace')
  return rows
}
export function dispatchFoundationDemo(projectId, command, uid, storage = localStorage) {
  const rows = readFoundationProjects(storage), index = rows.findIndex(p => p.id === projectId)
  requireDomain(index >= 0 || command.action === 'create_project' && command.payload?.projectId === projectId, 'PROJECT_NOT_FOUND', 'Foundation demo project not found', 404)
  const next = executeProjectAction(index >= 0 ? rows[index] : null, command, { ...foundationContext(uid), now: new Date().toISOString() })
  if (index >= 0) rows[index] = next
  else rows.push(next)
  storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(rows))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
  return next
}
export function readFoundationDemo(projectId, uid, request = { type: 'project' }, storage = localStorage) {
  const p = readFoundationProjects(storage).find(p => p.id === projectId)
  requireDomain(!!p, 'PROJECT_NOT_FOUND', 'Foundation demo project not found', 404)
  return readProjectResource(p, foundationContext(uid).actor, request, 'local-demo')
}
export const previewLegacyMigration = records => migrationDryRun(records)
export function addResearcherScenarios(storage = localStorage) {
  const rows = readFoundationProjects(storage)
  for (const fixture of createResearcherScenarios()) if (!rows.some(p => p.id === fixture.id)) rows.push(fixture)
  storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(rows))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
}
export function addStaffScenarios(storage = localStorage) {
  const rows = readFoundationProjects(storage)
  for (const fixture of createStaffScenarios()) if (!rows.some(p => p.id === fixture.id)) rows.push(fixture)
  storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(rows))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
}
