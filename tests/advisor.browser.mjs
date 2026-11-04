import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'
export async function verifyAdvisorBrowser(bundle) {
  const require=createRequire(import.meta.url)
  const {chromium}=require(process.env.MFU_PLAYWRIGHT_MODULE || 'playwright')
  const server=await createServer({mode:'emulator',server:{host:'127.0.0.1',port:5174,strictPort:true}})
  await server.listen()
  const browser=await chromium.launch({headless:true,...(process.env.MFU_BROWSER_PATH?{executablePath:process.env.MFU_BROWSER_PATH}:{})})
  const base='http://127.0.0.1:5174',qa=resolve(bundle.directory,'qa');mkdirSync(qa,{recursive:true})
  const pages=[],errors=[];let checks=0
  async function open(role){
    const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true})
    await context.addInitScript(()=>{try{localStorage.setItem('mfu-language','th')}catch{ /* Initial about:blank has no storage. */ }})
    const page=await context.newPage();pages.push(page);page.on('pageerror',error=>errors.push(error.message))
    await page.route('**/*',route=>{const url=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(url.hostname) || ['data:','blob:','chrome-extension:','edge-extension:'].includes(url.protocol)?route.continue():route.abort()})
    await page.goto(base)
    await page.getByLabel('อีเมล / Email',{exact:true}).fill(role==='researcher'?'researcher@example.test':role==='staff'?'staff@example.test':'reviewer@example.test')
    await page.getByLabel('รหัสผ่าน / Password',{exact:true}).fill(process.env.MFU_ADVISOR_TEST_PASSWORD)
    await page.getByRole('button',{name:'เข้าสู่ระบบ / Sign in',exact:true}).click()
    return page
  }
  async function projectVisible(page,title){await page.waitForFunction(text=>document.body.innerText.includes(text),title,{timeout:20000});checks++}
  try {
    const reviewer=await open('reviewer')
    await reviewer.locator('.review-project-card').nth(4).waitFor({timeout:30000})
    assert.equal(await reviewer.locator('.review-project-card').count(),5);checks++
    await reviewer.screenshot({path:resolve(qa,'reviewer-dashboard.png'),fullPage:true})
    await reviewer.setViewportSize({width:390,height:844})
    await reviewer.screenshot({path:resolve(qa,'reviewer-mobile.png'),fullPage:true})
    assert.ok(await reviewer.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));checks++
    await reviewer.setViewportSize({width:1440,height:1000})
    for(const spec of bundle.projects.filter(p=>p.demoGroup==='reviewer')){
      await reviewer.goto(base);const card=reviewer.locator('.review-project-card').filter({hasText:spec.id});await card.getByRole('button').click();await projectVisible(reviewer,spec.title)
      await reviewer.locator('.review-report canvas[data-rendered="true"]').waitFor({timeout:20000});checks++
    }
    await reviewer.goto(base)
    await reviewer.locator('.review-project-card').filter({hasText:'MFU-ADVISOR-V1-C02'}).getByRole('button',{name:'ประเมินต่อ'}).click()
    let form=reviewer.locator('.review-evaluation-form')
    await form.getByLabel(/^1\.5/).fill('ข้อเสนอแนะจากการทดสอบหน้าเว็บ: เพิ่มการอธิบายข้อมูลที่ไม่สอดคล้องกัน')
    await form.getByRole('button',{name:'บันทึกร่าง',exact:true}).click()
    await reviewer.getByText('บันทึกร่างในระบบแล้ว สามารถกลับมาประเมินต่อได้',{exact:true}).waitFor();checks++
    await reviewer.goto(base)
    await reviewer.locator('.review-project-card').filter({hasText:'MFU-ADVISOR-V1-C02'}).getByRole('button',{name:'ประเมินต่อ'}).click()
    form=reviewer.locator('.review-evaluation-form')
    assert.match(await form.getByLabel(/^1\.5/).inputValue(),/ทดสอบหน้าเว็บ/);checks++
    for(let i=0;i<4;i++)await form.locator('.review-question').nth(i).getByRole('radio').first().check()
    await form.locator('.review-overall').getByRole('radio').nth(1).check()
    await reviewer.screenshot({path:resolve(qa,'reviewer-evaluation.png'),fullPage:true})
    await reviewer.locator('.review-report').screenshot({path:resolve(qa,'report-preview.png')})
    const [download]=await Promise.all([reviewer.waitForEvent('download'),reviewer.locator('.review-report a[download]').click()])
    await download.saveAs(resolve(qa,'browser-report-download.pdf'));checks++
    await form.getByRole('button',{name:'ตรวจสอบก่อนส่ง',exact:true}).click()
    await form.getByRole('heading',{name:'ตรวจสอบก่อนยืนยันส่ง',exact:true}).waitFor();checks++
    await reviewer.screenshot({path:resolve(qa,'reviewer-confirmation.png'),fullPage:true})
    await form.getByRole('button',{name:'ยืนยันส่งผลการประเมิน',exact:true}).click()
    await reviewer.getByRole('heading',{name:'ผลการประเมินที่ส่งแล้ว',exact:true}).waitFor({timeout:20000});checks++
    const staff=await open('staff')
    await staff.locator('.advisor-showcase article').nth(4).waitFor({timeout:30000})
    assert.equal(await staff.locator('.advisor-showcase article').count(),5);checks++
    await staff.screenshot({path:resolve(qa,'staff-dashboard.png'),fullPage:true})
    for(const spec of bundle.projects.filter(p=>p.demoGroup==='staff')){
      await staff.goto(base);await staff.locator('.advisor-showcase article').filter({hasText:spec.id}).getByRole('button').click();await projectVisible(staff,spec.title)
    }
    await staff.goto(base)
    await staff.locator('.review-comparison tbody tr').filter({hasText:'ระบบติดตามห่วงโซ่ผลิตภัณฑ์กาแฟ'}).getByRole('button').click()
    const disposition=staff.getByRole('heading',{name:'ส่งข้อเสนอแนะให้นักวิจัย',exact:true}).locator('..')
    await disposition.getByLabel('ขั้นตอนถัดไป').selectOption('revision')
    await disposition.getByLabel('ข้อเสนอแนะ / เหตุผล').fill('เพิ่มการอธิบายข้อมูลที่ไม่สอดคล้องกันและส่งรายงานฉบับแก้ไข')
    await disposition.getByRole('button',{name:'บันทึกและแจ้งนักวิจัย',exact:true}).click()
    await staff.getByText('บันทึกข้อมูลเรียบร้อยแล้ว',{exact:true}).waitFor();checks++
    const researcher=await open('researcher')
    await researcher.locator('.projects-table tbody tr').nth(4).waitFor({timeout:30000})
    assert.equal(await researcher.locator('.projects-table tbody tr').count(),5);checks++
    await researcher.getByText('เพิ่มการอธิบายข้อมูลที่ไม่สอดคล้องกันและส่งรายงานฉบับแก้ไข',{exact:true}).waitFor();checks++
    await researcher.screenshot({path:resolve(qa,'researcher-dashboard.png'),fullPage:true})
    for(const spec of bundle.projects.filter(p=>p.demoGroup==='researcher')){
      await researcher.goto(base);await researcher.locator('.projects-table tbody tr').filter({hasText:spec.id}).getByRole('button').click();await projectVisible(researcher,spec.title)
    }
    assert.deepEqual(errors,[])
    console.log(`PASS: ${checks} browser checks: three real sign-ins, five examples per dashboard, all 15 projects open, PDF canvas/download, saved/reloaded draft, confirm/submit, staff release, researcher feedback.`)
  }catch(error){for(let i=0;i<pages.length;i++)await pages[i].screenshot({path:resolve(qa,`browser-failure-${i}.png`),fullPage:true}).catch(()=>{});throw error}
  finally {await browser.close();await server.close()}
}
