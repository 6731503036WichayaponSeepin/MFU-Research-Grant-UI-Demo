import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({cacheDir:'node_modules/.vite-tests/work-plan',envDir:'tmp/work-plan-no-env',server:{host:'127.0.0.1',port:5229,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5229/',errors=[]
page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('dialog',d=>d.accept())
page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR',m.text())})
try{
 await page.goto(base+'#/researcher/dashboard');await page.getByRole('button',{name:'EN',exact:true}).click()
 await page.goto(base+'#/researcher/projects/V16-DRAFT/manual');await page.locator('.rs1-work-plan').waitFor()
 await page.getByLabel('Start Date *',{exact:true}).fill('2026-01-01');await page.getByLabel('End Date *',{exact:true}).fill('2027-12-31')
 const row=page.locator('.rs1-task-row')
 check(await row.count()===1,'initial dynamic task');check(await page.getByLabel('Task 1 start date',{exact:true}).inputValue()==='2026-01-01','first starts with project')
 check(await page.getByLabel('Task 1 start date',{exact:true}).getAttribute('readonly')!==null,'derived start is read-only')
 for(let i=1;i<=5;i++){
  if(i>1)await page.getByRole('button',{name:'+ Add Task',exact:true}).click()
  await page.getByLabel('Task '+i,{exact:true}).fill('แผนงานวิจัย '+i)
  await page.getByLabel('Task '+i+' end date',{exact:true}).fill(`2026-0${i+2}-01`)
 }
 check(await row.count()===5,'unlimited task rows');check(await page.getByLabel('Task 5 start date',{exact:true}).inputValue()==='2026-06-01','chain to preceding end')
 check(await page.locator('.rs1-gantt-bar').count()===5,'date-based Gantt contains all valid tasks')
 await page.getByLabel('Task 1 end date',{exact:true}).fill('2026-02-15');check(await page.getByLabel('Task 2 start date',{exact:true}).inputValue()==='2026-02-15','dependent start updates')
 await page.getByLabel('Start Date *',{exact:true}).fill('2026-01-15');check(await page.getByLabel('Task 1 start date',{exact:true}).inputValue()==='2026-01-15','project date change updates chain')
 await page.getByLabel('Task 2 end date',{exact:true}).fill('2026-02-01');check((await page.locator('.rs1-work-plan').innerText()).includes('must not precede'),'chronological validation')
 await page.getByLabel('Task 2 end date',{exact:true}).fill('2028-01-02');check((await page.locator('.rs1-work-plan').innerText()).includes('within the project period'),'project boundary validation')
 await page.getByLabel('Task 2 end date',{exact:true}).fill('2026-04-01')
 await page.getByLabel('End Date *',{exact:true}).fill('2028-01-16');check((await page.locator('.rs1-work-plan').innerText()).includes('must not exceed two years'),'two-year project validation')
 await page.getByLabel('End Date *',{exact:true}).fill('2027-12-31')
 await page.reload();await row.first().waitFor();check(await row.count()===5,'private draft recovery retains all tasks')
 check(await page.getByLabel('Task 2 start date',{exact:true}).inputValue()==='2026-02-15','recovery keeps chain')
 await page.getByRole('button',{name:'Review →',exact:true}).click();check((await page.locator('.rs1-work-plan').innerText()).includes('แผนงานวิจัย 5'),'read-only preview all tasks')
 await page.getByLabel('I have reviewed the information',{exact:true}).check();await page.getByRole('button',{name:'Confirm Review',exact:true}).click();await page.waitForURL(/proposal-pdf$/)
 const result=await page.evaluate(async()=>{const p=JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id==='V16-DRAFT');const {generateRS1PDF}=await import('/src/utils/generateRS1PDF.js');const {extractDocumentText}=await import('/src/utils/rs1Extraction.js');const {extractRS1Fields}=await import('/src/utils/rs1FieldMapping.js');const pdf=await generateRS1PDF(p.proposal),text=(await extractDocumentText(new File([pdf.blob],'work-plan.pdf',{type:'application/pdf'}))).text;return {p,text,imported:extractRS1Fields(text),bytes:Array.from(new Uint8Array(await pdf.blob.arrayBuffer()))}})
 check(result.p.status==='DRAFT','saving never changes project state');check(result.p.proposal.workTasks.length===5,'canonical rows retained');check(result.p.proposalVersions.at(-1).proposal.workTasks.length===5,'version snapshot all rows')
 check(result.text.includes('แผนงานวิจัย 5')&&result.text.includes('2026-06-01')&&result.text.includes('2026-07-01'),'generated PDF all tasks and ranges')
 check(result.imported.workTasks?.length===5,'generated PDF re-import retains all tasks')
 await mkdir('tmp/rs1-work-plan',{recursive:true});await writeFile('tmp/rs1-work-plan/tasks.pdf',Buffer.from(result.bytes))
 await page.goto(base+'#/staff/projects/V16-DRAFT/staff-review');await page.locator('.staff-proposal-review').waitFor();check((await page.locator('.staff-proposal-review .rs1-work-plan').innerText()).includes('แผนงานวิจัย 5'),'Staff sees every task');check(await page.getByRole('button',{name:'+ Add Task',exact:true}).count()===0,'Staff proposal read-only')
 await page.goto(base+'#/researcher/projects/V16-DRAFT/manual');await row.first().waitFor();await page.getByRole('button',{name:'Remove Task 2',exact:true}).click();check(await row.count()===4,'remove a task');check(await page.getByLabel('Task 2 start date',{exact:true}).inputValue()==='2026-02-15','removal updates dependent start')
 await page.locator('.rs1-work-plan').scrollIntoViewIfNeeded();await page.screenshot({path:'tmp/rs1-work-plan/desktop.png',fullPage:false})
 for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await page.getByRole('button',{name:lang,exact:true}).click();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width)}
 await page.goto(base+'#/researcher/dashboard');await page.getByRole('button',{name:'Add Research Scenarios',exact:true}).click();await page.goto(base+'#/researcher/projects/V16-CORRECTION/manual');await row.first().waitFor();check(await page.getByRole('button',{name:'+ Add Task',exact:true}).isDisabled(),'unrequested correction cannot add tasks');check(await page.getByLabel('Task 1',{exact:true}).isDisabled(),'unrequested correction task locked')
 await page.goto(base+'#/researcher/upload');await page.locator('input[type=file]').setInputFiles('tests/fixtures/rs1-original-content.docx');await page.locator('.upload-result').waitFor();check((await page.locator('.rs1-work-plan').innerText()).includes('January–March 2027'),'legacy DOCX free-text period preserved');check(await page.getByLabel('Task 1',{exact:true}).inputValue()==='Collect baseline data','DOCX task import')
 await page.getByLabel('I have reviewed and corrected the extracted values',{exact:true}).check();await page.getByRole('button',{name:'Continue to RS-1 Form',exact:true}).click();await page.locator('.rs1-document-form').waitFor();check(await page.getByLabel('Task 1',{exact:true}).inputValue()==='Collect baseline data','reviewed imported task transfers')
 await page.goto(base+'#/researcher/upload');await page.locator('input[type=file]').setInputFiles('tmp/rs1-work-plan/tasks.pdf');await page.locator('.upload-result').waitFor();check(await page.locator('.rs1-task-row').count()===5,'actual PDF upload preserves all five tasks');check(await page.getByLabel('Task 5',{exact:true}).inputValue()==='แผนงานวิจัย 5','fifth imported task review')
 await page.getByLabel('I have reviewed and corrected the extracted values',{exact:true}).check();await page.getByRole('button',{name:'Continue to RS-1 Form',exact:true}).click();await page.locator('.rs1-document-form').waitFor();check(await page.locator('.rs1-task-row').count()===5,'PDF reviewed transfer retains all tasks')
 check(errors.length===0,'no runtime errors');console.log(`PASS RS-1 dynamic working plan ${n} checks`)
}finally{await browser.close();await server.close()}
