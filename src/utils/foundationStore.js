import { createFoundationFixtures, FOUNDATION_DEMO_WORKSPACE, foundationContext, foundationActors } from '../data/foundationDemo.js'
import { executeProjectAction, readProjectResource } from '../domain/actions.js'
import { migrationDryRun } from '../domain/migration.js'
import { requireDomain } from '../domain/contracts.js'
import { createResearcherScenarios } from '../data/researcherScenarios.js'
import { createStaffScenarios } from '../data/staffScenarios.js'
import { updateDemoDatabase } from './demoDatabase.js'

export const FOUNDATION_DEMO_KEY = 'mfu-foundation-v16-demo-projects'
let cachedRows
let channel
const validateRows = rows => {
  requireDomain(Array.isArray(rows) && rows.every(p => p.schemaVersion === '1.6' && p.fictional === true && p.simulationOnly === true && p.workspace === FOUNDATION_DEMO_WORKSPACE),
    'INVALID_DEMO_STORE', 'Only explicitly fictional v1.6 records may use the foundation demo namespace')
  return rows
}
async function persist(update) {
  const result = await updateDemoDatabase(rows => update(validateRows(rows)))
  cachedRows = result.rows
  channel?.postMessage('updated')
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
  return result.value
}
// No migration writer. Reset is confined to this explicitly fictional namespace.
export function resetFoundationDemo(storage = localStorage) {
  if (cachedRows && typeof localStorage !== 'undefined' && storage === localStorage) return persist(() => ({ rows: createFoundationFixtures() })).then(() => { for (const uid of Object.keys(foundationActors)) storage.removeItem?.(`mfu-v16-notification-read:${FOUNDATION_DEMO_WORKSPACE}:${uid}`) })
  readFoundationProjects(storage) // Preserve malformed/unrecognized data; never erase it.
  const fixtures = createFoundationFixtures()
  storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(fixtures))
  for (const uid of Object.keys(foundationActors)) storage.removeItem?.(`mfu-v16-notification-read:${FOUNDATION_DEMO_WORKSPACE}:${uid}`)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
  return fixtures
}
export function initializeFoundationDemo(storage = localStorage) {
  if (typeof localStorage !== 'undefined' && storage === localStorage && typeof indexedDB !== 'undefined') return (async () => {
    const old = storage.getItem(FOUNDATION_DEMO_KEY)
    const previous = old === null ? null : validateRows(JSON.parse(old))
    const result = await updateDemoDatabase(rows => {
      if (rows && previous) requireDomain(JSON.stringify(rows) === JSON.stringify(previous), 'DEMO_MIGRATION_CONFLICT', 'Different demo data exists in both browser stores; neither copy was changed')
      return { rows: rows ? validateRows(rows) : previous || createFoundationFixtures() }
    })
    cachedRows = result.rows
    // Remove only the exact copy successfully transferred, never a concurrently modified record.
    if (old !== null && storage.getItem(FOUNDATION_DEMO_KEY) === old && JSON.stringify(result.rows) === JSON.stringify(previous)) storage.removeItem(FOUNDATION_DEMO_KEY)
    if (!channel && typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('mfu-foundation-v16-updates')
      channel.onmessage = async () => {
        try { const current = await updateDemoDatabase(rows => ({ rows: validateRows(rows) })); cachedRows = current.rows; window.dispatchEvent(new Event('mfu-projects-updated')) } catch { /* The next action will report any storage error. */ }
      }
    }
    return cachedRows
  })()
  if (storage.getItem(FOUNDATION_DEMO_KEY) === null) {
    storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(createFoundationFixtures()))
  }
  return readFoundationProjects(storage)
}
export function readFoundationProjects(storage = localStorage) {
  if (cachedRows && typeof localStorage !== 'undefined' && storage === localStorage) return cachedRows
  const rows = JSON.parse(storage.getItem(FOUNDATION_DEMO_KEY) || '[]')
  return validateRows(rows)
}
export function dispatchFoundationDemo(projectId, command, uid, storage = localStorage) {
  if (cachedRows && typeof localStorage !== 'undefined' && storage === localStorage) return persist(rows => {
    const index = rows.findIndex(p => p.id === projectId)
    requireDomain(index >= 0 || command.action === 'create_project' && command.payload?.projectId === projectId, 'PROJECT_NOT_FOUND', 'Foundation demo project not found', 404)
    const current = index >= 0 ? rows[index] : null
    let effective = command
    if (current && command.action === 'attach_document' && command.expectedVersion < current._version) {
      const events = current.statusHistory.filter(event => event.projectVersion > command.expectedVersion)
      if (events.length === current._version - command.expectedVersion && events.every(event => event.action === 'attach_document')) {
        const document = command.payload.document
        const version = Math.max(0, ...current.documents.filter(d => d.kind === document.kind).map(d => d.version)) + 1
        effective = { ...command, expectedVersion: current._version, payload: { ...command.payload, document: { ...document, version } } }
      }
    }
    const next = executeProjectAction(current, effective, { ...foundationContext(uid), now: new Date().toISOString() })
    if (index >= 0) rows[index] = next
    else rows.push(next)
    return { rows, value: next }
  }).catch(async error => {
    if (error.code === 'VERSION_CONFLICT') {
      const fresh = await updateDemoDatabase(rows => ({ rows: validateRows(rows) }))
      cachedRows = fresh.rows
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
      error.message = 'ข้อมูลโครงการเปลี่ยนแล้ว ระบบอัปเดตข้อมูลล่าสุดให้แล้ว กรุณาตรวจสอบและลองอีกครั้ง'
    }
    throw error
  })
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
  if (cachedRows && typeof localStorage !== 'undefined' && storage === localStorage) return persist(rows => { for (const fixture of createResearcherScenarios()) if (!rows.some(p => p.id === fixture.id)) rows.push(fixture); return { rows } })
  const rows = readFoundationProjects(storage)
  for (const fixture of createResearcherScenarios()) if (!rows.some(p => p.id === fixture.id)) rows.push(fixture)
  storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(rows))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
}
export function addStaffScenarios(storage = localStorage) {
  if (cachedRows && typeof localStorage !== 'undefined' && storage === localStorage) return persist(rows => { for (const fixture of createStaffScenarios()) if (!rows.some(p => p.id === fixture.id)) rows.push(fixture); return { rows } })
  const rows = readFoundationProjects(storage)
  for (const fixture of createStaffScenarios()) if (!rows.some(p => p.id === fixture.id)) rows.push(fixture)
  storage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(rows))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
}
