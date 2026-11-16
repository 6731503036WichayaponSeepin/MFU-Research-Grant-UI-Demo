import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoundationFixtures, foundationContext, foundationActors } from '../src/data/foundationDemo.js'
import { createResearcherScenarios } from '../src/data/researcherScenarios.js'
import { executeProjectAction } from '../src/domain/actions.js'
import { executeFoundationCommand } from '../functions/foundationPolicy.js'
import { demoDocument } from '../src/data/demoAttachment.js'
import { researcherRows, RESEARCHER_GROUPS, researcherDraftKey, mergeImportedDraft } from '../src/utils/researcherWorkspace.js'
import { extractRS1Fields } from '../src/utils/rs1FieldMapping.js'
import { correctionFields } from '../src/domain/localDemoPolicy.js'
const fixture = id => createFoundationFixtures().find(p => p.id === id)
let sequence = 0
const action = (p, name, payload = {}, uid = 'demo-user') => executeProjectAction(p, { id: `phase2-${++sequence}`, action: name, payload, expectedVersion: p?._version || 0 }, foundationContext(uid))
test('dashboard groups and filters are canonical and owner/workspace scoped, and draft keys isolate identities', () => {
  const rows = createFoundationFixtures(), actor = foundationActors['demo-user']
  for (const [group, states] of Object.entries(RESEARCHER_GROUPS)) assert.equal(researcherRows(rows, actor, { group }).length, rows.filter(p => states.includes(p.status)).length)
  assert.equal(researcherRows([...rows, { ...rows[0], id: 'other', ownerUid: 'another-owner' }], actor).length, 14)
  assert.equal(researcherRows(rows, { ...actor, workspace: 'foreign' }).length, 0)
  assert.notEqual(researcherDraftKey(actor), researcherDraftKey({ ...actor, uid: 'other' }))
})
test('text extraction never invents missing values; deliberate blank clears while missing keys preserve draft', () => {
  const found = extractRS1Fields('Project Title: Extracted project\nProject Leader: Researcher\n')
  assert.equal(found.projectTitle, 'Extracted project'); assert.equal(found.methodology, undefined)
  const merged = mergeImportedDraft({ projectTitle: 'old', objectives: 'keep', advisorName: 'clear' }, { ...found, advisorName: '' })
  assert.equal(merged.objectives, 'keep'); assert.equal(merged.advisorName, '')
})
test('temporary TR-03 needs latest version PDF, explicit confirmation and local-only trusted context', () => {
  let p = fixture('V16-DRAFT')
  const document = { ...demoDocument, id: 'latest-pdf', kind: 'proposal_pdf', version: 1, proposalVersionId: p.proposalVersions.at(-1).id }
  p = action(p, 'attach_document', { document }); const draft = structuredClone(p)
  assert.throws(() => action(p, 'confirm_ready', { documentId: document.id }), /confirmation/i)
  const next = action(p, 'confirm_ready', { documentId: document.id, confirmed: true })
  assert.equal(next.status, 'AFFILIATION_REVIEW'); assert.equal(next.proposalReady.confirmedBy, 'demo-user'); assert.ok(next.proposalReady.confirmedAt)
  const backendActor = { ...foundationActors['demo-user'], authenticated: true }
  assert.throws(() => executeFoundationCommand(draft, { id: 'backend-ready', action: 'confirm_ready', expectedVersion: draft._version, payload: { documentId: document.id, confirmed: true, enableOpen: true } }, backendActor, foundationActors), /OPEN-04/)
  p = action(p, 'save_proposal', { proposal: { ...p.proposal, projectTitle: 'new version' } })
  assert.throws(() => action(p, 'confirm_ready', { documentId: document.id, confirmed: true }), /latest saved/)
})

test('local reviewed incomplete draft may reach affiliation but Staff submission still validates completeness',()=>{
  let p=action(null,'create_project',{projectId:'incomplete-ready',proposal:{projectTitle:'Reviewed partial data'}})
  const document={...demoDocument,id:'partial-pdf',kind:'proposal_pdf',version:1,proposalVersionId:p.proposalVersions.at(-1).id}
  p=action(p,'attach_document',{document})
  p=action(p,'confirm_ready',{documentId:document.id,confirmed:true})
  assert.equal(p.status,'AFFILIATION_REVIEW')
  assert.equal(p.proposal.leaderName,undefined)
  assert.throws(()=>action(p,'submit_proposal',{proposalVersionId:p.proposalVersions.at(-1).id,documentIds:[],signaturesComplete:true,usesOthersElectronicSignatures:false}))
  assert.equal(p.status,'AFFILIATION_REVIEW')
})
test('correction edits only requested sections; protected identities, state and history cannot be modified', () => {
  let p = createResearcherScenarios().find(p => p.id === 'V16-CORRECTION')
  assert.ok(correctionFields(p, foundationActors['demo-user'], 'local-demo').includes('methodology'))
  assert.deepEqual(correctionFields(p, foundationActors['demo-user'], 'backend'), [])
  assert.throws(() => executeFoundationCommand(p, { id: 'backend-correction', action: 'save_proposal', expectedVersion: p._version, payload: { proposal: { ...p.proposal, projectTitle: 'local permission must not leak' } } }, { ...foundationActors['demo-user'], authenticated: true }, foundationActors), /Only requested/)
  assert.throws(() => action(p, 'save_proposal', { proposal: { ...p.proposal, leaderName: 'not requested' } }), /Only requested/)
  const next = action(p, 'save_proposal', { proposal: { ...p.proposal, projectTitle: 'permitted', ownerUid: 'attacker', status: 'CLOSED', statusHistory: [] } })
  assert.equal(next.status, 'STAFF_REVIEW'); assert.equal(next.ownerUid, p.ownerUid); assert.ok(next.statusHistory.length > p.statusHistory.length)
  assert.equal(next.proposal.projectTitle, 'permitted')
  assert.throws(() => action(next, 'return_to_affiliation'), /OPEN-05/)
})
test('signed evidence must reference current version; conditional consent records identity/time/project/version', () => {
  let p = fixture('V16-AFFILIATION'), version = p.proposalVersions.at(-1).id
  const data = { proposalVersionId: version, documentIds: p.documents.map(d => d.id), signaturesComplete: true, usesOthersElectronicSignatures: true }
  assert.throws(() => action(p, 'submit_proposal', data), /Consent/)
  p = action(p, 'submit_proposal', { ...data, consentConfirmed: true })
  assert.equal(p.signatureConsent.projectId, p.id); assert.equal(p.signatureConsent.proposalVersionId, version); assert.ok(p.signatureConsent.confirmedAt)
  let correction = createResearcherScenarios()[0]
  correction = action(correction, 'save_proposal', { proposal: { ...correction.proposal, methodology: 'revised' } })
  assert.throws(() => action(correction, 'resubmit_proposal', { ...data, proposalVersionId: correction.proposalVersions.at(-1).id }), /reference this proposal version/)
})
test('closure supplementary and revised report contracts retain state/history and never create another review', () => {
  let p = createResearcherScenarios().find(p => p.id === 'V16-CLOSURE-MORE')
  p = action(p, 'supplement_closure', { method: 'report', summary: p.closure.summary, finishedDate: p.closure.finishedDate, documentIds: p.closure.documentIds })
  assert.equal(p.status, 'CLOSURE_REVIEW')
  let r = fixture('V16-RELEASED'), assignments = structuredClone(r.closure.assignments), evaluations = structuredClone(r.closure.evaluations)
  r = action(r, 'attach_document', { document: { ...demoDocument, id: 'new-revised', kind: 'revised_report', version: 1 } })
  r = action(r, 'submit_revised_report', { documentIds: ['new-revised'], confirmed: true })
  assert.equal(r.status, 'REPORT_EVALUATION'); assert.deepEqual(r.closure.assignments, assignments); assert.deepEqual(r.closure.evaluations, evaluations)
})
test('reviewed import metadata is archived without invented source bytes or mutation of older snapshots', () => {
  const p = fixture('V16-DRAFT'), previous = JSON.stringify(p.proposalVersions)
  const next = action(p, 'save_proposal', { proposal: p.proposal, importSource: { id: 'source-1', name: 'input.docx', type: 'docx', size: 100, fields: ['projectTitle'], reviewed: true } })
  assert.equal(next.importSources[0].reviewedBy, p.ownerUid)
  assert.equal(next.importSources[0].extraction, 'text-patterns-not-OCR')
  assert.equal(JSON.stringify(p.proposalVersions), previous)
})
