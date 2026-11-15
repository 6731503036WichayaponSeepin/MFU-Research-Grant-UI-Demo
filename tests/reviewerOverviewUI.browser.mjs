import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/reviewer-overview-no-env',server:{host:'127.0.0.1',port:5212,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5212/'
try{
 await mkdir('tmp/reviewer-overview-ui',{recursive:true})
 for(let i=1;i<=3;i++){
  await page.goto(base+'#/roles');await page.locator('.shared-role').last().getByRole('combobox').selectOption(`demo-reviewer-${i}`);await page.getByRole('button',{name:/· reviewer/}).click()
  await page.evaluate(async()=>{const {addStaffScenarios}=await import('/src/utils/foundationStore.js');addStaffScenarios()})
  const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
  for(const id of ['V16-EVALUATION-0','V16-EVALUATION-DRAFT','V16-EVALUATION-3','V16-CLOSED-REPORT']){
   await page.goto(base+`#/reviewer/projects/${id}/details`);await page.locator('.reviewer-project-overview').waitFor();await page.getByRole('button',{name:'EN',exact:true}).click()
   const expected=await page.evaluate(async({id,uid})=>{const {foundationActors}=await import('/src/data/foundationDemo.js'),{permittedDocuments}=await import('/src/utils/commonWorkspace.js'),{ownAssignment,reviewStatus}=await import('/src/utils/reviewerWorkspace.js');const p=JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id===id),actor=foundationActors[uid];return{count:permittedDocuments(p,actor).length,status:reviewStatus(p,actor),reportIds:ownAssignment(p,actor).documentIds,title:p.titleEn}}, {id,uid:`demo-reviewer-${i}`})
   check(await page.locator('h1').count()===1&&await page.locator('h1').innerText()===expected.title,'project title heading')
   check((await page.locator('.so-summary>div').last().innerText()).includes(String(expected.count)),'authorized document count')
   check(await page.locator('.vo-progress li').count()===3&&await page.locator('.shared-timeline,.so-stages').count()===0,'personal progress only')
   const action=expected.status==='submitted'?'my-evaluation':'evaluation'
   check((await page.locator('.so-actions a.primary').getAttribute('href')).endsWith('/'+action),'status-based action')
   check(await page.locator('.vo-document').count()===expected.reportIds.length,'assigned reports only')
   check(!(await page.locator('.reviewer-project-overview').innerText()).includes('fixture-command'),'no technical history IDs')
  }
  check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'overview does not mutate records')
 }
 for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);await page.screenshot({path:`tmp/reviewer-overview-ui/${lang}-${width}.png`,fullPage:true})}
 check(await page.getByRole('navigation',{name:'Project pages',exact:true}).locator('a').count()===3,'project tabs retained')
 await page.goto(base+'#/reviewer/projects/V16-DRAFT/details');await page.getByRole('heading',{name:'Project not found or access denied'}).waitFor();check(await page.locator('.reviewer-project-overview').count()===0,'unassigned denied')
 for(const role of ['staff','researcher']){await page.goto(base+`#/${role}/projects/V16-EVALUATION-3/details`);await page.locator(`.${role}-project-overview`).waitFor();check(await page.locator('.reviewer-project-overview').count()===0,'other role view unchanged')}
 console.log(`PASS Reviewer Overview UI ${n} checks`)
}finally{await browser.close();await server.close()}
