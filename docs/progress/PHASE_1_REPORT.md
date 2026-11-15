# Phase 1 Report — Common & Shared Pages

Project: Personal Research Grant Management System for Mae Fah Luang University · 404 Team Found  
Target: v1.6 · วันที่ 15 November 2026 · สถานะ: ส่งตรวจ Phase 1 และหยุดก่อน Phase 2

## 1. ขอบเขตและหลักฐานก่อนเริ่ม

ตรวจ AGENTS.md, Requirements/Workflow/User Flow/Use Case Diagram/Use Case Specification/State Transition Diagram ใน `C:/Users/User/Downloads/เอกสารความต้องการ/` ซึ่งระบุ v1.6 วันที่ 14 November 2026 พร้อม audit ทั้งหกไฟล์และ PHASE_0_REPORT.md โดยเทียบกับ implementation จริงและรันทดสอบก่อนพัฒนา ไม่ใช้รายงาน Phase 0 แทนหลักฐานโค้ด

Requirements หลักคือ `requirement (1).md` และเอกสารอีกห้าประเภทตาม paths ใน AGENTS.md; paths ยังถูกต้อง ไม่สลับไปใช้ Downloads/requirement.md อีกฉบับ ข้อกำหนด DESIGN/OPEN ยังมีสถานะตามเอกสารเดิม การเลือก palette, routes และ components ด้านล่างเป็น implementation/design ตามคำสั่ง Phase 1 ไม่ใช่ประกาศว่า Stakeholder ปิด OPEN แล้ว

Baseline ของงานนี้: Phase 0 มี 9 states/TR-01–TR-17, pure action contract, capabilities, guarded Firebase execute endpoint, fixtures และ dry-run แต่ UI เดิมยังเป็น legacy. ก่อนเพิ่ม tests ใหม่ รัน regression ผ่าน 84/84 จริง งานที่มีอยู่ก่อน Phase 1 ใน working tree ได้รับการรักษา ไม่ย้อน App/layout/auth/staff/locale/backend changes เดิม

ดำเนินการเฉพาะ common UI, read adapters, local fictional reset และ tests ที่จำเป็น ไม่เปลี่ยน TR, Backend contract, Firestore/Storage rules, role-specific reducers, Database หรือ API ใน Phase นี้ ไม่ deploy ไม่อ่าน/seed/migrate Firebase จริง

## 2. Completed Pages

คำว่า Completed ในตารางหมายถึงขอบเขต Common & Shared Pages ของ Phase 1 ไม่ใช่ role-specific workflow ทั้งระบบ

| Page ID / Page | ผลที่ทำได้ | ข้อจำกัดที่ระบุใน UI |
|---|---|---|
| N-C01 Demo Scenario Entry | 3 roles, reviewer personas 1/2/3 ใน role เดียว, TH/EN, fictional/local simulation banner, v1.6 เป็นค่าเริ่มต้น, เลือก Legacy ได้อย่างมีป้ายชัดเจน, native confirmation dialog ก่อน reset | reset เฉพาะ fictional namespace v1.6 และ read markers ของ 5 demo identities; ไม่ reset legacy/private drafts/Firebase; malformed namespace ไม่ถูกลบ |
| N-C02 Sign In | Email/password, disabled/loading fieldset, auth error, server-profile Access Denied, ใช้บัญชีอื่น, retry, profile loading timeout, responsive layout | ใช้ Firebase Auth เดิมและ active role/workspace จาก users profile; ไม่มี registration หรือ role picker; ไม่สร้างบัญชีจริง |
| N-C03 Not Found / Access Denied | Page Not Found, Project not found or access denied, missing project context, role-restricted route, project loading/error/retry, back to dashboard | รวม missing/forbidden project message เพื่อไม่ยืนยันการมีอยู่ของโครงการที่เปิดไม่ได้; FirebaseGate ใช้ server profile ตามเดิม |
| N-X01 Project Overview | Project/researcher/research/budget/dates/status, recorded timeline, permitted document count, next required action ตาม capability, change/extension counts, closure/cancellation summary | ปุ่ม workflow เฉพาะบทบาทของ canonical v1.6 ปิดพร้อมข้อความ pending later phase; ไม่ส่ง canonical records เข้า legacy reducers; ไม่มี dropdown เปลี่ยนสถานะ |
| N-X02 Document Library | รายการทุก permitted document, kind/name/version/upload date/uploader, เลือก PDF จริง, canvas preview, download หลังตรวจ bytes, loading/error/retry | metadata ที่ไม่มีในข้อมูลเดิมแสดง —; ไฟล์ที่ไม่ hydrate/bytes ไม่ใช่ PDF แสดง unavailable; ไม่สร้างผลประเมิน PDF ใหม่ใน Phase นี้ |
| N-X03 Activity & History | event, previous/new state, actor/role/time/reason, recorded version/TR, permitted details before/after และ external record references | non-staff ได้เฉพาะ projected history; ไม่แต่งข้อมูลที่หายไปหรือเขียนทับประวัติเก่า; JSON details ใช้เฉพาะข้อมูลที่ผ่าน projection |
| N-X04 Notifications & Tasks | unread indicator, individual/all read, action-required links, in-app status events, recorded deadlines, related-project links, loading/error/success | ระบุไม่มี email sender; แสดงวันสิ้นสุดที่บันทึกโดยไม่ตั้ง cadence/near-deadline threshold ใหม่; legacy task derivation ยังไม่ migrate เป็น canonical capabilities |
| Shared landing/list | dashboard และ project list แบบอ่านข้อมูลตามสิทธิ์, search/status filter, เปิด contextual project shell | ใช้รายการพื้นฐานสำหรับเชื่อม Common Pages; role-specific dashboard/work queues จะพัฒนาตาม Phase ที่ได้รับมอบหมาย |

สถานะ CANCELLED แสดงแยกจาก CLOSED และไม่แสดงว่าเข้าสู่เส้นทางปิดโครงการ Timeline ใช้สถานะจากเหตุการณ์ที่มีจริง ไม่เติมขั้น REPORT_EVALUATION ให้เส้นทางผลงานเผยแพร่ ตัวอย่าง AFFILIATION/CANCELLED ยังคงมีคำเตือน synthetic setup ที่ไม่ได้ execute OPEN transitions

## 3. Shared Design System และ Layout

- Palette: wine primary `#791f35`, background `#f5f6f8` / entry `#f2f4f7`, text `#263244`, เส้นขอบ `#dce1e8`; badge มีทั้งข้อความและ State ID ไม่ใช้สีสื่อความหมายเพียงอย่างเดียว
- Typography ใช้ local/system Thai-capable font stack เดิมร่วมกับมาตรฐาน headings/body; ไม่เพิ่ม external font request
- Spacing tokens 4/8/12/16/24/32px, card radius 12px, controls มีพื้นที่กดอย่างน้อย 44px, keyboard focus outline ชัดเจน
- Shared card/table/form/button/badge/feedback/dialog styles; native modal มี focus trap/escape และคืน focus กลับ trigger; default focus อยู่ Cancel
- Header ใช้ displayName/identity, role, TH/EN, account menu, unread count และ sign out/choose role; shared Firebase sign out เคารพ unsaved guard
- Sidebar มีเฉพาะ Dashboard, Projects, Notifications และ New Proposal สำหรับ Researcher; staff review/closure/external records เข้าจาก project context ไม่เป็น global main menus
- Breadcrumb, Back, project Overview/Documents/History navigation ใช้ hash router เดิมและ browser history; รักษา navigation guard และ working draft เดิม
- Desktop sidebar, Tablet layout และ Mobile navigation ปรับตาม viewport; table scroll อยู่ใน container; ไม่ซ่อน page overflow เพื่อกลบปัญหา layout

## 4. Modified Components / Files

| ไฟล์ | งานที่แก้ใน Phase 1 |
|---|---|
| AGENTS.md | บันทึก authorization/จุดหยุด Phase 1 และ fictional reset boundary; รักษากฎเดิม |
| src/App.jsx | เลือก SharedWorkspace สำหรับ common routes/canonical local data; guard ไม่ให้ canonical records ใช้ legacy workflow screens; รักษา role-specific renderers เดิม |
| src/components/DemoEntry.jsx | Scenario entry, default v1.6, reviewer personas, explicit Legacy selection, confined reset confirmation/error/success |
| src/components/FirebaseGate.jsx | loading/denied/retry feedback, 15s technical profile-load timeout และ cleanup; รักษา Firebase Auth/profile subscription |
| src/components/Header.jsx | identity/unread count และ unsaved sign-out guard |
| src/components/Sidebar.jsx | role navigation จาก shared policy; ถอด context-specific global menus |
| src/components/DocumentPreview.jsx | Retry สำหรับโหลด PDF ล้มเหลว; คง actual-byte fetch/PDF.js/download |
| src/pages/ProjectDocuments.jsx | แทน fabricated Readable Report ด้วย permitted real-file library; แสดง metadata ทุกชนิด/เวอร์ชันที่มีสิทธิ์ |
| src/utils/foundationStore.js | explicit reset เฉพาะ fictional v1.6 namespace/read markers; ตรวจข้อมูลก่อน overwrite และไม่ migrate |
| package.json | เพิ่ม test:phase1:browser และ test:phase1:auth โดยไม่เพิ่ม dependency |

ไฟล์ backend/domain/rules ที่ git status แสดงว่า modified/untracked หลายรายการเป็นงาน Phase 0 หรือมีอยู่ก่อนแล้ว ไม่ใช่การแก้ Backend ใหม่ใน Phase นี้ `npm test` ใช้ pretest sync script เดิม; server-copy parity ยังคงผ่าน

## 5. New Components / Files

| ไฟล์ | หน้าที่ |
|---|---|
| src/shared.css | design tokens/layout/forms/tables/badges/modal/feedback/responsive overrides |
| src/components/SharedWorkspace.jsx | protected shared shell, common loading/error routing, project list/overview/documents/history/notifications integration |
| src/components/SharedFeedback.jsx | Feedback และ ConfirmationModal |
| src/components/ProjectStateBadge.jsx | bilingual labels + original State ID |
| src/pages/SharedProjectOverview.jsx | N-X01 read-only role-aware overview และ capability hints |
| src/pages/ActivityHistory.jsx | N-X03 projected historical events/external records |
| src/pages/NotificationsTasks.jsx | N-X04 task/deadline/in-app notification read state |
| src/utils/commonWorkspace.js | role routes/navigation, role-scoped views/documents, safe actual PDF URL, timeline/actions/notifications helpers |
| tests/commonWorkspace.test.js | 6 tests สำหรับ permissions/9 states/files/no mutation/history/notifications/reset |
| tests/phase1.browser.mjs | isolated local Chrome walkthrough + screenshots |
| tests/phase1.auth.browser.mjs | Auth/Firestore-emulator-only Chrome walkthrough และ server-profile role checks |
| docs/progress/screenshots/phase1-*.png | 8 screenshots ที่สร้างจาก Browser จริง |

## 6. Routes

ใช้ existing hash route contract ไม่สร้าง router ซ้ำ; `{role}` คือ researcher/staff/reviewer

| หน้า | URL |
|---|---|
| Demo Scenario Entry | `#/roles` เฉพาะ local build |
| Sign In | Firebase build เมื่อยังไม่มี authorized session; ไม่แสดง local role picker |
| Shared landing | `#/{role}/dashboard` |
| Scoped project list | `#/{role}/projects?search=...&status=...` — status เป็น filter เท่านั้น |
| Project Overview | `#/{role}/projects/{projectId}/details` |
| Document Library | `#/{role}/projects/{projectId}/documents?document={documentId}` |
| Activity & History | `#/{role}/projects/{projectId}/timeline` |
| Notifications & Tasks | `#/{role}/notifications` |
| Error states | แสดง inline สำหรับ unknown route/missing context/loading failure/denied; ไม่เผย project title หรือเอกสารที่ไม่มีสิทธิ์ |

Canonical contextual workflow links ยังไม่ execute ใน Phase 1; role-only direct URLs ถูกปฏิเสธ และหน้าที่ยังไม่มีแสดง pending ตาม scope แทนการ fallback ไปฟอร์ม legacy สำหรับ canonical project. Legacy ชุดแยกยังเปิดฟอร์มเดิมผ่าน Project Overview เพื่อรักษางานเดิม ไม่ถือเป็น v1.6 workflow implementation

## 7. Permissions / Data Boundaries

| สิ่งที่อ่าน/ทำ | Researcher | Staff | Expert Reviewer |
|---|---|---|---|
| Project list/detail/history | Own + workspace | workspace scope | assigned + workspace |
| Documents | own permitted files; feedback หลัง release | permitted scoped files | assigned report IDs / own referenced feedback ตาม Phase 0 contract |
| Evaluations | projected submitted/released only | existing authorized staff view | own only |
| Notification read marker (local) | workspace + UID | workspace + UID | แยก reviewer UID 1/2/3 |
| Project mutation ใน Common Pages | ไม่มี | ไม่มี | ไม่มี |
| Main navigation | Dashboard/Projects/New Proposal/Notifications | Dashboard/Projects/Notifications | Dashboard/Projects/Notifications |

Local role/persona selection เป็น simulation ไม่ใช่ Authentication หรือ Backend authorization ข้อมูลตัวอย่างทั้งหมดอยู่ browser namespace เท่านั้น Firebase mode ยังคงใช้ verified session, server profile, private views และ existing rules/API guards ไม่เชื่อ role จาก URL

Canonical helpers reuse projectProjection/hasCapability จาก Phase 0, filter อีกครั้งก่อน render; legacy compatibility views ตัด evaluation archives/snapshots/registry/private reviewer context ที่ไม่ควรแสดง ไม่อ้างว่า frontend projection แทน Backend guards ได้

Document Library ไม่รับ arbitrary http/javascript/public URLs มา preview ใช้ hydrated PDF data ที่ขึ้นต้น `%PDF-` เท่านั้น PDF.js ตรวจ parse/render อีกชั้น ก่อนมี blob download link ไม่มี fabricated report paragraphs ไม่มีการสร้าง PDF จากเนื้อหาที่แต่งให้โครงการจริง การอ่านทุกหน้า/preview/download ไม่เรียก command หรือ append audit

Reset ตรวจ namespace schemaVersion/fictional/simulationOnly/workspace ก่อนเขียนเฉพาะ `mfu-foundation-v16-demo-projects` และล้าง known local read markers ของ demo identities เท่านั้น ถ้า JSON เสีย/เป็นข้อมูลไม่รู้จักจะเก็บไว้และแจ้ง error ไม่กวาดลบ localStorage ไม่ clear private drafts หรือ legacy keys

## 8. Requirement References / Traceability

| หน้าหรือส่วนงาน | Requirement / Workflow | หลักฐานทดสอบ |
|---|---|---|
| Entry/Auth/role navigation/access errors | FR-COM-01–03, NFR-01/02/10; User Flow login → scoped list | Local 3 roles + 3 personas; Auth server profile, invalid password/unprovisioned/role URL |
| Project Overview | FR-COM-04, FR-RES-18, FR-CLS-11/12, FR-CAN-02; 9 states | all-nine display, owner/workspace/assignment tests, two terminal states |
| Documents | FR-COM-02, FR-REV-02/03, NFR-02/05/07; read-only across TR-01–17 | permitted actual PDF preview/download, no arbitrary URLs, no project/history mutation |
| Activity/History | FR-COM-05, FR-RES-19, FR-ADM-10/13, NFR-03 | original event preservation, restricted details, publication/cancellation timeline |
| Notifications/Tasks | FR-RES-20, FR-ADM-09; Workflow notification side events; OPEN-10 | read markers scoped per identity, one/all read, visible-project links, no email claim/cadence |
| Layout/feedback/i18n/navigation | NFR-08/09/11 | 1440×1000, 820×1180, 390×844; TH/EN, Back/Forward, real unsaved draft and sign-out guard |
| Pending transition actions | TR-03/07/17, OPEN-04/05/20; Phase 0 contracts | ไม่เปิดหรือแก้ transitions; Phase 0 regression tests ยังคงผ่าน |

Common Pages ไม่มี state-changing transition ใหม่ State IDs/BR/TR เดิมไม่ถูกเพิ่มหรือลบ status dropdown ใน project list เป็น search filter ไม่ใช่ generic mutation selector

## 9. Testing Results

| Check | ผลล่าสุด | ขอบเขต/ข้อจำกัด |
|---|---|---|
| ก่อนแก้: npm test | PASS 84/84 | ตรวจฐาน Phase 0 จาก code จริง ไม่อ้างรายงานอย่างเดียว |
| หลังแก้: npm test | PASS 90/90, 0 fail/skip | 84 regression + 6 common tests รวม server-byte parity |
| npm run lint | PASS | source, scripts และ tests; generated dist ไม่ใช่ source ที่ตรวจ |
| npm run build | PASS | local production bundle; ไม่ deploy |
| npx vite build --mode firebase --outDir dist/firebase-phase1 | PASS | Firebase-mode bundle; ไม่ deploy; default build อาจล้าง generated dist นี้ในรอบถัดไป |
| npm run test:phase1:browser | PASS 44 checks | roles/personas, permissions/files/9 states, real canvas PDF, unchanged project/history, search routing, missing/denied routes, Back/Forward, unsaved draft, reset cancel/confirm/confinement, notifications, mobile/tablet/English, invalid storage retry; no external requests |
| npm run test:phase1:auth | PASS 16 checks | local Auth/Firestore emulators, 3 server-profile roles, 14/14/6 visible records, URL role override, invalid password, loading disabled form, denied unprovisioned profile, sign-out unsaved guard, mobile login; no external requests |
| git diff --check | PASS | มีเฉพาะคำเตือน LF/CRLF ของ working tree ไม่มี whitespace error |

Browser ใช้ Chrome แบบ headless และ isolated context ไม่ใช้ session ส่วนตัวของผู้ใช้ Scripts ใช้ Vite envDir แยกจาก real .env และ Auth script assert emulator hosts/project `demo-mfu-secure` ก่อน Admin setup ทุกครั้ง ไม่เรียก production Firebase. ต้องกำหนด `MFU_PLAYWRIGHT_MODULE` ให้ตรง runtime ที่มี Playwright ในเครื่อง (ไม่เพิ่ม package ใน repository) และใช้ Java/emulator cache ตาม setup เดิม

การรัน browser ใน sandbox รอบแรกถูก localhost network restriction; หลังอนุญาต local execution จึงรันผ่าน ไม่ใช่ผลล้มเหลวของ UI รอบทดสอบพบและแก้จริง: notification IDs ของ cloned fixtures ซ้ำและ staff local feed แสดงผู้รับคนอื่น, mobile sidebar padding/overflow และปุ่มเลือก Demo ที่รับ style เก่าใหญ่เกินไป; เพิ่ม scoped notification regression test และตรวจ screenshot ซ้ำ ไม่ปิด lint/assertions เพื่อหลบปัญหา

ไม่ได้รัน deployment/production UAT, email delivery, accessibility audit ด้วยผู้ใช้จริง หรือ browser engine อื่น ไม่ตีความ NFR targets ที่รอยืนยันว่าได้ผ่านเกณฑ์ Stakeholder แล้ว Backend HTTP/Storage emulator counts ของ Phase 0 ไม่ถูกนำมานับเป็นการทดสอบใหม่ใน Phase 1 เพราะไม่มี backend/rules change

## 10. Screenshots

| ภาพ | ไฟล์ |
|---|---|
| Demo entry / Desktop | [phase1-entry-desktop.png](screenshots/phase1-entry-desktop.png) |
| Sign In / Desktop | [phase1-signin-desktop.png](screenshots/phase1-signin-desktop.png) |
| Sign In / Mobile | [phase1-signin-mobile.png](screenshots/phase1-signin-mobile.png) |
| CANCELLED overview / Desktop | [phase1-cancelled-desktop.png](screenshots/phase1-cancelled-desktop.png) |
| Actual PDF library / Desktop | [phase1-documents-desktop.png](screenshots/phase1-documents-desktop.png) |
| Notifications / Desktop | [phase1-notifications-desktop.png](screenshots/phase1-notifications-desktop.png) |
| Assigned reviewer overview / Mobile | [phase1-overview-mobile.png](screenshots/phase1-overview-mobile.png) |
| Assigned reviewer overview / Tablet | [phase1-overview-tablet.png](screenshots/phase1-overview-tablet.png) |

## 11. Known Issues / Pending Requirements

1. Canonical role-specific proposal/submission/check/extension/assignment/evaluation/release/revised-report/closure screens ยัง pending ตาม scope ปุ่มใน Overview อธิบายข้อจำกัดชัดเจน ไม่ใช้ legacy mutation แทน ไม่กล่าวว่าทำ workflow ทั้งระบบครบแล้ว
2. Local Legacy dataset แยกไว้เพื่อรักษาข้อมูล/ร่าง/ฟอร์มเดิม พฤติกรรมหลายรอบและสถานะเก่าของ compatibility layer ยังไม่ใช่ v1.6; ไม่มี automatic migration และไม่มีการแก้ย้อนหลังให้เหมือนผ่านหนึ่งรอบ
3. Deadline section แสดง recorded date เท่านั้น Email service และ reminder cadence/calendar policy ยังไม่ implement/ไม่อ้างว่าได้ส่งจริง (OPEN-10)
4. TR-03/TR-07/cancellation authorization และ OPEN อื่นยังปิด/รอยืนยันเช่น Phase 0 ไม่เปิดสิทธิ์หรือสร้าง requirement ใหม่
5. Evaluation PDF renderer/combined PDF/retention และ download หลัง CLOSED ที่ยัง OPEN ไม่ได้พัฒนาใน Phase 1; Document Library แสดงไฟล์ที่มีจริงตาม permission เท่านั้น
6. Metadata ของ legacy attachments/history บางรายการไม่มี version/uploader/time; แสดง — ไม่แต่งหรือเขียนกลับข้อมูล
7. Build ยังมี chunk >500kB warning ของแอป/PDF dependencies ไม่ใช่ build failure; ยังไม่รับรอง performance target (NFR-12 OPEN)
8. Automated Browser ครอบคลุม Chrome/3 viewport ที่ระบุ ไม่ใช่ผล usability study หรือการรับรอง accessibility ทั้งหมด; profile-load timeout recovery มี implementation แต่ยังไม่ได้จำลอง network failure ทุกรูปแบบ
9. Role-specific dashboard/advanced queue/filter และ legacy task migration ไม่ถูกขยายใน Phase นี้ Shared dashboard/list ทำหน้าที่พาไป common project context; search ใช้ URL และ status filter เป็น read-only

## 12. จุดหยุด

จบงาน Phase 1 เฉพาะขอบเขตนี้ ส่งรายงานและ screenshots ให้ผู้ใช้ตรวจ ไม่มี deploy ไม่มีการเปลี่ยน Firebase จริง ไม่มี migration apply และไม่เริ่ม Phase 2 จนกว่าผู้ใช้จะสั่ง
