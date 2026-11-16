# Evaluation Workspace / PDF Delivery

17 พฤศจิกายน 2569 — Local Demo / Requirements v1.6

## Reference

อ่าน AGENTS.md, Requirements/Workflow/User Flow/Use Case/State v1.6 และ MFU Design System ที่เกี่ยวข้อง ใช้ `D:/เอกสาร Seminer/แบบประเมินผล (ร่าง) รายงานวิจัยฉบับสมบูรณ์ .docx` เป็นแหล่งแบบฟอร์ม ตรวจ OOXML และ render ด้วย Word แบบ read-only ครบ 2 หน้า

SHA-256: `d7b48577d82df528fed1efb1be425fff0d68f292c74648fdc7fbeae1b3b8ca97`

[Source comparison](evidence/evaluation-source/SOURCE_COMPARISON.csv): 31 ข้อความต้นฉบับตรงกับ catalogue ทั้งหมด รวมเลข 1.6 ที่เป็น automatic numbering ใน Word ไม่มีช่องลงนามในแบบนี้

## Form alignment — คำสั่งก่อนหน้า

- ครบ 1.1–1.7, 2.1–2.5, 3 และ 4; radio groups 5 ชุด / 13 ตัวเลือก และ utilization checkboxes 5 ตัวเลือกตามต้นฉบับ
- แสดง required details เฉพาะตัวเลือกที่มี เนื่องจาก / ระบุ / โปรดระบุ / ได้แก่; 2.3 ไม่มีรายละเอียดเพิ่มเติม
- ลบ inactive answers จาก working draft, new save/submit payload, preview และ PDF; Backend mirror ทำ normalization เดียวกันก่อนตรวจชนิดข้อมูล
- ไม่เพิ่ม rating, question หรือ signature; เลิกแสดง Additional Comments ที่ไม่มีในต้นฉบับ ใช้ข้อ 3 ตามแบบ ไม่แก้ historical submitted records หรือ migrate ข้อมูลเดิม
- เก็บ rubricVersion ของการบันทึกใหม่เป็น source draft provenance ไม่ใช่ Stakeholder approval; OPEN-11 คงเดิม
- Draft recovery, V04, V05 และ Staff ใช้ชุดคำตอบ/เงื่อนไขเดียวกัน พร้อม inline validation และ focus field ที่ผิด

## PDF and cross-role delivery — คำสั่งก่อนหน้า

- PDF รายบุคคล on-demand จาก capability-checked submitted snapshot ตรวจสิทธิ์และ snapshot ซ้ำหลังโหลด font ก่อนเผยแพร่ bytes
- ใช้หัวข้อ เลขข้อ คำศัพท์และตัวเลือกต้นฉบับ พร้อม vector checkboxes/ticks, Thai Sarabun, multiline และ page breaks; ไม่สร้างลายเซ็นและไม่สร้าง merged PDF
- Hide inactive values ใน PDF รวม metadata โดย sanitize สำเนา ไม่เปลี่ยน immutable source records
- Reviewer preview/download เฉพาะผลตน Staff เข้าถึงผลที่ส่งแล้ว นักวิจัยเข้าถึง 3 ฉบับและ authorized feedback หลัง release เท่านั้น
- เพิ่ม Preview ใน action component ใช้ guard เดียวกับ Download; preview/download ไม่แก้สถานะหรือสร้าง evaluation round ใหม่
- คง 3 unique reviewers, submitted-only 3/3, release once, revised report และ explicit staff closure ตามเดิม; post-CLOSED PDF ยังถูกปิดตาม OPEN เดิม

## Compact layout — คำสั่ง UI ล่าสุด

ปรับเฉพาะ presentation: ลบ redundant heading/Back/project tabs/report–evaluation navigation ใน editable V02/V03 ใช้ project title + reference/reviewer/revision/due/status แบบย่อ และข้อความ draft-rubric ขนาดเล็ก

แผง 50:50 ปรับขนาดได้ ใช้ความสูง viewport ที่เหลือ แผงละ 1 scroll owner; toolbar และ form actions อยู่ให้เห็น ลด padding และย่อ toolbar เป็น icon controls พร้อม accessible labels รองรับ fit width, zoom, page navigation, download/fullscreen และ mobile stacking

รักษา Sidebar/Header, evaluation state, conditional answers, handlers และ permissions จากงานก่อนหน้า ไม่เปลี่ยน Staff/Researcher layout

## Files

- `evaluation.js`, `reviewerWorkspace.js`, `domain/actions.js` และ server mirror: source catalogue / normalization / version provenance
- `EvaluationFormFields.jsx`, `ReviewerPages.jsx`, `ReviewerEvaluationReview.jsx`, `StaffEvaluationTrackingView.jsx`: source form และ consistent read-only answers
- `evaluationPDF.js`, `EvaluationPdfAction.jsx/.css`: source PDF และ guarded preview/download
- `DocumentPreview.jsx`, `ReviewerEvaluationWorkspace.jsx/.css`, `SharedWorkspace.jsx`: scoped viewport layout และ enhanced reader
- เพิ่ม source/conditional/layout tests; ปรับ regression selectors จาก retired dropdown/Back/unsupported comment field เป็น controls ตามแบบจริง ไม่ skip tests เพื่อให้ผ่าน

Traceability: FR-REV-01–10, FR-CLS-09/10, FR-COM-02/05, NFR-01/03/05, TR-13/15/16; ไม่เปลี่ยนสถานะหลักหรือ transition contract

## Actual results

| Status | Check |
|---|---|
| PASS | Unit 141/141 รวม source conditional validation, payload/PDF filtering, historical immutability, backend normalization และ duplicate/permission guards |
| PASS | Source/delivery browser 79 checks: exact form, focus, recovery, preview, 4-page Thai PDF, all 3 individual previews/downloads, feedback after release และ before-release denial |
| PASS | Compact layout browser 27 checks: 1440×900 / 1280×720 / mobile, one heading, no redundant navigation/banner, full remaining height, independent scrolling, sticky actions และ no project mutation |
| PASS | Source PDF render ตรวจจริงครบ 4 หน้า รวมคำตอบ 65 บรรทัด ไม่มี clipping; checkbox marks ตรงกับคำตอบ |
| PASS | Final lint / production build; bundle-size warning เดิม |
| PASS | Full browser regressions 44/44 suites ครบ Researcher/Staff/Reviewer รวม Phase 4/5, cross-role, permissions และ report/publication closure |

หลักฐานใน [evidence/evaluation-source](evidence/evaluation-source/): source CSV/hash, unit/lint/build logs, PDF, rendered pages, desktop/mobile screenshots และ browser results

## Limitations

- OPEN-11 ยังเปิด แบบที่ได้รับเป็นฉบับร่าง ไม่อ้าง Stakeholder confirmation; ไม่เพิ่ม signature/identity policy
- NOT TESTED: Firebase emulator/live authorization และ deployment; ไม่อ้าง production readiness
- Browser runtime บางรอบพบ localhost `EACCES` / `ERR_NETWORK_ACCESS_DENIED`; opt-in test transport ใช้ bytes ของ local static resources จริง ผ่าน Node HTTP และ fallback สู่ browser เมื่อ transport ไม่พร้อม ไม่มี API mocking หรือการข้าม assertions
- ไม่มี live Firebase writes, deployment หรือ git push

แก้ test runner ให้ติดตั้ง transport ตั้งแต่สร้าง page รวม suite ที่ไม่มี page event listener แล้วทวน suite ที่ล้มเหลว ผลสุดท้ายผ่านครบ 44; previousRun เก็บประวัติรอบก่อนหน้า ไม่ข้าม assertions หรือคืนพฤติกรรมเก่าเพื่อให้ผ่าน

