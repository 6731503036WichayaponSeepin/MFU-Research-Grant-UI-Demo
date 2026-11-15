import { readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

mkdirSync('tmp/cancellation-regression-screenshots', { recursive: true })
const results = []
for (const file of readdirSync('tests/staff-ui').filter(file => file.endsWith('.mjs')).sort()) {
  const run = spawnSync(process.execPath, [`tests/staff-ui/${file}`], { encoding: 'utf8', timeout: 180000 })
  const output = `${run.stdout || ''}${run.stderr || ''}`
  console.log(output)
  results.push({ file, status: run.status === 0 ? 'PASS' : 'FAIL', output, error: run.error?.message })
}
mkdirSync('docs/progress/evidence', { recursive: true })
writeFileSync('docs/progress/evidence/STAFF_UI_VALIDATION.json', JSON.stringify({ executedAt: new Date().toISOString(), results }, null, 2))
if (results.some(result => result.status !== 'PASS')) process.exitCode = 1
