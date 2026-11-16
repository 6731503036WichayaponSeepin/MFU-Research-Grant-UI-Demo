import test from 'node:test'
import assert from 'node:assert/strict'
import { rs1Fields } from '../src/utils/rs1Fields.js'
import { extractRS1Fields } from '../src/utils/rs1FieldMapping.js'
import { proposalData } from '../src/domain/model.js'
import { proposalFieldErrors } from '../src/utils/proposalValidation.js'
import { validSignatureImage, signatureErrors } from '../src/utils/rs1Signatures.js'
import { executeProjectAction } from '../src/domain/actions.js'
import { createResearcherScenarios } from '../src/data/researcherScenarios.js'
import { foundationContext } from '../src/data/foundationDemo.js'
import { readFileSync } from 'node:fs'

test('RS-1 catalogue retains original keys and adds participant subfields / three task-period rows',()=>{
  assert.equal(rs1Fields.length,97)
  assert.equal(new Set(rs1Fields.map(f=>f.key)).size,97)
  for(const f of rs1Fields)assert.equal(proposalData({[f.key]:'test'})[f.key],'test')
  assert.deepEqual(proposalData({participants:'original free text',workPlan:'original plan',teamSignatures:'original signatures'}),{participants:'original free text',workPlan:'original plan',teamSignatures:'original signatures'})
  assert.ok(!rs1Fields.some(f=>/reviewer.*Signature/i.test(f.key)))
})
test('labelled extraction supports added fields and never treats blank template placeholders as data',()=>{
  const data=extractRS1Fields('Project Title: ………………………\nFull name:\nAffiliation:\nProject Leader\n')
  assert.equal(data.projectTitle,undefined)
  assert.deepEqual(extractRS1Fields('Participant Full Name: ดร. มาลี ใจดี\nParticipant Email: fictional@example.org\nTask 1: เก็บข้อมูล\nPeriod 1: มกราคม\n1. Full Name: ดร. มาลี ใจดี'),{participantName:'ดร. มาลี ใจดี',participantEmail:'fictional@example.org',workTask1:'เก็บข้อมูล',workPeriod1:'มกราคม',bioName:'ดร. มาลี ใจดี'})
})
test('signature payload rejects forged MIME, oversized and malformed images; drafts permit absent consent',()=>{
  const png='data:image/png;base64,'+btoa('\x89PNG\r\n\x1a\nfixture')
  assert.equal(validSignatureImage(png),true)
  assert.equal(validSignatureImage('data:image/png;base64,'+btoa('<svg/>')),false)
  assert.equal(validSignatureImage('data:image/jpeg;base64,'+btoa('\xff\xd8\xff'+ 'x'.repeat(65536))),false)
  assert.throws(()=>proposalData({leaderSignatureImage:'data:image/png;base64,eA=='}),{code:'INVALID_SIGNATURE_IMAGE'})
  assert.equal(proposalData({leaderSignatureImage:png}).leaderSignatureImage,png)
  assert.ok(signatureErrors({leaderSignatureImage:png}).some(e=>e.field==='electronicSignatureConsent'))
  assert.deepEqual(signatureErrors({leaderSignatureImage:png,leaderSignature:'Fictional test',leaderSignDate:'2026-11-16',electronicSignatureConsent:'confirmed'}),[])
  assert.ok(proposalFieldErrors({leaderSignatureImage:png}).some(e=>e.field==='electronicSignatureConsent'))
})
test('reference fields stay synchronized with the rendered form and correction cannot mutate signature payloads',()=>{
  assert.match(readFileSync('src/pages/ManualEntry.jsx','utf8'),/RS1DocumentForm/)
  assert.equal(rs1Fields.length,97)
  const p=createResearcherScenarios().find(p=>p.id==='V16-CORRECTION')
  const command={id:'rs1-correction-guard',action:'save_proposal',expectedVersion:p._version,payload:{proposal:{...p.proposal,leaderSignatureImage:'data:image/png;base64,'+btoa('\x89PNG\r\n\x1a\nfixture')}}}
  assert.throws(()=>executeProjectAction(p,command,foundationContext('demo-user')),{code:'EDIT_SCOPE_DENIED'})
  assert.ok(!p.proposal.leaderSignatureImage)
})
test('itemized expense validation prevents negative rows and mismatched category totals',()=>{
  assert.ok(proposalFieldErrors({compensation:'100',compensationAmount1:'50'}).some(e=>e.messageEn==='Category total must match its itemized amounts.'))
  assert.ok(proposalFieldErrors({compensation:'-1',compensationAmount1:'-1'}).some(e=>e.messageEn==='Expense item amounts must be nonnegative.'))
})
test('structured repeated DOCX labels map to their original roles instead of overwriting each other',()=>{
  const extracted=extractRS1Fields('Part A: Project information\nProject Leader\nFull name: Leader\nAffiliation: Science\nProject Participant\nFull name: Participant\nAffiliation: Health\nProject Advisor\nFull name: Advisor\nAffiliation: Engineering\nPart B: Autobiography\nFull name: Biography\nPart C: List of reviewers\nFull name: First\nAffiliation: One\nFull name: Second\nAffiliation: Two\nFull name: Third\nAffiliation: Three')
  for(const [key,value]of Object.entries({leaderName:'Leader',leaderAffiliation:'Science',participantName:'Participant',participantAffiliation:'Health',advisorName:'Advisor',advisorAffiliation:'Engineering',bioName:'Biography',reviewer1Name:'First',reviewer2Name:'Second',reviewer3Name:'Third'}))assert.equal(extracted[key],value,key)
})
