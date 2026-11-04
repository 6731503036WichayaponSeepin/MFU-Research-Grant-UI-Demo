import { useEffect, useRef, useState } from 'react'
import { registerNavigationGuard } from './navigationGuard.js'

const memoryDrafts=new Map()

// Working copies are separate from saved demo projects and survive Back/Forward and refresh.
export function useFormDraft(key,initialValue){
  const storageKey='mfu-navigation-draft-'+key
  const [initial]=useState(()=>typeof initialValue==='function'?initialValue():initialValue)
  const [record,setRecord]=useState(()=>{
    if(memoryDrafts.has(storageKey))return memoryDrafts.get(storageKey)
    try{const cached=JSON.parse(localStorage.getItem(storageKey)||'null');if(cached&&Object.hasOwn(cached,'value'))return cached}catch{/* Keep malformed storage untouched until a deliberate edit. */}
    return {value:initial,baseline:JSON.stringify(initial)}
  })
  const dirty=JSON.stringify(record.value)!==record.baseline
  const dirtyRef=useRef(dirty)
  useEffect(()=>{dirtyRef.current=dirty},[dirty])
  useEffect(()=>registerNavigationGuard(storageKey,()=>dirtyRef.current),[storageKey])
  function setValue(change){setRecord(previous=>{
    const value=typeof change==='function'?change(previous.value):change,next={...previous,value}
    memoryDrafts.set(storageKey,next)
    try{localStorage.setItem(storageKey,JSON.stringify(next))}catch{/* Keep the working copy in memory if browser storage is full. */}
    return next
  })}
  function markSaved(value=record.value){
    dirtyRef.current=false
    memoryDrafts.delete(storageKey)
    localStorage.removeItem(storageKey)
    setRecord({value,baseline:JSON.stringify(value)})
  }
  return [record.value,setValue,markSaved]
}

// Existing RS-1 and evaluation components already persist their own working copies.
export function useUnsavedChanges(value,savedValue){
  const [baseline,setBaseline]=useState(()=>JSON.stringify(savedValue))
  const dirtyRef=useRef(JSON.stringify(value)!==baseline)
  const [key]=useState(()=>Symbol('form'))
  useEffect(()=>{dirtyRef.current=JSON.stringify(value)!==baseline},[value,baseline])
  useEffect(()=>registerNavigationGuard(key,()=>dirtyRef.current),[key])
  return next=>{dirtyRef.current=false;setBaseline(JSON.stringify(next===undefined?value:next))}
}

const workingFiles=new Map()
export function clearWorkingFiles(){workingFiles.clear();memoryDrafts.clear()}
export function useWorkingFile(key){
  const [file,setFile]=useState(()=>workingFiles.get(key)||null)
  const markSaved=useUnsavedChanges(file?{name:file.name,size:file.size,lastModified:file.lastModified}:null,null)
  function update(value){if(value)workingFiles.set(key,value);else{workingFiles.delete(key);markSaved(null)}setFile(value)}
  return [file,update]
}
