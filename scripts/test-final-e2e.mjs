import {spawnSync} from 'node:child_process'
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs'
const root='tmp/final-e2e',evidence='docs/progress/evidence/final-e2e'
mkdirSync(`${root}/tests`,{recursive:true});mkdirSync(evidence,{recursive:true});mkdirSync('tmp/cancellation-regression-screenshots',{recursive:true})
const files=[...readdirSync('tests').filter(f=>f.endsWith('.browser.mjs')&&!['advisor.browser.mjs','phase1.auth.browser.mjs'].includes(f)).map(f=>`tests/${f}`),...readdirSync('tests/staff-ui').filter(f=>f.endsWith('.mjs')).map(f=>`tests/staff-ui/${f}`)]
const requested=new Set(process.argv.slice(2)),results=[]
for(const source of files.filter(f=>!requested.size||requested.has(f))){
 const id=source.replace(/^tests\//,'').replaceAll('/','-'),path=`${root}/tests/${id}`
 writeFileSync(path,readFileSync(source,'utf8').replaceAll('docs/progress/screenshots',`${root}/screenshots`).replaceAll('docs/final/evidence',`${root}/phase6-evidence`))
 if(source==='tests/phase6.browser.mjs')writeFileSync(`${root}/tests/phase6.pages.mjs`,readFileSync('tests/phase6.pages.mjs'))
 const started=new Date().toISOString(),run=spawnSync(process.execPath,[path],{encoding:'utf8',timeout:300000})
 const output=(run.stdout||'')+(run.stderr||'');writeFileSync(`${evidence}/${id}.log`,output)
 const result={source,status:run.status===0?'PASS':'FAIL',started,exitCode:run.status,error:run.error?.message,log:`${evidence}/${id}.log`,summary:output.match(/PASS[^\n]*/g)||[]}
 results.push(result);console.log(`${result.status} ${source}: ${result.summary.join('; ')||output.slice(-500)}`)
}
const path=`${evidence}/results.json`;let previous=[]
if(requested.size){try{previous=JSON.parse(readFileSync(path,'utf8')).results}catch{/* Initial targeted run. */}}
const merged=previous.filter(old=>!results.some(r=>r.source===old.source)).concat(results.map(r=>{const old=previous.find(o=>o.source===r.source);return old?{...r,previousRun:old}:r}))
writeFileSync(path,JSON.stringify({executedAt:new Date().toISOString(),results:merged},null,2))
if(results.some(r=>r.status!=='PASS'))process.exitCode=1
