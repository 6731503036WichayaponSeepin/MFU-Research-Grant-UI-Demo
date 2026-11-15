import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/manual-ui-no-env',server:{host:'127.0.0.1',port:5218,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5218/'
page.on('dialog',d=>d.accept())
try{
 await mkdir('tmp/researcher-manual-ui',{recursive:true});await page.goto(base+'#/researcher/dashboard');await page.getByRole('button',{name:'EN',exact:true}).click();await page.getByRole('button',{name:'Add Research Scenarios',exact:true}).click()
 for(const id of ['V16-DRAFT','V16-CORRECTION']){
  await page.goto(base+`#/researcher/projects/${id}/manual`);await page.locator('.rs1-field').first().waitFor()
  const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects')),p=JSON.parse(before).find(p=>p.id===id)
  check(await page.locator('.project-page-nav').count()===0,'tabs hidden only on manual')
  check(await page.locator('.rs1-field').count()===72&&await page.locator('.rs1-continuous-card').count()===4,'all original fields/four sections')
  check(await page.locator('.rs1-progress,.rs1-step').count()===0,'continuous form')
  check(await page.locator('.rm-context .state-'+p.status).count()===1,'actual project state')
  if(id==='V16-CORRECTION'){check((await page.locator('.researcher-editor>.shared-notice').innerText()).includes(p.proposalReview.notes),'existing correction instructions');check(await page.getByLabel('Project Title *',{exact:true}).isEnabled(),'requested field editable');check(await page.getByLabel('Research Objectives *',{exact:false}).isDisabled(),'unrequested field read only')}
  for(const lang of ['TH','EN'])for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(350)
   check(await page.locator('h1').innerText()===(lang==='TH'?'จัดทำและขอแก้ไขข้อเสนอโครงการ':'Proposal Preparation & Revision'),'localized shared title')
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+id+lang+width)
   check(await page.locator('.rs1-page').evaluate(el=>Math.abs(el.getBoundingClientRect().width-el.closest('.researcher-editor').getBoundingClientRect().width)<2),'full width')
   await page.locator('.rs1-page').evaluate(el=>el.scrollIntoView({block:'start'}))
   check(await page.locator('.rs1-footer').evaluate(el=>{const r=el.getBoundingClientRect();return getComputedStyle(el).position==='sticky'&&r.top>=0&&r.bottom<=innerHeight+1}),'sticky actions visible while editing')
   await page.screenshot({path:`tmp/researcher-manual-ui/${id}-${lang}-${width}.png`,fullPage:false})
  }
  check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'presentation does not mutate versions/history')
 }
 await page.goto(base+'#/researcher/projects/V16-DRAFT/details');await page.locator('.researcher-project-overview').waitFor();check(await page.locator('.project-page-nav').count()===1,'tabs retained on overview')
 await page.goto(base+'#/researcher/projects/V16-ACTIVE/manual');await page.getByRole('heading',{name:'Proposal editing is not allowed at this state'}).waitFor();check(await page.locator('.rs1-field').count()===0,'state permission unchanged')
 console.log(`PASS Researcher Manual UI ${n} checks`)
}finally{await browser.close();await server.close()}
