// Local QA only; no deploy/seed/migration writer. Raw logs preserve failures.
import {spawn} from 'node:child_process'
import {mkdir,writeFile} from 'node:fs/promises'
const node=process.execPath,mode=process.argv[2]||'local',dir='docs/final/evidence'
await mkdir(dir,{recursive:true})
const suites=mode==='emulator'?
 [['foundation-http','tests/foundation.api.integration.mjs'],['staff-reviewer-http','tests/phase3.api.integration.mjs'],['canonical-acl','tests/foundation.rules.integration.mjs'],['login-legacy','tests/login-only.integration.mjs'],['legacy-acl','tests/rules.integration.mjs'],['auth-researcher','tests/phase1.auth.browser.mjs',{PHASE2_WRITE_TEST:'true'}],['auth-staff','tests/phase1.auth.browser.mjs',{PHASE3_WRITE_TEST:'true'}],['auth-reviewer','tests/phase1.auth.browser.mjs',{PHASE4_WRITE_TEST:'true'}]]:
 [['unit','--test','tests/*.test.js'],['lint','node_modules/eslint/bin/eslint.js','.'],['build','node_modules/vite/bin/vite.js','build'],['build-firebase','node_modules/vite/bin/vite.js','build','--mode','firebase','--outDir','dist/firebase-final'],...['phase1','phase2','phase3','phase4','phase5','phase6'].map(p=>[p+'-browser',`tests/${p}.browser.mjs`]),['migration-dry-run','scripts/foundation-migration-dry-run.mjs']]
const results=[]
for(const [id,...rest]of suites){
 const extra=typeof rest.at(-1)==='object'?rest.pop():{}
 const env={...process.env,PHASE2_WRITE_TEST:'false',PHASE3_WRITE_TEST:'false',PHASE4_WRITE_TEST:'false',...extra}
 let output='';const started=new Date().toISOString()
 const code=await new Promise(resolve=>{const p=spawn(node,rest,{env,stdio:['ignore','pipe','pipe']});p.stdout.on('data',s=>output+=s);p.stderr.on('data',s=>output+=s);p.on('error',e=>{output+=e.message;resolve(-1)});p.on('exit',resolve)})
 await writeFile(`${dir}/${id}.log`,output)
 results.push({id,status:code===0?'PASS':'FAIL',exitCode:code,started,command:[node,...rest].join(' '),log:`evidence/${id}.log`})
 await writeFile(`${dir}/${mode}-results.json`,JSON.stringify(results,null,2))
 console.log(id,code===0?'PASS':'FAIL')
}
process.exitCode=results.some(r=>r.status==='FAIL')?1:0
