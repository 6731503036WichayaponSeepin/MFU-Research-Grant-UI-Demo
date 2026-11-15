import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/reviewer-history-no-env',server:{host:'127.0.0.1',port:5214,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5214/'
try{
 await mkdir('tmp/reviewer-history-ui',{recursive:true})
 for(let i=1;i<=3;i++){
  await page.goto(base+'#/roles');await page.locator('.shared-role').last().getByRole('combobox').selectOption(`demo-reviewer-${i}`);await page.getByRole('button',{name:/· reviewer/}).click()
  await page.evaluate(async()=>{const {addStaffScenarios}=await import('/src/utils/foundationStore.js');addStaffScenarios()})
  const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
  for(const id of ['V16-EVALUATION-0','V16-EVALUATION-DRAFT','V16-EVALUATION-3']){
   await page.goto(base+`#/reviewer/projects/${id}/timeline`);await page.locator('.reviewer-activity-history').waitFor();await page.getByRole('button',{name:'EN',exact:true}).click()
   const expected=JSON.parse(before).find(p=>p.id===id).statusHistory.slice().reverse().filter(e=>e.action==='assign_reviewers'||e.updatedBy===`demo-reviewer-${i}`&&['save_evaluation','submit_evaluation','attach_document'].includes(e.action)).sort((a,b)=>(Date.parse(b.updatedAt||b.date)||0)-(Date.parse(a.updatedAt||a.date)||0))
   check(await page.locator('h1').count()===1,'single project title')
   check(await page.locator('.va-history-summary>div').count()===3,'summary uses three actual metadata fields')
   check(await page.locator('.vah-event').count()===expected.length,'actual personal events only')
   check(JSON.stringify(await page.locator('.vah-title time').allTextContents())===JSON.stringify(await page.evaluate(async events=>{const {displayDate}=await import('/src/utils/researchDisplay.js');return events.map(e=>displayDate(e.updatedAt||e.date,'en',true))},expected)),'newest-first localized actual timestamps')
   check(await page.locator('.reviewer-activity-history input,.reviewer-activity-history textarea,.reviewer-activity-history button').count()===0,'history read only')
   check(!(await page.locator('.vah-card').innerText()).includes('Committee acknowledgement'),'no internal staff history')
  }
  check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'no audit/store mutations')
 }
 for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);await page.screenshot({path:`tmp/reviewer-history-ui/${lang}-${width}.png`,fullPage:true})}
 // Missing history must remain empty; do not synthesize an assignment event from metadata.
 await page.evaluate(()=>{const key='mfu-foundation-v16-demo-projects',rows=JSON.parse(localStorage.getItem(key));rows.find(p=>p.id==='V16-EVALUATION-3').statusHistory=[];localStorage.setItem(key,JSON.stringify(rows))});await page.reload();await page.getByRole('heading',{name:'No visible activity yet'}).waitFor();check(await page.locator('.vah-event').count()===0,'no fabricated events')
 await page.goto(base+'#/reviewer/projects/V16-DRAFT/timeline');await page.getByRole('heading',{name:'Project not found or access denied'}).waitFor();check(await page.locator('.reviewer-activity-history').count()===0,'unassigned denied')
 for(const role of ['staff','researcher']){await page.goto(base+`#/${role}/projects/V16-EVALUATION-0/timeline`);await page.locator('.shared-history').waitFor();check(await page.locator('.reviewer-activity-history').count()===0,'other role unchanged')}
 console.log(`PASS Reviewer History UI ${n} checks`)
}finally{await browser.close();await server.close()}
