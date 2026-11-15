# Current Page Inventory

วันที่ตรวจ: 14 November 2026 · วิเคราะห์ source snapshot ใน working tree ไม่ใช่ deployed site

## วิธีนับ

- **21 screen types**: 18 page tokens ที่ App router รับ + Demo Role Selection + Firebase Sign In gate + Not Found. Dashboard เปลี่ยน implementation ตามบทบาท แต่ยังเป็น page token เดียว
- ตัวเลข 21 รวมทั้งสอง runtime modes: default Demo มี 20 types (ไม่มี Firebase Sign In); Firebase mode มี 20 types (ไม่มี Demo Role Selection). ทั้งสอง entry ไม่แสดงพร้อมกัน
- **37 รายการใน inventory ตามบริบทผู้ใช้**: Common 3 + Researcher 13 + Staff 12 + Reviewer 9 = 37. ตัวเลขนี้รวมการใช้ screen type ร่วมกันข้ามบทบาท จึงห้ามนำไปบวกกับ 21
- **23 ไฟล์ JSX ใน src/pages/** ไม่เท่ากับจำนวนหน้า: 4 legacy files ไม่ได้ mount; ส่วน Login/Role Selection อยู่ src/components และ Timeline/Answers ใช้ component ร่วม
- Queue แบบไม่มี Project ID เช่น #/staff/staff-review ใช้ ProjectList target filter ถือเป็น list variant ของ page token เดิม ไม่ใช่หน้ารายโครงการเพิ่ม; query tabs, filters, pagination ไม่เป็นหน้าใหม่
- Route ID ในเอกสารนี้เป็น Audit ID ไม่ใช่ Requirement ID ใหม่
- Working = logic ที่ระบุทำงานในขอบเขตที่ตรวจ; Partial = มีจริงแต่ไม่ครบ/ไม่ตรง v1.6; Mock = เนื้อหาหรือกลไกจำลอง; Not Implemented = ไม่พบ implementation (แสดงใน gap/feature inventory). ทุกหน้า local ใช้ fictional data แม้ปุ่มทำงานจริงกับ localStorage
- Firebase มี implementation แต่ยังไม่ได้ตรวจ deployment/login/Storage จริงในงานนี้ จึงไม่ใช้คำว่า Working เพื่อรับรอง remote service

## รูปแบบ URL และส่วนที่ใช้ร่วมกัน

Base host ใช้ localhost ที่ผู้รันกำหนด ไม่ตรึงพอร์ต; route ทั้งหมดเป็น hash. รูปแบบ global คือ #/{role}/{page}; project คือ #/{role}/projects/:id/{page}; #/{role}/projects/:id alias ไป details; #/{role} alias ไป dashboard

Source หลัก: src/main.jsx, src/App.jsx, src/utils/demoRouter.js. Sidebar/Header/Breadcrumb/Back/Project Navigation เป็น Layout/Components ไม่ใช่หน้า. ทุก project route ผ่าน App.canRead ก่อน render; local role switch ไม่ใช่ authentication

ตารางแต่ละหน้ารวม Purpose, Features, Actions, Input, Display, Logic, States, Connections, References และ Status. ชื่อ state ตัวเล็กในช่อง Existing States คือค่าจริงใน code ไม่ใช่ชื่อที่เสนอให้ใช้ต่อ

### C01 — Demo Role Selection

| Field | รายละเอียด |
|---|---|
| Page ID / Name | C01 / Demo Role Selection |
| Route / URL | `#/roles` |
| Source File | src/components/DemoEntry.jsx |
| User Role | Common |
| Purpose | เลือกบทบาทเพื่อสาธิต |
| Existing Features | 3 role cards, EN/TH, remembered role |
| Buttons and Actions | Start Demo, change language |
| Input Fields | role, language |
| Displayed Information | ชื่อระบบ/ข้อความข้อมูลสาธิต |
| Business Logic | initializeDemo() seed local data; ไม่ authenticate |
| Related Project States | ทุกสถานะ (ไม่มีการเปลี่ยน) |
| Connected Pages | R01/S01/V01 ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-01–03; NFR-01/10 |
| Implementation Status | **Mock**; local persistence/seed ไม่ใช่ production capability |

### C02 — Firebase Sign In

| Field | รายละเอียด |
|---|---|
| Page ID / Name | C02 / Firebase Sign In |
| Route / URL | `MODE=firebase: unauthenticated gate ที่ URL ปัจจุบัน (ไม่มี /login route)` |
| Source File | src/components/FirebaseGate.jsx |
| User Role | Common |
| Purpose | ยืนยันตัวตนใน MODE=firebase |
| Existing Features | Email/password Auth, restore session, profile active/workspace, denied/error |
| Buttons and Actions | Sign in; Sign out ผ่าน Header |
| Input Fields | email, password |
| Displayed Information | loading/error; ชื่อบัญชีและ role หลังเข้า |
| Business Logic | Firebase Auth + users/{uid}; role URL ต้องตรง profile; ไม่มี registration/reset password UI |
| Related Project States | ไม่เกี่ยวข้อง |
| Connected Pages | Role Dashboard ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-01–02; NFR-01/02 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### C03 — Not Found / Access Feedback

| Field | รายละเอียด |
|---|---|
| Page ID / Name | C03 / Not Found / Access Feedback |
| Route / URL | `#/{valid-role}/unknown; invalid role ใน local กลับ Role Selection` |
| Source File | src/App.jsx; src/components/DemoEntry.jsx |
| User Role | Common |
| Purpose | แจ้ง URL/โครงการ/สิทธิ์ไม่ถูกต้อง |
| Existing Features | Not Found, project unavailable, role restriction, staff load errors |
| Buttons and Actions | Back to Dashboard/Projects |
| Input Fields | ไม่มี |
| Displayed Information | error/empty/loading |
| Business Logic | invalid role ใน local mode กลับ Role Selection; valid role unknown page แสดง not-found; error boundary แยก component |
| Related Project States | ไม่เปลี่ยนสถานะ |
| Connected Pages | C01/R01/S01/V01 ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-02/04; NFR-08 |
| Implementation Status | **Working**; local persistence/seed ไม่ใช่ production capability |

## researcher (13 views)

### R01 — Researcher Dashboard

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R01 / Researcher Dashboard |
| Route / URL | `#/researcher/dashboard` |
| Source File | src/pages/RoleOverview.jsx |
| User Role | researcher |
| Purpose | สรุปงานเจ้าของโครงการ |
| Existing Features | total/pending/active/completed cards; 3 recent projects |
| Buttons and Actions | Open filtered list; open project |
| Input Fields | ไม่มี (ลิงก์ query filter) |
| Displayed Information | counts, id/title/status |
| Business Logic | canRead + nextTask + sort updatedAt; active/completed ใช้สถานะเก่า |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | projects/details ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-03–04; FR-RES-18–20 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R02 — Project List

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R02 / Project List |
| Route / URL | `#/researcher/projects` |
| Source File | src/pages/ProjectList.jsx; src/pages/StaffProjectList.jsx; src/components/DemoScenarios.jsx |
| User Role | researcher |
| Purpose | ค้นหาและเลือกโครงการตามบทบาท |
| Existing Features | Search/status/pagination 6; examples/all; Staff search leader/titleEn + work filter |
| Buttons and Actions | Search/Clear; previous/next; open task/project |
| Input Fields | search,status,page; Staff filter/task; view=examples/all |
| Displayed Information | title,id/code,leader,status; scenario cards |
| Business Logic | canRead local owner/assignment; staff shared ใช้ canonical workspace list; examples ยังมี scenario ที่ไม่ตรง v1.6 |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details; task route เช่น staff-review/closure ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-03; FR-ADM-01/08; FR-REV-02 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R03 — Choose Submission Method

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R03 / Choose Submission Method |
| Route / URL | `#/researcher/choose` |
| Source File | src/pages/ChooseSubmissionMethod.jsx |
| User Role | researcher |
| Purpose | เลือกกรอกหรือ import |
| Existing Features | Manual/Upload cards |
| Buttons and Actions | Start Manual; Start Upload; Back |
| Input Fields | ไม่มี |
| Displayed Information | คำแนะนำวิธีทำ RS-1 |
| Business Logic | prepare() preserve working draft then reset DRAFT_KEY; ยังไม่สร้าง project จน save |
| Related Project States | เริ่มต้น/DRAFT |
| Connected Pages | manual/upload ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-RES-01–05; TR-01/02 |
| Implementation Status | **Working**; local persistence/seed ไม่ใช่ production capability |

### R04 — Import & Review RS-1

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R04 / Import & Review RS-1 |
| Route / URL | `#/researcher/upload` |
| Source File | src/pages/UploadDocument.jsx |
| User Role | researcher |
| Purpose | นำเข้าข้อมูลจากไฟล์แล้วตรวจแก้ |
| Existing Features | PDF.js/Mammoth text parsing; regex 9 fields; drag/drop; raw text; editable preview |
| Buttons and Actions | Browse/Drop/Change/Remove; Start Over; Continue to Form/manual |
| Input Fields | PDF/DOCX ≤10 MB; title,leader,affiliation,phone,email,advisor,type,keywords,objectives |
| Displayed Information | found count 0–9,raw text,filename/pages/errors |
| Business Logic | ไม่มี OCR; only nonempty values merge จึงการเว้นว่างไม่ล้างค่าเก่า; source PDF ≤2 MB เก็บ bytes ส่วน DOCX/large PDF เก็บ metadata; limits เป็น implementation ไม่ใช่ approved AC |
| Related Project States | DRAFT (working copy ไม่เปลี่ยน state) |
| Connected Pages | choose/manual ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-RES-04–08; NFR-06/07; OPEN-01–03 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R05 — RS-1 Editor

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R05 / RS-1 Editor |
| Route / URL | `#/researcher/manual; #/researcher/projects/:id/manual` |
| Source File | src/pages/ManualEntry.jsx; src/utils/projectStorage.js |
| User Role | researcher |
| Purpose | กรอก/แก้/บันทึกร่าง |
| Existing Features | 4 parts; Part A 19 sections; review subparts; auto working copy; budget sum; PDF |
| Buttons and Actions | Next/Back; Jump part/section; Save Draft; Review checkbox; Confirm Review |
| Input Fields | RS-1 field catalogue ด้านล่าง; confirmed |
| Displayed Information | fields,budget,part progress,save notice |
| Business Logic | saveProposal; edit draft/revision_required หรือ correction approved; ไม่มี AFFILIATION_REVIEW editor rule ที่ถูกต้อง; confirmed แล้วไป submission โดยไม่ทำ TR-03 แยก |
| Related Project States | draft,revision_required; certified correction path |
| Connected Pages | choose/upload/details/submission ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-RES-01–03/06–12/17; FR-SIG-01; TR-01–04/06 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R06 — Proposal Submission Confirmation

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R06 / Proposal Submission Confirmation |
| Route / URL | `#/researcher/submission; #/researcher/projects/:id/submission` |
| Source File | src/pages/SubmissionConfirmation.jsx; src/utils/proposalSubmission.js |
| User Role | researcher |
| Purpose | ตรวจสรุปและยืนยันยื่น |
| Existing Features | summary; proposal PDF; generic reviewed checkbox; validation; submission receipt |
| Buttons and Actions | Back; generate/download PDF; Confirm; Go My Projects |
| Input Fields | agreed checkbox |
| Displayed Information | title,leader,budget,id/workspace/result status |
| Business Logic | submitResearchProposal() generates PDF and buildProposal→unit_review; ไม่บังคับ signed RS-1/affiliation evidence/consent และไม่ไป STAFF_REVIEW ตาม TR-05 |
| Related Project States | draft/revision_required → unit_review/admin_review |
| Connected Pages | manual/projects ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-RES-13–15; FR-SIG-02–06; BR-03/04/11/12; TR-05 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R07 — Project Details

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R07 / Project Details |
| Route / URL | `#/researcher/projects/:id/details` |
| Source File | src/pages/ProjectDetail.jsx |
| User Role | researcher |
| Purpose | อ่านข้อมูลโครงการ |
| Existing Features | Information/Research/Budget tabs; generate proposal PDF; edit availability |
| Buttons and Actions | Change tab; Generate/Download PDF; Edit; Staff Record Change |
| Input Fields | tab=information/research/budget |
| Displayed Information | project ID/title/leader/affiliation/dates/budget/research text |
| Business Logic | App canRead; staff change action แสดงกว้าง; focused ซ่อน changes/documents tabs แต่ query ยังเปิดได้; reviewer เห็นข้อมูลและ PDF ข้อเสนอกว้างกว่ารายงาน |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | timeline/documents/manual/project-change-record ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-04; FR-RES-10/18; FR-ADM-02; FR-REV-03 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R08 — Project Timeline

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R08 / Project Timeline |
| Route / URL | `#/researcher/projects/:id/timeline` |
| Source File | src/pages/ProjectDetail.jsx → ProjectTimeline |
| User Role | researcher |
| Purpose | ดูสถานะและเหตุการณ์ |
| Existing Features | 9 legacy linear steps; history pagination 5 |
| Buttons and Actions | Previous/Next history |
| Input Fields | history page |
| Displayed Information | status/by/date/note |
| Business Logic | สถานะไม่ใช่ 9 State ID v1.6; history local ไม่ redact evaluator events; query page ไม่จำกัดบน |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details/documents ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-RES-18/19; FR-ADM-10; NFR-03/04 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R09 — Project Documents

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R09 / Project Documents |
| Route / URL | `#/researcher/projects/:id/documents` |
| Source File | src/pages/ProjectDocuments.jsx; src/components/DocumentPreview.jsx |
| User Role | researcher |
| Purpose | อ่านข้อเสนอ/รายงาน |
| Existing Features | Proposal/report tabs; readable report; PDF canvas pages; download |
| Buttons and Actions | Select document; Readable/PDF; Download; Reviewer next |
| Input Fields | document,format (chapter query ไม่มีการแบ่งบทจริง) |
| Displayed Information | filename; six readable sections; PDF bytes |
| Business Logic | readable paragraphs มีข้อความ/ตัวเลข hardcoded ใช้แม้โครงการไม่ใช่ demoGenerated; ไม่ได้อ่านข้อความรายงานจริง; attachment อื่นถูกรวมแต่ไม่มี picker; source file versions ไม่ครบ |
| Related Project States | ทุกสถานะเดิมเมื่อมีไฟล์ |
| Connected Pages | details/evaluation/results ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-02; FR-REV-03; FR-RES-08; NFR-02/05 |
| Implementation Status | **Mock**; local persistence/seed ไม่ใช่ production capability |

### R10 — Correction Request

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R10 / Correction Request |
| Route / URL | `#/researcher/projects/:id/correction` |
| Source File | src/pages/CorrectionRequest.jsx; src/utils/demoCorrection.js |
| User Role | researcher |
| Purpose | ขอ/อนุญาตแก้หลังรับรองแบบเดิม |
| Existing Features | pending/approved/rejected/saved; notes |
| Buttons and Actions | Researcher request/edit; Staff approve/reject |
| Input Fields | note/comment required |
| Displayed Information | request reason,state,staff comment |
| Business Logic | อนุญาต researcher แก้ RS-1 หลัง certification ผ่าน Web; ขัด FR-ADM-13 งานเปลี่ยนข้อมูลจาก e-Office ต้อง staff แก้; ไม่มี API replay action correction_* |
| Related Project States | certified legacy active ฯลฯ; state unchanged |
| Connected Pages | manual/details ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-13; OPEN-13; BR-06 (พฤติกรรมเดิมขัด) |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R11 — Closure Workspace

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R11 / Closure Workspace |
| Route / URL | `#/researcher/projects/:id/closure` |
| Source File | src/pages/ClosureWorkspace.jsx; src/utils/closure.js |
| User Role | researcher |
| Purpose | ยื่น/ตรวจ/ปิดโครงการ |
| Existing Features | role forms; PDF attachments; drafts/check/return/assign/release/final-check/complete |
| Buttons and Actions | Researcher save/submit/remove files; Staff check/assign/release/return/final verify/close |
| Input Fields | method,summary,finishedDate,publication,report/publication/support PDF; Staff checked,outcome,notes,reviewers,dueAt,close confirmation |
| Displayed Information | closure.state,files,check notes,waiting/closed message |
| Business Logic | main status closure_review ตลอดช่วงประเมิน; assign ≥1 (server1–10), local directory 1; outcome revision creates round2; final path sets revisedAfterEvaluation=true โดยไม่รับไฟล์ใหม่และ ResearcherForm locked; focused closed ซ่อน ClosureNotice/ClosedContent |
| Related Project States | active/final_report/closure_review/completed |
| Connected Pages | details/documents/results ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-CLS-01–12; FR-REV-01/08–10; TR-11–16 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R12 — Evaluation Results

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R12 / Evaluation Results |
| Route / URL | `#/researcher/projects/:id/results` |
| Source File | src/pages/EvaluationResults.jsx; src/pages/ReviewerEvaluation.jsx → EvaluationDetails |
| User Role | researcher |
| Purpose | ดูคำตอบ/ประวัติการส่ง |
| Existing Features | reviewer/round/history tabs; full answer details; feedback attachments |
| Buttons and Actions | Select reviewer/round; history; Staff continue closure |
| Input Fields | reviewer,round,view,section query (section ไม่ paginate EvaluationDetails) |
| Displayed Information | submitted answers,result,comments,attachments,history |
| Business Logic | staff all; researcher current only after feedbackReleasedAt; reviewer own rounds; no evaluation PDF generator, attachment download ไม่ใช่ generated evaluation PDF |
| Related Project States | closure_review/completed |
| Connected Pages | closure/details/evaluation ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-REV-07/09/10; FR-CLS-09; NFR-05 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### R13 — Notifications & Activity

| Field | รายละเอียด |
|---|---|
| Page ID / Name | R13 / Notifications & Activity |
| Route / URL | `#/researcher/notifications` |
| Source File | src/pages/Notifications.jsx |
| User Role | researcher |
| Purpose | ดูงาน/เหตุการณ์/ใกล้ครบกำหนด |
| Existing Features | mark all read; events pagination6; Staff queues; deadline alerts |
| Buttons and Actions | Mark All Read; Open project/queue; Previous/Next |
| Input Fields | page query |
| Displayed Information | event/status/note/time; Staff unread/loading/error |
| Business Logic | local history+role watermark; Firebase per-user notifications; local reviewer timeline events ไม่ scrub; ไม่มี email delivery/scheduler |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details/projects ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-05; FR-RES-19/20; Use Case3.8; NFR-03 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

## staff (12 views)

### S01 — Staff Dashboard

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S01 / Staff Dashboard |
| Route / URL | `#/staff/dashboard` |
| Source File | src/pages/StaffOverview.jsx |
| User Role | staff |
| Purpose | สรุปคิวเจ้าหน้าที่ |
| Existing Features | 5 cards; 5 most recently submitted; loading/error |
| Buttons and Actions | Open project/list filter |
| Input Fields | ไม่มี |
| Displayed Information | projectCode, title, leader, affiliation, submittedAt,status |
| Business Logic | matchesStaffFilter; nearDeadline 0–30 วัน; ไม่มีเกณฑ์ช่วงเตือนที่ยืนยัน |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | projects/details ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-01/08; FR-COM-03–04 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S02 — Project List

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S02 / Project List |
| Route / URL | `#/staff/projects` |
| Source File | src/pages/ProjectList.jsx; src/pages/StaffProjectList.jsx; src/components/DemoScenarios.jsx |
| User Role | staff |
| Purpose | ค้นหาและเลือกโครงการตามบทบาท |
| Existing Features | Search/status/pagination 6; examples/all; Staff search leader/titleEn + work filter |
| Buttons and Actions | Search/Clear; previous/next; open task/project |
| Input Fields | search,status,page; Staff filter/task; view=examples/all |
| Displayed Information | title,id/code,leader,status; scenario cards |
| Business Logic | canRead local owner/assignment; staff shared ใช้ canonical workspace list; examples ยังมี scenario ที่ไม่ตรง v1.6 |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details; task route เช่น staff-review/closure ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-03; FR-ADM-01/08; FR-REV-02 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S03 — Project Details

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S03 / Project Details |
| Route / URL | `#/staff/projects/:id/details` |
| Source File | src/pages/ProjectDetail.jsx |
| User Role | staff |
| Purpose | อ่านข้อมูลโครงการ |
| Existing Features | Information/Research/Budget tabs; generate proposal PDF; edit availability |
| Buttons and Actions | Change tab; Generate/Download PDF; Edit; Staff Record Change |
| Input Fields | tab=information/research/budget |
| Displayed Information | project ID/title/leader/affiliation/dates/budget/research text |
| Business Logic | App canRead; staff change action แสดงกว้าง; focused ซ่อน changes/documents tabs แต่ query ยังเปิดได้; reviewer เห็นข้อมูลและ PDF ข้อเสนอกว้างกว่ารายงาน |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | timeline/documents/manual/project-change-record ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-04; FR-RES-10/18; FR-ADM-02; FR-REV-03 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S04 — Project Timeline

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S04 / Project Timeline |
| Route / URL | `#/staff/projects/:id/timeline` |
| Source File | src/pages/ProjectDetail.jsx → ProjectTimeline |
| User Role | staff |
| Purpose | ดูสถานะและเหตุการณ์ |
| Existing Features | 9 legacy linear steps; history pagination 5 |
| Buttons and Actions | Previous/Next history |
| Input Fields | history page |
| Displayed Information | status/by/date/note |
| Business Logic | สถานะไม่ใช่ 9 State ID v1.6; history local ไม่ redact evaluator events; query page ไม่จำกัดบน |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details/documents ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-RES-18/19; FR-ADM-10; NFR-03/04 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S05 — Project Documents

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S05 / Project Documents |
| Route / URL | `#/staff/projects/:id/documents` |
| Source File | src/pages/ProjectDocuments.jsx; src/components/DocumentPreview.jsx |
| User Role | staff |
| Purpose | อ่านข้อเสนอ/รายงาน |
| Existing Features | Proposal/report tabs; readable report; PDF canvas pages; download |
| Buttons and Actions | Select document; Readable/PDF; Download; Reviewer next |
| Input Fields | document,format (chapter query ไม่มีการแบ่งบทจริง) |
| Displayed Information | filename; six readable sections; PDF bytes |
| Business Logic | readable paragraphs มีข้อความ/ตัวเลข hardcoded ใช้แม้โครงการไม่ใช่ demoGenerated; ไม่ได้อ่านข้อความรายงานจริง; attachment อื่นถูกรวมแต่ไม่มี picker; source file versions ไม่ครบ |
| Related Project States | ทุกสถานะเดิมเมื่อมีไฟล์ |
| Connected Pages | details/evaluation/results ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-02; FR-REV-03; FR-RES-08; NFR-02/05 |
| Implementation Status | **Mock**; local persistence/seed ไม่ใช่ production capability |

### S06 — Proposal Review

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S06 / Proposal Review |
| Route / URL | `#/staff/projects/:id/staff-review` |
| Source File | src/pages/ProposalReview.jsx; src/utils/projectStorage.js → updateProjectStatus |
| User Role | staff |
| Purpose | ตรวจข้อเสนอและส่งกลับ/ตรวจผ่าน |
| Existing Features | focused summary; detail/document navigation; notes; return/complete |
| Buttons and Actions | Open Details; Open RS-1; Return for Revision; Complete Review |
| Input Fields | review-notes |
| Displayed Information | title,leader,budget,status,message |
| Business Logic | เฉพาะ admin_review เปลี่ยน revision_required หรือ committee_review; เหตุผลส่งกลับ required; ไม่คง STAFF_REVIEW ตาม TR-06; signed evidence/checklist ไม่มี |
| Related Project States | admin_review/revision_required/committee_review |
| Connected Pages | details/documents/projects ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-01–05; FR-SIG-06; FR-RES-16/17; TR-06/08 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S07 — External Administrative Records

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S07 / External Administrative Records |
| Route / URL | `#/staff/projects/:id/administrative-records` |
| Source File | src/pages/AdministrativeRecords.jsx; src/utils/administrativeRecords.js |
| User Role | staff |
| Purpose | บันทึกผลจากเอกสารภายนอก |
| Existing Features | stage-specific form; history; HTTPS reference |
| Buttons and Actions | Save result & update status; details |
| Input Fields | date,responsible,letterNumber,reference,notes; unitOutcome; certification,meetingNumber/Date,outcome |
| Displayed Information | current status,history,save/error |
| Business Logic | unit→eoffice→admin; committee endorsed+certified→active; เส้นทาง legacy สร้าง extra eoffice status และ revision_required; ไม่มี API e-Office; canonical TR-09 standards criteria ไม่ครบ |
| Related Project States | unit_review,eoffice_pending,committee_review,active |
| Connected Pages | details/projects ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-06/07/11; BR-02/05/06/13; TR-09 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S08 — Project Change / Extension Record

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S08 / Project Change / Extension Record |
| Route / URL | `#/staff/projects/:id/project-change-record` |
| Source File | src/pages/ProjectChangeRecord.jsx; src/utils/projectChanges.js |
| User Role | staff |
| Purpose | บันทึกเปลี่ยนข้อมูลจากหนังสือ |
| Existing Features | 4 types; file validation; before/after history; history filter/paging |
| Buttons and Actions | Save; Clear; Download reference; details |
| Input Fields | type,title/leader/methodology newValue or endDate; letterNumber/date,reason,description,effectiveDate,PDF≤2 MB; search/filter |
| Displayed Information | project summary,before/after,operator/date/letter |
| Business Logic | applyChange updates immediately, state unchanged; blocks completed only จึง draft ก็แก้ได้; ไม่จำกัด 2 ครั้ง/6เดือน ไม่เก็บ denied outcome แยก |
| Related Project States | ทุก legacy non-completed (กว้างกว่า IN_PROGRESS) |
| Connected Pages | details/projects ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-09/13; BR-14; TR-10 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S09 — Correction Request

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S09 / Correction Request |
| Route / URL | `#/staff/projects/:id/correction` |
| Source File | src/pages/CorrectionRequest.jsx; src/utils/demoCorrection.js |
| User Role | staff |
| Purpose | ขอ/อนุญาตแก้หลังรับรองแบบเดิม |
| Existing Features | pending/approved/rejected/saved; notes |
| Buttons and Actions | Researcher request/edit; Staff approve/reject |
| Input Fields | note/comment required |
| Displayed Information | request reason,state,staff comment |
| Business Logic | อนุญาต researcher แก้ RS-1 หลัง certification ผ่าน Web; ขัด FR-ADM-13 งานเปลี่ยนข้อมูลจาก e-Office ต้อง staff แก้; ไม่มี API replay action correction_* |
| Related Project States | certified legacy active ฯลฯ; state unchanged |
| Connected Pages | manual/details ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-13; OPEN-13; BR-06 (พฤติกรรมเดิมขัด) |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S10 — Closure Workspace

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S10 / Closure Workspace |
| Route / URL | `#/staff/projects/:id/closure` |
| Source File | src/pages/ClosureWorkspace.jsx; src/utils/closure.js |
| User Role | staff |
| Purpose | ยื่น/ตรวจ/ปิดโครงการ |
| Existing Features | role forms; PDF attachments; drafts/check/return/assign/release/final-check/complete |
| Buttons and Actions | Researcher save/submit/remove files; Staff check/assign/release/return/final verify/close |
| Input Fields | method,summary,finishedDate,publication,report/publication/support PDF; Staff checked,outcome,notes,reviewers,dueAt,close confirmation |
| Displayed Information | closure.state,files,check notes,waiting/closed message |
| Business Logic | main status closure_review ตลอดช่วงประเมิน; assign ≥1 (server1–10), local directory 1; outcome revision creates round2; final path sets revisedAfterEvaluation=true โดยไม่รับไฟล์ใหม่และ ResearcherForm locked; focused closed ซ่อน ClosureNotice/ClosedContent |
| Related Project States | active/final_report/closure_review/completed |
| Connected Pages | details/documents/results ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-CLS-01–12; FR-REV-01/08–10; TR-11–16 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S11 — Evaluation Results

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S11 / Evaluation Results |
| Route / URL | `#/staff/projects/:id/results` |
| Source File | src/pages/EvaluationResults.jsx; src/pages/ReviewerEvaluation.jsx → EvaluationDetails |
| User Role | staff |
| Purpose | ดูคำตอบ/ประวัติการส่ง |
| Existing Features | reviewer/round/history tabs; full answer details; feedback attachments |
| Buttons and Actions | Select reviewer/round; history; Staff continue closure |
| Input Fields | reviewer,round,view,section query (section ไม่ paginate EvaluationDetails) |
| Displayed Information | submitted answers,result,comments,attachments,history |
| Business Logic | staff all; researcher current only after feedbackReleasedAt; reviewer own rounds; no evaluation PDF generator, attachment download ไม่ใช่ generated evaluation PDF |
| Related Project States | closure_review/completed |
| Connected Pages | closure/details/evaluation ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-REV-07/09/10; FR-CLS-09; NFR-05 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### S12 — Notifications & Activity

| Field | รายละเอียด |
|---|---|
| Page ID / Name | S12 / Notifications & Activity |
| Route / URL | `#/staff/notifications` |
| Source File | src/pages/Notifications.jsx |
| User Role | staff |
| Purpose | ดูงาน/เหตุการณ์/ใกล้ครบกำหนด |
| Existing Features | mark all read; events pagination6; Staff queues; deadline alerts |
| Buttons and Actions | Mark All Read; Open project/queue; Previous/Next |
| Input Fields | page query |
| Displayed Information | event/status/note/time; Staff unread/loading/error |
| Business Logic | local history+role watermark; Firebase per-user notifications; local reviewer timeline events ไม่ scrub; ไม่มี email delivery/scheduler |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details/projects ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-05; FR-RES-19/20; Use Case3.8; NFR-03 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

## reviewer (9 views)

### V01 — Reviewer Dashboard

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V01 / Reviewer Dashboard |
| Route / URL | `#/reviewer/dashboard` |
| Source File | src/pages/ReviewerDashboard.jsx |
| User Role | reviewer |
| Purpose | ดูงานมอบหมาย |
| Existing Features | All/Pending/Completed filters; report metadata; prior submission details |
| Buttons and Actions | Details; Evaluate |
| Input Fields | local filter |
| Displayed Information | dueAt, assigned date, result badge, reviewRound |
| Business Logic | assignedReviewers includes username; รองรับ round2 scenario ที่ขัด v1.6 |
| Related Project States | closure_review + closure.state |
| Connected Pages | projects/details/evaluation ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-REV-02/03/05/08 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### V02 — Project List

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V02 / Project List |
| Route / URL | `#/reviewer/projects` |
| Source File | src/pages/ProjectList.jsx; src/pages/StaffProjectList.jsx; src/components/DemoScenarios.jsx |
| User Role | reviewer |
| Purpose | ค้นหาและเลือกโครงการตามบทบาท |
| Existing Features | Search/status/pagination 6; examples/all; Staff search leader/titleEn + work filter |
| Buttons and Actions | Search/Clear; previous/next; open task/project |
| Input Fields | search,status,page; Staff filter/task; view=examples/all |
| Displayed Information | title,id/code,leader,status; scenario cards |
| Business Logic | canRead local owner/assignment; staff shared ใช้ canonical workspace list; examples ยังมี scenario ที่ไม่ตรง v1.6 |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details; task route เช่น staff-review/closure ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-03; FR-ADM-01/08; FR-REV-02 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### V03 — Project Details

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V03 / Project Details |
| Route / URL | `#/reviewer/projects/:id/details` |
| Source File | src/pages/ProjectDetail.jsx |
| User Role | reviewer |
| Purpose | อ่านข้อมูลโครงการ |
| Existing Features | Information/Research/Budget tabs; generate proposal PDF; edit availability |
| Buttons and Actions | Change tab; Generate/Download PDF; Edit; Staff Record Change |
| Input Fields | tab=information/research/budget |
| Displayed Information | project ID/title/leader/affiliation/dates/budget/research text |
| Business Logic | App canRead; staff change action แสดงกว้าง; focused ซ่อน changes/documents tabs แต่ query ยังเปิดได้; reviewer เห็นข้อมูลและ PDF ข้อเสนอกว้างกว่ารายงาน |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | timeline/documents/manual/project-change-record ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-04; FR-RES-10/18; FR-ADM-02; FR-REV-03 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### V04 — Project Timeline

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V04 / Project Timeline |
| Route / URL | `#/reviewer/projects/:id/timeline` |
| Source File | src/pages/ProjectDetail.jsx → ProjectTimeline |
| User Role | reviewer |
| Purpose | ดูสถานะและเหตุการณ์ |
| Existing Features | 9 legacy linear steps; history pagination 5 |
| Buttons and Actions | Previous/Next history |
| Input Fields | history page |
| Displayed Information | status/by/date/note |
| Business Logic | สถานะไม่ใช่ 9 State ID v1.6; history local ไม่ redact evaluator events; query page ไม่จำกัดบน |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details/documents ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-RES-18/19; FR-ADM-10; NFR-03/04 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### V05 — Project Documents

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V05 / Project Documents |
| Route / URL | `#/reviewer/projects/:id/documents` |
| Source File | src/pages/ProjectDocuments.jsx; src/components/DocumentPreview.jsx |
| User Role | reviewer |
| Purpose | อ่านข้อเสนอ/รายงาน |
| Existing Features | Proposal/report tabs; readable report; PDF canvas pages; download |
| Buttons and Actions | Select document; Readable/PDF; Download; Reviewer next |
| Input Fields | document,format (chapter query ไม่มีการแบ่งบทจริง) |
| Displayed Information | filename; six readable sections; PDF bytes |
| Business Logic | readable paragraphs มีข้อความ/ตัวเลข hardcoded ใช้แม้โครงการไม่ใช่ demoGenerated; ไม่ได้อ่านข้อความรายงานจริง; attachment อื่นถูกรวมแต่ไม่มี picker; source file versions ไม่ครบ |
| Related Project States | ทุกสถานะเดิมเมื่อมีไฟล์ |
| Connected Pages | details/evaluation/results ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-ADM-02; FR-REV-03; FR-RES-08; NFR-02/05 |
| Implementation Status | **Mock**; local persistence/seed ไม่ใช่ production capability |

### V06 — Evaluation Form

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V06 / Evaluation Form |
| Route / URL | `#/reviewer/projects/:id/evaluation` |
| Source File | src/pages/ReviewerEvaluation.jsx; src/utils/evaluation.js |
| User Role | reviewer |
| Purpose | กรอกผลประเมินที่มอบหมาย |
| Existing Features | 7 sections; working draft; conditional reasons; additional feedback files |
| Buttons and Actions | Change section; Save Draft; Review Answers |
| Input Fields | 4 categorical questions+detail; chapters,outputs,strengths,future,utilization,result,reason,additionalComments≤5000,documents |
| Displayed Information | report revision,round,section,error/submission state |
| Business Logic | validateEvaluation; draft partial allowed; submitted locked; awaiting_review guard; form based on stakeholder-draft-1 ยังรอ actual rubric; ไม่ใช่ numerical score form |
| Related Project States | closure_review + awaiting_review (ควร REPORT_EVALUATION) |
| Connected Pages | documents/answers/results ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-REV-04–06/08; TR-15; OPEN-11 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### V07 — Review Evaluation Answers

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V07 / Review Evaluation Answers |
| Route / URL | `#/reviewer/projects/:id/answers` |
| Source File | src/pages/ReviewerEvaluation.jsx stage=answers |
| User Role | reviewer |
| Purpose | ตรวจคำตอบก่อนส่ง |
| Existing Features | summary; validation; final confirmation |
| Buttons and Actions | Back Edit; Confirm Submit |
| Input Fields | ไม่มี input เพิ่ม; อ่าน form working draft |
| Displayed Information | EvaluationDetails ทั้งฟอร์ม แม้ส่ง focused/section props เพราะ component ไม่รับ props เหล่านั้น |
| Business Logic | review action lock avoids duplicate submitted; ใช้ draft key เดียวกับ evaluation; no status canonical REPORT_EVALUATION |
| Related Project States | closure_review + awaiting_review |
| Connected Pages | evaluation/results ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-REV-06; TR-15 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### V08 — Evaluation Results

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V08 / Evaluation Results |
| Route / URL | `#/reviewer/projects/:id/results` |
| Source File | src/pages/EvaluationResults.jsx; src/pages/ReviewerEvaluation.jsx → EvaluationDetails |
| User Role | reviewer |
| Purpose | ดูคำตอบ/ประวัติการส่ง |
| Existing Features | reviewer/round/history tabs; full answer details; feedback attachments |
| Buttons and Actions | Select reviewer/round; history; Staff continue closure |
| Input Fields | reviewer,round,view,section query (section ไม่ paginate EvaluationDetails) |
| Displayed Information | submitted answers,result,comments,attachments,history |
| Business Logic | staff all; researcher current only after feedbackReleasedAt; reviewer own rounds; no evaluation PDF generator, attachment download ไม่ใช่ generated evaluation PDF |
| Related Project States | closure_review/completed |
| Connected Pages | closure/details/evaluation ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-REV-07/09/10; FR-CLS-09; NFR-05 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

### V09 — Notifications & Activity

| Field | รายละเอียด |
|---|---|
| Page ID / Name | V09 / Notifications & Activity |
| Route / URL | `#/reviewer/notifications` |
| Source File | src/pages/Notifications.jsx |
| User Role | reviewer |
| Purpose | ดูงาน/เหตุการณ์/ใกล้ครบกำหนด |
| Existing Features | mark all read; events pagination6; Staff queues; deadline alerts |
| Buttons and Actions | Mark All Read; Open project/queue; Previous/Next |
| Input Fields | page query |
| Displayed Information | event/status/note/time; Staff unread/loading/error |
| Business Logic | local history+role watermark; Firebase per-user notifications; local reviewer timeline events ไม่ scrub; ไม่มี email delivery/scheduler |
| Related Project States | ทุกสถานะเดิม |
| Connected Pages | details/projects ภายใต้ role เดียวกัน; global Back/Breadcrumb ไป Dashboard/Projects |
| Requirement References | FR-COM-05; FR-RES-19/20; Use Case3.8; NFR-03 |
| Implementation Status | **Partial**; local persistence/seed ไม่ใช่ production capability |

## Route variants และเส้นทางที่ไม่ควรนับเป็นหน้าธุรกิจเพิ่ม

| Variant | สิ่งที่ render จริง / ข้อจำกัด |
|---|---|
| #/staff/staff-review | ProjectList target=staff-review กรอง admin_review/revision_required/committee_review แล้วเปิด S06 |
| #/staff/closure | ProjectList target=closure กรอง active/final_report/closure_review/completed แล้วเปิด S10 |
| #/staff/administrative-records | ProjectList target=administrative-records กรอง unit_review/eoffice_pending/committee_review/active แล้วเปิด S07 |
| #/{role}/{project-view} โดยไม่มี ID | showList สร้าง ProjectList selector สำหรับ details/timeline/documents/correction/results ฯลฯ; บาง target ไม่กรอง eligibility จึงไม่ถือว่า workflow ถูกต้อง |
| #/reviewer/projects/:id/closure | App ไม่ restrict แต่ส่ง mode=researcher; ClosureWorkspace.allowed ปฏิเสธ reviewer ไม่ใช่ Reviewer Closure page |
| #/reviewer/projects/:id/correction | App ไม่ restrict; CorrectionRequest แสดงฟอร์ม researcher เมื่อ !staff; reducer ปฏิเสธ request แต่ปุ่ม Edit เมื่อ approved เรียก callback ได้ก่อน Manual route ปฏิเสธ เป็น unsupported/unsafe UI surface ไม่ใช่บทบาทใหม่ |
| role ที่ไม่มีสิทธิ์กับ staff-review/admin/change/evaluation/answers/manual/submission/choose/upload | App restricted แสดงข้อความ ไม่ใช่ฟังก์ชันของบทบาทนั้น |
| #/{role}/projects/:id/{global-page} | parser ยอมรับ แต่เป็น URL ที่ไม่ใช่ canonical; dashboard/projects/choose/upload/notifications ไม่ควรมี project ID |
| alias ใน App.go | staff-dashboard/reviewer-dashboard → dashboard; active-project-detail/closed-project-detail/project-detail → details; project-closure/closure-document-check → closure; final-report-review → projects. เป็น internal callback aliases ไม่ใช่ parser รองรับ URL เก่าอัตโนมัติ |
| unknown role / unknown page | DemoEntry กลับ role selector เมื่อ role ว่าง; FirebaseGate บังคับ role บัญชี; valid role + unknown page จึงแสดง C03 |

## Tabs, Forms, Modals และ Components (ไม่นับหน้า)

| Surface | อยู่ที่ | รายละเอียด / การเข้าถึง |
|---|---|---|
| Detail tabs | ProjectDetail | information/research/budget แสดงใน focused; changes/documents ซ่อนใน nav แต่ query.tab ยัง render ได้ |
| RS-1 parts | ManualEntry | Overview, A (19 หัวข้อ), B, C; review tabs เป็น state ภายใน ไม่มี URL แยก |
| Evaluation sections | ReviewerEvaluation | 7 query.section; answers ใช้ route จริงแยก แต่ section ไม่ใช่ 7 หน้า |
| EvaluationDetails | ReviewerEvaluation | component รับ evaluation/preview เท่านั้น; focused/section/onSection ที่ผู้เรียกส่งไม่มีผล จึงแสดงทั้งฟอร์ม |
| Document type/format | ProjectDocuments | proposal/report + readable/pdf และ PDF page controls; ไม่สร้าง route ใหม่ |
| Notification/project pagination | Notifications/ProjectList | query.page และ query.history เปลี่ยนข้อมูลในหน้าเดิม |
| Native confirm | demoRouter/navigationGuard/DemoEntry | unsaved changes, reset confirm; ไม่ใช่ route/modal page |
| Account dropdown | Header | EN/TH, identity, sign out/choose role; escape/outside click |
| Closure subforms | ClosureWorkspace | ResearcherForm/StaffForm/FinalVerification, stage state เปลี่ยน form; ไม่ใช่หน้าสถานะใหม่ |
| ClosureNotice/ClosedContent | ClosureWorkspace | มี implementation ใน non-focused branch แต่ App ส่ง focused เสมอ จึงไม่ได้เปิดใน current closure route |
| RegistryEditor/StatusEditor | StaffRegistry | inline editors ไม่ใช่ modal route; parent legacy StaffDashboard ไม่ได้ mount ใน App |
| ReviewerDemoPreview | components | preview ใน memory ไม่ส่ง backend และไม่ mount ใน current Dashboard |
| PDF preview | DocumentPreview | canvas + local blob download มีการ parse bytes จริง ไม่ใช่ภาพ mock แต่ข้อมูล seed เป็น mock |
| ErrorBoundary | main wrapper | reload/error fallback component ไม่ใช่ route |
| Empty components | StatusBadge, SummaryCard, ProjectTable, LanguageSwitcher | ไฟล์ว่าง ไม่ใช่หน้าที่ใช้งาน |

## Field catalogue ของ RS-1 Editor (R05)

Overview: projectTitle, projectTitleEn, strategy. Part A: leaderName/Affiliation/Phone/Email/Percent, participants; advisorName/Qualification/Position/Affiliation; cooperationName/Affiliation/Address/Type; researchType, keywords, background, objectives, literature, references, methodology, scope; startDate,endDate,workPlan,progress; outcomeType,outcomeDetail,integration,publicationLevel; compensationDetail/compensation,directDetail/directCost,materialsDetail/materials,utilityDetail/utility; standards,clarifications,advisorSignature,advisorSignDate,leaderSignature,leaderSignDate,teamSignatures. Part B: bioName, bioPosition, bioResearchId, bioEducation, bioExperience, bioExpertise, bioPublications, bioPresentations, bioIP, bioManagement, bioCompleted, bioOngoing. Part C: reviewer1–3 Name/Position/Affiliation/Email. ชื่อผู้ลงนามเป็นข้อความ ไม่ใช่ signed file หรือหลักฐาน consent

## Legacy implementations (ไม่นับเป็น Current Route)

| Source | สิ่งที่มีจริงใน code | Current mapping / เหตุผลไม่นับ |
|---|---|---|
| src/pages/Dashboard.jsx | researcher banner, 5 cards, showcase, released feedback, deadlines | App ใช้ RoleOverview แทน |
| src/pages/MyProjects.jsx | search/status/year/pagination table | App ใช้ ProjectList |
| src/pages/StaffDashboard.jsx | registry, AdvisorShowcase, charts, filters, workflow overview | App ใช้ StaffOverview; Registry UI จึงไม่มี current route |
| src/pages/ActiveProjectDetail.jsx | time progress, 4 tabs, legacy timeline; plan tab placeholder | App ใช้ ProjectDetail; internal alias map ไป details |
| src/components/AdvisorShowcase.jsx, WorkQueue.jsx, ReviewerSteps.jsx, ReviewerDemoPreview.jsx | summaries, action queues, training steps and preview | ไม่พบการ mount จาก current App page tree; อย่านับเป็นหน้าที่เปิดได้ |

ที่มี code แต่ไม่มี current route ต้องใช้สถานะ **Not Implemented ใน current navigation** หรือ **Partial / unreachable** ตามฟังก์ชัน ห้ามนำไปกล่าวว่ามีหน้าทะเบียนเต็มรูปแบบแล้ว

