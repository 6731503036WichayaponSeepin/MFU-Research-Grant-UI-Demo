import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE),server=await createServer({envDir:'tmp/staff-ui-no-env',server:{host:'127.0.0.1',port:5195,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}});let count=0;const check=(v,m)=>{assert.ok(v,m);count++}
try{
 await page.goto('http://127.0.0.1:5195/#/staff/dashboard');await page.locator('.sd-dashboard').waitFor();const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 check(await page.locator('.sd-summary-row').count()===11,'11 sidebar metrics');check(await page.locator('.sd-summary-strip a').count()===4,'4 summary metrics');check(await page.locator('.sidebar-role,.sidebar-toggle,.shared-demo-banner').count()===0,'compact staff shell');check(await page.locator('h1').count()===1,'single heading');check(await page.locator('.sidebar-menu a').count()===1,'staff dashboard navigation');check(await page.locator('.sd-recent th').count()===5,'all original table columns retained')
 const expected=await page.evaluate(async()=>{const {staffRows,STAFF_QUEUES}=await import('/src/utils/staffWorkspace.js'),{foundationActors}=await import('/src/data/foundationDemo.js'),rows=JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects'));return Object.fromEntries(STAFF_QUEUES.map(queue=>[queue,staffRows(rows,foundationActors['demo-staff'],{queue}).length]))})
 for(const row of await page.locator('.sd-summary-row').all()){const href=await row.getAttribute('href'),queue=new URLSearchParams(href.split('?')[1]).get('queue');check(Number(await row.locator('strong').innerText())===expected[queue],'dynamic count '+queue)}
 for(const lang of ['TH','EN'])for(const [width,height]of [[1440,900],[1280,720],[390,844]]){await page.setViewportSize({width,height});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow '+width+lang);if(width>1000){const box=await page.locator('.sidebar').evaluate(e=>({client:e.clientHeight,scroll:e.scrollHeight}));console.log(width,height,box);check(box.scroll<=box.client+1,'desktop sidebar fits '+width+lang)}}
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350);await page.screenshot({path:'tmp/staff-dashboard-ui.png',fullPage:true})
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'no data mutation');await page.locator('.sd-search select').selectOption('IN_PROGRESS');await page.locator('.sd-search button').click();await page.waitForURL(/status=IN_PROGRESS/);check(await page.locator('.shared-table tbody tr').count()===1,'dashboard reuses registry status filter')
 await page.locator('.sd-summary-row').first().click();await page.waitForURL(/queue=total/);check(await page.locator('.rd-branding').count()===1,'staff registry shares compact shell');check(await page.locator('select[name=status]').count()===1,'registry filters retained')
 await page.getByRole('button',{name:'Collapse sidebar',exact:true}).click();check(await page.locator('.sidebar-collapsed').count()===1,'collapse handler retained')
 console.log(`PASS Staff UI ${count} checks`)
}finally{await browser.close();await server.close()}

