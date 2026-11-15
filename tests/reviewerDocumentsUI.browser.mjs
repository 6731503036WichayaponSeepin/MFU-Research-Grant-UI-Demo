import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/reviewer-documents-no-env',server:{host:'127.0.0.1',port:5213,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5213/'
try{
 await mkdir('tmp/reviewer-documents-ui',{recursive:true})
 for(let i=1;i<=3;i++){
  await page.goto(base+'#/roles');await page.locator('.shared-role').last().getByRole('combobox').selectOption(`demo-reviewer-${i}`);await page.getByRole('button',{name:/· reviewer/}).click()
  const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
  await page.goto(base+'#/reviewer/projects/V16-EVALUATION-0/documents');await page.locator('.reviewer-document-library').waitFor();await page.getByRole('button',{name:'EN',exact:true}).click()
  check(await page.locator('h1').count()===1,'single project heading')
  check(await page.locator('.vd-sections>.vd-card').count()===2,'two compact sections')
  check(await page.locator('.vd-table tbody tr').count()===1,'assigned report only')
  check(await page.locator('.vd-evaluation').count()===0,'no draft/pending PDF entry')
  check(await page.locator('.reviewer-document-library input,.reviewer-document-library button').count()===0,'no upload/delete actions')
  await page.getByRole('link',{name:'Preview PDF',exact:true}).click();await page.locator('canvas[data-rendered=true]').waitFor();check(await page.getByRole('link',{name:'Download PDF',exact:true}).count()===1,'existing preview/download controls')
  await page.goto(base+'#/reviewer/projects/V16-EVALUATION-3/documents');await page.locator('.reviewer-document-library').waitFor()
  check(await page.locator('.vd-evaluation').count()===1,'submitted own evaluation entry')
  const href=await page.locator('.vd-evaluation>a').getAttribute('href');check(href.endsWith('/my-evaluation'),'V05 route')
  await page.locator('.vd-evaluation>a').click();await page.locator('.vs-submitted').waitFor();check(await page.getByRole('button',{name:'Download PDF',exact:true}).isEnabled(),'existing V05 generation action')
  await page.goto(base+'#/reviewer/projects/V16-EVALUATION-3/documents');await page.locator('.reviewer-document-library').waitFor()
  for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:900});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);if(i===1)await page.screenshot({path:`tmp/reviewer-documents-ui/${lang}-${width}.png`,fullPage:true})}
  check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'document browsing does not mutate records')
 }
 await page.goto(base+'#/reviewer/projects/V16-EVALUATION-3/documents?document=fixture-doc-unknown');await page.getByRole('heading',{name:'Document not found or access denied'}).waitFor();check(await page.locator('canvas').count()===0,'unknown document denied')
 await page.goto(base+'#/reviewer/projects/V16-DRAFT/documents');await page.getByRole('heading',{name:'Project not found or access denied'}).waitFor();check(await page.locator('.reviewer-document-library').count()===0,'unassigned denied')
 for(const role of ['staff','researcher']){await page.goto(base+`#/${role}/projects/V16-EVALUATION-3/documents`);await page.locator('.shared-table').waitFor();check(await page.locator('.reviewer-document-library').count()===0,'other role unchanged')}
 console.log(`PASS Reviewer Document Library UI ${n} checks`)
}finally{await browser.close();await server.close()}
