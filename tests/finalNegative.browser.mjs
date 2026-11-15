import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/final-negative-no-env',server:{host:'127.0.0.1',port:5217,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),base='http://127.0.0.1:5217/'
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},project=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')).find(p=>p.id==='V16-EVALUATION-0'))
async function persona(i){await page.goto(base+'#/roles');await page.getByRole('button',{name:'EN',exact:true}).click();await page.getByLabel('Reviewer persona (same role)',{exact:true}).selectOption(`demo-reviewer-${i}`);await page.getByRole('button',{name:/· reviewer/}).click()}
page.on('dialog',d=>d.accept())
try{
 await persona(1);await page.goto(base+'#/reviewer/projects/V16-EVALUATION-0/evaluation');await page.locator('.reviewer-form').waitFor()
 await page.getByRole('button',{name:'Review Answers',exact:true}).click();check(await page.getByRole('alert').count()===1,'missing required answers rejected')
 for(const [i,key]of ['objectives','consistency','abstract','executive'].entries()){
  await page.locator('.reviewer-form select').nth(i).selectOption('1');await page.getByLabel(key+'Detail',{exact:true}).fill('เหตุผลประกอบหัวข้อ '+key)
 }
 const narratives=page.locator('.reviewer-form > label textarea')
 for(let i=0;i<4;i++)await narratives.nth(i).fill(`ข้อเสนอแนะส่วนที่ ${i+1}`)
 const utilization=page.locator('.reviewer-form > section').last()
 for(let i=0;i<5;i++){const row=utilization.locator(':scope > div').nth(i);await row.getByRole('checkbox').check();if(await row.locator('textarea').count())await row.locator('textarea').fill(`แนวทางใช้ประโยชน์ ${i+1}`)}
 check(await utilization.getByRole('checkbox',{checked:true}).count()===5,'all utilization options')
 check(await utilization.locator('textarea').count()===4,'all conditional utilization details')
 await page.getByLabel('Evaluation Result',{exact:true}).selectOption('2');await page.getByRole('button',{name:'Review Answers',exact:true}).click();check(await page.getByRole('alert').count()===1,'non-certified outcome requires reason')
 await page.getByLabel('Result reason',{exact:true}).fill('ต้องปรับปรุงการอภิปรายผลและตรวจสอบความสอดคล้องของข้อมูล');await page.getByLabel('Additional Comments',{exact:true}).fill('ข้อคิดเห็นเพิ่มเติมฉบับสมบูรณ์')
 await page.getByLabel('Upload PDF',{exact:true}).setInputFiles('public/MFU-Demonstration-Sample.pdf');await page.getByText('Uploading…',{exact:true}).waitFor({state:'hidden'});const feedback=(await project()).documents.find(d=>d.kind==='feedback')
 await page.getByRole('button',{name:'Save Draft',exact:true}).click();await page.getByText('Saved successfully',{exact:true}).waitFor();let p=await project();check(JSON.stringify(p.closure.evaluations['demo-reviewer-1'].documentIds)===JSON.stringify([feedback.id]),'only the actual uploaded feedback is selected; no hidden aggregate document IDs')
 check(Object.keys(p.closure.evaluations['demo-reviewer-1'].utilization).length===5,'all utilization values saved');check(!p.closure.evaluations['demo-reviewer-1'].submitted,'draft remains unsubmitted')
 await persona(2);await page.goto(base+`#/reviewer/projects/V16-EVALUATION-0/documents?document=${feedback.id}`);await page.getByRole('heading',{name:'Document not found or access denied'}).waitFor();check(await page.locator('canvas').count()===0,'another reviewer cannot preview feedback')
 await persona(1);await page.goto(base+'#/reviewer/projects/V16-EVALUATION-0/evaluation');await page.getByRole('button',{name:'Review Answers',exact:true}).click();await page.locator('.vr-review').waitFor();check((await page.locator('.vr-review').innerText()).includes('MFU-Demonstration-Sample.pdf'),'review preserves actual attachment')
 await page.getByRole('button',{name:'Submit Evaluation',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await page.locator('.vs-submitted').waitFor();p=await project();const e=p.closure.evaluations['demo-reviewer-1']
 check(e.submitted&&e.result===2&&e.reviewRound===1,'actual non-certified submitted result in one round');check(Object.keys(e.utilization).length===5&&e.documentIds.includes(feedback.id),'conditional data and attachment retained');check(p.status==='REPORT_EVALUATION'&&!p.closure.release,'submission does not auto-release or change project state')
 check(['chapters','outputs','strengths','future'].every((key,i)=>e[key]===`ข้อเสนอแนะส่วนที่ ${i+1}`),'every narrative field persisted exactly')
 check(['objectives','consistency','abstract','executive'].every(key=>e[key+'Detail']==='เหตุผลประกอบหัวข้อ '+key),'every conditional categorical reason persisted exactly')
 check(e.reason==='ต้องปรับปรุงการอภิปรายผลและตรวจสอบความสอดคล้องของข้อมูล'&&e.additionalComments==='ข้อคิดเห็นเพิ่มเติมฉบับสมบูรณ์','final reason and additional comments persisted exactly')
 await page.goto(base+'#/reviewer/projects/V16-EVALUATION-0/answers');await page.locator('.vs-submitted').waitFor();check(await page.getByRole('button',{name:'Submit Evaluation',exact:true}).count()===0,'submitted result cannot be submitted again')
 await page.goto(base+'#/reviewer/projects/V16-EVALUATION-0/evaluation');await page.locator('.vs-submitted').waitFor();check(await page.getByRole('button',{name:'Save Draft',exact:true}).count()===0,'post-submission editing restricted')
 console.log(`PASS Final Negative browser ${n} checks; complete conditional rubric, feedback ACL and submitted lock`)
}catch(error){console.log((await page.locator('main').innerText()).slice(-3500));throw error}finally{await browser.close();await server.close()}
