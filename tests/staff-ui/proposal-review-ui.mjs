import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE),server=await createServer({envDir:'tmp/proposal-review-no-env',server:{host:'127.0.0.1',port:5197,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}});let n=0;const check=(v,m)=>{assert.ok(v,m);n++},read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id==='V16-STAFF'))
try{
 await page.goto('http://127.0.0.1:5197/#/staff/projects/V16-STAFF/staff-review');await page.locator('.staff-proposal-review').waitFor();const before=JSON.stringify(await read())
 check(await page.locator('h1').count()===1,'single heading');check(await page.locator('.sp-page-heading').innerText().then(t=>t.includes('MFU-RG-2569-003')),'reference present');check(await page.locator('.sp-document a').count()===2,'submitted signed RS1 and affiliation evidence retained');check(await page.locator('.sp-right input[type=checkbox]').count()===13,'only 13 existing editable section controls');check(await page.locator('.sp-right textarea').count()===2,'both original remarks bindings preserved')
 for(const lang of ['TH','EN'])for(const width of [1440,1280,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow '+lang+width)}
 check(await page.locator('.sp-correction form>button').evaluate(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'),'outline correction');check(await page.locator('.sp-pass form>button').evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(147, 22, 56)'),'maroon passed action')
 check(JSON.stringify(await read())===before,'UI reads do not mutate record')
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350);await page.screenshot({path:'tmp/staff-proposal-review.png',fullPage:false})
 const passed=page.getByRole('heading',{name:'Record Review Passed',exact:true}).locator('..');await passed.getByRole('button',{name:'Record Review Passed',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click();check(JSON.stringify(await read())===before,'cancel keeps original state')
 await passed.getByRole('button',{name:'Record Review Passed',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await passed.getByRole('status').waitFor();const p=await read();check(p.status==='COMMITTEE_ACKNOWLEDGEMENT'&&p.statusHistory.at(-1).transitionRule==='TR-08','TR08 retained');check(!(await passed.getByRole('status').innerText()).includes('COMMITTEE_ACKNOWLEDGEMENT'),'readable success state')
 console.log(`PASS Proposal Review UI ${n} checks`)
}finally{await browser.close();await server.close()}
