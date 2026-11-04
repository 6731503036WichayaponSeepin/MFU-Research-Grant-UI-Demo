// Isolated UI harness: no authentication, Firebase data, backend or emulator needed.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { createServer } from 'vite'
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
const require=createRequire(import.meta.url)
const {chromium}=require(process.env.MFU_PLAYWRIGHT_MODULE || 'playwright')
const server=await createServer({server:{host:'127.0.0.1',port:5175,strictPort:true}})
const html=`<!doctype html><html lang="th"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module">
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import Demo from '/src/components/ReviewerDemoPreview.jsx';
import '/src/index.css';
import '/src/App.css';
import '/src/pages/Closure.css';
import '/src/pages/Reviewer.css';
function App(){const [open,setOpen]=useState(true);return React.createElement(React.Fragment,null,React.createElement('button',{onClick:()=>setOpen(true)},'เปิดตัวอย่างอีกครั้ง'),React.createElement(Demo,{open,onClose:()=>setOpen(false)}))}
createRoot(document.getElementById('root')).render(React.createElement(App));
</script></body></html>`
mkdirSync('tmp',{recursive:true})
writeFileSync('tmp/reviewer-demo-preview.html',html)
await server.listen()
const browser=await chromium.launch({headless:true,...(process.env.MFU_BROWSER_PATH?{executablePath:process.env.MFU_BROWSER_PATH}:{})})
const context=await browser.newContext({viewport:{width:1280,height:900}})
const page=await context.newPage(),errors=[],external=[]
page.on('pageerror',error=>errors.push(error.message))
await page.addInitScript(()=>{
  window.demoNetwork=[]
  window.fetch=(...args)=>{window.demoNetwork.push(String(args[0]));return Promise.reject(new Error('Demo must not fetch'))}
  XMLHttpRequest.prototype.open=function(...args){window.demoNetwork.push(String(args[1]));throw new Error('Demo must not call APIs')}
})
await page.route('**/*',async route=>{
  const url=new URL(route.request().url())
  if(!['localhost','127.0.0.1'].includes(url.hostname)){external.push(url.href);return route.abort()}
  return route.continue()
})
let checks=0
const button=name=>page.getByRole('button',{name,exact:true})
const nav=index=>page.getByRole('navigation',{name:'ขั้นตอนทดลองประเมิน'}).getByRole('button').nth(index)
try {
  await page.goto('http://127.0.0.1:5175/tmp/reviewer-demo-preview.html')
  await button('รับงานตัวอย่างและอ่านรายงาน').waitFor()
  assert.ok(await page.getByText('DEMO PREVIEW — ข้อมูลสมมติ ไม่บันทึกลง Firebase',{exact:true}).isVisible());checks++
  assert.equal(await page.locator('.review-demo-steps button').count(),5);checks++
  await button('รับงานตัวอย่างและอ่านรายงาน').click()
  assert.ok(await page.getByRole('heading',{name:'อภิปรายผลและข้อจำกัด',exact:true}).isVisible());checks++
  await button('ถัดไป').click()
  await button('เติมข้อเสนอแนะตัวอย่างในช่องว่าง').click()
  const chapters=page.locator('label').filter({hasText:/^1\.5 ข้อเสนอแนะ/}).locator('textarea')
  await chapters.fill('ข้อเสนอแนะที่ผู้ทดลองแก้ไขเอง: เพิ่มตารางผลทดสอบ')
  await button('เก็บร่างในหน้านี้').click()
  await nav(1).click();await nav(2).click()
  assert.match(await chapters.inputValue(),/ผู้ทดลองแก้ไขเอง/);checks++
  await button('เติมข้อเสนอแนะตัวอย่างในช่องว่าง').click()
  assert.match(await chapters.inputValue(),/ผู้ทดลองแก้ไขเอง/);checks++
  await button('ปิดตัวอย่าง').click();await button('เปิดตัวอย่างอีกครั้ง').click()
  assert.match(await chapters.inputValue(),/ผู้ทดลองแก้ไขเอง/);checks++
  await nav(4).click()
  assert.match(await page.getByRole('alert').innerText(),/กรุณาเลือกผลประเมิน/);checks++
  for(const [index,label] of ['เห็นชอบ','เห็นชอบโดยมีข้อแก้ไข','ให้แก้ไขและส่งใหม่'].entries()){
    await nav(3).click()
    await page.locator('input[name="demo-result"]').nth(index).check()
    if(index===2){
      await button('ตรวจทานคำตอบ').click();assert.match(await page.getByRole('alert').innerText(),/เหตุผล/);checks++
      await page.getByLabel('เหตุผลที่ให้แก้ไขและส่งใหม่ *',{exact:true}).fill('กรุณาเพิ่มหลักฐานการทดสอบจากพื้นที่ภายนอกและวิเคราะห์ข้อจำกัด')
    }
    await button('ตรวจทานคำตอบ').click()
    assert.ok(await page.locator('.review-saved-result').getByText(label,{exact:true}).isVisible());checks++
    assert.match(await page.locator('.review-saved-result').innerText(),/ผู้ทดลองแก้ไขเอง/);checks++
    await button('จำลองส่งผลประเมิน').click();await button('ยกเลิก').click()
    assert.equal(await page.getByRole('heading',{name:'จำลองส่งสำเร็จ',exact:true}).count(),0);checks++
    await button('จำลองส่งผลประเมิน').click();await button('ยืนยันจำลองส่ง').click()
    assert.ok(await page.getByRole('heading',{name:'จำลองส่งสำเร็จ',exact:true}).isVisible());checks++
    await button('กลับไปทดลองแก้ไข').click()
  }
  await page.setViewportSize({width:390,height:844})
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++
  await nav(3).click();await button('ตรวจทานคำตอบ').click();await button('จำลองส่งผลประเมิน').click();await button('ยืนยันจำลองส่ง').click()
  await button('เริ่มใหม่').click();await nav(2).click()
  assert.equal(await chapters.inputValue(),'');checks++
  assert.deepEqual(await page.evaluate(()=>window.demoNetwork),[]);checks++
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);checks++
  console.log(`PASS: ${checks} browser checks: five steps, preserved input, three outcomes, validation, confirmation/cancel, reset, mobile and zero API calls.`)
} catch(error) {console.error({errors,external,text:await page.locator('body').innerText()});throw error} finally {await browser.close();await server.close();unlinkSync('tmp/reviewer-demo-preview.html')}
