import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE),server=await createServer({envDir:'tmp/certification-ui-no-env',server:{host:'127.0.0.1',port:5198,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}});let n=0;const check=(v,m)=>{assert.ok(v,m);n++},project=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id==='V16-COMMITTEE'))
const form=t=>page.getByRole('heading',{name:t,exact:true}).locator('..')
async function submit(t){await form(t).getByRole('button',{name:t,exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await form(t).getByRole('status').waitFor()}
try{
 await page.goto('http://127.0.0.1:5198/#/staff/projects/V16-COMMITTEE/administrative-records');await page.locator('.staff-certification').waitFor();const before=JSON.stringify(await project())
 check(await page.locator('h1').count()===1,'single heading');check(await page.locator('.sc-heading').innerText().then(t=>t.includes('MFU-RG-2569-004')),'reference');check(await page.locator('.sc-progress li').count()===3,'three display steps');check(await page.locator('.sc-progress [aria-current]').count()===1,'one current step');check(await page.locator('.sc-left textarea').count()===2,'both remarks preserved');check(await page.locator('.sc-left input[type=file]').count()===2,'both document upload controls preserved')
 for(const lang of ['TH','EN'])for(const width of [1440,1280,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width)}
 check(JSON.stringify(await project())===before,'read-only UI')
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350);await page.screenshot({path:'tmp/staff-certification-ui.png',fullPage:true})
 check(await form('Record Certification').getByRole('button',{name:'Record Certification',exact:true}).isDisabled(),'certification still gated')
 await form('Record Acknowledgement').getByLabel('External Meeting Information',{exact:true}).fill('ประชุมส่วนบริหารงานวิจัย');await form('Record Acknowledgement').getByLabel('External Date',{exact:true}).fill('2026-11-15');await form('Record Acknowledgement').getByLabel('External Reference',{exact:true}).fill('มฟล. 2569/041');await submit('Record Acknowledgement');check((await project()).status==='COMMITTEE_ACKNOWLEDGEMENT','ack does not certify');check(await page.locator('.sc-progress .complete').count()===2,'progress reflects acknowledgement')
 await form('Record Certification').getByLabel('External Reference',{exact:true}).fill('มฟล. วจ. 2569/018');await submit('Record Certification');const p=await project();check(p.status==='IN_PROGRESS'&&p.statusHistory.at(-1).transitionRule==='TR-09','explicit TR09 retained');check(await page.locator('.sc-progress .complete').count()===3,'recorded certification complete')
 console.log(`PASS Certification UI ${n} checks`)
}finally{await browser.close();await server.close()}
