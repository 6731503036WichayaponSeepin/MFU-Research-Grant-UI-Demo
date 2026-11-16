import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir,readFile } from 'node:fs/promises'
import { createServer } from 'vite'
const require=createRequire(import.meta.url),{chromium}=require(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/phase4-no-env',server:{host:'127.0.0.1',port:5182,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage()
const base='http://127.0.0.1:5182/',dir='docs/progress/screenshots/phase4',errors=[]
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await mkdir(dir,{recursive:true});await mkdir('tmp/pdfs',{recursive:true})
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++}
const route=async(path,role='reviewer')=>{await page.goto(base+`#/${role}/`+path);await page.locator('#page-title').waitFor()}
const rows=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mfu-foundation-v16-demo-projects')))
try{
 await page.goto(base);await page.getByRole('button',{name:'EN',exact:true}).click();await page.getByRole('button',{name:/· reviewer/}).click();await page.locator('#page-title').waitFor()
 check(await page.locator('.rv-strip a').count()===4,'four derived reviewer summary metrics');await page.screenshot({path:`${dir}/assigned-reviews.png`,fullPage:true})
 await page.getByLabel('Review Status',{exact:true}).selectOption('pending');await page.getByRole('button',{name:'Search',exact:true}).click();check(await page.locator('.shared-project-row').count()===1,'pending queue')
 await route('projects/V16-DRAFT/evaluation');check(await page.getByRole('heading',{name:'Project not found or access denied'}).count()===1,'unassigned denied')
 await route('projects/V16-EVALUATION-0/assigned-report');const before=JSON.stringify(await rows());check(await page.locator('.ve-report').count()===1,'assigned report only')
 await page.locator('.ve-report canvas[data-rendered=true]').waitFor();check(JSON.stringify(await rows())===before,'read report leaves project unchanged');await page.screenshot({path:`${dir}/report-reader.png`,fullPage:true})
 await route('projects/V16-EVALUATION-0/evaluation');await page.getByLabel('3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป',{exact:true}).fill('Independent reviewer one draft');await page.getByRole('button',{name:'Save Draft',exact:true}).click();await page.getByText('Saved successfully',{exact:true}).waitFor()
 let p=(await rows()).find(p=>p.id==='V16-EVALUATION-0');check(!p.closure.evaluations['demo-reviewer-1'].submitted,'draft not submitted');await page.reload();await page.getByLabel('3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป',{exact:true}).waitFor();check(await page.getByLabel('3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป',{exact:true}).inputValue()==='Independent reviewer one draft','saved draft reload')
 await page.getByRole('button',{name:'Review Answers',exact:true}).click();check(await page.locator('.reviewer-form').getByRole('alert').count()===5,'partial draft inline validation');check(await page.locator('#evaluation-objectives').evaluate(el=>el===document.activeElement),'focus first invalid criterion')
 for(const label of ['1.1 การวิจัยบรรลุวัตถุประสงค์ของโครงการวิจัยหรือไม่','1.2 ผลการดำเนินงานเป็นไปตามข้อเสนอโครงการวิจัยหรือไม่','1.3 บทคัดย่อ มีความสมบูรณ์ ครอบคลุมครบถ้วน ทั้งทางด้านเนื้อหา ภาษาที่ใช้','1.4 บทสรุปผู้บริหาร มีความสมบูรณ์ ครอบคลุมครบถ้วน ทั้งทางด้านเนื้อหา ภาษาที่ใช้'])await page.getByRole('group',{name:label,exact:true}).getByRole('radio').first().check()
 await page.locator('input[name=result][value="1"]').check()
 await page.getByLabel('1.5 ข้อเสนอแนะเพื่อปรับปรุงแก้ไขร่างรายงานวิจัยฉบับสมบูรณ์ ในแต่ละบท',{exact:true}).fill('ข้อเสนอแนะภาษาไทย\nMultiline exact submitted answer')
 await page.screenshot({path:`${dir}/evaluation-editor.png`,fullPage:true});await page.getByRole('button',{name:'Review Answers',exact:true}).click();await page.waitForURL(/answers$/);check((await page.locator('.reviewer-answers').allTextContents()).join('\n').includes('Independent reviewer one draft'),'review matches working draft')
 await page.screenshot({path:`${dir}/review-submit.png`,fullPage:true});await page.getByRole('button',{name:'Submit Evaluation',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click();check(!(await rows()).find(p=>p.id==='V16-EVALUATION-0').closure.evaluations['demo-reviewer-1'].submitted,'cancel confirmation no submission')
 await page.getByRole('button',{name:'Submit Evaluation',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm',exact:true}).click();await page.waitForURL(/my-evaluation$/)
 p=(await rows()).find(p=>p.id==='V16-EVALUATION-0');check(p.closure.evaluations['demo-reviewer-1'].submitted&&p.status==='REPORT_EVALUATION'&&!p.closure.release,'submitted self transition no release')
 const unchanged=JSON.stringify(await rows()),download=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF',exact:true}).click();await (await download).saveAs('tmp/pdfs/phase4-evaluation.pdf');check((await readFile('tmp/pdfs/phase4-evaluation.pdf')).subarray(0,5).toString()==='%PDF-','real PDF bytes');check(JSON.stringify(await rows())===unchanged,'PDF read-only')
 await page.screenshot({path:`${dir}/submitted-result.png`,fullPage:true});await route('projects/V16-EVALUATION-0/evaluation');check(await page.getByRole('button',{name:'Save Draft',exact:true}).count()===0,'submitted editor locked')
 await route('projects/V16-EVALUATION-0/my-evaluation');await page.setViewportSize({width:390,height:1000});await page.waitForTimeout(350);await page.screenshot({path:`${dir}/submitted-mobile.png`,fullPage:true});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile no overflow')
 await route('projects/V16-CLOSED-REPORT/my-evaluation');check(await page.getByRole('button',{name:'Download PDF',exact:true}).isDisabled(),'post-CLOSED remains OPEN disabled')
 // Switch the existing fictional persona at entry, preserving one role and distinct records.
 await page.goto(base+'#/roles');await page.getByLabel('Reviewer persona (same role)',{exact:true}).selectOption('demo-reviewer-2');await page.getByRole('button',{name:/· reviewer/}).click();await route('projects/V16-EVALUATION-0/evaluation');check(await page.getByLabel('3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป',{exact:true}).inputValue()==='','persona2 has independent draft')
 await route('projects/V16-EVALUATION-0/my-evaluation');check(await page.getByRole('heading',{name:'No submitted evaluation',exact:true}).count()===1,'persona2 cannot read persona1 result')
 await page.goto(base+'#/roles');await page.getByLabel('Reviewer persona (same role)',{exact:true}).selectOption('demo-reviewer-3');await page.getByRole('button',{name:/· reviewer/}).click();await route('projects/V16-EVALUATION-0/evaluation');check(await page.getByLabel('3. ข้อเสนอแนะ เพื่อการพัฒนางานวิจัยต่อไป',{exact:true}).inputValue()==='','persona3 independent')
 await route('projects/V16-EVALUATION-0/my-evaluation','researcher');check(await page.getByRole('heading',{name:'Access Denied'}).count()===1,'role route denied')
 check(errors.length===0,JSON.stringify(errors));console.log(`PASS Phase 4 browser: ${checks} checks; PDF=tmp/pdfs/phase4-evaluation.pdf`)
}catch(e){await page.screenshot({path:'tmp/phase4-debug.png',fullPage:true});console.log((await page.locator('main').innerText()).slice(0,1800));throw e}finally{await context.close();await browser.close();await server.close()}
