import test from 'node:test'
import assert from 'node:assert/strict'
import { replayProject, projectView, authorizeProfile, rejectInlineFiles } from '../functions/securePolicy.js'
import { buildProposal } from '../src/utils/projectStorage.js'
import { transition } from '../src/utils/closure.js'
const owner={uid:'owner',username:'owner',role:'researcher',workspace:'production'}
const staff={uid:'staff',username:'staff',role:'staff',workspace:'production'}
const reviewer={uid:'expert',username:'expert',role:'reviewer',workspace:'production'}
const proposal={projectTitle:'Research',leaderName:'Owner',objectives:'Study',methodology:'Survey',startDate:'2026-01-01',endDate:'2027-01-01',compensation:1000}
const candidate=()=>buildProposal(null,proposal,owner,false,'new-project')
test('server ignores forged status, owner, history actor, role and timestamps on proposal creation',()=>{
  const forged={...candidate(),status:'completed',ownerUid:'someone-else',reviewerUids:['attacker'],closedAt:'2000-01-01'}
  const p=replayProject(null,forged,owner,{},'2026-10-27T00:00:00.000Z')
  assert.equal(p.status,'draft');assert.equal(p.ownerUid,'owner');assert.equal(p.closedAt,undefined)
  assert.deepEqual(p.reviewerUids,[]);assert.equal(p.statusHistory.at(-1).updatedBy,'owner')
  assert.equal(p.createdAt,'2026-10-27T00:00:00.000Z')
  assert.throws(()=>replayProject(p,forged,{...owner,uid:'outsider',username:'outsider'}))
  assert.throws(()=>replayProject(p,forged,{...staff,workspace:'demo'}))
  assert.throws(()=>replayProject(null,forged,reviewer))
  assert.throws(()=>authorizeProfile({active:false,workspace:'demo',role:'staff'},'x'))
})
test('server validates assignments and cannot be bypassed through registry status',()=>{
  const p={...replayProject(null,candidate(),owner),status:'closure_review',closure:{state:'submitted',method:'report',documents:[{kind:'report'}]}}
  const next=transition(p,'check',{outcome:'complete',checked:true,reviewers:['expert']},staff)
  assert.throws(()=>replayProject(p,next,owner))
  assert.throws(()=>replayProject(p,next,staff,{expert:{active:true,role:'researcher',workspace:'production'}}))
  assert.throws(()=>replayProject(p,next,staff,{expert:{active:true,role:'reviewer',workspace:'demo'}}))
  const assigned=replayProject(p,next,staff,{expert:{active:true,role:'reviewer',workspace:'production'}})
  assert.deepEqual(assigned.reviewerUids,['expert'])
  assert.throws(()=>replayProject(assigned,{...assigned,status:'completed',statusHistory:[...assigned.statusHistory,{action:'registry_status',note:'bypass'}]},staff))
})
test('projections hide other evaluations, unreleased feedback and private registry narratives',()=>{
  const p={...replayProject(null,candidate(),owner),reviewerUids:['expert','second'],registry:{firstResult:'secret'},closure:{evaluations:{expert:{submitted:false,chapters:'private draft'},second:{submitted:true,chapters:'other reviewer'}},history:[{role:'reviewer',by:'second',snapshot:{secret:true}}]}}
  assert.deepEqual(projectView(p,owner).closure.evaluations,{})
  assert.equal(projectView(p,owner).registry,undefined)
  assert.deepEqual(Object.keys(projectView(p,reviewer).closure.evaluations),['expert'])
  assert.deepEqual(projectView(p,reviewer).closure.history,[])
  p.closure.feedbackReleasedAt='2026-10-27'
  assert.deepEqual(Object.keys(projectView(p,owner).closure.evaluations),['second'])
  assert.equal(Object.keys(projectView(p,staff).closure.evaluations).length,2)
  assert.throws(()=>projectView(p,{...reviewer,uid:'unassigned'}))
  assert.throws(()=>rejectInlineFiles({proposal:{_document:{dataUrl:'data:application/pdf;base64,abc'}}}))
})
