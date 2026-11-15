# Phase 0 Report — System Foundation v1.6

วันที่ดำเนินการ: 15 พฤศจิกายน 2569 (15 November 2026, Asia/Bangkok)
Project: Personal Research Grant Management System for Mae Fah Luang University · Team: 404 Team Found
สถานะ: ส่งตรวจ Phase 0; ยังไม่เริ่ม Phase 1

## 1. งานที่ดำเนินการและขอบเขต

วางฐาน Domain แบบ versioned ด้วย schemaVersion="1.6" ใช้ 9 State IDs และ Transition Contracts TR-01–TR-17 พร้อม Action Contract, Capability Matrix, Document Validation, one-round evaluation, audit และ Migration Dry-run ที่ไม่เขียนข้อมูล

สิ่งที่ทำงานจริงในขอบเขตนี้:

- Pure reducer executeProjectAction() ตรวจ state, role/capability, version และ payload ก่อนคืน aggregate ใหม่; input เดิมไม่ถูกแก้ไข
- API researchApi รองรับ action="execute" สำหรับ contract v1.6 ใช้ Firebase ID token, server profile และ directory ภายใน transaction เดิม ไม่เชื่อ actor/role/status/time หรือ OPEN approvals จาก request
- Legacy action="save" ใช้กับข้อมูลเก่าเท่านั้น และปฏิเสธการเขียน canonical v1.6 แม้ client ลบ schemaVersion หรือเปลี่ยน status เพื่อหลบ guard
- Local Demo v1.6 เป็น opt-in ด้วย initializeFoundationDemo()/dispatchFoundationDemo()/readFoundationDemo() และ key ใหม่ mfu-foundation-v16-demo-projects; มี fixtures สมมติ 14 ระเบียน ครบ 9 states, สอง closure paths และ progress 0/3–3/3
- เพิ่ม scripts สำหรับ Unit Tests, emulator rules/API tests และ offline migration analysis; ไม่มี migration apply writer
- ปรับ AGENTS.md ให้ชี้เอกสารจริงและบันทึกขอบเขต Phase 0/ทางเข้าของ foundation

**ขอบเขตที่ยังไม่ทำ:** ไม่ย้าย page router, forms หรือหน้าจอเดิมทั้งหมดมาใช้ execute contract; current Demo pages ยังใช้ legacy compatibility layer. ค่า workflow/statusConfig เดิมยังคงไว้เพื่อแสดงข้อมูลเก่า ส่วน canonical model คือ PROJECT_STATES/TRANSITIONS ใน src/domain/contracts.js. ไม่กล่าวว่า Demo ทุกหน้าตรง v1.6 แล้ว และไม่อนุญาตให้ normalizeStatus() เปลี่ยนข้อมูลเดิมเป็น canonical โดยอัตโนมัติ

ไม่ deploy, ไม่ seed/migrate Firebase จริง, ไม่แก้ข้อมูลเดิมใน browser ของผู้ใช้ และไม่เริ่ม redesign หน้าจอ Phase 1. การทดสอบ Firebase ทำเฉพาะ localhost และ demo-mfu-secure ที่เป็น emulator

## 2. เอกสารอ้างอิงและตำแหน่งที่ตรวจแล้ว

อ่าน AGENTS.md, เอกสาร v1.6 ทั้งหกประเภท และ docs/audit/01–06 (System Overview, Page Inventory, Feature Inventory, Gap Analysis, Proposed Structure, Revision Plan). Fingerprints ของชุด Requirements ตรงกับที่บันทึกใน audit; สถานะยังเป็น Draft และมี DESIGN/OPEN ตามต้นฉบับ

Root จริงของเอกสาร: C:/Users/User/Downloads/เอกสารความต้องการ/

| เอกสาร | ไฟล์จริง | Version |
|---|---|---|
| Requirements Specification | requirement (1).md | 1.6, 14 Nov 2026 |
| Workflow | Workflow (1).md | 1.6, 14 Nov 2026 |
| User Flow | User Flow.md | 1.6, 14 Nov 2026 |
| Use Case Diagram | Use Case Diagram (1).md | 1.6, 14 Nov 2026 |
| Use Case Specification | Use Case Specification (1).md | 1.6, 14 Nov 2026 |
| State Transition Specification | State Transition Diagram (1).md | 1.6, 14 Nov 2026 |

แก้ path เก่าใน AGENTS.md แล้ว. ภาพ Use Case รอบก่อนที่ Downloads/Workflow update-Usecase.drawio.png ไม่พบ ณ วันที่ตรวจ และไม่ใช่เอกสารหลัก v1.6; ไม่ใช้แทนชุดใหม่. ไฟล์ Downloads/requirement.md ที่เพิ่มรหัส AC รายข้อไม่ได้เลือกมาแทนชุดที่ผู้ใช้ยืนยัน; อ้าง AC ในแถว FR ของชุดหลัก และ AC-TR ใน State Specification

## 3. ไฟล์ที่แก้ไข/เพิ่มใน Phase 0

| File | งาน |
|---|---|
| AGENTS.md | แก้ตำแหน่งเอกสารจริง, current authorization, foundation entry points และ stop boundary |
| src/domain/contracts.js | 9 State IDs, 17 rules, Action Contract, role capability vocabulary, document kinds, cancellation reasons |
| src/domain/model.js | aggregate schema, proposal/document/version validation, progress, signatory list, audit accessor |
| src/domain/permissions.js | role/owner/workspace/assignment checks, state-aware capabilities, redacted views |
| src/domain/actions.js | trusted-context reducer, action guards, submission/review/release/revision/closure logic และ read resources |
| src/domain/migration.js | read-only mapping analysis, original preservation, unresolved/invalid classifications |
| src/data/foundationDemo.js | 14 labelled v1.6 fixtures, 3 reviewer personas และ explicit local simulation context |
| src/utils/foundationStore.js | namespace แยก, no overwrite/reset, local dispatch/read และ dry-run accessor |
| src/utils/foundationApi.js | explicit authenticated command adapter พร้อม private file preparation และ positive acknowledgement |
| src/data/statuses.js | export canonical model/labels; เก็บ legacy presentation แยกอย่างชัดเจน |
| functions/foundationPolicy.js | canonical backend boundary, trusted actor/context, projection และ upload capability |
| functions/securePolicy.js | ป้องกัน legacy save bypass canonical contract; canonical view projection |
| functions/index.js | execute action ผ่าน transaction/token/profile/ticket/bytes checks เดิม และ guards สำหรับ canonical upload |
| functions/records.js | canonical indexes ใช้ State ID, assignment/result identity และ audit rule โดยไม่ใช้ legacy stage ordinal |
| storage.rules | assigned-report-only reads และ submitted/released feedback-file checks สำหรับ v1.6 |
| scripts/sync-server-domain.mjs | package domain modules ให้ backend ใช้ logic เดียวกัน |
| functions/domain/src/domain/*.js | generated server copies ของ 5 shared domain modules; byte parity test |
| functions/domain/src/data/statuses.js | generated copy ของ labels/exports ที่ปรับ |
| scripts/foundation-migration-dry-run.mjs | read-only offline CLI; ไม่ import Firebase และไม่เขียน records |
| tests/foundation.test.js | 17 tests ครอบคลุม contracts, guards, lifecycle, permission, document, audit, migration, packaging |
| tests/foundation.rules.integration.mjs | local Firestore regression + v1.6 Storage ACL checks |
| tests/foundation.api.integration.mjs | authenticated HTTP + canonical transaction/projection/private file/one-round closure tests |
| tests/evaluation.test.js, reviewerScenarios.test.js, workflow.test.js | เปลี่ยนชื่อกรณี repeated-review เดิมให้ระบุ legacy compatibility เท่านั้น; ไม่ลด/ลบ assertions เพื่ออ้าง v1.6 ผ่าน |
| package.json | เพิ่ม test:foundation, test:foundation:rules, test:foundation:api, migration:dry-run |
| docs/progress/PHASE_0_REPORT.md | รายงานนี้ |

ไฟล์ App, authentication UI, staff pages, navigation, locales และ integration tests บางไฟล์มี uncommitted changes อยู่ก่อน Phase 0 แล้ว; ไม่ย้อน/เขียนทับ/อ้างว่าเป็นผลงาน Phase 0. docs/audit เป็นรายงานก่อนแก้และยังคงไว้เป็น baseline

## 4. State Transition Contract

ทุก action ต้องมี command.id, action, payload และ expectedVersion. Server สร้าง identity/time/version/audit เอง. Main states มีเพียง DRAFT, AFFILIATION_REVIEW, STAFF_REVIEW, COMMITTEE_ACKNOWLEDGEMENT, IN_PROGRESS, CLOSURE_REVIEW, REPORT_EVALUATION, CLOSED, CANCELLED

| Rule | From | To | Roles | Requirement | Runtime status |
|---|---|---|---|---|---|
| TR-01 | เริ่มต้น | DRAFT | researcher | FR-RES-01 | Guarded implementation |
| TR-02 | DRAFT | DRAFT | researcher | FR-RES-02–08 | Guarded implementation |
| TR-03 | DRAFT | AFFILIATION_REVIEW | researcher | FR-RES-11 | DISABLED — OPEN-04 |
| TR-04 | AFFILIATION_REVIEW | AFFILIATION_REVIEW | researcher | FR-RES-12 | Guarded implementation |
| TR-05 | AFFILIATION_REVIEW | STAFF_REVIEW | researcher | FR-RES-13–15; FR-SIG-02–05 | Guarded implementation |
| TR-06 | STAFF_REVIEW | STAFF_REVIEW | staff, researcher | FR-ADM-04; FR-RES-16–17 | Guarded implementation |
| TR-07 | STAFF_REVIEW | AFFILIATION_REVIEW | researcher | BR-10 | DISABLED — OPEN-05 |
| TR-08 | STAFF_REVIEW | COMMITTEE_ACKNOWLEDGEMENT | staff | FR-ADM-05 | Guarded implementation |
| TR-09 | COMMITTEE_ACKNOWLEDGEMENT | IN_PROGRESS | staff | FR-ADM-06–07; BR-13 | Guarded implementation |
| TR-10 | IN_PROGRESS | IN_PROGRESS | staff | FR-ADM-09; BR-14 | Guarded implementation |
| TR-11 | IN_PROGRESS | CLOSURE_REVIEW | researcher | FR-CLS-01–04 | Guarded implementation |
| TR-12 | CLOSURE_REVIEW | CLOSURE_REVIEW | staff, researcher | FR-CLS-05–06 | Guarded implementation |
| TR-13 | CLOSURE_REVIEW | REPORT_EVALUATION | staff | FR-CLS-07; FR-REV-01 | Guarded implementation |
| TR-14 | CLOSURE_REVIEW | CLOSED | staff | FR-CLS-08 | Guarded implementation |
| TR-15 | REPORT_EVALUATION | REPORT_EVALUATION | researcher, staff, reviewer | FR-REV-04–10; FR-CLS-09 | Guarded implementation |
| TR-16 | REPORT_EVALUATION | CLOSED | staff | FR-CLS-10; FR-REV-08 | Guarded implementation |
| TR-17 | IN_PROGRESS | CANCELLED | staff | FR-CAN-01–02; FR-REG-03 | DISABLED — OPEN-20 |

TR-09 ไม่เปิดใช้ universal standards blocker: ต้องมี external acknowledgement และ staff certification แต่เรื่องเตือน/บล็อกเมื่อขาดใบรับรองยังเป็น OPEN-17. TR-10 ไม่ยื่น e-Office ผ่าน API; บันทึก approved/rejected outcomes และกำหนด 2 ครั้ง/ครั้งละไม่เกิน 6 เดือน. กรณี month-end ที่ต้องเลือก rollover convention ปฏิเสธเป็น OPEN_REQUIREMENT แทนตัดสิน OPEN-10 เอง

Save Proposal เป็น TR-02/04/06 ตาม state เดิม; Save Closure Draft เป็น event ใน IN_PROGRESS/CLOSURE_REVIEW; Save Evaluation เป็นงานย่อยใน REPORT_EVALUATION. Preview/Download เป็น read operation ไม่ mutate project/history/version. Attach Document append immutable version โดยคง main state. CLOSED/CANCELLED ไม่เปลี่ยนไป state อื่น; record_notice เป็น metadata event เฉพาะ staff ใน IN_PROGRESS/CLOSED ไม่ใช่การเปิดโครงการใหม่ และ CANCELLED ไม่เข้า closure

## 5. Action Contract และ Validation

| Action | TR / Allowed states | Capability |
|---|---|---|
| create_project | TR-01 | create |
| save_proposal | TR-02, TR-04, TR-06 | editProposal |
| confirm_ready | TR-03 | editProposal |
| submit_proposal | TR-05 | submitProposal |
| request_proposal_revision | TR-06 | reviewProposal |
| resubmit_proposal | TR-06 | editProposal |
| return_to_affiliation | TR-07 | editProposal |
| pass_proposal | TR-08 | reviewProposal |
| record_acknowledgement | COMMITTEE_ACKNOWLEDGEMENT | certify |
| certify_project | TR-09 | certify |
| record_extension | TR-10 | changeProject |
| record_project_change | IN_PROGRESS | changeProject |
| save_closure_draft | IN_PROGRESS, CLOSURE_REVIEW | submitClosure |
| submit_closure | TR-11 | submitClosure |
| request_closure_documents | TR-12 | reviewClosure |
| supplement_closure | TR-12 | submitClosure |
| check_closure | TR-12 | reviewClosure |
| assign_reviewers | TR-13 | assignReviewers |
| close_publication | TR-14 | close |
| save_evaluation | TR-15 | evaluate |
| submit_evaluation | TR-15 | evaluate |
| release_evaluations | TR-15 | release |
| submit_revised_report | TR-15 | reviseReport |
| verify_revised_report | TR-15 | close |
| request_revised_documents | TR-15 | close |
| close_report | TR-16 | close |
| cancel_project | TR-17 | cancel |
| attach_document | DRAFT, AFFILIATION_REVIEW, STAFF_REVIEW, COMMITTEE_ACKNOWLEDGEMENT, IN_PROGRESS, CLOSURE_REVIEW, REPORT_EVALUATION | upload |
| record_notice | IN_PROGRESS, CLOSED | recordNotice |

### Payload และ guard สำคัญ

| กลุ่ม | Payload / guard |
|---|---|
| Create/save | create: projectId + proposal, expectedVersion=0; save: proposal fields ตาม allowlist เดิม; owner/workspace ใช้ actor; draft incomplete ได้ แต่ confirm/submit ใช้ existing proposal validator |
| Ready | confirm_ready ระบุ TR-03 แต่ทุก request ถูกปฏิเสธ OPEN-04; request flag approved/enableOpen/context เปลี่ยนนโยบายไม่ได้ |
| Proposal submit/resubmit | current proposalVersionId + documentIds ที่มี signed_rs1 และ affiliation_evidence; signaturesComplete=true; ประกาศ usesOthersElectronicSignatures; ถ้า true ต้อง consentConfirmed=true; consent ผูก signer-role list, version, signed document, actor/time |
| Revision | staff ต้องมี notes; main state คง STAFF_REVIEW; researcher แก้ได้เมื่อ actionRequiredBy=researcher แล้ว resubmit กลับ staff |
| Pass/certify | confirm staff check; committee acknowledgement เป็น external record; reference/date และ explicit staff certification ก่อน IN_PROGRESS; ไม่มี committee approval/login |
| Extension/change | staff + IN_PROGRESS + external outcome/reference/reason; rejected ไม่แก้ fields; approved เก็บ before/after/actor/time/docs; extension count เฉพาะ approved; title/leader/methodology ใช้ existing change types ไม่เปิด field อื่นที่ยัง OPEN-13 |
| Closure submit | report ต้อง report file; publication ต้อง summary_report และ publication evidence; summary/finishedDate/explicit submit; supplemental files อยู่ path เดิมและคง CLOSURE_REVIEW |
| Assignment | checked report revision; exactly 3 distinct active reviewer IDs ใน server directory/workspace; ผูก report document IDs และ assignment ID; ไม่ assign ซ้ำเป็นรอบใหม่ |
| Evaluation | reviewer เฉพาะ assignment ตน; draft incomplete ไม่นับ; type/conditional-field validation จาก draft rubric เดิม; submit แล้ว immutable; narrative ไม่รับ object injection; feedback files ต้องเป็นของผู้ประเมินคนนั้น |
| Release | REPORT_EVALUATION + 3 submitted distinct reviewers + explicit staff confirmation + ยังไม่มี release; เก็บ release ID/actor/time; duplicate command/duplicate release ถูกปฏิเสธ |
| Revised report | ต้อง release แล้ว; upload/submit new revised_report document ID จริง; ไม่ reset assignments/evaluations หรือเพิ่ม reviewRound; staff verify latest submitted version ก่อน TR-16 |
| Cancellation | validate reason RESIGNED/EXCEEDED_DURATION/OTHER, OTHER details, explicit confirmation และ document refs ได้; execution ปิดไว้ด้วย OPEN-20; ไม่ auto-cancel เมื่อครบ 2 ปี |
| Document | id/kind/name/positive size/version; local bytes ต้อง %PDF- และขนาดตรง; backend ใช้ private Storage reference แล้ว API ตรวจ ticket/object/content header/owner; version เก่าห้าม overwrite |
| Concurrency/audit | expectedVersion ตรงก่อนแก้; command ID เดิมถูกปฏิเสธ 409 ไม่สร้าง event ซ้ำ; append server actor/time/previous/new/TR/projectVersion และไม่แก้ input เดิม |

รูปแบบ PDF≤2MB เป็น **technical compatibility ของ adapter เดิม** ไม่ใช่คำยืนยันว่า OPEN-02/16 ปิดแล้ว. การติ๊ก consent/signatures เป็นคำรับรองผู้ใช้ ไม่ใช่การตรวจความแท้ของลายเซ็นหรือ PKI. Rubric เดิมใช้เป็น draft validation ไม่ยืนยันว่า actual stakeholder form/registry mapping อนุมัติแล้ว

## 6. Capability Matrix

ทุก cell ยังต้องผ่าน actor active, matching workspace, ownership/assignment และ state/action guards; staff scope รายบุคคลที่ยัง OPEN ไม่ถูกสมมติเป็นสิทธิ์ใหม่. Backend mode ต้อง authenticated context ที่ API สร้างหลัง token verification; local-demo mode ต้อง explicit simulation identity ไม่ใช้แทน Auth

| Capability | Researcher | Staff | Expert Reviewer |
|---|---|---|---|
| Read project/history | Own project | Authorized workspace records | Assigned project/context only |
| Edit proposal | Own DRAFT/AFFILIATION_REVIEW หรือ STAFF_REVIEW ที่ staff ขอแก้ | ไม่แก้ในฐานะ researcher; approved external change เท่านั้น | Denied |
| Submit proposal/evidence | Own eligible project + signed/evidence/consent gates | Review/return/pass | Denied |
| Download project files | Own permitted files; evaluation feedback ต้องถูก submit และ release แล้ว | ตาม project scope | Assigned report IDs หรือ own evaluation feedback เท่านั้น |
| Project changes/extensions | Read result; no direct edit | IN_PROGRESS + external approved/rejected result | Denied |
| Submit closure/revised report | Owner ตาม state และ actionRequiredBy | Check/request missing/verify | Denied |
| Assign reviewers | Denied | Checked report + exactly 3 active distinct reviewers | Denied |
| Save/submit evaluation | Denied | Denied | Own unsubmitted assignment in REPORT_EVALUATION |
| Read evaluation results | Only after staff release | Submitted results/drafts ตาม authorized staff view | Own result only |
| Evaluation PDF source | Submitted + released; post-CLOSED access pending | Submitted; post-CLOSED pending | Own submitted result; post-CLOSED pending |
| Release evaluations | Denied | REPORT_EVALUATION + 3/3 + once | Denied |
| Close project | Denied | Checked publication path หรือ verified new revised report | Denied |
| Cancel project | Disabled | Disabled — OPEN-20 | Disabled |
| Record external notice | Denied | IN_PROGRESS/CLOSED; no state change | Denied |

projectProjection() ตัด other reviewers/current drafts/legacy review archives ออกจาก non-staff views; reviewer ไม่ได้ proposalVersions, signature/evidence bundle, administrative/change records หรือ revised-report versions. Storage rules ตรวจ assigned report ticket IDs และ released submitted-feedback IDs เพิ่มจาก role membership. ไม่ใช้การซ่อนปุ่มเป็น authorization

## 7. Data Model

ใช้ aggregate เดิมเป็นฐาน โดยเปลี่ยนแปลงอย่างระบุ schemaVersion ไม่สร้าง project table ชุดที่สองใน Backend. เอกสารใน aggregate เก็บหนึ่งครั้งแล้วใช้ documentIds อ้างอิง

| ข้อมูลที่ต้องรองรับ | Canonical location / semantics |
|---|---|
| Project Information | id, workspace, ownerUid/ownerUsername, status, title/titleEn/leader/affiliation/budget/startDate/endDate, createdAt/updatedAt/_version |
| RS-1 Proposal | proposal: existing RS-1 field allowlist; current values |
| Proposal Versions | proposalVersions[] immutable snapshots; ready/submitted evidence references; past snapshots ไม่เปลี่ยนตาม approved project change |
| Project Documents | documents[] immutable id/kind/version/metadata + local bytes หรือ private Storage refs + uploadedBy/At |
| Signed RS-1 | documents.kind=signed_rs1; proposalSubmission.documentIds |
| Affiliation Evidence | documents.kind=affiliation_evidence; ไม่บังคับ meeting minutes และ confirmation ทั้งสองพร้อมกัน |
| Signature Consent | signatureConsent current attestation; exact bundle archived in proposalVersions[].submissions[] พร้อม requiredSignatories และ actor/time |
| Project History | statusHistory[] append-only authoritative events |
| Extension Records | extensionRecords[] external approved/rejected, before/after, reference, docs, actor/time |
| Project Change Records | changeRecords[] approved/rejected, requested fields, before/after, external reference, docs, actor/time |
| Closure Submission | closure.method/state/actionRequiredBy/draft/documentIds/submissions[]/revision/check |
| Reviewer Assignments | closure.reviewers[] + assignments[] with reviewer ID, report revision/documentIds, assignedBy/At, dueAt; reviewerUids for existing ACL/index compatibility |
| Evaluation Records | closure.evaluations[reviewerId] draft/submitted answers, own documentIds, assignmentId, actor/time, reviewRound=1 |
| Evaluation Release | closure.release immutable one-time record; releasedFeedbackDocumentIds derived for Storage rules |
| Revised Report Versions | closure.revisedReportVersions[] file refs and submission audit; closure.finalCheck references latest actual version |
| Cancellation Records | cancellation contract shape: projectId, previousState, reason/details/documentIds, cancelledBy/At; available as labelled read-only fixture, no mutation permission enabled |
| Notifications | notifications[] in_app events; backend also uses existing per-user notification projection; ไม่มี email sender claim |
| Audit Logs | auditLogs(project) derives from statusHistory; backend activity/activityLogs indexes reused, no duplicate mutable audit stream |

closure.state และ actionRequiredBy เป็นงานย่อย ไม่ใช่ State ID ใหม่. reviewer IDs ต้องไม่เป็น prototype keys. Legacy registry และผลประเมิน 4 รูปแบบ/ขั้นตอน(1)–(6) ยังไม่แปลงเป็น enums ใหม่จนยืนยัน OPEN-21

## 8. Migration Dry-run Results

CLI: npm run migration:dry-run หรือ node scripts/foundation-migration-dry-run.mjs --input functions/demoProjects.json

ทุกผลมี dryRun=true, writes=0, applyAllowed=false. Pure API เก็บ original ของทุกระเบียนแบบ deep clone รวมประวัติและเอกสารเดิม; CLI แสดงเฉพาะ mapping summary/warnings ไม่ dump PDF bytes. ไม่มี apply command, no Firebase SDK initialization และไม่มี network access ใน migration script

| Input ที่อ่านแบบ offline | Total | Candidate | Needs review | Already current | Invalid | Writes |
|---|---:|---:|---:|---:|---:|---:|
| createInteractiveDemo() legacy fixtures | 12 | 1 | 11 | 0 | 0 | 0 |
| functions/demoProjects.json | 18 | 2 | 16 | 0 | 0 | 0 |
| New v1.6 foundation fixtures | 14 | 0 | 0 | 14 | 0 | 0 |

Candidate เป็นข้อเสนอ mapping ตามหลักฐาน **ไม่ใช่อนุมัติให้ migrate**; workspace binding และ human review ยังจำเป็น. ไม่ได้อ่าน LocalStorage จริงของ browser ผู้ใช้หรือ export Firebase จริง จึงไม่อ้างว่าตรวจครบทุกข้อมูลที่เคยบันทึกนอก repository

### รายระเบียนของ current legacy fixture set

| Project ID | Classification | Suggested State | เหตุผล |
|---|---|---|---|
| MFU-DEMO-001 | candidate | DRAFT | Draft ไม่มีหลักฐานขัดแย้ง; ยังต้องผูก workspace และตรวจทาน |
| MFU-DEMO-011 | needs_review | ไม่สรุป | Missing external acknowledgement/certification evidence for TR-09 |
| MFU-DEMO-015 | needs_review | ไม่สรุป | Ambiguous closure subtask: inspect assignment, release and revised report |
| MFU-DEMO-016 | needs_review | ไม่สรุป | Legacy completed label lacks staff closure audit/check evidence |
| MFU-DEMO-012 | needs_review | ไม่สรุป | Missing external acknowledgement/certification evidence for TR-09 |
| MFU-DEMO-006 | needs_review | ไม่สรุป | Legacy staff queue does not prove signed RS-1, affiliation evidence and consent |
| MFU-DEMO-018 | needs_review | ไม่สรุป | Evaluation stage lacks exactly three valid assignments and checked report |
| MFU-DEMO-REVIEWER-FIRST-02 | needs_review | ไม่สรุป | Evaluation stage lacks exactly three valid assignments and checked report |
| MFU-DEMO-REVIEWER-FIRST-03 | needs_review | ไม่สรุป | Evaluation stage lacks exactly three valid assignments and checked report |
| MFU-DEMO-REVIEWER-REVISION | needs_review | ไม่สรุป | Evaluation stage lacks exactly three valid assignments and checked report; Legacy repeated evaluation must be preserved and reviewed; never fabricate a one-round history |
| MFU-DEMO-REVIEWER-NOT-APPROVED | needs_review | ไม่สรุป | Evaluation stage lacks exactly three valid assignments and checked report |
| MFU-DEMO-REVIEWER-NO-SUBMISSION | needs_review | ไม่สรุป | No confirmed closure submission with source documents |

Repeated-review history ถูกเก็บตามจริงและจัด needs_review ไม่รีเซ็ตเป็นหนึ่งรอบย้อนหลัง. eoffice_pending/final_report/revision_required ไม่ถูก rename โดยดูเพียงชื่อ; registryยกเลิก/ลาออกไม่ทำให้สร้าง CANCELLED/TR-17 เอง; unknown/duplicate IDs ถูกแยกรายงาน

### Local fixtures ใหม่

14 records ครบทั้ง9states, publication/report closures, report progress0/3–3/3 และ released case. AFFILIATION_REVIEW และ CANCELLED เป็น **synthetic setup snapshots** ที่มี fixtureSetup/synthetic marker และ fixture_snapshot event ไม่อ้างว่า execute TR-03/TR-17 สำเร็จ. ไม่เปิด OPEN policy เพื่อ seed ตัวอย่าง. Namespace initializer เขียนเฉพาะ key ใหม่เมื่อไม่มีอยู่ ไม่ reset/overwrite ของเดิม; malformed existing value ถูกแจ้ง error และเก็บไว้

## 9. Requirement Traceability

| Requirements / AC | Implementation / Tests |
|---|---|
| FR-COM-01–05; NFR-01–04 | Actor modes, capabilities, read projections, optimistic version, audit; foundation Unit Tests + API/rules emulator |
| FR-RES-01–03/09–12/16–20; TR-01–08 | Proposal data/version, submit/revision contracts, blocked ready/TR-07, canonical labels; Unit origin/self-loop tests; UI/import/PDF rendering deferred |
| FR-RES-13–15; FR-SIG-02–06; BR-03/04/11/12; AC-TR-05 | Signed bundle/affiliation OR evidence-kind/conditional consent/current snapshot, signatory list, audit; missing evidence/consent/type tests |
| FR-ADM-04–07/09–13; BR-05/06/13/14; AC-TR-09/10 | Staff check/acknowledgement/certification; external approved/rejected changes; 2×6-month limits; no e-Office API; OPEN standards policy not auto-enabled |
| FR-CLS-01–12; BR-07–09; AC-TR-14/16 | Two paths, summary-report+publication requirements, supplemental self-loop, actual revised file and staff check/closure; Unit + HTTP lifecycle |
| FR-REV-01–10; AC-TR-15; NFR-05 | 3 unique active assignments, 0/3–3/3 submitted only, once release, own results/released PDFs source guards, one round; renderer not claimed implemented |
| FR-CAN-01–02; FR-REG-03; BR-14/15; AC-TR-17 | Contract/validation/terminal shape/fixture; execution denied OPEN-20; no permanent deletion/auto-cancel |
| FR-REG-01/02/04; OPEN-19/21 | Migration unresolved classifications and preservation; no registry enums, automatic removal or window rejection introduced |
| NFR-06/07/10/11 | Technical document validation, failed-save preservation, fictional namespace, byte-identical shared/server packaging; extraction accuracy and performance not invented |

ทุก AC อ้างตามคอลัมน์ของ FR และ AC-TR ในเอกสาร ไม่สร้าง Requirement/BR/State ใหม่. Action names/DTO fields เป็น implementation contract ภายใน Phase 0 ไม่ใช่ Stakeholder requirements ใหม่

## 10. Testing Results

| Check | Result | ขอบเขต |
|---|---|---|
| node --test tests/*.test.js | PASS: 84/84, 0 fail, 0 skip | 67 existing regression + 17 foundation tests; guards มี table-driven wrong-origin cases ครบทุก state |
| npm run test:foundation | PASS ตาม foundation suite | State/roles/documents/3 reviewers/release/terminal/audit/migration/server-copy parity |
| npm run lint | PASS | รวม source/backend/scripts/tests ใหม่; รอบสุดท้ายผ่านหลังลบ generated Firebase build ใน tmp ซึ่ง ESLint เคยนำ minified bundles มาตรวจและรายงาน errors; ไม่เปลี่ยน source เพื่อหลบ lint |
| npm run build | PASS | Default local Demo build; ไม่ deploy |
| npx vite build --mode firebase --outDir tmp/phase0-firebase-build | PASS | Firebase entry/build configuration; ไม่ deploy |
| Firestore emulator regression | PASS: 28 access-control checks | Existing rules: unauthenticated/owner/staff/reviewer/workspace/revocation/notification writes |
| v1.6 Storage emulator | PASS: 17 checks | Assigned report only; signed-evidence denial for reviewer; own/other feedback; before/after release; unsubmitted feedback denied; anonymous/outsider/revoked access |
| v1.6 authenticated HTTP emulator | PASS: 22 requests | Auth, OPEN denial, legacy bypass denial, forged context, 3 submissions, release gate/once, private missing-file rejection, upload+revision+final-check+closure and no re-evaluation |
| Migration dry-runs | PASS, writes=0 | 12 legacy fixtures, 18 offline JSON rows, 14 canonical fixtures; preservation checked in Unit Tests |

เริ่ม emulator ใน sandbox รอบแรกเชื่อม localhost ไม่สำเร็จ; รันใหม่ด้วย local-execution permission แล้วผ่านและ shutdown ทุก emulator. ใช้ demo-mfu-secure และ localhost เฉพาะ Auth/Firestore/Functions/Storage ไม่มี deploy/migrate/seed production

ข้อจำกัดการทดสอบ: Functions emulator ใช้ Node24 ของเครื่อง ขณะที่ deployment engine กำหนด Node22; ไม่ได้ทดสอบ runtimeจริงบนcloud. Build มีคำเตือน chunkเกิน500kB ของแอปเดิม ยังไม่ทำcode-splitting/UIoptimizationในPhaseนี้. ไม่ได้รันbrowservisual/UATหรือemaildeliveryจริง

### Regression tests ที่อ้างพฤติกรรมเก่า

tests/evaluation.test.js, reviewerScenarios.test.js และ workflow.test.js มีกรณีคาดหวังการประเมินซ้ำเดิม. เปลี่ยนชื่อให้ระบุ legacy compatibility only เพื่อรักษาพฤติกรรมข้อมูลเก่าในช่วงที่ยังไม่migrate ไม่ใช่นำมารับรองv1.6. Foundation testsและHTTP testsใหม่ยืนยันตรงข้ามว่า v1.6ไม่เพิ่มรอบ/ไม่ล้างผลเดิม. ไม่ลบassertionsหรือแก้expectationให้ผ่านโดยไม่มีreplacementtest

## 11. OPEN Issues ที่ยังไม่ตัดสินแทนผู้ใช้

| Issue | สถานะใน Phase 0 |
|---|---|
| OPEN-04 / TR-03 ready trigger | Contractมี แต่ executionปิด; พร้อมreviewก่อนimplementtrigger |
| OPEN-05 / TR-07 re-affiliation criteria | ปิด execution; ไม่ใช้legacyreturnlogicบังคับแทน |
| OPEN-20 cancellation permissions / other origins | ทุกroleยังไม่มีcancel capability; validatepayload+readonlyfixtureได้เท่านั้น |
| OPEN-17 standards warning/block / evidence details | ไม่blockทุกproject; recordstandards_evidencekindได้ตามสิทธิ์ แต่ไม่ตั้งapprovedtypes/mandatorychecksเอง |
| OPEN-10 month-end/calendar/reminder calculation | ไม่เลือกrolloverเอง; ambiguousmonth-endextensiondeniedwithOPEN error; noemailcadence |
| OPEN-01/02/03/06/13/15/16 fields/file/checklist/edit/consent proof | ใช้existingtechnicaladapters/fieldallowlistsเป็นimplementationdesign ไม่ประกาศว่าปิดประเด็น;หน้าใหม่ต้องตรวจอีกครั้ง |
| OPEN-07/11/21 rubric / registry outcomes | Reuse draft rubricvalidation; ไม่สร้าง4registryenumหรือ6automatedstepsเพิ่ม |
| FR-REV-07 combined PDF/retention/post-CLOSED downloads | GuardปฏิเสธgeneratedPDFsourceหลังterminal; individualauthorizedsubmittedsnapshotพร้อมให้rendererภายหลัง;ไม่มีfakePDF/signature |
| OPEN-09/18 enrollment windows; OPEN-19 registry removal | ไม่auto-reject/auto-remove/auto-cancel/hard-delete |
| OPEN-12 MVP / NFR-08/09/12 targets | Phase0 scopeตามคำสั่งนี้เท่านั้น;ไม่ถือว่าทุกtargetsystemfeatureได้รับอนุมัติให้implement |

## 12. Remaining Tasks และจุดหยุด

1. ให้ผู้ใช้ตรวจ Phase 0 และยืนยัน OPEN ที่จำเป็นก่อนเปิด TR-03/TR-07/cancellation หรือ month-end policy;ไม่เริ่ม Phase1เอง
2. เมื่อได้รับมอบหมายหน้า ให้ย้ายจาก legacy candidate-save ไป v1.6 command adapterทีละpage โดยใช้ canonicalState/capabilityguards;currentrouterยังไม่cutover
3. Implement UI evidence/consent/versionpickers, reviewer assignment/tracking/release/revised upload/finalverification และ generatedevaluationPDFตามscopeแต่ละphase;ห้ามแสดงว่ามีครบแล้วจากfoundationtests
4. ตรวจ rubric, RS-1 original templates และ Excel mappingจากเอกสารต้นทางที่ยังต้องยืนยัน;เพิ่มfileformats/accuracyACตามคำตอบ ไม่สมมติOCRหรือPKI
5. ตรวจ migration candidates/unresolvedพร้อมเจ้าของข้อมูล;ถ้าจะมีapplymigrationต้องรับคำสั่งใหม่และรักษาbackup/history/documents ไม่ใช้dry-runเป็นการอนุมัติproductionmigration
6. Browserintegration/visualQA/UAT และ Node22 runtime verificationให้ทำเมื่อหน้าที่เกี่ยวข้องเปลี่ยน;buildwarningsยังเป็นข้อจำกัดที่ทราบ

หยุดที่ Phase 0 หลังส่งรายงานนี้ ไม่ deploy ไม่เปลี่ยนFirebaseจริง และไม่เริ่มPhase1จนกว่าผู้ใช้สั่ง

## Appendix: Offline dataset fingerprints

- createInteractiveDemo() serialized input: bafd9ad939dec19621f5eb9bd82e463cc2c7fac56041e351699820558b1ed194
- functions/demoProjects.json parsed serialized input: 8b46d52b3302e6a778ea137fc8a8ab2f505f406a7dd7fa7ca3129a2858ac3ee6
- Source/server foundation modulesผ่านbyte-paritytest;เอกสารต้นฉบับไม่ได้แก้ไข
