import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import { useDemoRoute } from './utils/useDemoRoute'
import { demoHref, navigateDemo, backDemo } from './utils/demoRouter'
import { useLiveProjects } from './utils/useLiveProjects'
import { getProjects, DRAFT_KEY, preserveWorkingDraft } from './utils/projectStorage'
import { canRead, persist } from './utils/closure'
import { startSharedStore } from './utils/sharedStore'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import RoleOverview from './pages/RoleOverview'
import ReviewerDashboard from './pages/ReviewerDashboard'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import ProjectDocuments from './pages/ProjectDocuments'
import CorrectionRequest from './pages/CorrectionRequest'
import EvaluationResults from './pages/EvaluationResults'
import ReviewerEvaluation from './pages/ReviewerEvaluation'
import ClosureWorkspace from './pages/ClosureWorkspace'
import ProposalReview from './pages/ProposalReview'
import ManualEntry from './pages/ManualEntry'
import SubmissionConfirmation from './pages/SubmissionConfirmation'
import ChooseSubmissionMethod from './pages/ChooseSubmissionMethod'
import UploadDocument from './pages/UploadDocument'
import AdministrativeRecords from './pages/AdministrativeRecords'
import ProjectChangeRecord from './pages/ProjectChangeRecord'
import Notifications from './pages/Notifications'
import './App.css'
import './design.css'
import './workspace.css'
import './pages/FocusedDemo.css'
import './components/Sidebar.css'

const titleKeys={dashboard:'dashboard',projects:'myProjects',details:'projectDetails',timeline:'projectTimeline',documents:'researchDocuments',manual:'proposalForm',submission:'confirmProposal',choose:'newProposal',upload:'importRS1','staff-review':'proposalReview',closure:'closureReview',correction:'correctionRequest',evaluation:'researchEvaluation',answers:'reviewAnswers',results:'evaluationResults','administrative-records':'externalRecords','project-change-record':'projectChangeRecord',notifications:'notifications'}
const aliases={'staff-dashboard':'dashboard','reviewer-dashboard':'dashboard','project-detail':'details','active-project-detail':'details','closed-project-detail':'details','proposal-review':'staff-review','project-closure':'closure','closure-document-check':'closure','final-report-review':'projects'}
const globalPages=['dashboard','projects','choose','upload','manual','submission','notifications']
function ProposalEditor({project,...props}){
  useState(()=>{if(project){let saved;try{saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')}catch{saved={}}if(saved._projectId!==project.id)localStorage.setItem(DRAFT_KEY,JSON.stringify({...project.proposal,_projectId:project.id}))}return null})
  return <ManualEntry {...props}/>
}
export default function App({authenticatedUser:currentUser,onRoleChange}) {
  const route=useDemoRoute(),{page,projectId,query}=route
  const [projects]=useLiveProjects(getProjects)
  const {t}=useTranslation()
  const pageTitle=titleKeys[page]?t(titleKeys[page]):t('pageNotFound')
  const [notice,setNotice]=useState('')
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false)
  const project=projects.find(p=>p.id===projectId&&canRead(p,currentUser))
  useEffect(()=>startSharedStore(currentUser),[currentUser])
  useEffect(()=>{window.scrollTo({top:0});document.title=pageTitle+' · MFU Research';document.getElementById('page-title')?.focus()},[page,projectId,query.section,query.tab,query.chapter,query.history,pageTitle])
  const go=Object.assign((next,id=null,params={})=>navigateDemo(currentUser.role,aliases[next]||next,id,params),{href:(next,id=null,params={})=>demoHref(currentUser.role,next,id,params),completed:(next,id)=>navigateDemo(currentUser.role,next,id,{},true,true)})
  const detailHref=id=>go.href('details',id)
  const returnToPrevious=()=>backDemo(currentUser.role,page==='projects'?'dashboard':'projects')
  async function edit(p){try{await preserveWorkingDraft(currentUser);localStorage.setItem(DRAFT_KEY,JSON.stringify({...p.proposal,_projectId:p.id}));go('manual',p.id)}catch(e){setNotice(e.message)}}
  async function prepare(next){try{await preserveWorkingDraft(currentUser);localStorage.setItem(DRAFT_KEY,'{}');go(next)}catch(e){setNotice(e.message)}}
  async function commit(action,data){try{await persist(project.id,action,data,currentUser);return true}catch(e){setNotice(e.message);return false}}
  const canEdit=project&&currentUser.role==='researcher'&&(['draft','revision_required'].includes(project.status)||project.correction?.state==='approved')
  const staff=currentUser.role==='staff',reviewer=currentUser.role==='reviewer'
  const restricted=(['staff-review','administrative-records','project-change-record'].includes(page)&&!staff)||(['evaluation','answers'].includes(page)&&!reviewer)||(['manual','submission','choose','upload'].includes(page)&&currentUser.role!=='researcher')
  const showList=!projectId&&!globalPages.includes(page)&&page!=='not-found'
  const tabs=project?[
    ['details',t('projectDetails')],['timeline',t('projectTimeline')],['documents',reviewer?t('readReport'):t('documents')],
    ...(reviewer?[['evaluation','ประเมิน'],['answers','ตรวจทาน'],['results','ผลประเมิน']]:[
      ...(staff?[['staff-review',t('proposalReviewShort')]]:[]),
      ...(['active','final_report','closure_review','completed'].includes(project.status)?[['closure',staff?t('closureReview'):t('submitClosure')]]:[]),
      ...(project.certification||project.correction?[['correction',t('correctionRequest')]]:[]),
      ...(project.closure?[['results',t('evaluationResults')]]:[])
    ])
  ]:[]
  const listTarget=showList?page:undefined
  return <div className={`app role-${currentUser.role} focused-demo ${sidebarCollapsed?'sidebar-collapsed':'sidebar-expanded'}`}><a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus()}}>{t('skipToContent')}</a><Sidebar collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(value=>!value)} page={page} role={currentUser.role} onNavigate={go}/><div className="app-content"><Header pageTitle={pageTitle} page={page} onNavigate={go} currentUser={currentUser} onLogout={()=>onRoleChange('')}/><main className="main" id="main-content" tabIndex={-1}><nav className="breadcrumbs" aria-label={t('breadcrumbs')}><a href={go.href('dashboard')}>{t('dashboard')}</a>{page!=='dashboard'&&<><span>›</span><a href={go.href('projects')}>{t('projects')}</a></>}{project&&page!=='details'&&<><span>›</span><a href={detailHref(project.id)}>{t('projectDetails')} · {project.id}</a></>}{page==='answers'&&project&&<><span>›</span><a href={go.href('evaluation',project.id)}>{t('researchEvaluation')}</a></>}<span>›</span><span aria-current="page">{pageTitle}</span></nav><div className="focused-page-heading"><h1 id="page-title" tabIndex={-1}>{showList?t('selectProject',{title:pageTitle}):pageTitle}</h1>{page!=='dashboard'&&<button type="button" className="outline-button" onClick={returnToPrevious}>{t('backArrow')}</button>}</div>{project&&<nav className="project-page-nav" aria-label={t('projectPages')}>{tabs.map(([key,label])=><a key={key} href={go.href(key,project.id)} aria-current={page===key?'page':undefined}>{label}</a>)}</nav>}{notice&&<p role="alert" className="submission-error">{notice}</p>}
    <div key={page+':'+projectId+':'+JSON.stringify(query)} className="focused-screen">
    {restricted?<section className="panel focused-card" role="alert">{t('rolePageRestricted')} <a href={go.href('dashboard')}>{t('backToDashboard')}</a></section>:projectId&&!project?<section className="panel focused-card" role="alert">{t('projectUnavailable')} <a href={go.href('projects')}>{t('backToProjects')}</a></section>:<>
    {page==='dashboard'&&(reviewer?<ReviewerDashboard currentUser={currentUser} onViewProject={id=>go('details',id)} onEvaluate={id=>go('evaluation',id)} onOpenReviews={()=>go('projects',null,{view:'examples'})}/>:<RoleOverview projects={projects} currentUser={currentUser} onNavigate={go} onProject={detailHref}/>)}
    {(page==='projects'||showList)&&<ProjectList currentUser={currentUser} projects={projects} query={query} onNavigate={go} target={listTarget}/>}
    {project&&['details','timeline'].includes(page)&&<ProjectDetail focused view={page} historyPage={Math.max(1,Number(query.history)||1)} onHistoryPage={history=>go(page,project.id,{history})} initialTab={query.tab} onTabChange={tab=>go(page,project.id,{tab})} projectId={project.id} onBack={()=>go('projects')} onEdit={canEdit?edit:undefined} onChangeRecord={staff?()=>go('project-change-record',project.id):undefined}/>}
    {project&&page==='details'&&reviewer&&<div className="focused-actions"><a className="primary" href={go.href('documents',project.id)}>ถัดไป · อ่านรายงาน →</a></div>}
    {project&&page==='documents'&&<ProjectDocuments project={project} currentUser={currentUser} query={query} onNavigate={go}/>}
    {project&&page==='correction'&&<CorrectionRequest onApproved={()=>go.completed('details',project.id)} project={project} currentUser={currentUser} onEdit={edit}/>}
    {project&&page==='staff-review'&&<ProposalReview focused onDocuments={()=>go('documents',project.id,{document:'proposal',format:'pdf'})} projectId={project.id} onViewProject={id=>go('details',id)}/>}
    {project&&page==='closure'&&<ClosureWorkspace onCompleted={()=>go.completed('details',project.id)} focused mode={staff?'staff':'researcher'} currentUser={currentUser} projectId={project.id} onViewProject={id=>go('details',id)} onBack={()=>go('details',project.id)}/>}
    {project&&['evaluation','answers'].includes(page)&&<ReviewerEvaluation focused stage={page} section={query.section||'0'} project={project} currentUser={currentUser} commit={commit} onNavigate={(next,params)=>go(next,project.id,params)}/>}
    {project&&page==='results'&&<EvaluationResults project={project} currentUser={currentUser} query={query} onNavigate={go}/>}
    {page==='choose'&&<ChooseSubmissionMethod onBack={returnToPrevious} onManual={()=>prepare('manual')} onUpload={()=>prepare('upload')}/>}
    {page==='manual'&&(!projectId||canEdit)?<ProposalEditor onSaved={saved=>go.completed('details',saved.id)} project={project} currentUser={currentUser} onBack={returnToPrevious} onConfirm={()=>go('submission',project?.id)}/>:page==='manual'&&<p role="alert">{t('proposalLocked')}</p>}
    {page==='submission'&&<SubmissionConfirmation currentUser={currentUser} onBack={()=>go('manual',projectId)} onProjects={()=>go('projects')}/>}
    {page==='upload'&&<UploadDocument onBack={returnToPrevious} onEdit={()=>go('manual')}/>}
    {project&&page==='administrative-records'&&<AdministrativeRecords focused projectId={project.id} currentUser={currentUser} onViewProject={id=>go('details',id)}/>}
    {project&&page==='project-change-record'&&<ProjectChangeRecord focused projectId={project.id} currentUser={currentUser} onViewProject={id=>go('details',id)}/>}
    {page==='notifications'&&<Notifications page={Number(query.page)||1} onPage={next=>go('notifications',null,{page:next})} currentUser={currentUser} onViewProject={id=>go('details',id)}/>}
    {page==='not-found'&&<section className="panel focused-card"><p>{t('pageNotFound')}</p><a href={go.href('dashboard')}>{t('backToDashboard')}</a></section>}
    </>}
    </div></main></div></div>
}
