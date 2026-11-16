import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {mkdir,writeFile} from 'node:fs/promises'
import {createServer} from 'vite'
const {rs1Document,rs1DocumentFields,rs1WebFields}=await import(pathToFileURL(process.cwd()+'/src/data/rs1Document.js'))
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/rs1-strict-no-env',server:{host:'127.0.0.1',port:5226,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},normalize=s=>s.replace(/[✓□☑]/g,'').replace(/\s+/g,' ').replace(/ \)/g,')').trim(),errors=[]
page.on('dialog',d=>d.accept());page.on('pageerror',e=>errors.push(e.message))
try{
 await mkdir('tmp/rs1-strict',{recursive:true});await page.goto('http://127.0.0.1:5226/#/researcher/projects/V16-DRAFT/manual');await page.getByRole('button',{name:'EN',exact:true}).click();await page.locator('.rs1-document-form').waitFor()
 assert.deepEqual(await page.locator('[data-rs1-source]').evaluateAll(els=>els.map(e=>e.dataset.rs1Source)),rs1Document.filter(b=>b.type!=='signature').map(b=>b.id));n++
 assert.deepEqual(await page.locator('.rs1-field').evaluateAll(els=>els.map(e=>e.dataset.rs1Key)),rs1WebFields.map(f=>f.key));n++
 for(const b of rs1Document.filter(b=>b.type!=='signature')){const el=page.locator(`[data-rs1-source="${b.id}"]`),text=normalize(await el.innerText());if(b.en&&b.type!=='workTable')check(text.includes(normalize(b.en)),'source wording '+b.id);if(b.instruction)check(text.includes(normalize(b.instruction.en)),'instruction '+b.id);for(const option of b.options||[])check(text.includes(normalize(option.en)),'option '+b.id+option.value)}
 check(await page.locator('.rs1-document-options input').first().evaluate(el=>{const r=el.getBoundingClientRect();return r.width<=20&&r.height<=20}),'compact original choice controls')
 const before=await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))
 for(const lang of ['TH','EN'])for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await page.getByRole('button',{name:lang,exact:true}).click();await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'responsive '+lang+width);if(width!==768)await page.screenshot({path:`tmp/rs1-strict/form-${lang}-${width}.png`,fullPage:false})}
 check(await page.evaluate(()=>localStorage.getItem('mfu-foundation-v16-demo-projects'))===before,'reading does not change data')
 const pdf=await page.evaluate(async()=>{const {generateRS1PDF}=await import('/src/utils/generateRS1PDF.js');const {extractDocumentText}=await import('/src/utils/rs1Extraction.js');const r=await generateRS1PDF({}),parsed=await extractDocumentText(new File([r.blob],'original-structure.pdf',{type:'application/pdf'}));const bytes=new Uint8Array(await r.blob.arrayBuffer());let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return {...parsed,base64:btoa(binary)}})
 await writeFile('tmp/rs1-strict/strict-template.pdf',Buffer.from(pdf.base64,'base64'));await writeFile('tmp/rs1-strict/strict-pdf-text.txt',pdf.text)
 check(pdf.pageCount===7,'empty original template remains seven pages')
 for(const b of rs1Document){if(b.en&&['heading','fixed','field','choices','text','people'].includes(b.type))check(normalize(pdf.text).includes(normalize(b.en)),'PDF source '+b.id);if(b.instruction)check(normalize(pdf.text).includes(normalize(b.instruction.en)),'PDF instruction '+b.id);for(const option of b.options||[])check(normalize(pdf.text).includes(normalize(option.en)),'PDF option '+b.id+option.value)}
 for(const key of ['English Project Title','Additional Project Participants','Additional working plan','Team Signatories and Dates'])check(!pdf.text.includes(key),'no unsupported PDF field '+key)
 await writeFile('tmp/rs1-strict/strict-template.pdf',Buffer.from(pdf.base64,'base64'));await writeFile('tmp/rs1-strict/strict-pdf-text.txt',pdf.text)
 await page.goto('http://127.0.0.1:5226/#/researcher/upload');await page.locator('input[type=file]').setInputFiles('tests/fixtures/rs1-original-content.docx');await page.locator('.upload-result').waitFor()
 for(const [label,value]of [['Project Title','Fictional strict source import'],['Research Objectives','Strict imported objectives'],['Methodology (data collection, samples, randomization, analysis)','Strict imported methodology'],['Expected Outcomes by Reporting Period','Strict imported progress'],['Task 1','Collect baseline data'],['Compensation: Item 1 amount','1500']])check(await page.getByLabel(label,{exact:true}).inputValue()===value,'original DOCX import '+label)
 check((await page.locator('.rs1-work-plan').innerText()).includes('January–March 2027'),'unparsed imported period preserved without guessing')
 await page.getByLabel('I have reviewed and corrected the extracted values',{exact:true}).check();await page.getByRole('button',{name:'Continue to RS-1 Form',exact:true}).click();await page.locator('.rs1-document-form').waitFor()
 check(await page.getByLabel('Research Objectives *',{exact:true}).inputValue()==='Strict imported objectives','reviewed source transfer')
 check(errors.length===0,'no runtime errors');console.log(`PASS Strict RS-1 ${n} checks; 97 original fields; 7 source pages`)
}finally{await browser.close();await server.close()}
