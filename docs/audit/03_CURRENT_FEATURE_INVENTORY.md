# Current Feature Inventory

อ่านคู่กับ Page Inventory; Audit date 14 November 2026. รายการนี้แยก **logic ที่มีจริง**, **mock content**, **unreachable code** และ **remote capability ที่ยังไม่ทดสอบ**. คำว่า Working ไม่รับรองความตรง v1.6 โดยอัตโนมัติ

## Feature map

| ID | Function | Pages | Source / implementation | สถานะและข้อค้นพบ | Requirements / Rules | Gap |
|---|---|---|---|---|---|---|
| F01 | Identity / roles | C01/C02 | DemoEntry, FirebaseGate, securePolicy.authorizeProfile | Local role selection เป็น Mock; Firebase Auth implementation เป็น Partial ยังไม่รันทดสอบ live | FR-COM-01/02; NFR-01/02 | G02 |
| F02 | Scoped project reads | R01–02/S01–02/V01–02 | closure.canRead; firebaseSharedStore; projectView; firestore.rules | local staff เห็นทุก project; Firebase scoped workspace/owner/assignment; projection ไม่ครบใน reviewRounds | FR-COM-02–04; FR-REV-02/03 | G02/G13 |
| F03 | Dashboard/search/filter | R01–02/S01–02/V01–02 | RoleOverview,StaffOverview,ProjectList,StaffProjectList,ReviewerDashboard | Working ต่อ seed/legacy status; ไม่รวม CANCELLED/REPORT_EVALUATION; examples ยังมีข้อมูลขัด | FR-COM-03/04; FR-ADM-01/08 | G01/G18 |
| F04 | Create/save draft | R03/R05 | buildProposal,saveProposal,preserveWorkingDraft | Working local draft persistence; state ใช้ draft ไม่ใช่ DRAFT; source/API mode ต้องแยก | FR-RES-01–03; TR-01/02 | G01 |
| F05 | RS-1 structured editor | R05 | ManualEntry; proposalValidation | Partial หลายส่วนจริง; field list/standards/reviewer eligibility texts เป็น local choices ยังไม่ยืนยัน data dictionary | FR-RES-02/09; OPEN-01/06/13 | G03/G15 |
| F06 | Import/extract/review | R04 | UploadDocument; PDF.js,Mammoth,extractRS1Fields | Partial parser จริง9fields ไม่มีOCR ไม่ใช่ AI extraction mock; accuracy/mapping OPEN; source bytes DOCXไม่เก็บ | FR-RES-04–08; NFR-06/07 | G03 |
| F07 | Proposal PDF | R05/R06/R07/S03 | ProposalPDF,generateRS1PDF | Partial สร้าง PDF จริงจาก structured fields; ไม่คงแบบฟอร์มต้นฉบับ/พื้นที่ลงนามครบและ field projectTitleEn ไม่อยู่ generator sections | FR-RES-10/11; FR-SIG-01; NFR-05 | G04 |
| F08 | Ready-for-affiliation confirmation | R05/R06 | ManualEntry confirm → submission | Not Implemented แยก TR-03; submit เดียวไป unit_review; trigger OPEN-04 | FR-RES-11/12; TR-03/04 | G04 |
| F09 | Signed RS-1 + evidence | R06/S06 | SubmissionConfirmation,proposalValidation | Not Implemented: generic agreement ไม่ใช่ signed check; generated PDF ไม่ใช่ signed original | FR-RES-13/14; FR-SIG-02/03/06; TR-05 | G05 |
| F10 | Electronic-signature consent | R06/S06 | ไม่มี consent record reducer/fields | Not Implemented: เก็บผู้ยืนยัน/เวลา/document version ไม่มี | FR-SIG-04/05; BR-12 | G05 |
| F11 | Submit receipt/idempotency | R06 | submitResearchProposal,buildProposal | Partial validation/positive acknowledgement/ref ID จริง; ไม่ไป STAFF_REVIEW; gateเอกสารไม่ครบ | FR-RES-14/15; TR-05 | G04/G05 |
| F12 | Proposal return/resubmit | S06/R05 | updateProjectStatus,buildProposal | Partial ส่งกลับ/เหตุผล/ส่งใหม่ได้ แต่เปลี่ยน main statusเป็น revision_required แทน STAFF_REVIEW self-loop | FR-ADM-04; FR-RES-16/17; TR-06 | G06 |
| F13 | Staff check passed | S06 | ProposalReview; proposal_check replay | Partial admin_review→committee_review; checklist/evidenceไม่มี | FR-ADM-01–05; TR-08 | G06 |
| F14 | Committee acknowledgement/certification | S07 | recordAdministrativeResult | Partial รับข้อมูล external จริงแต่ outcome endorsed/revision/deferred อาจทำให้เข้าใจ committee decision; ไม่แยก research-standards gate | FR-ADM-06/07/11; BR-05/13; TR-09 | G07/G15 |
| F15 | Timeline/audit | R08/S04/V04 | ProjectTimeline,statusHistory,closure.history; API activityLogs | Partial append audit จริง; linear legacy timeline; local actorไม่ trusted; evaluator data privacy/versionsไม่ครบ | FR-COM-05; FR-RES-18/19; FR-ADM-10; NFR-03 | G01/G13/G17 |
| F16 | Project changes | S08 | ProjectChangeRecord,applyChange | Partial staff edits+before/after+external PDF จริง; any noncompleted state; ไม่มี approved/denied distinction | FR-ADM-13; UseCase3.10 | G08 |
| F17 | Duration extension | S08 | applyChange extension | Partial endDate updateและhistoryจริง; ไม่มี2ครั้ง/6เดือน; local deadline re-evaluateจากdate ไม่มี mail schedule | FR-ADM-09; BR-14; TR-10 | G08/G16 |
| F18 | Certified project correction | R10/S09 | demoCorrection; correctionAction | Local Working แต่ขัด staff-only e-Office flow; Firebase replay ไม่รู้จัก correction_* จึงไม่เท่ากับ end-to-end feature | FR-ADM-13; OPEN-13 | G08/G19 |
| F19 | Closure report submission | R11 | ResearcherForm,transition submit | Partial file/summary/date validation; main status closure_review แม้ post-evaluation; draft/files persisted | FR-CLS-01/02/04/06; TR-11/12 | G01/G09 |
| F20 | Publication path | R11/S10 | method publication →ready_close →complete | Partial bypass reviewerจริง; ไม่บังคับรายงานย่อแยกจากหลักฐาน; criteria OPEN-14 | FR-CLS-03/07/08; TR-14 | G09 |
| F21 | Assign reviewers | S10 | StaffForm directory; transition check; securePolicy replay | Partial variable size; local directory1/server1–10; ไม่มี exactly3 | FR-REV-01; TR-13 | G10 |
| F22 | Evaluation draft/submit | V06/V07 | ReviewerEvaluation,validateEvaluation,transition review | Working สำหรับแบบฟอร์ม draftปัจจุบัน/locking; rubric official OPEN-11; round2 supportขัด | FR-REV-04–06/08; TR-15 | G11/G15 |
| F23 | Evaluation completion/release | S10/S11/R12 | allEvaluationsSubmitted,release_feedback,EvaluationResults | Partial completionตาม Nassigned≥1 ไม่ใช่3; releaseมีstate guard ไม่ได้ explicit feedbackReleasedAt guard; API replays actor; local projection gate UI | FR-REV-09/10; TR-15 | G10/G12 |
| F24 | Revised report after release | R11/S10 | submit finalRevision/FinalVerification | Partial revision pathcreates round2; final optionsets revisedAfterEvaluationก่อนresearcher uploadและ locks form | FR-CLS-09/10; FR-REV-08; TR-15/16 | G11/G12 |
| F25 | Evaluation PDF on-demand | R12/S11/V08 | ไม่มี generator ของผลประเมิน; FeedbackFiles download input attachments | Not Implemented; feedback attachment/RS-1 PDFไม่ใช่PDF generatedผลประเมิน | FR-REV-07; NFR-05 | G14 |
| F26 | Final verification/close | S10 | transition final_check/complete | Partial staff check before completedจริง; one-roundและrevised filegateไม่ตรง; focused hideClosedContent | FR-CLS-10–12; TR-16 | G11/G12/G17 |
| F27 | External closure notice | S10 (unreachable form) | ClosureNotice,record_notice | Partial reducer+nonfocused UIมี แต่ current focused completed branchไม่ mount; ไม่ได้เชื่อม e-Office | FR-CLS-12; FR-ADM-11; BR-06 | G17 |
| F28 | Cancellation | ไม่มีหน้า | registry assessmentStatusมียกเลิก/ลาออกเท่านั้น | Not Implemented canonical CANCELLED/TR-17/reason/audit; registry valueไม่ใช่project cancellation | FR-CAN-01/02; FR-REG-03; BR-14/15; TR-17 | G20 |
| F29 | Research standards | R05/S07 | standards select; certification generic | Partial selectiontext แต่ไม่มี certification type/evidence metadata/status roleครบ; automaticblockยังOPEN | FR-STD-01–03; BR-13 | G15 |
| F30 | Registry | legacy StaffRegistry | registry.js,data/registry,closureRegistry; functions/records | Partial utility/index/legacy editor; Not Implemented reachable registry UI; 4 assessment labelsและ6steps hardcode ทั้งที่OPEN-21 | FR-REG-01–04; BR-16 | G15/G21 |
| F31 | Notifications/deadlines/email | R13/S12/V09 | Notifications,deadlineItems,API notifications fanout | Local/remote activityมีจริง; Email Not Implemented; 30dayค่าออกแบบ ไม่approvedschedule | UseCase3.8; FR-RES-20; OPEN-10 | G16 |
| F32 | Navigation/form retention | ทุกหน้า | demoRouter,navigationGuard,useFormDraft | Working logic Back/Forward/hash/unsaved; selected Fileเก็บmemoryไม่รอดreload; role draftkeyบางformsไม่isolated | NFR-08/10; FR-COM-02 | G02/G18 |
| F33 | Remote file persistence | C02 และ file pages | firebaseFiles,index prepareUpload/storage.rules | Partial codeมีจริง tickets/auth/privateStorage; ไม่รันทดสอบlive ไม่อ้างuploadedสำเร็จ | NFR-02/07; FR-RES-08 | G13/G17 |
| F34 | Scenario/mock data | ProjectList/ReviewerDashboard/documents | interactiveDemo,demoProjects,demoRegistry,demoAttachment; functions/demo | Mock 12local seed projects,1localreviewer; sample PDFs reused; separate advisor15 + workshopJSON ไม่ใช่ฐานเดียวกัน | NFR-10; FR-REV-01/08 | G18 |

## Mock data lineage และสิ่งที่ไม่ได้เชื่อมจริง

1. Default entry ใช้ createInteractiveDemo จากต้นแบบ createDemoProjects: เลือก7 recordsเดิม แล้วเพิ่ม2first-report+revision+not-approved+no-submission รวม12 recordsใหม่เมื่อ clean seed. นักวิจัย demo-user เป็นเจ้าของ7; อีก5ของ demo-reviewer-fixture. ไม่ใช้จำนวนใน README ที่บอก7เป็นจำนวนจริงของ clean seedปัจจุบัน
2. sharedStore local directory มี demo-reviewer เพียงคนเดียว. หลาย closure fixturesตั้ง evaluations/released/finalCheck ล่วงหน้า; บาง pending fixtureมี feedbackReleasedAt ตั้งแล้ว จึงไม่ใช้ fixtureเป็นหลักฐานว่าลำดับการกดครบ
3. demoAttachment เป็น sample PDF bytes reuse ไม่ใช่รายงานจริงของแต่ละโครงการ. Readable Report มี hardcoded60ครัวเรือน/52คน/15%/4.2 ไม่ได้ deriveจากPDF จึงเป็น Mock content แม้ดาวน์โหลดPDFได้จริง
4. demoRegistry เติม narrative/stepsสมมติอัตโนมัติสำหรับ demoGenerated/demoScenario. ไม่ใช่ข้อมูล Excel stakeholdersที่ยืนยันแล้ว
5. functions/demo advisor bundle มี15 projects,5ต่อrole; functions/demoProjects.json เป็น legacy seedอีกชุด; scripts provision/seed/migrate เป็นเครื่องมือ offline ไม่ใช่pages และไม่ได้รันใน audit
6. API save/Storage SDK เป็นโค้ดจริงใน Firebase mode; ไม่ใช่หลักฐานว่า default DemoเรียกAPIหรือข้อมูลpersistในcloudแล้ว
7. ไม่พบ e-Office API (ตรงScopeOut). ไม่พบ email transport/scheduler (ยังขาดตามWorkflow); in-app noticeไม่ใช่อีเมล

## Cross-cutting data และ side effects

| Data | ที่เก็บ/การเปลี่ยน | ความเสี่ยงต่อ redesign |
|---|---|---|
| Project aggregate | local KEY หรือ canonical Firestore | main status/closure.stateต้อง migrateอย่างระบุเงื่อนไข ห้ามเดาmappingจากชื่ออย่างเดียว |
| Proposal draft | DRAFT_KEY dynamicเมื่อFirebase user; genericlocal key | แยกworkingcopyกับsavedversion; importedblankไม่overrideoldvalue |
| Form drafts | mfu-navigation-draft-*; in-memory map | หลายkeyมีrole/projectแต่ไม่UID/workspace ห้ามแชร์draftข้ามบัญชีในFirebase |
| Evaluation draft | mfu-review-working-{uid}-{project} | submitted immutableแต่ยังรองรับreviewRounds ต้องหยุดสร้างรอบใหม่โดยรักษาประวัติเดิม |
| Attachments | localdataURL / Storage tickets/path | ไฟล์ต้นทาง,ฉบับลงนาม,affiliation evidence,finalreportต้องมีdocumentkind/versionที่แยก |
| History | statusHistory,closure.history,registryHistory,changeRecords,activityLogs | trustactor/timeที่server; redactfields/archivesตามroleทุกnestedpath |
| Read watermark | local role key / remote per-userreadAt | localใช้เพื่อสาธิตเท่านั้น ไม่ใช่realnotificationaccesscontrol |

## Runtime evidence ที่ตรวจเพิ่มโดยไม่แก้แอป

- node --test tests/*.test.js: **67 pass / 0 fail / 0 skip**. Test reviewerScenarios.test.js มีกรณี “reviewer can reassess a resubmitted report…” ซึ่งรับรองlegacy behaviorที่ขัดFR-REV-08 จึงต้องเปลี่ยนtestภายหลังได้รับคำสั่ง implement
- In-memory probe: allEvaluationsSubmitted กับ reviewer1คนคืนtrue; release_feedbackสำเร็จ; submit revisedแล้ว reviewRound=2/state=awaiting_review
- buildProposal(submit=true) พร้อมstructuredfieldsแต่ไม่มีsignedRS-1/affiliationevidenceผ่านและได้unit_review
- applyChange(extension) กับstatus=draft/endDate2027→2029ผ่าน คงdraft; แสดงทั้งstateeligibilityและdurationlimitที่ขาด
- ไม่สร้าง persistent test records ไม่เปิดproduction ไม่รันsync/seed. ยังต้อง browser/integration testsตามแผนPhase6

