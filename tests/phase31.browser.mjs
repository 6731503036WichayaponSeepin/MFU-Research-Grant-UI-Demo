import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { createServer } from 'vite'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MFU_PLAYWRIGHT_MODULE || 'playwright')
const server = await createServer({ envDir:'tmp/phase31-no-env', server:{host:'127.0.0.1',port:5181,strictPort:true} }); await server.listen()
const browser = await chromium.launch({channel:'chrome',headless:true})
const context = await browser.newContext(), page = await context.newPage()
const stage = process.env.UI_STAGE || 'after', dir = `docs/progress/screenshots/phase31-${stage}`
await mkdir(dir,{recursive:true})
let checks=0
try {
 await page.goto('http://127.0.0.1:5181/'); await page.getByRole('button',{name:'EN',exact:true}).click()
 await page.getByRole('button',{name:/staff/}).click(); await page.locator('#page-title').waitFor()
 const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 for(const role of ['staff','researcher','reviewer']) {
  for(const width of [1440,1280,768,390]) {
   await page.setViewportSize({width,height:1000}); await page.goto(`http://127.0.0.1:5181/#/${role}/dashboard`); await page.locator('#page-title').waitFor()
   await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(350)
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${role} ${width} overflow`); checks++
   if(stage==='after') { assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)'); checks++; if(width===390){assert.ok(await page.locator('.sidebar').evaluate(el=>el.getBoundingClientRect().width>=innerWidth-2));checks++} }
   await page.screenshot({path:`${dir}/${role}-${width}.png`,fullPage:true})
  }
 }
 await page.setViewportSize({width:1440,height:1000}); await page.goto('http://127.0.0.1:5181/#/staff/projects/V16-ACTIVE/details'); await page.locator('#page-title').waitFor(); await page.screenshot({path:`${dir}/overview.png`,fullPage:true})
 assert.equal(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects')),before); checks++
 await page.keyboard.press('Tab'); assert.ok(await page.evaluate(()=>document.activeElement!==document.body)); checks++
 console.log(`PASS Phase 3.1 ${stage}: ${checks} checks`)
} finally { await context.close(); await browser.close(); await server.close() }
