import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {readFile} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/researcher-validation-no-env',server:{host:'127.0.0.1',port:5194,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}}),base='http://127.0.0.1:5194/',errors=[]
let count=0;const check=(ok,message)=>{assert.ok(ok,message);count++};page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
const route=async(path,role='researcher')=>{await page.goto(base+`#/${role}/${path}`);await page.locator('#page-title').waitFor()}
const rows=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')))
try{
 await route('manual');await page.getByRole('button',{name:'EN',exact:true}).click()
 const source=await readFile('src/pages/ManualEntry.jsx','utf8'),fields=Function(source.slice(source.indexOf('const parts ='),source.indexOf('function loadDraft'))+';return allFields')()
 check(await page.locator('.rs1-field').count()===fields.length,'every original field exists')
 const expected={}
 for(const [i,f]of fields.entries()){
  const control=page.locator('.rs1-field').nth(i).locator('input,textarea,select'),tag=await control.evaluate(e=>e.tagName)
  let value=f.key==='leaderName'?'ดร. ณัฐวุฒิ วัฒนกุล':f.type==='date'?(f.key==='endDate'?'2027-01-01':'2026-01-01'):f.type==='number'?'50':f.type==='email'?'researcher@example.org':`ข้อมูลวิจัย ${i+1}`
  if(tag==='SELECT'){value=await control.locator('option').nth(1).getAttribute('value');await control.selectOption(value)}else await control.fill(value)
  expected[f.key]=value
 }
 await page.reload();await page.locator('.rs1-field').first().waitFor()
 for(const [i,f]of fields.entries())check(await page.locator('.rs1-field').nth(i).locator('input,textarea,select').inputValue()===expected[f.key],`recovery ${f.key}`)
 await page.getByRole('button',{name:'Review →',exact:true}).click();await page.getByLabel('I have reviewed the information',{exact:true}).check();await page.getByRole('button',{name:'Confirm Review',exact:true}).click();await page.waitForURL(/proposal-pdf$/)
 const created=(await rows()).find(p=>p.title===expected.projectTitle);check(created?.status==='DRAFT','review saves without transition')
 for(const f of fields)check(String(created.proposal[f.key])===expected[f.key],`saved binding ${f.key}`)
 await route('projects/V16-ACTIVE/closure');await page.getByLabel('Closure path',{exact:true}).selectOption('publication')
 check(await page.getByLabel('Document Type',{exact:true}).inputValue()==='summary_report','switch immediately updates effective upload type')
 await page.getByLabel('Upload PDF',{exact:true}).setInputFiles('public/MFU-Demonstration-Sample.pdf');await page.getByText('Uploading…',{exact:true}).waitFor({state:'hidden'})
 let active=(await rows()).find(p=>p.id==='V16-ACTIVE');check(active.documents.at(-1).kind==='summary_report'&&active.status==='IN_PROGRESS','default publication upload correctly typed, state unchanged')
 await page.getByLabel('Closure path',{exact:true}).selectOption('report');check(await page.getByLabel('Document Type',{exact:true}).inputValue()==='report','reverse switch restores report type')
 await route('dashboard');await page.getByRole('button',{name:'Add Research Scenarios',exact:true}).click()
 const fixtures=(await rows()).filter(p=>p.id.startsWith('V16-') && p.ownerUid==='demo-user')
 for(const [state,p]of new Map(fixtures.map(p=>[p.status,p])).entries()){
  await route(`projects/${p.id}/details`);const text=await page.locator('main').innerText()
  check(text.includes(p.referenceNumber)&&!text.includes(p.id)&&!text.includes(state),'localized display '+state)
 }
 for(const [width,language]of [[1440,'th'],[390,'th'],[1440,'en'],[390,'en']]){
  await page.setViewportSize({width,height:900});await page.getByRole('button',{name:language.toUpperCase(),exact:true}).click();await route('dashboard');await page.waitForTimeout(350)
  const text=await page.locator('body').innerText();check(!/Phase \d|Contract Fixture|V16-|\d{4}-\d{2}-\d{2}T/.test(text),'friendly demo display '+language+width)
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+language+width)
 }
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350);await page.screenshot({path:'tmp/researcher-validation-dashboard.png',fullPage:false})
 await route('projects');await page.getByLabel('Search projects',{exact:true}).fill(fixtures[0].referenceNumber);await page.getByRole('button',{name:'Search',exact:true}).click();check(await page.locator('.shared-project-row').count()===1,'visible reference is searchable')
 check(errors.length===0,JSON.stringify(errors));console.log(`PASS Researcher validation: ${count} checks; ${fields.length} field bindings/recovery; nine states; upload path switching; TH/EN responsive`)
}finally{await browser.close();await server.close()}

