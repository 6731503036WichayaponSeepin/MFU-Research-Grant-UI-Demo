import {spawnSync} from 'node:child_process'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'

const root='tmp/reviewer-flow-validation'
mkdirSync(root,{recursive:true})
mkdirSync('tmp/cancellation-regression-screenshots',{recursive:true})
const regressions=[1,2,3,4,5].map(phase=>{
 const path=`${root}/phase${phase}.mjs`
 // Isolate screenshot outputs only; retain every original assertion and action.
 writeFileSync(path,readFileSync(`tests/phase${phase}.browser.mjs`,'utf8').replaceAll('docs/progress/screenshots',`${root}/screenshots`))
 return path
})
const suites=['Dashboard','Evaluation','Review','Submitted','Overview','Documents','History','Notifications'].map(name=>`tests/reviewer${name}UI.browser.mjs`)
const requested=new Set(process.argv.slice(2))
const results=[]
for(const file of [...suites,...regressions].filter(file=>!requested.size||requested.has(file))){
 const started=Date.now(),run=spawnSync(process.execPath,[file],{encoding:'utf8',timeout:180000})
 const output=(run.stdout||'')+(run.stderr||'')
 console.log(output)
 results.push({file,status:run.status===0?'PASS':'FAIL',durationMs:Date.now()-started,output,error:run.error?.message})
}
mkdirSync('docs/progress/evidence',{recursive:true})
const evidencePath='docs/progress/evidence/REVIEWER_FLOW_VALIDATION.json'
let previous=[]
if(requested.size){try{previous=JSON.parse(readFileSync(evidencePath,'utf8')).results}catch{/* First targeted run. */}}
const merged=previous.filter(old=>!results.some(result=>result.file===old.file)).concat(results.map(result=>{
 const old=previous.find(old=>old.file===result.file)
 return old?{...result,previousRun:{status:old.status,output:old.output}}:result
}))
writeFileSync(evidencePath,JSON.stringify({executedAt:new Date().toISOString(),results:merged},null,2))
if(results.some(r=>r.status!=='PASS'))process.exitCode=1
