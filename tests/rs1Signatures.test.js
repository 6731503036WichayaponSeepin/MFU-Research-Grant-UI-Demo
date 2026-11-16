import test from 'node:test'
import assert from 'node:assert/strict'
import {rs1Signers,currentSignature,signatureErrors} from '../src/utils/rs1Signatures.js'
import {proposalData} from '../src/domain/model.js'
const image='data:image/png;base64,'+btoa('\x89PNG\r\n\x1a\nfixture')
test('each named participant has an independent image bound to this document and identity',()=>{
 const data={signatureDocumentId:'project-a',leaderName:'Leader',participantRecords:[{name:'First'},{name:'Second'}]}
 const signers=rs1Signers(data)
 assert.equal(signers.length,4)
 data.electronicSignatures=signers.filter(s=>s.name).map(s=>({signerKey:s.key,identity:s.identity,name:s.name,image,date:'2026-11-16',own:true,consent:false,documentId:'project-a'}))
 assert.deepEqual(signatureErrors(data),[])
 assert.equal(proposalData(data).electronicSignatures.length,3)
 data.electronicSignatures[1].own=false
 assert.ok(signatureErrors(data).some(e=>e.messageEn.includes('Consent')))
 data.electronicSignatures[1].consent=true
 assert.deepEqual(signatureErrors(data),[])
 data.participantRecords.reverse()
 assert.equal(currentSignature(data,rs1Signers(data)[2]),undefined,'reordering never transfers an image to another person')
 data.electronicSignatures[0].documentId='project-b'
 assert.ok(signatureErrors(data).some(e=>e.messageEn.includes('document reference')))
})
test('legacy image is never rebound to a renamed signer',()=>{
 const data={leaderName:'New Person',leaderSignature:'Original Person',leaderSignatureImage:image}
 assert.equal(currentSignature(data,rs1Signers(data)[1]),undefined)
 data.leaderName='Original Person'
 assert.equal(currentSignature(data,rs1Signers(data)[1]).image,image)
})
