import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {createServer} from 'vite'
import {finalPages} from './phase6.pages.mjs'
const require=createRequire(import.meta.url),{chromium}=require(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/phase6-no-env',server:{host:'127.0.0.1',port:5186,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext(),page=await context.newPage(),errors=[],results=[],controls=[]
const dir='docs/final/evidence/screenshots';await mkdir(dir,{recursive:true})
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
try{
 await page.goto('http://127.0.0.1:5186/');await page.getByRole('heading').first().waitFor()
 const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 for(const [id,,role,path]of finalPages){
  if(!path){results.push({id,status:'NOT TESTED',scope:'Firebase Sign In tested separately by auth emulator suite'});continue}
  for(const language of ['th','en'])for(const width of [1440,1280,768,390]){
   await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:5186/'+path)
   await page.locator(id==='N-C01'?'main h1':'#page-title').waitFor()
   await page.evaluate(async language=>{const {default:i18n}=await import('/src/i18n.js');await i18n.changeLanguage(language);await document.fonts.ready},language)
   await page.waitForTimeout(300)
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)
   results.push({id,language,width,status:overflow?'FAIL':'PASS',scope:'route render + no document overflow'})
   if(language==='th'&&width===1440){
    controls.push({id,role,path,controls:await page.locator('main button,main a,main input,main textarea,main select,main summary').evaluateAll(elements=>elements.map(el=>({tag:el.tagName,type:el.type||null,label:el.getAttribute('aria-label')||el.labels?.[0]?.innerText||el.innerText||el.name||'',disabled:!!el.disabled,href:el.getAttribute('href'),visible:!!el.getClientRects().length})))})
    await page.screenshot({path:`${dir}/${id}-th-1440.png`,fullPage:true})
   }
   if(overflow||width===390&&language==='th'&&['N-R03','N-S02','N-V03','N-C01'].includes(id))await page.screenshot({path:`${dir}/${id}-${language}-${width}.png`,fullPage:true})
   assert.ok(!overflow,`${id} ${role} ${language} ${width} horizontal overflow`)
  }
 }
 assert.equal(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects')),before,'read-only page survey changed canonical projects')
 assert.deepEqual(errors,[])
 console.log(`PASS Phase 6 browser: ${results.filter(r=>r.status==='PASS').length} route/language/viewport checks; sign-in separate; project data unchanged`)
}finally{await writeFile('docs/final/evidence/page-results.json',JSON.stringify(results,null,2));await writeFile('docs/final/evidence/page-controls.json',JSON.stringify(controls,null,2));await context.close();await browser.close();await server.close()}
