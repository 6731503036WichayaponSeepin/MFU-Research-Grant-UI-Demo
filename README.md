# MFU Research Grant Management — v1.6 Demo

Personal Research Grant Management System for Mae Fah Luang University · **404 Team Found**

Local Demo และ Firebase mode ใช้ canonical v1.6 contract ร่วมกัน: 3 roles, 9 main states, TR-01–TR-17. Theme และ UI มาตรฐานอยู่ใน [DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md)

## Run Local Demo

```sh
npm ci
npm run dev
```

ใช้ dependencies ที่มีอยู่ได้โดยไม่ต้องติดตั้งใหม่ เปิด localhost ตามที่ Vite แสดง เลือก **v1.6 — Canonical Demo (3 roles)** และบทบาท Researcher / Research Administration Staff / Expert Reviewer มี Reviewer personas สมมติ 3 คนในบทบาทเดียว Local Demo ไม่ต้องเข้าสู่ระบบและไม่เชื่อม Firebase จริง

ข้อมูลเริ่มต้นเป็น fictional 14 projects ใน localStorage มี opt-in contract fixtures แยกจาก legacy dataset การ Reset ต้องยืนยันและเปลี่ยนเฉพาะ namespace ของ Local Demo ไม่ใช่บัญชี/ข้อมูล Firebase หรือ private working copies ทั้งหมด ดู [Demo User Guide](docs/final/DEMO_USER_GUIDE.md)

## Current workflows

- RS-1 manual/import/review/draft, proposal PDF, signed RS-1 + affiliation evidence + conditional consent
- Staff correction, acknowledgement **เพื่อทราบ**, certification และ external changes/extensions ผ่านผลจาก e-Office โดยไม่มี API
- Publication closure ไม่ผ่าน Reviewer; report closure ใช้ exactly 3 unique reviewers, independent drafts, one-time submit, Staff release เมื่อ 3/3, revised report แล้ว Staff verify/close เอง ไม่ประเมินซ้ำ
- Actual document reader และ individual on-demand evaluation PDF ตามสิทธิ์; in-app notifications/audit history ไม่อ้างว่าส่ง email จริง
- Minimal MFU shared theme รองรับ TH/EN และ mobile/tablet/desktop

ตัวอย่าง route: `#/researcher/projects/V16-DRAFT/manual`, `#/staff/projects/V16-CLOSURE/closure-review`, `#/reviewer/projects/V16-EVALUATION-0/evaluation` หน้าย่อยเข้าผ่าน Project Overview/Assigned Reviews; tabs/modals ไม่ใช่หน้าใหม่

**ขอบเขตที่ยัง BLOCKED:** TR-03/OPEN-04 และ correction OPEN-13 ใช้ temporary Local Demo decision เท่านั้น Backend ยังไม่เปิด; TR-07 และ cancellation OPEN-20 ไม่เปิด mutation; official rubrics/checklists, Excel mapping, standards policy, combined/post-CLOSED PDF และ retention ยังรอยืนยัน Web Correction Approval เดิมยุติแล้วโดยรักษาประวัติ ไม่ใช้ legacy workflow เป็นหลักฐาน v1.6

## Verification

```sh
npm test
npm run lint
npm run build
npm run test:phase6
npm run test:phase6:emulator
```

Browser suites ต้องมี installed Chrome + Playwright (`MFU_PLAYWRIGHT_MODULE` ระบุตำแหน่ง package ได้) Emulator suite ต้องมี Java 21+, Firebase CLI และ cached emulator binaries; ใช้เฉพาะ `demo-mfu-secure` บน localhost โดยสร้าง fictional accounts/data ใน Emulator เท่านั้น

`test:phase6` รัน maintained unit/lint/build/role browser suites + 240 TH/EN responsive checks + **read-only** legacy migration dry-run; ไม่ apply migration ผล JSON/logs เก็บที่ `docs/final/evidence/` ไม่มีคำสั่ง deploy ใน workflow นี้

Firebase mode: `npm run dev -- --mode firebase` ใช้ Firebase Authentication และ role จาก Server Profile ไม่มี public registration หรือ role picker การทดสอบ Phase 6 ใช้ Emulator config เท่านั้น [firebase-setup.md](docs/firebase-setup.md) เป็นคู่มือเทคนิคเดิม ต้องอ่าน readiness/OPEN constraints ล่าสุดก่อนใช้งาน ไม่ใช่การอนุญาตแก้ production

## Final documentation

- [Phase 6 Report](docs/progress/PHASE_6_REPORT.md)
- [Final Page Inventory — 31 functional definitions](docs/final/FINAL_PAGE_INVENTORY.md)
- [Requirement Traceability — 75 FRs / 17 TRs](docs/final/REQUIREMENT_TRACEABILITY_MATRIX.md)
- [Test Cases & Results](docs/final/TEST_CASES_RESULTS.md)
- [Known Issues](docs/final/KNOWN_ISSUES.md)
- [Demo User Guide](docs/final/DEMO_USER_GUIDE.md)
- [Deployment Readiness — BLOCKED for Production](docs/final/DEPLOYMENT_READINESS.md)

Requirements v1.6 วันที่ 14 November 2026 เป็นแหล่งอ้างอิงหลัก ตำแหน่งเอกสารจริง/กฎการทำงานอยู่ใน [AGENTS.md](AGENTS.md) Audit เป็น baseline ก่อนการพัฒนา และรายงานแต่ละ Phase เป็นหลักฐานการเปลี่ยนแปลง ไม่แปลง DESIGN/OPEN เป็น stakeholder CONFIRMED

Phase 6 หยุดแล้ว ไม่มี deployment, live migration หรือ Firebase จริงถูกแก้ไข Build ที่ผ่านไม่ใช่ Production/UAT approval
