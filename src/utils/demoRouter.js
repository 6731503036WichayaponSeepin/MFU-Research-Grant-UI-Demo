import { confirmNavigation, hasUnsavedChanges } from './navigationGuard.js'
// Extend the demo's existing page router with URL history; hash routes also work on static hosting.
export const demoRoles = ['researcher','staff','reviewer']
export const demoPages = ['dashboard','projects','details','timeline','documents','manual','submission','choose','upload','staff-review','closure','correction','evaluation','answers','results','administrative-records','project-change-record','notifications']
export function parseDemoRoute(hash) {
  try {
    const url=new URL((hash || '#/roles').replace(/^#/,''),'http://demo.local')
    const parts=url.pathname.split('/').filter(Boolean)
    if(parts[0]==='roles')return {role:'',page:'roles',projectId:null,query:Object.fromEntries(url.searchParams)}
    const [role,section,id,view]=parts
    if(!demoRoles.includes(role)||parts.length>4||id&&section!=='projects')return {role:'',page:'not-found',projectId:null,query:{}}
    const page=section==='projects'&&id ? view||'details' : section||'dashboard'
    return {role,page:demoPages.includes(page)?page:'not-found',projectId:id?decodeURIComponent(id):null,query:Object.fromEntries(url.searchParams)}
  }catch{return {role:'',page:'not-found',projectId:null,query:{}}}
}
export function demoHref(role,page='dashboard',projectId=null,query={}) {
  if(!role)return '#/roles'
  const path=projectId?`/${role}/projects/${encodeURIComponent(projectId)}/${page}`:`/${role}/${page}`
  const search=new URLSearchParams(Object.entries(query).filter(([,value])=>value!==undefined&&value!==null&&value!==''))
  return '#'+path+(search.size?'?'+search:'')
}
export function navigateDemo(role,page,projectId=null,query={},replace=false,completed=false) {
  const hash=demoHref(role,page,projectId,query)
  if(hash===window.location.hash)return true
  if(navigationInstalled)return writeRoute(hash,replace,completed)
  window.history[replace?'replaceState':'pushState']({},'',hash)
  window.dispatchEvent(new Event('mfu-route-change'))
  return true
}
export const routeSnapshot=()=>window.location.hash
export function subscribeRoute(listener){
  const notify=event=>{if(!navigationInstalled||event.type==='mfu-route-change')listener(event)}
  for(const name of ['popstate','hashchange','mfu-route-change'])window.addEventListener(name,notify)
  return ()=>{for(const name of ['popstate','hashchange','mfu-route-change'])window.removeEventListener(name,notify)}
}

let navigationInstalled=false, accepted=null, restoring=false
const metadata=()=>window.history.state?.mfuNavigation
function notifyRoute(){window.dispatchEvent(new Event('mfu-route-change'))}
function writeRoute(hash,replace=false,completed=false){
  if(!completed&&!confirmNavigation(parseDemoRoute(accepted.hash),parseDemoRoute(hash)))return false
  const trail=replace?[...accepted.trail.slice(0,-1),hash]:[...accepted.trail,hash]
  const next={hash,trail,index:trail.length-1}
  window.history[replace?'replaceState':'pushState']({...window.history.state,mfuNavigation:next},'',hash)
  accepted=next;notifyRoute();return true
}
export function backDemo(role,fallbackPage='projects',projectId=null){
  const current=metadata()
  if(navigationInstalled&&current?.hash===window.location.hash){
    for(let index=current.index-1;index>=0;index--){
      const hash=current.trail[index],route=parseDemoRoute(hash)
      if(route.role!==role)break
      if(hash!==current.hash&&route.page!=='not-found'){window.history.go(index-current.index);return}
    }
  }
  navigateDemo(role,fallbackPage,projectId,{},true)
}
export function installDemoNavigation(){
  navigationInstalled=true
  const existing=metadata(),hash=window.location.hash
  accepted=existing?.hash===hash?existing:{hash,index:0,trail:[hash]}
  window.history.replaceState({...window.history.state,mfuNavigation:accepted},'',hash)
  function click(event){
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
    const link=event.target.closest?.('a[href]')
    if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self')return
    const href=link.getAttribute('href')
    if(!href?.startsWith('#/'))return
    event.preventDefault()
    if(href!==accepted.hash)writeRoute(href)
  }
  function historyChanged(){
    const hash=window.location.hash
    if(restoring){if(hash===accepted.hash)restoring=false;return}
    if(hash===accepted.hash)return
    const target=metadata()
    if(!confirmNavigation(parseDemoRoute(accepted.hash),parseDemoRoute(hash))){
      restoring=true
      window.history.go(target?.hash===hash?accepted.index-target.index:-1)
      return
    }
    if(target?.hash===hash)accepted=target
    else{
      const trail=[...accepted.trail,hash];accepted={hash,trail,index:trail.length-1}
      window.history.replaceState({...window.history.state,mfuNavigation:accepted},'',hash)
    }
    notifyRoute()
  }
  function beforeUnload(event){if(hasUnsavedChanges()){event.preventDefault();event.returnValue=''}}
  document.addEventListener('click',click,true)
  window.addEventListener('popstate',historyChanged)
  window.addEventListener('hashchange',historyChanged)
  window.addEventListener('beforeunload',beforeUnload)
  return ()=>{navigationInstalled=false;document.removeEventListener('click',click,true);window.removeEventListener('popstate',historyChanged);window.removeEventListener('hashchange',historyChanged);window.removeEventListener('beforeunload',beforeUnload)}
}
