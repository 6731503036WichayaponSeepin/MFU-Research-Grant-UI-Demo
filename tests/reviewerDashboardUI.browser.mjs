import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { createServer } from 'vite'
const { chromium } = createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE || 'playwright')
const server = await createServer({ envDir:'tmp/reviewer-ui-no-env', server:{host:'127.0.0.1',port:5208,strictPort:true} })
await server.listen()
const browser = await chromium.launch({channel:'chrome',headless:true}), page = await browser.newPage()
let checks=0
const check=(value,message)=>{assert.ok(value,message);checks++}
try {
 await mkdir('tmp/reviewer-dashboard-ui',{recursive:true})
 for(let i=1;i<=3;i++) {
  await page.goto('http://127.0.0.1:5208/#/roles')
  await page.locator('.shared-role').last().getByRole('combobox').selectOption(`demo-reviewer-${i}`)
  await page.getByRole('button',{name:/· reviewer/}).click()
  await page.locator('.rv-workspace').waitFor()
  const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
  const expected=await page.evaluate(async uid=>{
   const {reviewerRows,reviewStatus}=await import('/src/utils/reviewerWorkspace.js')
   const {foundationActors}=await import('/src/data/foundationDemo.js')
   const rows=reviewerRows(JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')),foundationActors[uid])
   return [rows.length,...['pending','draft','submitted'].map(s=>rows.filter(p=>reviewStatus(p,foundationActors[uid])===s).length)]
  },`demo-reviewer-${i}`)
  check(JSON.stringify(await page.locator('.rv-strip strong').allTextContents())===JSON.stringify(expected.map(String)),'canonical strip counts')
  check(JSON.stringify(await page.locator('.rv-sidebar strong').allTextContents())===JSON.stringify(expected.map(String)),'sidebar counts')
  check(await page.locator('h1').count()===1,'single heading')
  check(await page.locator('.sidebar-role,.sidebar-toggle,.shared-demo-banner').count()===0,'compact shell')
  check(await page.locator('.rd-demo-mode').count()===1,'demo identification')
  check(await page.locator('.rv-table tbody tr').count()===expected[0],'assigned-only list')
  for(const lang of ['TH','EN']) for(const width of [1440,1280,390]) {
   await page.setViewportSize({width,height:width===1280?720:900})
   await page.getByRole('button',{name:lang,exact:true}).click()
   await page.waitForTimeout(350)
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive overflow')
   if(width>1000) {
    check(await page.locator('.sidebar').evaluate(el=>el.scrollHeight<=el.clientHeight+1),'no desktop sidebar scroll')
    check(await page.locator('.sidebar').evaluate(el=>el.getBoundingClientRect().width<=300),'compact desktop sidebar width')
   }
  }
  await page.getByLabel('Review Status',{exact:true}).selectOption('pending')
  await page.getByRole('button',{name:'Search',exact:true}).click()
  check(await page.locator('.rv-table tbody tr').count()===expected[1],'existing filter')
  check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'no data mutation')
  await page.setViewportSize({width:1440,height:900})
  await page.goto('http://127.0.0.1:5208/#/reviewer/dashboard')
  await page.locator('.rv-workspace').waitFor()
  await page.waitForTimeout(350)
  await page.screenshot({path:`tmp/reviewer-dashboard-ui/persona-${i}.png`,fullPage:true})
  check(await page.locator('.rv-strip').count()===1&&await page.locator('.rv-right>.rv-card').count()===2&&await page.locator('.rv-donut').count()===1,'Dashboard cards preserved')
  await page.goto('http://127.0.0.1:5208/#/reviewer/projects');await page.locator('.rv-registry').waitFor()
  check(await page.locator('.rv-strip,.rv-right,.rv-donut,.rv-card-heading>a').count()===0,'assigned page has no summary/task/progress/View All')
  check(await page.locator('.rv-table tbody tr').count()===expected[0],'all assigned records retained')
  check(await page.locator('.rv-sidebar a').count()===4,'sidebar counts retained')
  for(const lang of ['TH','EN'])for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350)
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'assigned-page responsive '+lang+width)
   check(await page.locator('.rv-assigned').evaluate(el=>Math.abs(el.getBoundingClientRect().width-el.closest('.rv-grid').getBoundingClientRect().width)<2),'assigned table uses full grid width')
  }
  await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350);await page.screenshot({path:`tmp/reviewer-dashboard-ui/assigned-${i}.png`,fullPage:true})
  const reference=await page.locator('.rv-project small').first().innerText();await page.getByLabel('Search projects',{exact:true}).fill(reference);await page.getByRole('button',{name:'Search',exact:true}).click()
  check(await page.locator('.rv-table tbody tr').count()===1,'existing reference search')
  check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'assigned presentation never mutates data')
 }
 console.log(`PASS Reviewer Dashboard UI ${checks} checks`)
} finally { await browser.close(); await server.close() }
