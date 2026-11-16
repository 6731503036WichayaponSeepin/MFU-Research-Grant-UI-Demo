import test from 'node:test'
import assert from 'node:assert/strict'
import {rs1Document,rs1DocumentFields} from '../src/data/rs1Document.js'
import {proposalData} from '../src/domain/model.js'
import {extractRS1Fields,extractRS1Tables} from '../src/utils/rs1FieldMapping.js'
test('strict RS-1 source structure has all 19 A headings, 1.1/1.2 and B1–10.2 in order',()=>{
 assert.deepEqual(rs1Document.filter(b=>/^a\d+$/.test(b.id)).map(b=>b.id),Array.from({length:19},(_,i)=>'a'+(i+1)))
 assert.equal(rs1Document.find(b=>b.id==='leader').en,'1.1 Project Leader')
 assert.equal(rs1Document.find(b=>b.id==='participant').en,'1.2 Project Participant')
 assert.deepEqual(rs1Document.filter(b=>/^b\d/.test(b.id)).map(b=>b.id),['b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b10.1','b10.2'])
 assert.equal(rs1DocumentFields.length,97)
 for(const key of ['projectTitleEn','participants','workPlan','teamSignatures','compensationDetail','directDetail','materialsDetail','utilityDetail','compensation','directCost','materials','utility'])assert.ok(!rs1DocumentFields.some(f=>f.key===key),'No unsupported original-form input: '+key)
 assert.deepEqual(proposalData({projectTitleEn:'retained',participants:'retained',workPlan:'retained',teamSignatures:'retained'}),{projectTitleEn:'retained',participants:'retained',workPlan:'retained',teamSignatures:'retained'})
})
test('strict option sets and tables retain source counts, wording and original notes',()=>{
 assert.deepEqual(rs1Document.filter(b=>b.type==='choices').map(b=>b.options.length),[5,5,3,4])
 const work=rs1Document.find(b=>b.id==='work-plan'),budget=rs1Document.find(b=>b.id==='budget')
 assert.deepEqual(work.headers,['Task','Period']);assert.equal(work.rows.length,3)
 assert.equal(budget.categories.length,4);for(const c of budget.categories)assert.equal(c.rows.length,3)
 assert.equal(rs1Document.filter(b=>b.type==='signature').length,3)
 assert.equal(rs1Document.find(b=>b.id==='signature-note').en,"Note. If an electronic signature is used, the owner's consent must be obtained.")
 assert.ok(rs1Document.find(b=>b.id==='a13').instruction.en.startsWith('0%'))
 assert.equal(rs1Document.find(b=>b.id==='a18').options[0].en,'No human trail / No animal use / Modern biotechnology-related research')
 assert.equal(rs1Document.filter(b=>b.id.startsWith('c-requirement-')).length,4)
})
test('source-paragraph responses and tables import without treating blank instructions as answers',()=>{
 const guide=rs1Document.find(b=>b.id==='a13').instruction.en
 assert.deepEqual(extractRS1Fields('Research Progress According to the Duration of Reporting the Progress of the Research\n'+guide+'\nExpected Outcomes of the Research'),{})
 const result=extractRS1Fields('Objectives of the Research Project\nActual objective\nLiterature Review\nActual literature\nReferences (please specify according to the international format)')
 assert.equal(result.objectives,'Actual objective');assert.equal(result.literature,'Actual literature')
 const tables=extractRS1Tables([[['Task','Period'],['Collect data','January'],['2.......','']],[['The Expense list (diffuse the multipliers)','Amount (Baht)'],['Category 1: Compensation',''],['Assistant','1,500'],['',''],['',''],['Category 2: Direct Cost',''],['Travel','200']]])
 assert.equal(tables.workTask1,'Collect data');assert.equal(tables.workTask2,'');assert.equal(tables.workTasks.length,1)
 assert.equal(tables.compensationAmount1,'1500');assert.equal(tables.compensation,'1500');assert.equal(tables.directCost,'200')
})
