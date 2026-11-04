const guards=new Map()
export const unsavedMessage='มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่? ระบบจะเก็บสำเนาร่างไว้ในเบราว์เซอร์นี้'
export function registerNavigationGuard(key,guard){guards.set(key,guard);return ()=>guards.delete(key)}
export function hasUnsavedChanges(){return [...guards.values()].some(guard=>guard())}
export function sameDraftScreen(from,to){
  return from.role===to.role&&from.projectId===to.projectId&&(from.page===to.page||['evaluation','answers'].includes(from.page)&&['evaluation','answers'].includes(to.page))
}
export function confirmNavigation(from,to,confirm=message=>window.confirm(message)){
  return sameDraftScreen(from,to)||!hasUnsavedChanges()||confirm(unsavedMessage)
}
