import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/budget-no-env',server:{host:'127.0.0.1',port:5227,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5227/',errors=[]
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
try{
 await page.goto(base+'#/researcher/dashboard');await page.getByRole('button',{name:'EN',exact:true}).click()
 await page.goto(base+'#/researcher/projects/V16-DRAFT/manual');await page.locator('.rs1-budget-row').first().waitFor()
 const old=await page.evaluate(()=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id==='V16-DRAFT').proposal)
 check(await page.getByRole('button',{name:/^Add expense —/}).count()===4,'four categories retain independent add controls')
 for(let i=0;i<4;i++)await page.getByRole('button',{name:'Add expense — compensation',exact:true}).click()
 const rows=page.locator('.rs1-budget-row[data-category=compensation]')
 check(await rows.count()>=5,'more than three expense rows supported')
 const count=await rows.count()
 for(let i=0;i<count;i++){await rows.nth(i).locator('input').nth(0).fill('ค่าเก็บข้อมูลภาคสนาม '+(i+1));await rows.nth(i).locator('input').nth(1).fill(String((i+1)*100))}
 const subtotal=count*(count+1)*50
 check((await page.locator('.rs1-budget-actions output').first().innerText()).replaceAll(',','')===subtotal.toFixed(2),'automatic subtotal')
 check(Number((await page.locator('.rs1-reference-table').last().locator('output').last().innerText()).replaceAll(',',''))===subtotal+['directCost','materials','utility'].reduce((sum,key)=>sum+Number(old[key]||0),0),'automatic grand total includes all categories')
 await rows.last().locator('input').nth(1).fill('-1');check(await rows.last().getByRole('alert').count()===1,'negative amount visible validation')
 await rows.last().locator('input').nth(1).fill(String(count*100))
 await page.reload();await page.locator('.rs1-budget-row').first().waitFor();check(await rows.count()===count,'autosave recovers all rows')
 await page.getByRole('button',{name:'Review →',exact:true}).click();check((await page.locator('.rs1-form-panel').innerText()).includes('ค่าเก็บข้อมูลภาคสนาม '+count),'preview retains final dynamic row')
 await page.getByLabel('I have reviewed the information',{exact:true}).check();await page.getByRole('button',{name:'Confirm Review',exact:true}).click();await page.waitForURL(/proposal-pdf$/)
 const result=await page.evaluate(async()=>{const p=JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id==='V16-DRAFT');const {generateRS1PDF}=await import('/src/utils/generateRS1PDF.js');const {extractDocumentText}=await import('/src/utils/rs1Extraction.js');const pdf=await generateRS1PDF(p.proposal);return {p,text:(await extractDocumentText(new File([pdf.blob],'budget.pdf',{type:'application/pdf'}))).text,bytes:Array.from(new Uint8Array(await pdf.blob.arrayBuffer()))}})
 check(result.p.status==='DRAFT','budget edits never transition project')
 check(result.p.proposal.budgetItems.compensation.length===count,'canonical data retains every row')
 check(result.p.proposalVersions.at(-1).proposal.budgetItems.compensation.length===count,'version snapshot retains every row')
 check(result.text.includes('ค่าเก็บข้อมูลภาคสนาม '+count),'PDF includes final dynamic row')
 check(result.p.proposal.materials===old.materials,'other categories preserved')
 await page.goto(base+'#/staff/projects/V16-DRAFT/staff-review');await page.locator('.staff-proposal-review').waitFor();check((await page.locator('.staff-proposal-review').innerText()).includes('ค่าเก็บข้อมูลภาคสนาม '+count),'Staff review retains all rows')
 check(await page.getByRole('button',{name:'Add expense — compensation',exact:true}).count()===0,'Staff proposal fields read-only')
 await page.goto(base+'#/researcher/projects/V16-DRAFT/manual');await rows.first().waitFor();await rows.nth(1).getByRole('button').click()
 check(await rows.count()===count-1,'remove individual row');check(await rows.nth(1).locator('input').first().inputValue()==='ค่าเก็บข้อมูลภาคสนาม 3','removal preserves remaining descriptions')
 for(let i=count-2;i>=0;i--)await rows.nth(i).getByRole('button').click()
 check(await rows.count()===0,'remove all expense rows');check(await page.locator('.rs1-budget-actions output').first().innerText()==='0.00','zero subtotal after removal')
 await page.getByRole('button',{name:'Add expense — compensation',exact:true}).click();check(await rows.count()===1,'add after removing all')
 await mkdir('tmp/rs1-budget',{recursive:true});await writeFile('tmp/rs1-budget/dynamic-budget.pdf',Buffer.from(result.bytes));await page.locator('.rs1-budget-row').first().scrollIntoViewIfNeeded();await page.screenshot({path:'tmp/rs1-budget/desktop.png',fullPage:false})
 for(const width of [768,390]){await page.setViewportSize({width,height:1000});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+width)}
 await writeFile('tmp/rs1-budget/result.json',JSON.stringify({checks:n,status:'PASS',count,subtotal},null,2));check(errors.length===0,'no browser runtime errors')
 console.log(`PASS RS-1 dynamic budget ${n} checks`)
}finally{await browser.close();await server.close()}
