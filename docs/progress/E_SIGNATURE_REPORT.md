# Optional Electronic Signature Audit

16 พฤศจิกายน 2569 — Local Demo

ตรวจ Researcher RS-1/import/submission/closure/revised report, Staff review/certification/change/extension/assignment/release/final closure/cancellation, Reviewer evaluation/review/submitted PDF และ runtime PDF generators

| แบบฟอร์ม | ผล |
|---|---|
| RS-1 Part A | หน้า 5 ต้นฉบับมี Advisor/Leader/Team signatures: shared upload component แยกรายคน รวมหลาย Participants |
| RS-1 Part B / C | ไม่มีช่องลงนาม ไม่เพิ่ม; proposed reviewers แยกจาก actual assignments |
| Signed RS-1 / affiliation evidence | รักษาการอัปโหลดเอกสารภายนอก ไม่เพิ่ม image signing tool ใน R06 หรือแทน e-Office/ต้นสังกัด |
| Staff records / closure submissions | ไม่มี original signed templates ยืนยันช่องลงนาม ไม่เพิ่มลายเซ็นใน administrative records |
| Reviewer evaluation PDF | BLOCKED สำหรับ image signatures: OPEN-11 และไม่มี original template; คง submit/lock/PDF snapshot เดิม |

## Implementation

SignatureImages.jsx/.css, rs1Signatures.js, RS1DocumentForm, ManualEntry, model/actions และ generateRS1PDF: PNG/JPG upload/preview/replace/remove, actual names/localized roles, per-signer images ภายใน proposal version ไม่มี cross-document signature library

Records เก็บ signerKey, identity, name, image, date, own, consent, documentId ภายใต้ signatureDocumentId ตรวจ document reference และ metadata; 64 KB/ภาพเป็น transport limit adapter เดิม ไม่ใช่ Stakeholder policy ภาพไม่ตรง current signer ไม่แสดงใน PDF

Consent แสดงเฉพาะเมื่อใช้ภาพของบุคคลอื่น เก็บใน version พร้อม Actor/Timestamp/Audit ของ save เดิม ไม่อ้าง identity verification ภาพ optional; ไม่มีภาพคง manual spaces ใน PDF ซ่อน traditional blocks ซ้ำจาก Web ตามคำสั่งล่าสุด

รักษา legacy data, versions, correction permissions และ TR-05 ไม่เปิด signature edits หลังส่งโดยพลการ

## Actual results

- PASS Unit 134/134: image validation, signer identity, consent, document reference, legacy binding, correction guards
- PASS alignment browser 28 และ signatures browser 9 checks: actual PDF 4 signer names/dates/images, recovery, replace/remove/consent
- PASS strict browser 203 checks และ blank PDF 7 หน้า; render signed page 5 ตรวจจริง ชื่อไทยและภาพไม่ทับกัน
- PASS lint/build มี bundle-size warning เดิม
- Full role regressions: ผลสุดท้ายใน RS1_FORM_ALIGNMENT_REPORT.md และ evidence/final-e2e/results.json
- BLOCKED เพิ่มภาพลายเซ็นเอกสารอื่นจนกว่าจะมี original templates/ยืนยัน OPEN-11
- NOT TESTED Firebase emulator/live และ identity/authenticity verification ไม่มี deploy/live writes/git push

อ้างอิง FR-SIG-01–06, FR-RES-09/10, FR-REV-04–07, BR-11/12, NFR-01–03, TR-02/04/05/06; คง OPEN-11/15/16
