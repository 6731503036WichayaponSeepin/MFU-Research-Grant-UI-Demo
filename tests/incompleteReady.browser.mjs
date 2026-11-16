import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/ready-no-env',server:{host:'127.0.0.1',port:5222,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage()
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5222/'
try{
 await page.goto(base+'#/researcher/manual');await page.getByRole('button',{name:'EN',exact:true}).click()
 await page.getByLabel('Project Title *',{exact:true}).fill('Incomplete proposal walkthrough')
 await page.getByRole('button',{name:'Save Draft',exact:true}).first().click();await page.waitForURL(/details$/)
 const url=page.url().replace(/details$/,'proposal-pdf');await page.goto(url)
 const button=page.getByRole('button',{name:'Confirm Ready for Affiliation',exact:true})
 check(await button.isDisabled(),'requires explicit review')
 await page.getByLabel('I have reviewed the entered information and confirm it is correct',{exact:true}).check()
 check(await button.isEnabled(),'incomplete data and no PDF do not block local review')
 await button.click();await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click()
 check(page.url()===url,'cancel keeps page/state')
 await button.click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await page.waitForURL(/details$/)
 const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.title==='Incomplete proposal walkthrough'))
 check(p.status==='AFFILIATION_REVIEW','incomplete proposal reaches affiliation review')
 check(!p.proposal.leaderName&&!p.proposal.objectives,'does not fabricate missing data')
 check(p.documents.some(d=>d.id===p.proposalReady.documentId&&d.kind==='proposal_pdf'),'latest PDF generated and saved automatically')
 check(p.proposalReady.confirmedBy==='demo-user'&&!!p.proposalReady.confirmedAt,'actor/time retained')
 console.log(`PASS Incomplete Ready ${n} checks`)
}finally{await browser.close();await server.close()}
