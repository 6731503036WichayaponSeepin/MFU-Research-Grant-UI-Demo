import test from 'node:test'
import assert from 'node:assert/strict'
import { demoHref,parseDemoRoute,demoPages,navigateDemo,subscribeRoute } from '../src/utils/demoRouter.js'
test('all focused screens round-trip through dedicated shareable URLs',()=>{
 for(const role of ['researcher','staff','reviewer'])for(const page of demoPages){
  const href=demoHref(role,page,'MFU-DEMO-018',{section:'2',tab:'research'})
  assert.deepEqual(parseDemoRoute(href),{role,page,projectId:'MFU-DEMO-018',query:{section:'2',tab:'research'}})
 }
 assert.equal(demoHref(''),'#/roles')
 assert.deepEqual(parseDemoRoute('#/staff/projects'),{role:'staff',page:'projects',projectId:null,query:{}})
 assert.equal(parseDemoRoute('#/reviewer/dashboard').page,'dashboard')
})
test('invalid routes fail safely and encoded project identifiers and filters are preserved',()=>{
 for(const hash of ['#/unknown/dashboard','#/staff/missing','#/staff/projects/%invalid/details'])assert.equal(parseDemoRoute(hash).page,'not-found')
 const route=parseDemoRoute(demoHref('researcher','details','โครงการ A',{search:'สวน & ชุมชน',empty:'',missing:undefined}))
 assert.equal(route.projectId,'โครงการ A');assert.deepEqual(route.query,{search:'สวน & ชุมชน'})
})
test('navigation records browser history and listens to Back/Forward and native anchor changes',()=>{
 const previous=globalThis.window,events=new EventTarget(),history=[]
 globalThis.window={location:{hash:'#/roles'},history:{pushState:(_state,_title,hash)=>{history.push(['push',hash]);window.location.hash=hash},replaceState:(_state,_title,hash)=>{history.push(['replace',hash]);window.location.hash=hash}},addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)}
 try{
  let changes=0;const unsubscribe=subscribeRoute(()=>changes++)
  navigateDemo('researcher','dashboard');navigateDemo('researcher','details','MFU-DEMO-001')
  navigateDemo('researcher','details','MFU-DEMO-001')
  assert.equal(history.length,2);assert.equal(changes,2)
  window.dispatchEvent(new Event('popstate'));window.dispatchEvent(new Event('hashchange'));assert.equal(changes,4)
  navigateDemo('staff','dashboard',null,{},true);assert.equal(history.at(-1)[0],'replace')
  unsubscribe();window.dispatchEvent(new Event('popstate'));assert.equal(changes,5)
 }finally{globalThis.window=previous}
})
