import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/review-ui-no-env',server:{host:'127.0.0.1',port:5210,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5210/#/reviewer/projects/V16-EVALUATION-0/'
page.on('dialog',d=>d.accept())
try{
 await mkdir('tmp/reviewer-review-ui',{recursive:true});await page.goto(base+'answers');await page.locator('.vr-review').waitFor();await page.getByRole('button',{name:'EN',exact:true}).click()
 check(await page.getByRole('button',{name:'Submit Evaluation',exact:true}).isDisabled(),'invalid submit blocked')
 check(await page.locator('.vr-validation.invalid').count()===1,'original validation shown')
 await page.getByRole('link',{name:'Back to Editor',exact:true}).click();await page.locator('.ve-workspace').waitFor()
 await page.locator('.reviewer-form select').evaluateAll(els=>els.forEach(el=>{el.value='0';el.dispatchEvent(new Event('change',{bubbles:true}))}))
 await page.getByLabel('1.5 ข้อเสนอแนะเพื่อปรับปรุงแก้ไขร่างรายงานวิจัยฉบับสมบูรณ์ ในแต่ละบท',{exact:true}).fill('ข้อเสนอแนะครบถ้วน\nComplete multiline comment')
 await page.getByLabel('Additional Comments',{exact:true}).fill('Working draft must survive Return to Edit')
 const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 await page.getByRole('button',{name:'Review Answers',exact:true}).click();await page.locator('.vr-review').waitFor()
 check(await page.locator('.vr-steps li').count()===3,'three steps')
 check(await page.locator('.vr-steps [aria-current=step]').count()===1,'current review step')
 check(await page.getByRole('button',{name:'Submit Evaluation',exact:true}).isEnabled(),'original valid submit enabled')
 check((await page.locator('.vr-answers').allTextContents()).join('\n').includes('Complete multiline comment'),'all comments preserved')
 check(await page.locator('.vr-left .vr-card').count()===3,'read-only sections')
 check(await page.locator('.vr-review input,.vr-review textarea,.vr-review select').count()===0,'read-only answers')
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'review does not save/submit')
 for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);await page.screenshot({path:`tmp/reviewer-review-ui/${lang}-${width}.png`,fullPage:true})}
 await page.getByRole('link',{name:'Back to Editor',exact:true}).click();await page.locator('.ve-workspace').waitFor()
 check(await page.getByLabel('Additional Comments',{exact:true}).inputValue()==='Working draft must survive Return to Edit','return preserves draft')
 await page.getByRole('button',{name:'Review Answers',exact:true}).click();await page.locator('.vr-review').waitFor()
 await page.getByRole('button',{name:'Submit Evaluation',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click()
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'cancel does not submit')
 console.log(`PASS Evaluation Review UI ${n} checks`)
}finally{await browser.close();await server.close()}
