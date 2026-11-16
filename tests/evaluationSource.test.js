import test from 'node:test'
import assert from 'node:assert/strict'
import {cleanEvaluationAnswers,evaluationFieldErrors,validateEvaluation,evaluationOptionLabels,utilizationFormOptions,evaluationDocumentRows,EVALUATION_RUBRIC_VERSION} from '../src/utils/evaluation.js'
import {evaluationRows,evaluationPayload} from '../src/utils/reviewerWorkspace.js'
import {executeProjectAction} from '../src/domain/actions.js'
import {createFoundationFixtures,foundationContext} from '../src/data/foundationDemo.js'
const answers={objectives:0,consistency:0,abstract:0,executive:0,result:0}
test('source options preserve conditional wording and 2.3 has no additional detail',()=>{
 assert.deepEqual(evaluationOptionLabels.map(v=>v.length),[3,3,2,2])
 for(const group of evaluationOptionLabels)assert.match(group[1],/เนื่องจาก|ระบุ/)
 assert.equal(utilizationFormOptions[2],'2.3 จดสิทธิบัตร / ลิขสิทธิ์')
 assert.doesNotThrow(()=>validateEvaluation({...answers,utilization:{2:''}}))
 for(const key of [0,1,3,4])assert.ok(evaluationFieldErrors({...answers,utilization:{[key]:''}}).some(e=>e.field==='utilization-'+key))
 for(const key of ['objectives','consistency','abstract','executive'])assert.ok(evaluationFieldErrors({...answers,[key]:1}).some(e=>e.field===key+'Detail'))
 assert.ok(evaluationFieldErrors({...answers,result:2}).some(e=>e.field==='reason'))
})
test('inactive details are excluded from current payload, preview and PDF rows, with no mutation of prior data',()=>{
 const stale={...answers,objectivesDetail:'PRIVATE INACTIVE',abstractDetail:'OLD ABSTRACT',reason:'OLD REASON',utilization:{2:'NO DETAIL FOR 2.3'},additionalComments:'RETIRED EXTRA'}
 const before=JSON.stringify(stale),payload=evaluationPayload(stale)
 for(const key of ['objectivesDetail','abstractDetail','reason','additionalComments'])assert.equal(payload[key],undefined)
 assert.equal(payload.utilization[2],'');assert.equal(payload.rubricVersion,EVALUATION_RUBRIC_VERSION)
 const text=JSON.stringify([...evaluationRows(payload),...evaluationDocumentRows(stale)])
 for(const value of ['PRIVATE INACTIVE','OLD ABSTRACT','OLD REASON','NO DETAIL FOR 2.3','RETIRED EXTRA'])assert.ok(!text.includes(value))
 assert.equal(JSON.stringify(stale),before)
 assert.ok(!evaluationRows({...stale,submitted:true}).some(([,v])=>v==='OLD REASON'),'historical data stays intact but inactive answers are hidden')
 assert.equal(cleanEvaluationAnswers({...stale,result:2}).reason,'OLD REASON')
})
test('backend strips inactive fields and stamps rubric version while preserving submitted locks',()=>{
 const p=createFoundationFixtures().find(p=>p.id==='V16-EVALUATION-0'),ctx=foundationContext('demo-reviewer-1')
 const command={id:'source-submit',action:'submit_evaluation',expectedVersion:p._version,payload:{evaluation:{...answers,objectivesDetail:{invalid:'inactive'},reason:'INACTIVE',utilization:{2:'STALE'}},documentIds:[]}}
 const result=executeProjectAction(p,command,ctx),e=result.closure.evaluations['demo-reviewer-1']
 assert.equal(e.rubricVersion,EVALUATION_RUBRIC_VERSION);assert.equal(e.objectivesDetail,undefined);assert.equal(e.reason,undefined);assert.equal(e.utilization[2],'')
 assert.throws(()=>executeProjectAction(result,{...command,id:'duplicate',expectedVersion:result._version},ctx))
 assert.equal(p.closure.evaluations['demo-reviewer-1'],undefined)
})
