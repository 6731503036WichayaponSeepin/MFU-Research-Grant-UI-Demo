import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE),server=await createServer({envDir:'tmp/registry-ui-no-env',server:{host:'127.0.0.1',port:5196,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}});let n=0;const check=(v,m)=>{assert.ok(v,m);n++}
try{
 await page.goto('http://127.0.0.1:5196/#/staff/projects');await page.locator('.staff-registry').waitFor();const initial=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 check(await page.locator('h1').count()===1,'single page heading');check(await page.locator('h1').innerText()==='ทะเบียนโครงการวิจัย','Thai title');check(await page.locator('.focused-page-heading,.shared-demo-banner').count()===0,'no redundant header/back/banner');check(await page.locator('.sr-toolbar [name]').count()===5,'all original filter and sort controls');check(await page.locator('.sr-results th').count()===5,'five original table columns');check(await page.locator('.sr-results tbody tr').count()===6,'original page size');check(await page.locator('.sd-summary-row').count()===11,'queue navigation retained')
 for(const language of ['TH','EN'])for(const width of [1440,1280,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:language,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+language+width)}
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350);await page.screenshot({path:'tmp/staff-registry-ui.png',fullPage:true})
 await page.getByRole('link',{name:'Next',exact:true}).click();check(page.url().includes('page=2'),'next pagination');await page.getByRole('link',{name:'Previous',exact:true}).click();await page.waitForURL(/page=1/)
 await page.getByLabel('Search',{exact:true}).fill('MFU-RG-2569-005');await page.getByRole('button',{name:'Search',exact:true}).click();check(await page.locator('.sr-results tbody tr').count()===1,'search retained');await page.getByRole('link',{name:'Clear filters',exact:true}).click()
 await page.getByLabel('Status',{exact:true}).selectOption('IN_PROGRESS');await page.getByRole('button',{name:'Search',exact:true}).click();check(await page.locator('.sr-results tbody tr').count()===1,'status retained')
 await page.locator('.sd-summary-row[href*="queue=REPORT_EVALUATION"]').click();check(await page.locator('.sr-results tbody tr').count()===5,'sidebar queue retains filter');check((await page.locator('.sr-results-heading').innerText()).includes('5'),'dynamic count')
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===initial,'presentation does not mutate data')
 console.log(`PASS Registry UI ${n} checks`)
}finally{await browser.close();await server.close()}
