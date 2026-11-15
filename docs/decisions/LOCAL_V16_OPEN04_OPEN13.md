# Temporary Design Decision — Local Demo v1.6 / OPEN-04, OPEN-13

วันที่ 15 November 2026 · สถานะ: USER-AUTHORIZED TEMPORARY LOCAL DEMO DESIGN  
Decision ID: LOCAL-V16-OPEN04-13 · ไม่ใช่ Stakeholder CONFIRMED

แหล่งคำสั่ง: ผู้ใช้ตอบคำถามระหว่าง Phase 2 ใน chat นี้ อนุญาตให้พัฒนาต่อเฉพาะ Local Demo ตามเงื่อนไขด้านล่าง โดย Requirements ยังคง OPEN-04, OPEN-05 และ OPEN-13 ตามเดิม เอกสาร Requirements ไม่ถูกแก้สถานะการยืนยัน

## OPEN-04 — Confirm Ready / TR-03

Trigger ของ Local Demo คือปุ่ม “ยืนยันเอกสารพร้อมยื่นต้นสังกัด / Confirm Ready for Affiliation” แล้วกดยืนยันผ่าน Confirmation Modal เท่านั้น

- ต้องเป็น DRAFT, ผ่าน Validation ของ Demo และมี PDF ที่อ้าง Proposal Version ล่าสุดซึ่งตรงกับข้อมูลปัจจุบัน
- Generate/Preview/Download/Save Draft/Upload ไม่เปลี่ยน State
- หลังยืนยัน เก็บ PDF document/version reference, source proposal version, ready proposal version, Actor, Timestamp และ Decision ID แล้วเปลี่ยน DRAFT → AFFILIATION_REVIEW
- AFFILIATION_REVIEW ไม่พิสูจน์ว่าต้นสังกัดได้รับเอกสารแล้ว
- TR-04 แก้ฉบับตามความเห็นต้นสังกัดและสร้าง PDF ใหม่โดยอยู่สถานะเดิม ไม่สร้าง TR-03 ซ้ำหรือถือว่าส่งข้อเสนอแล้ว

## OPEN-13 — Researcher correction scope / TR-06

เจ้าหน้าที่ใน Local Demo ต้องระบุ Editable Sections และเหตุผลผ่าน contract ที่ trusted actor เป็น Staff นักวิจัยแก้ได้เฉพาะ fields ในหัวข้อที่ระบุ รายการอนุญาตตามผู้ใช้:

| Editable Section ID | หัวข้อ | Fields ที่นำกลับมาใช้จากฟอร์ม RS-1 เดิม |
|---|---|---|
| projectTitle | Project Title | projectTitle, projectTitleEn |
| researcherInformation | Researcher Information | leaderName/Affiliation/Phone/Email/Percent; bioName/Position/ResearchId/Education/Experience/Expertise/Publications/Presentations/IP/Management/Completed/Ongoing |
| coResearchers | Co-researcher Information | participants |
| advisor | Advisor Information | advisorName/Qualification/Position/Affiliation |
| researchDetails | Research Details | strategy, researchType, keywords, background, literature, references, cooperationName/Affiliation/Address/Type, standards, clarifications |
| objectives | Objectives | objectives |
| methodology | Methodology | methodology |
| researchScope | Research Scope | scope |
| researchPlan | Research Plan | workPlan, progress |
| researchDuration | Research Duration | startDate, endDate |
| expectedOutcomes | Expected Outcomes | outcomeType, outcomeDetail, integration, publicationLevel |
| budget | Budget | compensation/Detail, directCost/directDetail, materials/Detail, utility/Detail |
| supportingDocuments | Supporting Documents | support file selection/upload; ไม่แก้ underlying immutable document/history |

Mapping ชื่อหัวข้อสู่ keys เป็น implementation mapping ของแบบฟอร์มที่มีอยู่ ไม่ใช่การเพิ่มฟิลด์บังคับ ไม่เปิด field อื่นเพราะเป็น free-text ใกล้เคียงกัน ข้อมูลลงนามอยู่ใน external signed file และ explicit attestation ไม่ปลดล็อก identity/state/audit fields

Project ID, Owner ID, State, Staff Records, Certification และ Audit History ห้ามแก้ผ่าน researcher payload `proposalData` รับเฉพาะ RS-1 allowlist และ Domain ตรวจ changed fields ก่อน save ทุกครั้ง ก่อนส่งใหม่ต้องอ้าง current saved version พร้อม signed_rs1 และ affiliation_evidence ของ version เดียวกัน (minutes OR confirmation) คำยืนยันลายเซ็นครบและ conditional consent แล้วจึงส่งกลับเจ้าหน้าที่โดยคง STAFF_REVIEW

TR-06 เก็บ proposal snapshots, resubmitted snapshot และประวัติ actor/time/changed fields/before/after; ภาพ UI ใช้ projected view ตามสิทธิ์ ไม่ลบหรือแต่งประวัติเดิม

Signed RS-1 และ affiliation evidence ของฉบับแก้ไขเป็นเงื่อนไขการส่งใหม่ จึงแนบใหม่ได้ตาม contract; support file อื่นต้องได้รับหัวข้อ supportingDocuments ไฟล์/บันทึกเดิมเก็บ immutable; Remove ใน workspace หมายถึงเอาออกจากชุดส่ง ไม่ใช่ลบข้อมูลจริง

## Production / Firebase Boundary

`src/domain/localDemoPolicy.js` อนุญาตได้เมื่อ trusted execution mode เป็น local-demo, actor.simulation=true, workspace=local-demo-v16 และ project มี fictional=true/simulationOnly=true เท่านั้น ไม่รับ enableOpen/approved/mode/actor จาก request payload เป็นสิทธิ์

Backend executeFoundationCommand กำหนด mode=backend เอง จึงไม่เปิด TR-03 แม้ profile/workspace/file ดูเหมือน Local Demo; editableSections ชั่วคราวใช้ไม่ได้ใน backend และการเปลี่ยน RS-1 fields ระหว่าง STAFF_REVIEW ถูกปฏิเสธจนมี production policy สำหรับ OPEN-13 ไม่ลด Backend guards เพื่อให้ Demo ผ่าน

TR-07 ยังคง PENDING/disabled ทั้ง Local และ Backend (OPEN-05) ส่วน cancellation permissions/OPEN อื่นไม่ได้รับอนุมัติในคำตอบนี้

Contract fixtures สำหรับ correction/additional closure/active publication/other-owner เป็นข้อมูลสมมติที่ผู้ใช้เลือกเพิ่มเองใน Local Demo ไม่เขียนทับ record ID ที่มีอยู่ ไม่ใช่ผลจาก Staff/Reviewer UI ที่พัฒนาเสร็จแล้ว และไม่ seed Firebase จริง

## Tests / การทบทวน

ทดสอบ positive/negative ของ latest PDF, explicit confirmation, immutable ready provenance, scoped correction, stale signed evidence, conditional consent, unchanged main state, wrong owner และ denial ใน backend context รวม browser/modal flow

รอ Stakeholder ยืนยัน production Trigger และ edit policy ก่อนนำ decision นี้ไปใช้ใน Firebase/Production ห้ามเปลี่ยน Requirements เป็น CONFIRMED และไม่ deploy จากงาน Phase 2
