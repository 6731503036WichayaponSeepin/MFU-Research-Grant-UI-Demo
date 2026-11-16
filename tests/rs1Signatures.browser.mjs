import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {createServer} from 'vite'
const {chromium}=createRequire(import.meta.url)(process.env.MFU_PLAYWRIGHT_MODULE||'playwright')
const server=await createServer({envDir:'tmp/signatures-no-env',server:{host:'127.0.0.1',port:5228,strictPort:true}});await server.listen()
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}})
let n=0;const check=(v,m)=>{assert.ok(v,m);n++},base='http://127.0.0.1:5228/'
try{
 await page.goto(base+'#/researcher/dashboard');await page.getByRole('button',{name:'EN',exact:true}).click()
 await page.goto(base+'#/researcher/projects/V16-DRAFT/manual');await page.locator('.rs1-signatures').waitFor()
 await page.getByLabel('Advisor Name',{exact:true}).fill('Fictional Advisor')
 await page.getByLabel('Participant Full Name',{exact:true}).fill('Fictional First')
 await page.getByRole('button',{name:'Add Participant',exact:true}).click();await page.getByLabel('Participant Full Name (2)',{exact:true}).fill('Fictional Second')
 check(await page.locator('.rs1-signature').count()===4,'individual cards for advisor, leader and both participants')
 const buffer=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=60;c.getContext('2d').fillText('TEST ONLY',10,30);return c.toDataURL('image/png').split(',')[1]}),'base64')
 const cards=page.locator('.rs1-signature')
 for(let i=0;i<4;i++){await cards.nth(i).locator('input[type=file]').setInputFiles({name:'fictional.png',mimeType:'image/png',buffer});await cards.nth(i).locator('img').waitFor();await cards.nth(i).locator('input[type=date]').fill('2026-11-16');await cards.nth(i).getByLabel('This is my own signature',{exact:true}).check()}
 check(await page.getByLabel('I obtained consent from all other signature owners',{exact:true}).count()===0,'consent only for another person image')
 await cards.nth(2).getByLabel('This is my own signature',{exact:true}).uncheck()
 check(await page.getByLabel('I obtained consent from all other signature owners',{exact:true}).count()===1,'other-person consent shown')
 await page.getByLabel('I obtained consent from all other signature owners',{exact:true}).check();await page.reload();await cards.nth(3).locator('img').waitFor()
 check(await cards.locator('img').count()===4,'all signature images recover')
 const result=await page.evaluate(async()=>{const draft=JSON.parse(localStorage.getItem('mfu-researcher-v16:local-demo-v16:demo-user:V16-DRAFT'));const {generateRS1PDF}=await import('/src/utils/generateRS1PDF.js');const {extractDocumentText}=await import('/src/utils/rs1Extraction.js');const pdf=await generateRS1PDF(draft);return {data:draft,text:(await extractDocumentText(new File([pdf.blob],'signed.pdf',{type:'application/pdf'}))).text,bytes:Array.from(new Uint8Array(await pdf.blob.arrayBuffer()))}})
 check(result.data.electronicSignatures.length===4,'independent version payloads')
 check(['Fictional First','Fictional Second','Fictional Advisor'].every(name=>result.text.includes(name)),'PDF includes all actual signer names')
 check((result.text.match(/Date 2026-11-16/g)||[]).length===4,'PDF includes each individual signing date')
 await mkdir('tmp/rs1-signatures',{recursive:true});await writeFile('tmp/rs1-signatures/multiple-participants.pdf',Buffer.from(result.bytes))
 await page.getByLabel('Participant Full Name',{exact:true}).fill('Different Fictional Person')
 check(await cards.nth(2).locator('img').count()===0,'renaming signer never reuses previous image')
 check(await cards.nth(3).locator('img').count()===1,'other signer unaffected')
 console.log(`PASS RS-1 electronic signatures ${n} checks`)
}finally{await browser.close();await server.close()}
