import { displayDate, actorName, editableSectionLabel } from '../utils/researchDisplay'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ManualEntry from './ManualEntry'
import UploadDocument from './UploadDocument'
import { correctionFields } from '../domain/localDemoPolicy'
import { proposalData } from '../domain/model'
import { readResearcherDraft, writeResearcherDraft, researcherDraftKey } from '../utils/researcherWorkspace'
import { Feedback } from '../components/SharedFeedback'
import { hasCapability } from '../domain/permissions'

export default function ResearcherEditor({ page, project, currentUser, go, commit, local }) {
  const { i18n } = useTranslation(), th = i18n.language !== 'en', text = (a, b) => th ? a : b
  const saved = useRef(project), [issue, setIssue] = useState('')
  const [identity] = useState(() => { try { return project?.id || readResearcherDraft(currentUser)._projectId || crypto.randomUUID() } catch { return crypto.randomUUID() } })
  const key = researcherDraftKey(currentUser, project?.id)
  const read = () => ({ ...project?.proposal, ...readResearcherDraft(currentUser, project?.id), _projectId: identity })
  const write = value => writeResearcherDraft(currentUser, project?.id, value)
  const blocked = project && !hasCapability(project, currentUser, 'editProposal') || page === 'upload' && project && project.status !== 'DRAFT'
  if (blocked) return <Feedback kind="error" title={text('ข้อเสนอนี้ไม่เปิดให้แก้ไขในสถานะปัจจุบัน', 'Proposal editing is not allowed at this state')} />
  const fields = project?.status === 'STAFF_REVIEW' ? correctionFields(project, currentUser, local ? 'local-demo' : 'backend') : null
  const save = async data => {
    const payload = { proposal: proposalData(data), ...(data._importSource?.reviewed ? { importSource: data._importSource } : {}) }
    let next = await commit(saved.current, saved.current ? 'save_proposal' : 'create_project', { ...payload, ...(!saved.current ? { projectId: identity } : {}) })
    saved.current = next
    if (data._sourceDocument?.dataUrl && !next.documents.some(d => d.kind === 'rs1_source' && d.dataUrl === data._sourceDocument.dataUrl)) {
      next = await commit(next, 'attach_document', { document: { ...data._sourceDocument, id: crypto.randomUUID(), kind: 'rs1_source', version: next.documents.filter(d => d.kind === 'rs1_source').length + 1 } })
      saved.current = next
    }
    return next
  }
  if (page === 'upload') return <UploadDocument key={key} onBack={() => go('choose', project?.id)} onEdit={() => go('manual', project?.id, {}, true)} workspace={{ key: `v16-extract:${key}`, read, write, manual: () => go('manual', project?.id) }} />
  return <><p className="shared-note">{text('บันทึกร่างไม่ใช่การยืนยันส่งข้อเสนอ ข้อมูลที่พิมพ์เก็บเป็นร่างส่วนตัวในเบราว์เซอร์', 'Save Draft does not submit the proposal. Typed values are recovered from a private browser draft.')}</p>{project?.proposalReview?.actionRequiredBy === 'researcher' && <section className="shared-notice"><strong>{project.proposalReview.notes}</strong><p>{actorName(project.proposalReview.requestedBy)} · {displayDate(project.proposalReview.requestedAt, i18n.language, true)}</p><p>{text('หัวข้อที่แก้ได้', 'Editable sections')}: {project.proposalReview.editableSections?.map(section => editableSectionLabel(section, i18n.language)).join(', ') || text('ยังไม่ได้ระบุ (OPEN-13)', 'Not specified (OPEN-13)')}</p></section>}{issue && <p role="alert">{issue}</p>}<ManualEntry key={key} currentUser={currentUser} workspace={{ read, write, save, savedProposal: project?.proposal, editableFields: fields }} onBack={() => go(project ? 'details' : 'choose', project?.id)} onSaved={next => { try { localStorage.removeItem(key) } catch { setIssue(text('บันทึกแล้ว แต่ล้าง working copy ไม่สำเร็จ', 'Saved; unable to clear the working copy')) } go('details', next.id, {}, true) }} onConfirm={() => { localStorage.removeItem(key); go('proposal-pdf', saved.current.id, {}, true) }} /></>
}
