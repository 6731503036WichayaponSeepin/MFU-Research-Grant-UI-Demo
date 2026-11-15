// Read-only offline migration analysis. Never initializes Firebase or writes records.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { migrationDryRun } from '../src/domain/migration.js'
import { createInteractiveDemo } from '../src/data/interactiveDemo.js'

const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--input')) throw new Error('Usage: node scripts/foundation-migration-dry-run.mjs [--input local-records.json]')
const records = args.length ? JSON.parse(readFileSync(args[1], 'utf8')) : createInteractiveDemo()
const original = JSON.stringify(records), report = migrationDryRun(records)
if (JSON.stringify(records) !== original) throw new Error('Dry-run mutated its input')
console.log(JSON.stringify({
  source: args.length ? args[1] : 'createInteractiveDemo() legacy fixtures',
  sourceSha256: createHash('sha256').update(original).digest('hex'),
  dryRun: report.dryRun, writes: report.writes, applyAllowed: report.applyAllowed, total: report.total, counts: report.counts,
  results: report.results.map(({ original: _original, ...result }) => { void _original; return result }),
}, null, 2))
