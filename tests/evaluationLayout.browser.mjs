import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/evaluation-layout-no-env',server:{host:'127.0.0.1',port:5234,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},errors=[]
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
try{
 await mkdir('tmp/evaluation-layout',{recursive:true});await page.goto('http://127.0.0.1:5234/#/reviewer/projects/V16-EVALUATION-0/evaluation');await page.locator('.ve-workspace').waitFor();await page.getByRole('button',{name:'EN',exact:true}).click();await page.locator('canvas[data-rendered=true]').waitFor()
 const initial=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 check(await page.locator('h1').count()===1,'one compact project title');check(await page.locator('.focused-page-heading,.project-page-nav').count()===0,'no redundant page heading, Back or tabs');check(await page.locator('.ve-project-header a').count()===0,'no report/evaluation navigation links');check(await page.locator('.shared-notice').count()===0,'no standalone draft warning banner');check(await page.locator('.ve-project-header small').count()===1,'small draft-rubric information retained')
 check(await page.locator('.ve-radio-group input').count()===13,'all source categorical options preserved');check(await page.locator('.ve-utilization input').count()===5,'all utilization options preserved')
 for(const [width,height]of [[1440,900],[1280,720]]){
  await page.setViewportSize({width,height});await page.locator('canvas[data-rendered=true]').waitFor();await page.waitForTimeout(200)
  const rect=await page.locator('.ve-workspace').boundingBox();check(rect.y<240,'panels moved upward '+height);check(rect.y+rect.height<=height&&rect.y+rect.height>=height-24,'use remaining viewport height '+height);check(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth+1),'no document overflow '+height)
  check(await page.locator('.ve-action-bar').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom<=innerHeight&&r.height>0}),'visible form actions '+height)
  check(await page.locator('.pdf-canvas-wrap').evaluate(el=>getComputedStyle(el).overflowY==='visible'&&getComputedStyle(el).maxHeight==='none'),'no nested PDF scroll '+height)
  await page.screenshot({path:`tmp/evaluation-layout/desktop-${height}.png`,fullPage:false})
 }
 const divider=page.getByRole('separator');await divider.focus();await page.keyboard.press('ArrowRight');check(await divider.getAttribute('aria-valuenow')==='52','divider still resizes');await page.keyboard.press('Home');check(await divider.getAttribute('aria-valuenow')==='50','50:50 reset')
 await page.locator('.ve-form-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);check(await page.locator('.ve-form-scroll').evaluate(el=>el.scrollTop>0),'one form scroll owner');check(await page.locator('.ve-pdf-scroll').evaluate(el=>el.scrollTop)===0,'independent PDF panel')
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);check(await divider.isHidden(),'mobile stacked panels');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no mobile horizontal overflow');await page.screenshot({path:'tmp/evaluation-layout/mobile.png',fullPage:false})
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===initial,'presentation does not mutate project');await page.goto('http://127.0.0.1:5234/#/researcher/projects/V16-EVALUATION-0/evaluation');await page.getByRole('heading',{name:'Access Denied',exact:true}).waitFor();check(await page.locator('.ve-workspace').count()===0,'wrong-role route never displays workspace');check(await page.locator('#page-title').count()===1,'error heading remains available');check(errors.length===0,JSON.stringify(errors));console.log(`PASS Compact Evaluation Layout ${n} checks`)
}finally{await browser.close();await server.close()}
