import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const require=createRequire(import.meta.url),{chromium}=require(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/phase5-no-env',server:{host:'127.0.0.1',port:5183,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),base='http://127.0.0.1:5183/',id='V16-CLOSURE'
let checks=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
const check=(v,m)=>{assert.ok(v,m);checks++}
const route=async(role,view)=>{await page.goto(base+`#/${role}/projects/${id}/${view}`);await page.locator('#page-title').waitFor()}
const project=()=>page.evaluate(id=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id===id),id)
const form=title=>page.getByRole('heading',{name:title,exact:true}).locator('..')
async function submit(title){await form(title).getByRole('button',{name:title,exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await form(title).getByRole('status').waitFor()}
async function persona(n){await page.goto(base+'#/roles');await page.getByLabel('Reviewer persona (same role)',{exact:true}).selectOption(`demo-reviewer-${n}`);await page.getByRole('button',{name:/· reviewer/}).click();await page.locator('#page-title').waitFor()}
async function pdf(role,index=0){const before=JSON.stringify(await project()),event=page.waitForEvent('download');await page.getByRole('button',{name:'Generate Individual PDF',exact:true}).nth(index).click();const file=await event;check(file.suggestedFilename().includes(`demo-reviewer-${index+1}`),`${role} requested reviewer identity`);await file.saveAs(`tmp/pdfs/phase5-${role}.pdf`);check(JSON.stringify(await project())===before,`${role} PDF never mutates project`)}
try{
 await mkdir('tmp/pdfs',{recursive:true});await mkdir('docs/progress/screenshots/phase5',{recursive:true})
 await page.goto(base);await page.getByRole('button',{name:'EN',exact:true}).click();await page.getByRole('button',{name:/· staff/}).click();await route('staff','closure-review');await submit('Record Document Check')
 await route('staff','reviewer-assignment');for(let n=1;n<=3;n++)await page.getByLabel(`Reviewer ${n}`,{exact:true}).selectOption(`demo-reviewer-${n}`);await submit('Confirm Reviewer Assignment')
 const assignments=JSON.stringify((await project()).closure.assignments)
 for(let n=1;n<=3;n++){
  await persona(n);await route('reviewer','evaluation');await page.getByLabel('3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป',{exact:true}).fill(`Integrated reviewer ${n}`);await page.getByRole('button',{name:'Save Draft',exact:true}).click();await page.getByText('Saved successfully',{exact:true}).waitFor()
  await route('staff','evaluation-tracking');check((await page.getByRole('heading',{name:new RegExp(`Evaluation Tracking.*${n-1}/3`)}).count())===1,'draft excluded from progress');check(await form('Release Evaluation Results').getByRole('button',{name:'Release Evaluation Results',exact:true}).isDisabled(),'release blocked before 3/3')
  await route('researcher','results');check(await page.getByRole('button',{name:'Generate Individual PDF',exact:true}).count()===0,'researcher cannot PDF unreleased results')
  await route('reviewer','evaluation');for(const label of ['1.1 การวิจัยบรรลุวัตถุประสงค์ของโครงการวิจัยหรือไม่','1.2 ผลการดำเนินงานเป็นไปตามข้อเสนอโครงการวิจัยหรือไม่','1.3 บทคัดย่อ มีความสมบูรณ์ ครอบคลุมครบถ้วน ทั้งทางด้านเนื้อหา ภาษาที่ใช้','1.4 บทสรุปผู้บริหาร มีความสมบูรณ์ ครอบคลุมครบถ้วน ทั้งทางด้านเนื้อหา ภาษาที่ใช้'])await page.getByRole('group',{name:label,exact:true}).getByRole('radio').first().check()
  await page.locator('input[name=result][value="1"]').check();await page.getByRole('button',{name:'Review Answers',exact:true}).click();await page.waitForURL(/answers$/);await page.getByRole('button',{name:'Submit Evaluation',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await page.waitForURL(/my-evaluation$/)
 }
 await route('staff','evaluation-tracking');check(await page.getByRole('button',{name:'Generate Individual PDF',exact:true}).count()===3,'staff three individual PDFs');await pdf('staff');await submit('Release Evaluation Results')
 check(await form('Release Evaluation Results').getByRole('button',{name:'Release Evaluation Results',exact:true}).isDisabled(),'release once')
 await route('researcher','results');check(await page.getByRole('button',{name:'Generate Individual PDF',exact:true}).count()===3,'researcher gets three released PDFs');await pdf('researcher',1);await page.screenshot({path:'docs/progress/screenshots/phase5/released-results.png',fullPage:true})
 let releaseFont,fontStarted;const waitingFont=new Promise(r=>fontStarted=r),heldFont=new Promise(r=>releaseFont=r)
 await page.route('**/fonts/Sarabun-Regular.ttf',async request=>{fontStarted();await heldFont;await request.continue()},{times:1})
 let lateDownloads=0;const onDownload=()=>lateDownloads++;page.on('download',onDownload)
 await page.getByRole('button',{name:'Generate Individual PDF',exact:true}).first().click();await waitingFont;await route('researcher','details');releaseFont();await page.waitForTimeout(500);page.off('download',onDownload);check(lateDownloads===0,'page/account exit cancels pending PDF download')
 await route('researcher','revised-report');await page.getByLabel('Upload PDF',{exact:true}).setInputFiles('public/MFU-Demonstration-Sample.pdf');await page.getByRole('button',{name:'Confirm Submission',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await page.getByRole('heading',{name:'Submission Receipt',exact:true}).waitFor()
 const evaluations=JSON.stringify((await project()).closure.evaluations);check((await project()).status==='REPORT_EVALUATION','revision does not close')
 await route('staff','final-verification');await submit('Verify Final Report');check((await project()).status==='REPORT_EVALUATION','verification does not close');await submit('Confirm Project Closure')
 const closed=await project();check(closed.status==='CLOSED'&&JSON.stringify(closed.closure.assignments)===assignments&&JSON.stringify(closed.closure.evaluations)===evaluations,'explicit closure preserves one round')
 await route('staff','evaluation-tracking');check(await page.getByRole('button',{name:'Generate Individual PDF',exact:true}).first().isDisabled(),'post-CLOSED PDF remains OPEN')
 await page.goto(base+'#/researcher/notifications');await page.locator('#page-title').waitFor();check((await page.locator('main').innerText()).includes('Report project closed'),'closure notification shared');await page.getByRole('button',{name:'Mark all as read',exact:true}).click();await page.getByText('Read status saved',{exact:true}).waitFor();check(await page.getByRole('button',{name:'Mark all as read',exact:true}).isDisabled(),'read markers persist')
 await route('staff','timeline');check((await page.locator('.shared-history').innerText()).includes('Report project closed'),'shared audit closure visible');check(errors.length===0,JSON.stringify(errors));console.log(`PASS Phase 5 browser: ${checks} checks; one shared project across three roles/personas`)
}catch(e){await page.screenshot({path:'tmp/phase5-debug.png',fullPage:true});throw e}finally{await context.close();await browser.close();await server.close()}
