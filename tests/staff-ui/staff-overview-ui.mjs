import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE),server=await createServer({envDir:'tmp/staff-overview-no-env',server:{host:'127.0.0.1',port:5205,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}});let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5205/'
const route=async id=>{await page.goto(base+'#/staff/projects/'+id+'/details');await page.locator('.so-header').waitFor()}
try{
 await route('V16-RELEASED');const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 const records=JSON.parse(before)
 for(const p of records){await route(p.id);check(await page.locator('h1').count()===1&&await page.locator('h1').innerText()===p.title,'project is main heading '+p.id);check(await page.locator('.focused-page-heading,.shared-demo-banner').count()===0,'no duplicate heading/back/banner '+p.id);check(await page.locator('.so-stages [aria-current=step]').count()===1,'one current stage '+p.id)
 const metadata=await page.evaluate(async p=>{const {staffTaskLinks}=await import('/src/utils/staffLinks.js'),{timelineStates,permittedDocuments}=await import('/src/utils/commonWorkspace.js'),{foundationActors}=await import('/src/data/foundationDemo.js');return {links:staffTaskLinks(p).map(([r])=>r),recorded:timelineStates(p),docs:permittedDocuments(p,foundationActors['demo-staff']).length}},p)
 const links=await page.locator('.so-actions .shared-actions a').evaluateAll(es=>es.map(e=>e.getAttribute('href').split('/').at(-1)));check(JSON.stringify(links)===JSON.stringify(metadata.links),'same permission-based action routes '+p.id);check(Number.parseInt(await page.locator('.so-summary > div').nth(3).locator('strong').innerText())===metadata.docs,'authorized document count '+p.id)
 const completed=await page.locator('.so-stages .completed').evaluateAll(es=>es.map(e=>e.dataset.stage));check(completed.every(s=>metadata.recorded.includes(s)),'never infer completed history '+p.id)
 if(p.closure?.method==='publication')check(await page.locator('.so-stages [data-stage=REPORT_EVALUATION]').count()===0,'publication skips reviewers')
 if(p.status==='CANCELLED')check(await page.locator('.so-stages [data-stage=CLOSED],.so-stages .pending').count()===0,'cancellation is terminal and distinct')
 }
 await route('V16-DRAFT');check(await page.locator('.so-stages .pending').count()>0,'pending stages explicitly indicated')
 await route('V16-RELEASED');for(const lang of ['TH','EN'])for(const width of [1440,1280,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);check(await page.locator('.project-page-nav a').first().evaluate(e=>getComputedStyle(e).borderBottomWidth==='2px'),'underline tabs '+lang+width)}
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350);await page.screenshot({path:'tmp/staff-project-overview-ui.png',fullPage:true})
 await page.getByRole('navigation',{name:'Project pages',exact:true}).getByRole('link',{name:'Document Library',exact:true}).click();check(await page.locator('.staff-project-tabs-view').count()===1,'staff document tabs consistent');await page.getByRole('navigation',{name:'Project pages',exact:true}).getByRole('link',{name:'Activity & History',exact:true}).click();check(await page.locator('.shared-history li').count()>0,'history route retained')
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'no canonical data writes')
 for(const role of ['researcher','reviewer']){await page.goto(base+`#/${role}/projects/V16-EVALUATION-0/details`);await page.locator('#page-title').waitFor();check(await page.locator('.staff-project-overview,.staff-project-tabs-view').count()===0,role+' view unaffected')}
 console.log(`PASS Staff Overview UI ${n} checks`)
}finally{await browser.close();await server.close()}

