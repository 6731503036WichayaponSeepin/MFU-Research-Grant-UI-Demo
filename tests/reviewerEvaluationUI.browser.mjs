import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { createServer } from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/evaluation-ui-no-env',server:{host:'127.0.0.1',port:5209,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5209/#/reviewer/'
page.on('dialog',d=>d.accept())
try{
 await mkdir('tmp/reviewer-evaluation-ui',{recursive:true})
 await page.goto(base+'projects/V16-EVALUATION-0/evaluation');await page.locator('.ve-workspace').waitFor();await page.getByRole('button',{name:'EN',exact:true}).click()
 // Multi-page bytes exist only in this isolated browser's fictional local store.
 await page.evaluate(async()=>{const {jsPDF}=await import('/node_modules/jspdf/dist/jspdf.es.min.js');const pdf=new jsPDF();pdf.text('Assigned fictional report page 1',20,20);pdf.addPage();pdf.text('Assigned fictional report page 2',20,20);const key='mfu-foundation-v16-demo-projects',rows=JSON.parse(localStorage.getItem(key)),p=rows.find(p=>p.id==='V16-EVALUATION-0');p.closure.assignments[0].dueAt='2026-12-15';p.documents.find(d=>d.id===p.closure.assignments[0].documentIds[0]).dataUrl=pdf.output('datauristring').replace(/^data:application\/pdf;[^,]*base64,/, 'data:application/pdf;base64,');localStorage.setItem(key,JSON.stringify(rows))})
 await page.reload();await page.locator('canvas[data-rendered=true]').waitFor()
 check((await page.locator('.shared-stack').innerText()).includes('15 Dec 2026'),'readable actual assignment due date')
 const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 check(await page.locator('.ve-divider').getAttribute('aria-valuenow')==='50','initial 50:50')
 check(await page.locator('.reviewer-form select').count()===5,'all existing criteria and result fields')
 check(await page.locator('.ve-action-bar button').count()===2,'sticky existing actions')
 await page.getByLabel('Additional Comments',{exact:true}).fill('Keep independent draft while reading PDF')
 await page.getByRole('button',{name:'Next',exact:true}).click();await page.locator('canvas[data-rendered=true]').waitFor()
 check((await page.locator('.pdf-reader-toolbar').innerText()).includes('2 / 2'),'existing page control')
 check(await page.getByLabel('Additional Comments',{exact:true}).inputValue()==='Keep independent draft while reading PDF','PDF page preserves answers')
 check(await page.getByRole('link',{name:'Download PDF',exact:true}).count()===1,'existing download')
 const divider=page.getByRole('separator'),box=await divider.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+100,box.y+box.height/2);await page.mouse.up()
 check(Number(await divider.getAttribute('aria-valuenow'))>50,'pointer resize')
 await divider.focus();await page.keyboard.press('Home');check(await divider.getAttribute('aria-valuenow')==='50','keyboard reset')
 const pdfTop=await page.locator('.ve-pdf-scroll').evaluate(el=>el.scrollTop)
 await page.locator('.ve-form-scroll').evaluate(el=>el.scrollTop=el.scrollHeight)
 check(await page.locator('.ve-form-scroll').evaluate(el=>el.scrollTop>0),'form independently scrolls')
 check(await page.locator('.ve-pdf-scroll').evaluate(el=>el.scrollTop)===pdfTop,'form does not scroll PDF')
 check(await page.locator('.ve-action-bar').evaluate(el=>{const r=el.getBoundingClientRect(),p=el.closest('.ve-editor').getBoundingClientRect();return r.bottom<=p.bottom+1&&r.bottom>=p.bottom-2}),'actions remain at panel bottom')
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'reading/resizing never mutates project')
 await page.getByRole('button',{name:'Save Draft',exact:true}).click();await page.getByText('Saved successfully',{exact:true}).waitFor()
 await page.goto(base+'projects/V16-EVALUATION-0/assigned-report');await page.locator('.ve-workspace').waitFor()
 check(await page.getByLabel('Additional Comments',{exact:true}).inputValue()==='Keep independent draft while reading PDF','V02/V03 draft recovery')
 await page.reload();await page.locator('.ve-workspace').waitFor();check(await page.getByLabel('Additional Comments',{exact:true}).inputValue()==='Keep independent draft while reading PDF','reload recovery')
 for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);if(width<900)check(await divider.isHidden(),'stacked panels');await page.screenshot({path:`tmp/reviewer-evaluation-ui/${lang}-${width}.png`,fullPage:true})}
 await page.goto(base+'projects/V16-DRAFT/evaluation');await page.getByRole('heading',{name:'Project not found or access denied'}).waitFor();check(await page.locator('.ve-workspace').count()===0,'unassigned report denied')
 console.log(`PASS Unified Evaluation UI ${n} checks`)
}finally{await browser.close();await server.close()}
