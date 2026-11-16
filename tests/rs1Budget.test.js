import test from 'node:test'
import assert from 'node:assert/strict'
import {budgetRows,budgetPatch,budgetSubtotal,invalidBudgetAmount,BUDGET_CATEGORIES} from '../src/utils/rs1Budget.js'
import {proposalData} from '../src/domain/model.js'
import {proposalFieldErrors} from '../src/utils/proposalValidation.js'
import {executeProjectAction} from '../src/domain/actions.js'
import {createResearcherScenarios} from '../src/data/researcherScenarios.js'
import {foundationContext} from '../src/data/foundationDemo.js'

test('dynamic budget retains every row, category totals, removal and legacy aliases',()=>{
 let data={materials:'300',materialsDetail:'Original material description'}
 assert.deepEqual(budgetRows(data,'materials'),[{description:'Original material description',amount:'300'}])
 for(const category of BUDGET_CATEGORIES){const rows=Array.from({length:5},(_,i)=>({description:category+' '+i,amount:String((i+1)*100)}));data={...data,...budgetPatch(data,category,rows)};assert.equal(data[category],'1500');assert.equal(budgetRows(data,category).length,5)}
 const saved=proposalData(JSON.parse(JSON.stringify(data)))
 assert.deepEqual(saved.budgetItems,data.budgetItems)
 data={...saved,...budgetPatch(saved,'compensation',budgetRows(saved,'compensation').filter((_,i)=>i!==1))}
 assert.equal(data.compensation,'1300');assert.equal(data.compensationItem2,'compensation 2')
 data={...data,...budgetPatch(data,'compensation',[])}
 assert.deepEqual(budgetRows(data,'compensation'),[]);assert.equal(data.compensation,'0');assert.equal(data.compensationItem1,'')
 assert.equal(budgetSubtotal(budgetRows(data,'utility')),1500)
})
test('budget rejects negative/nonnumeric amounts and malformed records without requiring descriptions',()=>{
 for(const value of ['-1','NaN','Infinity',null,{},-0.1])assert.equal(invalidBudgetAmount(value),true)
 for(const value of ['',0,'0','12.50'])assert.equal(invalidBudgetAmount(value),false)
 assert.throws(()=>proposalData({budgetItems:{unknown:[]}}))
 assert.throws(()=>proposalData({budgetItems:{materials:[{description:'x',amount:'1',extra:'x'}]}}))
 assert.deepEqual(proposalData({budgetItems:{materials:[{description:'',amount:'0'}]}}).budgetItems.materials,[{description:'',amount:'0'}])
 const data=budgetPatch({},'materials',[{description:'',amount:'-1'}])
 assert.ok(proposalFieldErrors(data).some(e=>e.messageEn==='Expense item amounts must be nonnegative.'))
})
test('budget correction follows existing section permissions and versions retain all rows',()=>{
 const p=createResearcherScenarios().find(p=>p.id==='V16-CORRECTION'),rows=Array.from({length:6},(_,i)=>({description:'Expense '+i,amount:'100'}))
 const command={id:'budget-version',action:'save_proposal',expectedVersion:p._version,payload:{proposal:{...p.proposal,...budgetPatch(p.proposal,'materials',rows)}}}
 const context=foundationContext('demo-user')
 assert.throws(()=>executeProjectAction(p,command,context),{code:'EDIT_SCOPE_DENIED'})
 p.proposalReview.editableSections.push('budget')
 const result=executeProjectAction(p,command,context)
 assert.equal(result.status,'STAFF_REVIEW');assert.equal(result.proposal.budgetItems.materials.length,6)
 assert.deepEqual(result.proposalVersions.at(-1).proposal.budgetItems.materials,rows)
 assert.equal(p.proposal.budgetItems,undefined)
})
