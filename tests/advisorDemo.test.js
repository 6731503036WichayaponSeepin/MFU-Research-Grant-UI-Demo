import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildAdvisorBundle } from '../functions/demo/advisorBundle.mjs'
import { seedAdvisorBundle,validateAdvisorBundle } from '../functions/demo/seedAdvisor.mjs'
import { demoActors } from '../functions/demo/advisorSpecs.mjs'
import { projectView,collectFiles } from '../functions/securePolicy.js'
import { demoShowcase,reviewerTask } from '../src/utils/reviewerPresentation.js'
import { transition } from '../src/utils/closure.js'
const bundle=buildAdvisorBundle('tmp/advisor-demo-unit')
test('advisor dataset contains 15 stable distinct projects and five examples per role',()=>{
  assert.equal(new Set(bundle.projects.map(p=>p.id)).size,15)
  for(const role of ['researcher','staff','reviewer'])assert.equal(demoShowcase(bundle.projects,role).length,5)
  assert.equal(bundle.projects.filter(p=>p.reviewerUids.includes('test-reviewer')).length,5)
  assert.ok(bundle.projects.every(p=>p.isDemo && p.workspace==='testing' && p.ownerUid==='test-researcher' && p.status!=='completed'))
  assert.equal(bundle.projects.find(p=>p.demoCode==='B05').closure.state,'ready_close')
})
test('all 28 PDFs contain real bytes and every project reference points to a generated file',()=>{
  assert.equal(bundle.files.length,28)
  for(const file of bundle.files){const bytes=readFileSync(bundle.directory+'/'+file.localFile);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(bytes.length,file.size);assert.ok(file.size<2*1024*1024);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256)}
  const paths=new Set(bundle.files.map(f=>f.storagePath))
  for(const project of bundle.projects)for(const file of collectFiles(project))assert.ok(paths.has(file.storagePath))
})
test('reviewer examples show pending, draft and three distinct outcomes without closing projects',()=>{
  const rows=demoShowcase(bundle.projects,'reviewer').map(p=>reviewerTask(p,'test-reviewer'))
  assert.deepEqual(rows.map(r=>r.state),['pending','draft','completed','completed','completed'])
  assert.deepEqual(rows.slice(2).map(r=>r.label),['เห็นชอบ','เห็นชอบโดยมีข้อแก้ไข','ให้แก้ไขและส่งใหม่'])
  const p=bundle.projects.find(p=>p.demoCode==='C01')
  const reviewed=transition(p,'review',{objectives:0,consistency:0,abstract:0,executive:0,result:0,utilization:{},documents:[]},demoActors.reviewer)
  assert.equal(reviewed.closure.state,'staff_decision');assert.equal(reviewed.status,'closure_review')
})
test('only staff-released feedback appears in researcher views; other reviewers cannot access projects',()=>{
  for(const code of ['C03','C05']){const visible=projectView(bundle.projects.find(p=>p.demoCode===code),demoActors.researcher);assert.deepEqual(visible.closure.evaluations,{});assert.equal(visible.demoScenarioLabel,undefined)}
  assert.equal(projectView(bundle.projects.find(p=>p.demoCode==='C04'),demoActors.researcher).closure.evaluations['test-reviewer'].result,1)
  assert.throws(()=>projectView(bundle.projects.find(p=>p.demoCode==='C01'),{...demoActors.reviewer,uid:'other-reviewer'}))
})
test('preview has no Firebase dependency and scope validation blocks production workspace or unrelated project',async()=>{
  const preview=await seedAdvisorBundle({bundle,projectId:'mfu-researchgrantmanagement'})
  assert.equal(preview.mode,'PREVIEW');assert.equal(preview.created,0)
  assert.throws(()=>validateAdvisorBundle({...bundle,workspace:'production'}))
  await assert.rejects(seedAdvisorBundle({bundle,projectId:'unrelated-live-project'}))
  assert.throws(()=>validateAdvisorBundle({...bundle,projects:bundle.projects.map((p,i)=>i? p:{...p,isDemo:false})}))
})

test('single reviewer mode prepares only C01 and two PDFs, never the other fourteen projects',async()=>{
  const single=buildAdvisorBundle('tmp/reviewer-example-unit',{reviewerExample:true})
  assert.equal(single.projects.length,1);assert.equal(single.projects[0].id,'MFU-ADVISOR-V1-C01')
  assert.equal(single.files.length,2);assert.ok(single.files.every(f=>f.projectId===single.projects[0].id))
  assert.equal(single.projects[0].closure.state,'awaiting_review')
  assert.deepEqual(single.projects[0].reviewerUids,['test-reviewer'])
  const preview=await seedAdvisorBundle({bundle:single,projectId:'mfu-researchgrantmanagement'})
  assert.equal(preview.projects,1);assert.equal(preview.pdfs,2);assert.equal(preview.created,0)
  assert.throws(()=>validateAdvisorBundle({...single,projects:[{...single.projects[0],id:'MFU-ADVISOR-V1-C02'}]}))
})
