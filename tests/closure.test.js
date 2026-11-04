import test from 'node:test'
import assert from 'node:assert/strict'
import { transition, owns, canRead, persist, readProjects } from '../src/utils/closure.js'
const researcher={role:'researcher',username:'alice'}, staff={role:'staff',username:'staff'}, reviewer={role:'reviewer',username:'expert'}
const project={id:'one',title:'Research',status:'active',ownerUsername:'alice',statusHistory:[]}
const document=kind=>({id:'doc',name:'report.pdf',kind,size:100,dataUrl:'data:application/pdf;base64,JVBERi0='})
const submission=method=>({method,summary:'Research outcomes',finishedDate:'2026-10-17',documents:[document(method)]})
const check={outcome:'complete',checked:true,reviewer:'expert',notes:'Documents checked'}
const evaluation={scores:[5,4,5,4,5,4],comments:'Complete research findings',result:'accept'}
const step=(p,a,d,u)=>transition(p,a,d,u,'2026-10-17T12:00:00Z')
test('report workflow persists drafts, assignment, evaluation and completion',()=>{
 let p=step(project,'save_draft',submission('report'),researcher)
 assert.equal(p.status,'active'); assert.equal(p.closure.state,'draft')
 p=step(p,'submit',submission('report'),researcher)
 assert.equal(p.status,'closure_review')
 assert.throws(()=>step(p,'complete',{},staff))
 p=step(p,'check_draft',check,staff);assert.equal(p.closure.state,'submitted')
 p=step(p,'check',check,staff);assert.equal(p.closure.state,'awaiting_review')
 assert.throws(()=>step(p,'review',evaluation,{...reviewer,username:'other'}))
 p=step(p,'review_draft',evaluation,reviewer);assert.equal(p.closure.state,'awaiting_review')
 p=step(p,'review',evaluation,reviewer);assert.equal(p.closure.evaluation.total,27)
 assert.equal(p.closure.state,'final_check')
 assert.throws(()=>step(p,'complete',{},staff))
 p=step(p,'final_check',{outcome:'complete',checked:true,notes:'Final documents verified'},staff)
 p=step(p,'complete',{},staff);assert.equal(p.status,'completed');assert.equal(p.closure.closedBy,'staff')
 assert.throws(()=>step(p,'save_draft',submission('report'),researcher))
 assert.equal(project.status,'active'); assert.equal(p.closure.history.length,8)
})
test('publication closes without report evaluation',()=>{
 let p=step(project,'submit',submission('publication'),researcher)
 p=step(p,'check',{...check,reviewer:''},staff);assert.equal(p.closure.state,'ready_close')
 p=step(p,'complete',{},staff);assert.equal(p.status,'completed');assert.equal(p.closure.evaluation,null)
})
test('returns, resubmits and preserves previous decisions without stale approval',()=>{
 let p=step(project,'submit',submission('report'),researcher)
 assert.throws(()=>step(p,'check',{outcome:'incomplete',notes:''},staff))
 p=step(p,'check',{outcome:'more_info',notes:'Add appendix'},staff)
 assert.equal(p.closure.state,'returned')
 p=step(p,'submit',submission('report'),researcher);assert.equal(p.closure.revision,2);assert.equal(p.closure.check,null)
 p=step(p,'check',check,staff);p=step(p,'review',{...evaluation,result:'revise'},reviewer)
 assert.equal(p.closure.state,'revision_pending')
 assert.throws(()=>step(p,'submit',submission('report'),researcher))
 p=step(p,'notify_revision',{notes:'Please correct the findings'},staff)
 assert.equal(p.closure.state,'returned')
 p=step(p,'submit',submission('report'),researcher)
 assert.equal(p.closure.state,'final_check')
 assert.equal(p.closure.evaluation.result,'revise');assert.equal(p.closure.reviewer,'expert')
 assert.throws(()=>step(p,'complete',{},staff))
 p=step(p,'final_check',{outcome:'complete',checked:true,notes:'Corrections verified'},staff)
 assert.equal(p.closure.state,'awaiting_review')
 assert.equal(p.closure.evaluation,null)
 assert.throws(()=>step(p,'complete',{},staff))
 p=step(p,'review',evaluation,reviewer)
 p=step(p,'final_check',{outcome:'complete',checked:true,notes:'Accepted revision verified'},staff)
 p=step(p,'complete',{},staff)
 assert.equal(p.status,'completed')
 assert.equal(p.closure.submissions.length,3)
 assert.equal(p.closure.history.find(h=>h.action==='review').snapshot.result,'revise')
})
test('validates required files, scores, roles and project ownership',()=>{
 assert.equal(owns(project,{...researcher,username:'bob'}),false)
 assert.equal(canRead(project,reviewer),false)
 assert.throws(()=>step(project,'submit',submission('report'),staff))
 assert.throws(()=>step({...project,status:'draft'},'submit',submission('report'),researcher))
 assert.throws(()=>step(project,'submit',{...submission('report'),documents:[]},researcher))
 let p=step(project,'submit',submission('report'),researcher)
 assert.throws(()=>step(p,'check',{...check,checked:false},staff))
 p=step(p,'check',check,staff)
 assert.throws(()=>step(p,'review',{...evaluation,scores:[5]},reviewer))
 assert.throws(()=>step(p,'complete',{},researcher))
 assert.equal(canRead(p,reviewer),true)
})

test('storage persists documents and draft across reads; quota failure preserves saved data',()=>{
 const prior = globalThis.localStorage
 let stored=JSON.stringify([project])
 globalThis.localStorage={getItem:()=>stored,setItem:(_key,value)=>{stored=value}}
 try {
  persist('one','save_draft',submission('report'),researcher)
  assert.equal(readProjects()[0].closure.documents[0].name,'report.pdf')
  const before=stored
  globalThis.localStorage.setItem=()=>{const error=new Error('Storage full');error.name='QuotaExceededError';throw error}
  assert.throws(()=>persist('one','submit',submission('report'),researcher))
  assert.equal(stored,before)
  assert.equal(readProjects()[0].closure.state,'draft')
 } finally { if(prior===undefined)delete globalThis.localStorage;else globalThis.localStorage=prior }
})
