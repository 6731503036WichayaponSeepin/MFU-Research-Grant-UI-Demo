import { assertProposalValid } from './proposalValidation.js'
import { createInteractiveDemo } from '../data/interactiveDemo.js'
import { normalizeStatus } from '../data/statuses.js'
import { demoDocument } from '../data/demoAttachment.js'
import { enrichDemoRegistry } from '../data/demoRegistry.js'
export const KEY = import.meta.env ? 'mfu-interactive-demo-v1-projects' : 'mfu-rs1-prototype-projects'
export let DRAFT_KEY = import.meta.env ? 'mfu-role-demo-v2-draft' : 'mfu-rs1-v2-draft'
const SEED_KEY = import.meta.env ? 'mfu-interactive-demo-v1-seeded' : 'mfu-demo-seed-v1'
const REVIEWER_SCENARIO_SEED_KEY = 'mfu-reviewer-demo-scenarios-v3'
export function setDraftIdentity(uid) { DRAFT_KEY = uid ? `mfu-private-draft-${uid}` : 'mfu-role-demo-v2-draft' }
let sharedStore = null
export function configureProjectStore(store) { sharedStore = store }
// Local mode remains synchronous; shared mode resolves only after server acknowledgement.
export function afterSave(result, value) { return result?.then ? result.then(() => value) : value }
export function getProjects() {
  if (sharedStore) return sharedStore.read()
  const projects = JSON.parse(localStorage.getItem(KEY) || '[]')
  if (!Array.isArray(projects) || projects.some(p => !p || p.id == null)) throw new Error('Invalid project storage; existing data was preserved.')
  return projects.map(p => ({ ...p, id:String(p.id), status:normalizeStatus(p.status), proposal:p.proposal || {}, statusHistory:Array.isArray(p.statusHistory)?p.statusHistory:[] }))
}
export function saveProjects(projects) {
  if (sharedStore) return sharedStore.save(projects)
  localStorage.setItem(KEY, JSON.stringify(projects))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mfu-projects-updated'))
}
export function initializeDemo(reset = false) {
  if (sharedStore) { if (reset) throw new Error('Shared demo reset is disabled'); return sharedStore.read() }
  const existingProjects = getProjects()
  let projects = existingProjects.map(enrichDemoRegistry)
  if (projects.some((project, index) => project !== existingProjects[index])) saveProjects(projects)
  if (!reset && localStorage.getItem(SEED_KEY)) {
    if (!localStorage.getItem('mfu-demo-documents-v2')) {
      const upgraded = projects.map(p=>p.demoGenerated && p.status !== 'completed' && p.closure && !p.closure.documents?.length ? {...p,closure:{...p.closure,documents:[{...demoDocument,kind:p.closure.method || 'report'}]}} : p)
      projects=upgraded
      saveProjects(projects)
      localStorage.setItem('mfu-demo-documents-v2','1')
    }
    if(!localStorage.getItem(REVIEWER_SCENARIO_SEED_KEY)) {
      const generated=createInteractiveDemo()
      let changed=false
      projects=projects.map(p=>{
        if(!p.demoGenerated)return p
        if(p.id==='MFU-DEMO-018'){
          const submissions=p.closure?.submissions?.length?p.closure.submissions:[{revision:p.closure?.revision||1,date:p.closure?.submittedAt||p.submittedAt,summary:p.closure?.summary||'',documents:structuredClone(p.closure?.documents||[])}]
          if(p.reviewerScenarioLabel==='ส่งรายงานใหม่'&&p.closure?.reviewRound&&p.closure?.submissions?.length)return p
          changed=true
          return {...p,reviewerScenarioLabel:p.reviewerScenarioLabel||'ส่งรายงานใหม่',closure:{...p.closure,reviewRound:p.closure?.reviewRound||1,submissions}}
        }
        if(p.id==='MFU-DEMO-REVIEWER-REVISION'&&!p.closure?.reviewRound){
          const previous=p.closure?.history?.find(item=>item.action==='review')?.snapshot
          changed=true
          return {...p,closure:{...p.closure,reviewRound:2,reviewRounds:previous?[{round:1,reportRevision:1,submittedAt:previous.submittedAt||previous.date,evaluations:{[p.closure.reviewer||'demo-reviewer']:{...previous,reviewRound:1}}}]:[]}}
        }
        return p
      })
      for(const fixture of generated.filter(p=>p.reviewerScenarioLabel&&!projects.some(existing=>existing.id===p.id))) {
        projects=[...projects,fixture]
        changed=true
      }
      if(changed)saveProjects(projects)
      localStorage.setItem(REVIEWER_SCENARIO_SEED_KEY,'1')
    }
    return projects
  }
  const retained = reset ? [] : projects
  const ids = new Set(retained.map(p => p.id))
  const result = [...retained, ...createInteractiveDemo().filter(p => !ids.has(p.id))]
  saveProjects(result)
  localStorage.setItem(SEED_KEY, '1')
  localStorage.setItem(REVIEWER_SCENARIO_SEED_KEY,'1')
  return result
}
export function updateProject(projectId, change) {
  const projects = getProjects(), index = projects.findIndex(p => String(p.id) === String(projectId))
  if (index < 0) throw new Error('Project not found')
  projects[index] = change(projects[index])
  return afterSave(saveProjects(projects), projects[index])
}
export function updateProjectStatus(projectId, status, note = '') {
  return afterSave(updateProject(projectId, project => {
    if (project.status !== 'admin_review' || !['revision_required','committee_review'].includes(status)) throw new Error('Review is not editable at this stage')
    if (status === 'revision_required' && !note.trim()) throw new Error('Revision reason required')
    const now = new Date().toISOString(), record = {projectId,previousStatus:project.status,newStatus:status,action:'proposal_check',role:'staff',status,note,updatedBy:'Research Administration Staff',updatedAt:now}
    return {...project,status,revisionReturnTo:status === 'revision_required' ? 'admin_review' : project.revisionReturnTo,updatedAt:now,reviewNotes:[...(project.reviewNotes || []),record],statusHistory:[...project.statusHistory,record]}
  }), true)
}
export function saveProposal(data, user, submit = false) {
  const projects = getProjects(), id = data._projectId || crypto.randomUUID(), existing = projects.find(p => p.id === id)
  const project = buildProposal(existing, data, user, submit, id)
  const result = saveProjects(existing ? projects.map(p => p.id === id ? project : p) : [project,...projects])
  return result?.then ? result.then(saved => saved?.id === id ? saved : project) : project
}
export function buildProposal(existing, data, user, submit = false, id = data._projectId || crypto.randomUUID(), now = new Date().toISOString()) {
  if (user?.role !== 'researcher' || !user.username) throw new Error('Researcher required')
  if (existing?.ownerUsername && existing.ownerUsername !== user.username) throw new Error('Proposal owner mismatch')
  if (existing && !['draft','revision_required'].includes(existing.status) && existing.correction?.state !== 'approved') {
    if (submit) return existing
    throw new Error('Submitted proposal is locked')
  }
  const budget = ['compensation','directCost','materials','utility'].reduce((sum,k) => sum + Number(data[k] || 0),0)
  if (submit) assertProposalValid(data)
  const status = submit ? (existing?.status === 'revision_required' ? (existing.revisionReturnTo === 'unit_review' ? 'unit_review' : 'admin_review') : 'unit_review') : existing?.status || 'draft'
  let project = {...existing,id,ownerUsername:user.username,title:data.projectTitle || '',titleEn:data.projectTitleEn || '',leader:data.leaderName || '',affiliation:data.leaderAffiliation || '',budget,status,createdAt:existing?.createdAt || now,updatedAt:now,startDate:data.startDate,endDate:data.endDate,proposal:{...data,_projectId:id},documentUrl:data._document?.dataUrl || existing?.documentUrl,documentName:data._document?.name || existing?.documentName,statusHistory:[...(existing?.statusHistory || []),{projectId:id,previousStatus:existing?.status || null,newStatus:status,action:submit?'submit_proposal':'save_proposal',role:user.role,status,note:submit?'Proposal submitted':'Draft saved',updatedAt:now,updatedBy:user.username}]}
  if (data._demoScenario) {
    project.demoScenario = true; project.fictional = true
    if (!existing) {
      project = enrichDemoRegistry(project)
      project.registryHistory = [{ by:user.username, role:user.role, at:now, source:'demo_sample', changes:[{field:'notes',label:'ข้อมูลสมมุติสำหรับเดโม',before:'',after:project.registry.notes}] }]
    }
  }
  if (existing?.correction?.state === 'approved') { project.status = existing.status; project.correction = {...existing.correction,state:submit?'saved':'approved'} }
  if (submit) project.submittedAt = now
  return project
}

// Preserve the current working copy before opening another draft or starting anew.
export function preserveWorkingDraft(user) {
  const data = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}')
  if (!data || typeof data !== 'object' || Array.isArray(data) || data._loadError) throw new Error('Invalid draft; original preserved')
  const existing = getProjects().find(p=>p.id===data._projectId)
  if (existing && !['draft','revision_required'].includes(existing.status)) return
  if (Object.entries(data).some(([key,value])=>!key.startsWith('_') && String(value || '').trim())) return saveProposal(data,user)
}

