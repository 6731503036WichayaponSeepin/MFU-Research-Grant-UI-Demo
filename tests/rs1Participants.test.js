import test from 'node:test'
import assert from 'node:assert/strict'
import {projectParticipants,participantPatch} from '../src/utils/rs1Participants.js'
import {proposalData,requiredSignatories} from '../src/domain/model.js'
import {extractRS1Fields} from '../src/utils/rs1FieldMapping.js'
import {executeProjectAction} from '../src/domain/actions.js'
import {createResearcherScenarios} from '../src/data/researcherScenarios.js'
import {foundationContext} from '../src/data/foundationDemo.js'
test('participants keep legacy values and ordered multiple records without required blank fields',()=>{
 const legacy={participantName:'First',participantEmail:'first@example.org',participants:'Original additional notes'}
 assert.equal(projectParticipants(legacy)[0].name,'First')
 const data=proposalData({...legacy,...participantPatch([{name:'First'},{name:'Second',affiliation:'Health'}])})
 assert.equal(data.participants,legacy.participants)
 assert.deepEqual(requiredSignatories(data).filter(s=>s.name).map(s=>s.name),['First','Second'])
 assert.deepEqual(projectParticipants(participantPatch([])),[])
 assert.throws(()=>proposalData({participantRecords:[{ownerUid:'forged'}]}),{code:'INVALID_PROPOSAL'})
})
test('repeated participant sections extract into ordered records with first legacy aliases',()=>{
 const data=extractRS1Fields('Part A: Project information\n1.2 Project Participant\nFull name: First\nAffiliation: Science\n1.2 Project Participant 2\nFull name: Second\nE-mail: second@example.org\nPart B: Autobiography')
 assert.equal(data.participantName,'First');assert.equal(data.participantRecords.length,2)
 assert.equal(data.participantRecords[1].email,'second@example.org')
})
test('correction deep comparison permits unchanged arrays and rejects unrequested participants',()=>{
 const p=createResearcherScenarios().find(p=>p.id==='V16-CORRECTION')
 p.proposal={...p.proposal,...participantPatch([{name:'Existing'}])}
 const command=proposal=>({id:'participant-scope',action:'save_proposal',expectedVersion:p._version,payload:{proposal}})
 const next=executeProjectAction(p,command({...structuredClone(p.proposal),projectTitle:'Requested edit'}),foundationContext('demo-user'))
 assert.equal(next.status,'STAFF_REVIEW');assert.equal(next.proposal.participantRecords[0].name,'Existing')
 assert.throws(()=>executeProjectAction(p,command({...p.proposal,...participantPatch([{name:'Changed'}])}),foundationContext('demo-user')),{code:'EDIT_SCOPE_DENIED'})
})
