import test from 'node:test'
import assert from 'node:assert/strict'
import { confirmNavigation,hasUnsavedChanges,registerNavigationGuard,sameDraftScreen,unsavedMessage } from '../src/utils/navigationGuard.js'
const route=(page,role='researcher',projectId='MFU-DEMO-001')=>({role,page,projectId})
test('only unsaved changes prompt, and cancel prevents leaving while saved data permits navigation',()=>{
 let dirty=true,prompts=0
 const stop=registerNavigationGuard('test',()=>dirty)
 try{
  assert.ok(hasUnsavedChanges())
  assert.equal(confirmNavigation(route('manual'),route('details'),message=>{assert.equal(message,unsavedMessage);prompts++;return false}),false)
  assert.equal(prompts,1)
  assert.equal(confirmNavigation(route('manual'),route('details'),()=>true),true)
  dirty=false
  assert.equal(confirmNavigation(route('manual'),route('details'),()=>{throw new Error('Should not prompt after saving')}),true)
 }finally{stop()}
 assert.equal(hasUnsavedChanges(),false)
})
test('evaluation sections and answer review share one draft; other projects and roles do not',()=>{
 assert.equal(sameDraftScreen(route('evaluation','reviewer'),route('answers','reviewer')),true)
 assert.equal(sameDraftScreen(route('manual'),route('manual')),true)
 assert.equal(sameDraftScreen(route('manual'),route('manual','staff')),false)
 assert.equal(sameDraftScreen(route('manual'),route('manual','researcher','other')),false)
 const stop=registerNavigationGuard('review',()=>true)
 try{assert.equal(confirmNavigation(route('evaluation','reviewer'),route('answers','reviewer'),()=>{throw new Error('Do not interrupt review of the same draft')}),true)}finally{stop()}
})
