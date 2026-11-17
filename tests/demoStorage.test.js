import test from 'node:test'
import assert from 'node:assert/strict'
import 'fake-indexeddb/auto'
import { createFoundationFixtures } from '../src/data/foundationDemo.js'
import { FOUNDATION_DEMO_KEY, initializeFoundationDemo, readFoundationProjects, dispatchFoundationDemo } from '../src/utils/foundationStore.js'

test('migrates existing records, stores large PDFs and preserves them across subsequent writes', async () => {
  const values = new Map(), legacy = createFoundationFixtures()
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
  globalThis.BroadcastChannel = undefined
  localStorage.setItem(FOUNDATION_DEMO_KEY, JSON.stringify(legacy))
  await initializeFoundationDemo()
  assert.equal(localStorage.getItem(FOUNDATION_DEMO_KEY), null)
  assert.deepEqual(readFoundationProjects(), legacy)
  let project = readFoundationProjects().find(p => p.id === 'V16-DRAFT')
  const bytes = '%PDF-' + 'a'.repeat(1500000)
  for (let i = 0; i < 4; i++) {
    const document = { id: `large-pdf-${i}`, kind: 'support', name: `file-${i}.pdf`, size: bytes.length, version: i + 1, dataUrl: `data:application/pdf;base64,${btoa(bytes)}` }
    project = await dispatchFoundationDemo(project.id, { id: `upload-${i}`, action: 'attach_document', expectedVersion: project._version, payload: { document } }, 'demo-user')
  }
  assert.equal(project.status, 'DRAFT')
  assert.equal(readFoundationProjects().find(p => p.id === project.id).documents.filter(d => d.id.startsWith('large-pdf-')).length, 4)
  await initializeFoundationDemo()
  assert.equal(readFoundationProjects().find(p => p.id === project.id).documents.find(d => d.id === 'large-pdf-0').dataUrl, `data:application/pdf;base64,${btoa(bytes)}`)
})
