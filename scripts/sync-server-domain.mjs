// Package the same deterministic workflow reducers for Cloud Functions deployment.
// Never copy environment files, credentials, browser components or node_modules.
import { mkdirSync, copyFileSync } from 'node:fs'
const files = {
  utils: ['closure','closureRegistry','handoff','projectStorage','administrativeRecords','projectChanges','registry','evaluation','pdfAttachment','proposalValidation'],
  data: ['interactiveDemo','demoProjects','demoRegistry','demoAttachment','statuses','registry'],
}
for (const [folder,names] of Object.entries(files)) {
  mkdirSync(`functions/domain/src/${folder}`, {recursive:true})
  for (const name of names) copyFileSync(`src/${folder}/${name}.js`, `functions/domain/src/${folder}/${name}.js`)
}
mkdirSync('functions/domain/functions', {recursive:true})
copyFileSync('functions/policy.js','functions/domain/functions/policy.js')
