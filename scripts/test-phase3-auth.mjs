import './sync-server-domain.mjs'
import { spawn } from 'node:child_process'
const child = spawn(process.execPath, ['node_modules/firebase-tools/lib/bin/firebase.js', 'emulators:exec', '--project', 'demo-mfu-secure', '--only', 'auth,firestore,functions,storage', 'node tests/phase1.auth.browser.mjs'], { stdio: 'inherit', env: { ...process.env, PHASE2_WRITE_TEST: 'false', PHASE3_WRITE_TEST: 'true' } })
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 1 })
