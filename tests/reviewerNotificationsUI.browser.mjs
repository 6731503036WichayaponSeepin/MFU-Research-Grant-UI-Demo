import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/reviewer-notifications-no-env',server:{host:'127.0.0.1',port:5215,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5215/'
try{
 await mkdir('tmp/reviewer-notifications-ui',{recursive:true})
 for(let i=1;i<=3;i++){
  await page.goto(base+'#/roles');await page.locator('.shared-role').last().getByRole('combobox').selectOption(`demo-reviewer-${i}`);await page.getByRole('button',{name:/· reviewer/}).click();await page.goto(base+'#/reviewer/notifications');await page.locator('.reviewer-notifications').waitFor();await page.getByRole('button',{name:'EN',exact:true}).click()
  const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
  const expected=await page.evaluate(async uid=>{const {workspaceNotifications}=await import('/src/utils/commonWorkspace.js'),{foundationActors}=await import('/src/data/foundationDemo.js');return workspaceNotifications(JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')),foundationActors[uid])},`demo-reviewer-${i}`)
  check(await page.locator('.vn-row').count()===expected.length,'authorized notification count')
  check(await page.locator('.vn-row.rn-unread').count()===expected.length,'persona read state isolated')
  check(await page.locator('h1').count()===1,'single heading')
  check(await page.locator('.reviewer-notifications>.vn-card').count()===1&&await page.locator('.sn-secondary').count()===0,'one compact list')
  check(await page.locator('.focused-page-heading').count()===0,'no Back/duplicate title')
  check(Number(await page.locator('.shared-notification-count').innerText())===expected.length,'header unread count')
  const href=await page.locator('.vn-content>a').first().getAttribute('href');await page.locator('.vn-content>a').first().click();await page.locator('.reviewer-project-overview').waitFor();check(page.url().endsWith(href.slice(1)),'existing project link');await page.goBack();await page.locator('.reviewer-notifications').waitFor()
  await page.getByRole('button',{name:'Mark as read',exact:true}).first().click();await page.getByText('Read status saved',{exact:true}).waitFor();check(await page.locator('.rn-unread-dot').count()===expected.length-1,'mark-one updates unread dots');check(Number(await page.locator('.shared-notification-count').innerText())===expected.length-1,'mark-one header count')
  for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);if(i===1)await page.screenshot({path:`tmp/reviewer-notifications-ui/${lang}-${width}.png`,fullPage:true})}
  await page.getByRole('button',{name:'Mark all as read',exact:true}).click();await page.getByText('Read status saved',{exact:true}).waitFor();check(await page.locator('.rn-unread-dot').count()===0,'mark-all unread cleared');check(await page.locator('.shared-notification-count').count()===0,'header unread cleared');await page.reload();await page.locator('.reviewer-notifications').waitFor();check(await page.getByRole('button',{name:'Mark all as read',exact:true}).isDisabled(),'read state persists');check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'read handlers preserve projects/audit/notification events')
 }
 await page.evaluate(()=>{const key='mfu-foundation-v16-demo-projects',rows=JSON.parse(localStorage.getItem(key));for(const p of rows)p.notifications=[];localStorage.setItem(key,JSON.stringify(rows))});await page.reload();await page.getByRole('heading',{name:'No notifications yet'}).waitFor();check(await page.getByRole('button',{name:'Mark all as read',exact:true}).isDisabled(),'empty-state disabled mark-all')
 for(const role of ['staff','researcher']){await page.goto(base+`#/${role}/notifications`);await page.locator('#page-title').waitFor();check(await page.locator('.reviewer-notifications').count()===0,'other role unchanged')}
 console.log(`PASS Reviewer Notifications UI ${n} checks`)
}finally{await browser.close();await server.close()}
