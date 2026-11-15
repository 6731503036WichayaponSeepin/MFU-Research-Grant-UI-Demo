# Phase 3.1 — Global UI Theme Redesign

Personal Research Grant Management System — MFU / 404 Team Found

Target v1.6 | 15 November 2026 | UI only — หยุดก่อน Phase 4

## ผลงาน

ปรับจาก Sidebar สีเข้มและ CSS หลายธีมเป็น Minimal Academic Dashboard: Sidebar ขาว, active menu แดงอ่อน, พื้นหลังเทาอ่อน, Cards ขาวขอบบาง, ปุ่มเรียบ, typography ไทย/อังกฤษอ่านง่าย และ status pills มีทั้งชื่อและ State ID

สร้าง [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) และ `src/theme.css` เป็นมาตรฐานร่วมสำหรับ Common, Shared, Researcher, Staff และ Existing Reviewer pages โหลดหลัง Entry styles ใน `src/main.jsx` ทั้ง Local/Firebase ปรับ AGENTS.md ให้ทุก Phase อ่าน Design System ก่อนแก้ UI

อ่านบริบทจาก AGENTS.md, เอกสารหกประเภท v1.6 ใน `C:/Users/User/Downloads/เอกสารความต้องการ/`, Audit หกไฟล์และรายงาน Phase 0–3; งาน Phase 3 มีหลักฐาน tests และรายงานก่อนเริ่มงานนี้ อ้าง FR-COM-01–05, FR-ADM-01/08/10, FR-REV-02/03 และ NFR ด้าน usability/security ตามขอบเขต UI ไม่เพิ่ม AC หรือ policy ใหม่

ภาพอ้างอิงผู้ใช้ยืนยันอยู่ใน `C:/Users/User/Downloads/Visual Reference 2 ภาพ/` เปิดดูทั้งสองภาพจริง: `904605401_3219330818276754_3027190073537019723_n.png` และ `910287609_2168577730419208_2221517785768663943_n.png` ใช้ visual hierarchy/white sidebar/thin cards/soft badges/timeline เท่านั้น ไม่คัดลอกตัวเลข เมนูหรือสถานะจากภาพ

## Updated Pages / Components

| พื้นที่ | การปรับ |
|---|---|
| Demo Entry / Sign In | พื้นเทาอ่อน, card ขอบบาง, radius และ controls ตามธีมกลาง; รักษา Authentication/role selection boundaries |
| Header / Sidebar | Sidebar ขาว, role indicator, account identity ที่ด้านล่าง, เมนู Reviewer ใช้ชื่อ Reviewer Dashboard/Assigned Reviews; labels ของบทบาทอื่นคงเดิม, notification/account/language handlers เดิม |
| Researcher Dashboard / Registry | Summary cards, rows, filters, buttons และพื้นที่ว่าง; ใช้ยอด/ลิงก์เดิม |
| Staff Dashboard / Registry | 11 queues เดิม, cards มี semantic accents เบา, tables/filters/pagination มาตรฐานเดียวกัน |
| Existing Reviewer Dashboard | Summary card งานที่ได้รับสิทธิ์จาก `visible.length` เชื่อม Projects route เดิม พร้อมรายการ/filters เดิม ไม่สร้าง Reviewer workflow Phase 4 |
| Project Overview / Details | Cards, fields, headings และ recorded timeline แบบ nodes; ใช้ `timelineStates` เดิม ไม่มีการบังคับทุกโครงการผ่านการประเมิน |
| Researcher Editor / Submission / Closure | ปุ่ม, input, section cards และ file controls ผ่าน shared visual layer; validation/working copies/handlers เดิม |
| Staff N-S03–N-S10 | Forms, confirmations, evidence links, tables และ disabled actions ใช้รูปแบบเดียวกัน |
| Documents / History / Notifications / Feedback | Shared cards, actual PDF viewer surroundings, timeline, notice/error/loading feedback และ actions ตามธีม; ไม่สร้าง Readable Report หรือข้อมูลปลอม |

ไม่สร้าง React components ซ้ำกับสิ่งที่มีอยู่ ตาราง mapping PageHeader, SummaryCard, StatusBadge, DataTable, FilterBar, SearchInput, Buttons, DocumentCard, Timelines, ConfirmationModal, Feedback states, TaskCard, Pagination, FormSection และ FileUpload อยู่ใน Design System

## Modified Files

- `src/theme.css` — centralized tokens, typography, shell, shared component styles และ responsive/reduced-motion rules
- `src/main.jsx` — โหลด common theme หลัง Entry styles
- `src/components/Sidebar.jsx` — role/account presentation และ Reviewer labels
- `src/App.jsx`, `src/components/SharedWorkspace.jsx` — ส่ง currentUser ที่มีอยู่ให้ Sidebar; Reviewer summary ใช้ scoped visible records เดิม
- `public/fonts/NotoSansThai-Variable.ttf`, `public/fonts/NotoSansThai-OFL.txt` — font แบบ local พร้อม license จาก Google Fonts repository ไม่มี runtime network request
- `tests/phase31.browser.mjs` — before/after screenshots, responsive/white sidebar/mobile width, keyboard focus และ unchanged local records checks
- `AGENTS.md`, `docs/design/DESIGN_SYSTEM.md`, รายงานนี้ และ screenshots

ไม่มีการแก้ Domain, API contract, Backend authorization, Database schema, Roles, Transition Rules, fixture data หรือ Firebase records ใน Phase นี้ Root git status มีงาน Phase ก่อนหน้าที่ยังไม่ commit จึงไม่ใช่รายการเปลี่ยนทั้งหมดของ Phase 3.1

## Testing Results

| Check | Result |
|---|---|
| npm test | PASS 104/104 |
| npm run lint | PASS |
| npm run build | PASS |
| Firebase-mode Vite build | PASS; ไม่ Deploy |
| Phase 3.1 before browser | PASS 14 checks |
| Phase 3.1 final browser | PASS 29 checks |
| Phase 1 Browser regression | PASS 44 checks |
| Phase 2 Browser regression | PASS 29 checks |
| Phase 3 Browser regression | PASS 42 checks |

Browser ใช้ isolated Chrome context + localhost Vite และ Local Demo เท่านั้น ตรวจ 3 Roles × 1440/1280/768/390px ไม่มี unintended document horizontal overflow; tables ที่กว้างเลื่อนภายใน container ได้ ตรวจ Sidebar สีขาวและ mobile width, keyboard focus และเปิดหน้าดูข้อมูลแล้ว Local project records ไม่เปลี่ยน

Phase 1–3 regressions ครอบคลุม navigation, documents/PDF access, unsaved drafts, validation, Staff confirmations และ transitions ที่มีอยู่ จึงไม่อาศัย screenshot อย่างเดียว ตอน Phase 2 มี console error สำหรับไฟล์ PDF ไม่ถูกต้องตาม negative test ที่ตั้งใจทดสอบ และ suite ผ่าน

ตรวจภาพจริงหลังปรับ พบ navigation ระหว่าง resize ยังมี transition เดิม จึงรอ font/layout settle ก่อนบันทึก/วัดขนาด เพิ่ม assertion ความกว้าง Sidebar บน Mobile ไม่แก้ permission เพื่อให้ test ผ่าน

## Before / After Screenshots

เก็บก่อนและหลังอย่างละ 13 ภาพ: dashboards ทั้งสามบทบาท × 4 viewport sizes และ Project Overview ภาพก่อนเป็น snapshot ก่อนแก้ธีม ไม่เขียนทับด้วย screenshot ของชุด regression

| Page | Before | After |
|---|---|---|
| Staff Desktop | [Before](screenshots/phase31-before/staff-1440.png) | [After](screenshots/phase31-after/staff-1440.png) |
| Researcher Desktop | [Before](screenshots/phase31-before/researcher-1440.png) | [After](screenshots/phase31-after/researcher-1440.png) |
| Reviewer Desktop | [Before](screenshots/phase31-before/reviewer-1440.png) | [After](screenshots/phase31-after/reviewer-1440.png) |
| Project Overview | [Before](screenshots/phase31-before/overview.png) | [After](screenshots/phase31-after/overview.png) |
| Staff Mobile | [Before](screenshots/phase31-before/staff-390.png) | [After](screenshots/phase31-after/staff-390.png) |
| Researcher Mobile | [Before](screenshots/phase31-before/researcher-390.png) | [After](screenshots/phase31-after/researcher-390.png) |
| Reviewer Mobile | [Before](screenshots/phase31-before/reviewer-390.png) | [After](screenshots/phase31-after/reviewer-390.png) |

1280/768px อยู่ในโฟลเดอร์เดียวกันโดยใช้ชื่อ `<role>-1280.png` / `<role>-768.png` ภาพ Phase 1–3 regression ใน screenshots root ถูกสร้างใหม่ด้วยธีมปัจจุบัน ส่วน before snapshots ข้างบนแยกเก็บถาวร

## Known Issues / Pending

- ยังมี CSS legacy เพื่อ compatibility; theme กลางเป็น visual override ไม่ได้ย้ายทุก declaration ออกจากไฟล์เก่าในครั้งนี้ การเพิ่มหน้าใหม่ต้องใช้ tokens และตรวจ specificity
- Existing Reviewer canonical actions ที่ยัง pending Phase 4 ยังคง pending ไม่เพิ่มฟอร์มประเมิน/สิทธิ์ใหม่เพื่อทำให้เหมือนภาพ มีเพียง summary/navigation presentation เพิ่มเติม
- ไม่มี fake Search ใน Header ไม่มีเมนูใหม่ที่ไม่มี handler ไม่มี hardcoded project counts ไม่มี role selection ใน Sign In จริง
- Font file แบบ variable เพิ่ม asset size; Build ยังเตือน chunks เกิน 500kB จากแอปเดิม งาน performance ไม่ได้ขยายใน Phase นี้
- Accessibility ตรวจ keyboard focus, semantic labels เดิม, responsive และแยก state ด้วยข้อความร่วมกับสี ยังไม่ใช่ full screen-reader/WCAG certification หรือ stakeholder UAT
- TR-03/OPEN-04 และ OPEN-13 คง temporary Local Demo policy เดิม; TR-07, cancellation OPEN-20 และ PDF service ที่ pending คงเดิม ไม่แก้ Requirements เป็น CONFIRMED
- ไม่มีการ Deploy, ส่ง email จริง, e-Office API หรือแก้ข้อมูล Firebase จริง หยุดหลัง Phase 3.1 เพื่อรอตรวจ ไม่เริ่ม Phase 4
