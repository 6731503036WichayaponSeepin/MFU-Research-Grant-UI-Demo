# Requirement Traceability Matrix — v1.6

วันที่ 15 November 2026 · 75 FRs / 17 TRs

PASS = AC ที่ทดสอบได้ในขอบเขต Demo ปัจจุบัน ไม่ใช่ stakeholder approval/UAT หรือ production certification; BLOCKED = มีข้อกำหนดส่วนที่ต้องรอยืนยัน แม้ Demo subset/negative guards ผ่านแล้ว; FAIL = พบความผิดและยังไม่แก้; NOT TESTED = ไม่มีหลักฐานรัน ส่วนที่ไม่ทดสอบ production/official template ระบุแยกใน Known Issues

Source: `C:/Users/User/Downloads/เอกสารความต้องการ/requirement (1).md`

SHA-256: `116ab472d17f37181c0274b73311881f5a12a42b75c0335dd846cd827bf37f5c` — ป้าย PROCESS/DESIGN/CONFIRMED/OPEN คงตามต้นฉบับ

| FR | ความต้องการ | Source label | Pages | Tests / evidence IDs | Result | Scope / blocker |
|---|---|---|---|---|---|---|
| FR-COM-01 | ระบบต้องระบุตัวตนและบทบาทผู้ใช้ก่อนเข้าถึงข้อมูลที่ปกป้อง | DESIGN | N-C02 | commonWorkspace.test.js; phase1.browser; auth-*; canonical-acl | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-COM-02 | ระบบต้องตรวจสิทธิ์สำหรับการอ่าน แก้ไข ดาวน์โหลด และเปลี่ยนสถานะ | DESIGN | N-X01,N-X02 | commonWorkspace.test.js; phase1.browser; auth-*; canonical-acl | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-COM-03 | ระบบต้องแสดงรายการโครงการตามบทบาทและสิทธิ์ | DESIGN | N-R02,N-S02,N-V01 | commonWorkspace.test.js; phase1.browser; auth-*; canonical-acl | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-COM-04 | ระบบต้องแสดงรายละเอียดโครงการที่จำเป็นต่อแต่ละบทบาท | DESIGN | N-X01 | commonWorkspace.test.js; phase1.browser; auth-*; canonical-acl | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-COM-05 | ระบบต้องบันทึกเหตุการณ์สำคัญพร้อมผู้กระทำและเวลา | DESIGN | N-X03 | commonWorkspace.test.js; phase1.browser; auth-*; canonical-acl | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-01 | นักวิจัยต้องสร้างโครงการใหม่ได้ | PROCESS/DESIGN | N-R03 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-02 | นักวิจัยต้องกรอกข้อมูล RS-1 ตามชุดฟิลด์ที่ระบบรองรับ | PROCESS | N-R03 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | BLOCKED | RS-1/Data Dictionary final ต้องยืนยัน; Demo fields tested |
| FR-RES-03 | นักวิจัยต้องแก้ไขและบันทึกร่างซ้ำได้ | PROCESS | N-R03 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-04 | ระบบต้องรองรับการอัปโหลดไฟล์ RS-1 เพื่อนำเข้าข้อมูล | CONFIRMED; รูปแบบไฟล์ OPEN | N-R04 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | BLOCKED | OPEN file formats; PDF/DOCX/text adapter tested |
| FR-RES-05 | ระบบต้องสกัดข้อมูลสำคัญจากเอกสาร RS-1 ที่อัปโหลด | CONFIRMED; Mapping OPEN | N-R04 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | BLOCKED | Official mapping OPEN; pattern extraction tested, no OCR |
| FR-RES-06 | นักวิจัยต้องตรวจสอบและแก้ค่าที่สกัดได้ก่อนยืนยัน | DESIGN รองรับ CONFIRMED | N-R04 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-07 | ระบบต้องบันทึกข้อมูลที่ผู้ใช้ยืนยันหลังการสกัดลงในร่าง | DESIGN | N-R04,N-R03 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-08 | ระบบต้องเก็บข้อมูลอ้างอิงไฟล์ต้นทางสำหรับการตรวจสอบ | DESIGN | N-R04,N-S03 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-09 | ระบบต้องตรวจความครบถ้วนของข้อมูลก่อนจัดทำฉบับพร้อมยื่น | DESIGN; Field list OPEN | N-R05 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | BLOCKED | Required field list OPEN; Demo validation tested |
| FR-RES-10 | ระบบต้องแสดงตัวอย่างหรือสร้าง PDF ข้อเสนอได้ | PROCESS/DESIGN | N-R05 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-11 | ระบบต้องรองรับเอกสาร PDF ฉบับพร้อมยื่นต้นสังกัด | DESIGN; Trigger OPEN | N-R05 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | BLOCKED | OPEN-04; positive TR-03 Local Demo only |
| FR-RES-12 | นักวิจัยต้องปรับข้อเสนอตามความเห็นของต้นสังกัดได้ | PROCESS/DESIGN | N-R03,N-R05 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-13 | นักวิจัยต้องแนบหลักฐานความเห็นชอบจากต้นสังกัดได้ | PROCESS | N-R06 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-14 | ระบบต้องแยก “บันทึก/อัปโหลด” ออกจาก “ยืนยันส่งข้อเสนอ” | PROCESS/DESIGN | N-R06 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-15 | นักวิจัยต้องเห็นผลการยื่นข้อเสนอที่ยืนยันแล้ว | DESIGN | N-R06 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-16 | นักวิจัยต้องดูข้อเสนอแนะ/คำขอแก้ไขจากเจ้าหน้าที่ได้ | PROCESS/DESIGN | N-R06,N-S03 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-17 | นักวิจัยต้องแก้ไขและยืนยันส่งใหม่ตามที่เจ้าหน้าที่แจ้งได้ | PROCESS/DESIGN | N-R03,N-R06 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | BLOCKED | OPEN-13 production edits; Local scoped correction tested |
| FR-RES-18 | นักวิจัยต้องดูสถานะโครงการและความหมายแต่ละช่วงได้ | PROCESS/DESIGN | N-X01,N-R01 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-19 | นักวิจัยต้องดูประวัติสถานะและเหตุการณ์สำคัญของโครงการตนได้ | DESIGN | N-X03 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-RES-20 | นักวิจัยต้องดูกรอบเวลาหรือวันสิ้นสุดโครงการได้ เมื่อมีข้อมูลอ้างอิง | DESIGN; กฎระยะเวลา OPEN | N-X01,N-X04 | researcher.test.js; phase2.browser; workflowIntegrationV16.test.js | BLOCKED | Recorded dates tested; calculation/reminder policy OPEN |
| FR-SIG-01 | ระบบต้องสร้างหรือจัดเตรียม RS-1 ฉบับสำหรับลงนาม โดยคงส่วนลงลายเซ็นตามแบบฟอร์มที่ใช้ | PROCESS/DESIGN | N-R05 | foundation.test.js; researcher.test.js; phase2.browser | BLOCKED | Official RS-1 template ไม่ได้แนบ; Demo signatory slots tested |
| FR-SIG-02 | นักวิจัยต้องแนบเอกสาร RS-1 ฉบับลงนามแล้วก่อนยืนยันส่งข้อเสนอไปยังเจ้าหน้าที่ | PROCESS/DESIGN; ประเภทไฟล์ OPEN | N-R06 | foundation.test.js; researcher.test.js; phase2.browser | BLOCKED | Final file formats OPEN; current signed PDF guard tested |
| FR-SIG-03 | ระบบต้องแสดงรายการผู้ที่จำเป็นต้องลงนามตามข้อมูลโครงการเพื่อให้นักวิจัยตรวจสอบความครบถ้วน | PROCESS/DESIGN | N-R06 | foundation.test.js; researcher.test.js; phase2.browser | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-SIG-04 | กรณีนำลายเซ็นอิเล็กทรอนิกส์ของบุคคลอื่นมาใช้ใน RS-1 ระบบต้องให้ผู้จัดทำเอกสารยืนยันว่าได้รับความยินยอมจากเจ้าของลายเซ็นแล้ว | ข้อกำหนดความยินยอมจาก RS-1; วิธี Checkbox เป็น DESIGN | N-R06 | foundation.test.js; researcher.test.js; phase2.browser | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-SIG-05 | ระบบต้องบันทึกการยืนยันเรื่องความยินยอมให้ตรวจสอบย้อนหลังได้ | DESIGN; วิธีพิสูจน์ความยินยอมจริง OPEN | N-X03,N-S03 | foundation.test.js; researcher.test.js; phase2.browser | BLOCKED | Consent record tested; authenticity/proof policy OPEN |
| FR-SIG-06 | เจ้าหน้าที่ต้องสามารถเปิดดูไฟล์ RS-1 ฉบับลงนามและข้อมูลการยืนยันที่เกี่ยวข้องได้ | DESIGN รองรับ PROCESS | N-S03 | foundation.test.js; researcher.test.js; phase2.browser | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-01 | เจ้าหน้าที่ต้องดูคิวข้อเสนอที่รอตรวจได้ | PROCESS/DESIGN | N-S01,N-S02 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-02 | เจ้าหน้าที่ต้องเปิดดูข้อมูลข้อเสนอ RS-1 และเอกสารต้นฉบับที่เกี่ยวข้องได้ | PROCESS/DESIGN | N-S03 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-03 | เจ้าหน้าที่ต้องตรวจข้อมูลสำคัญรวมถึงงบประมาณและเอกสารประกอบได้ | DESIGN; Checklist OPEN | N-S03 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | BLOCKED | Official checklist OPEN; display tested |
| FR-ADM-04 | เจ้าหน้าที่ต้องแจ้งแก้ไขข้อเสนอผ่าน Web ได้ | PROCESS | N-S03,N-R06 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-05 | เจ้าหน้าที่ต้องบันทึกผลตรวจผ่านเมื่อเอกสารครบได้ | PROCESS/DESIGN | N-S03 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-06 | ระบบต้องรองรับการติดตามขั้นตอนเสนอคณะกรรมการ **เพื่อทราบ** | PROCESS | N-S04 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-07 | เจ้าหน้าที่ต้องบันทึกการรับรองโครงการหลังขั้นตอนที่เกี่ยวข้องได้ | PROCESS | N-S04 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-08 | เจ้าหน้าที่ต้องค้นหา/กรองและเปิดทะเบียนโครงการในขอบเขตสิทธิ์ได้ | DESIGN | N-S02 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-09 | เจ้าหน้าที่ต้องบันทึกผลคำขอขยายเวลาที่นักวิจัยดำเนินการผ่าน e-Office แล้วใน Web ได้ | CONFIRMED | N-S05 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-10 | เจ้าหน้าที่ต้องตรวจสอบประวัติการแก้ไขและเปลี่ยนสถานะได้ | DESIGN | N-X03 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-11 | เจ้าหน้าที่ต้องบันทึกข้อมูลอ้างอิงหนังสือจาก e-Office ได้ หาก Stakeholder ต้องการ | DESIGN; รูปแบบเลขหนังสือ OPEN | N-S04,N-S05,N-S09 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | BLOCKED | External references tested; official number format OPEN |
| FR-ADM-12 | ระบบต้องควบคุมสิทธิ์การแก้ไขสถานะของเจ้าหน้าที่ | DESIGN | N-S03,N-S04 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-ADM-13 | เฉพาะเจ้าหน้าที่ที่มีสิทธิ์เท่านั้นที่ต้องปรับปรุงข้อมูลโครงการหลังคำขอเปลี่ยนแปลงได้รับอนุมัติ | PROCESS/DESIGN | N-S05 | staffWorkspaceV16.test.js; phase3.browser; staff-reviewer-http | BLOCKED | Approved supported changes tested; final field permission policy OPEN |
| FR-CLS-01 | นักวิจัยต้องเลือกเส้นทางส่งเอกสารปิดโครงการได้ | PROCESS/DESIGN | N-R07 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-CLS-02 | นักวิจัยต้องแนบเอกสารสำหรับเส้นทางรายงาน 5 บทได้ | PROCESS | N-R07 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | BLOCKED | Report adapter tested; final supporting checklist unavailable |
| FR-CLS-03 | นักวิจัยต้องแนบเอกสารสำหรับเส้นทางผลงานเผยแพร่ได้ | PROCESS; รายละเอียดเกณฑ์ต้องเทียบ 2569 | N-R07 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | BLOCKED | OPEN-14 Full Paper/Acceptance criteria unavailable |
| FR-CLS-04 | นักวิจัยต้องยืนยันยื่นเอกสารปิดโครงการใน Web ได้ | DESIGN รองรับ PROCESS | N-R07 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-CLS-05 | เจ้าหน้าที่ต้องตรวจเอกสารปิดโครงการตามเส้นทางที่เลือกได้ | PROCESS/DESIGN | N-S06 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | BLOCKED | File review tested; official checklist OPEN |
| FR-CLS-06 | เจ้าหน้าที่ต้องขอเอกสารเพิ่มเติมหรือแจ้งแก้ไขได้ | PROCESS/DESIGN | N-S06,N-R07 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-CLS-07 | ระบบต้องแยกเส้นทางประเมินรายงาน 5 บทออกจากเส้นทางเผยแพร่ | PROCESS | N-S06,N-S07 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-CLS-08 | เจ้าหน้าที่ต้องปิดโครงการเส้นทางเผยแพร่ได้ เมื่อหลักฐานครบ | PROCESS | N-S06 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-CLS-09 | นักวิจัยต้องสามารถส่งรายงานฉบับแก้ไข/ฉบับสมบูรณ์ใน Web หลังเจ้าหน้าที่กดส่งผลประเมินได้ | CONFIRMED; รายการเอกสารประกอบ OPEN | N-R08 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | BLOCKED | Revised upload/one-round tested; supporting document list OPEN |
| FR-CLS-10 | เจ้าหน้าที่ต้องบันทึกปิดโครงการเส้นทางรายงาน 5 บทได้ | CONFIRMED / PROCESS | N-S09 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-CLS-11 | ระบบต้องแสดงหลักฐานและเวลาที่เกี่ยวข้องกับการปิดโครงการย้อนหลังได้ | DESIGN | N-X03,N-S09 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-CLS-12 | ระบบต้องแสดงสถานะปิดโครงการให้ผู้มีสิทธิ์เห็นได้ | PROCESS | N-X01,N-S09 | workflowIntegrationV16.test.js; phase2/3/5.browser; foundation-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-01 | เจ้าหน้าที่ต้องจัดการมอบหมายผู้ทรงฯ 3 คนสำหรับรายงาน 5 บทได้ | DESIGN รองรับ PROCESS | N-S07 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-02 | ผู้ทรงฯ ต้องดูรายการงานประเมินที่ได้รับมอบหมายได้ | DESIGN | N-V01 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-03 | ผู้ทรงฯ ต้องเปิดอ่านหรือดาวน์โหลดร่างรายงานประกอบการประเมินได้ | PROCESS/DESIGN | N-V02 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-04 | ผู้ทรงฯ ต้องกรอกผลประเมินตามแบบประเมินที่กำหนดได้ | PROCESS; รายการหัวข้อ OPEN | N-V03 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | BLOCKED | OPEN-11 official rubric; existing Demo schema tested |
| FR-REV-05 | ผู้ทรงฯ ต้องบันทึกร่างแบบประเมินแล้วกลับมาทำต่อได้ | DESIGN | N-V03 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-06 | ผู้ทรงฯ ต้องยืนยันส่งผลประเมินได้ | DESIGN | N-V04,N-V05 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-07 | ระบบต้องสร้าง/ดาวน์โหลด PDF ผลประเมินรายบุคคลตามคำสั่งจากข้อมูลผลประเมินที่ส่งแล้ว | CONFIRMED; PDF รวม 3 คน/ระยะเวลาเก็บ และการดาวน์โหลดย้อนหลังหลัง `CLOSED` เป็น DESIGN/OPEN | N-V05,N-S08,N-R09 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-08 | ระบบต้องรองรับการประเมินเพียงหนึ่งรอบสำหรับรายงาน 5 บท | CONFIRMED | N-V03,N-S09 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-09 | ระบบต้องแสดงผลการส่งแบบประเมินของผู้ทรงฯ 3 คน | DESIGN | N-S08 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-REV-10 | เจ้าหน้าที่ต้องกดยืนยันส่งผลประเมินให้นักวิจัย | DESIGN | N-S08 | reviewerWorkspaceV16.test.js; phase4/5.browser; staff-reviewer-http | PASS | Implemented Demo AC; see test scope/results, not production sign-off |
| FR-STD-01 | ระบบต้องเก็บข้อมูลประเภทมาตรฐานการวิจัยที่เกี่ยวข้องกับโครงการและสถานะการรับรอง | อ้างอิงแนวปฏิบัติ; รายการ/ผู้บันทึก OPEN | N-S04 | staffWorkspaceV16.test.js (OPEN guard only) | BLOCKED | OPEN-17 types/actor/status policy; current fields are partial |
| FR-STD-02 | ระบบต้องรองรับการแนบหลักฐานการรับรองมาตรฐานการวิจัยที่เกี่ยวข้อง | อ้างอิงแนวปฏิบัติ; ฟิลด์บังคับ OPEN | N-S04 | staffWorkspaceV16.test.js (OPEN guard only) | BLOCKED | Evidence PDF supported; official certificate metadata/mandatory fields OPEN |
| FR-STD-03 | ระบบต้องแสดงคำเตือนหรือป้องกันการเปลี่ยนไปดำเนินการวิจัยเมื่อโครงการต้องมีการรับรองแต่ยังไม่มีหลักฐาน ตามกฎที่ยืนยันแล้ว | OPEN — ห้ามบล็อกอัตโนมัติจากข้อสันนิษฐาน | N-S04 | staffWorkspaceV16.test.js (OPEN guard only) | BLOCKED | OPEN-17 warn/block policy disabled |
| FR-REG-01 | เจ้าหน้าที่ต้องดูรอบรับข้อเสนอและวันที่ยื่นเพื่อช่วยตรวจช่วงเวลารับสมัครได้ | PROCESS; การบังคับวัน OPEN | N-S02 | foundation.test.js; staffWorkspaceV16.test.js (partial/guards) | BLOCKED | Submission dates shown; round dictionary/OPEN-18 not confirmed |
| FR-REG-02 | ระบบต้องรองรับการบันทึกผลการจัดการโครงการที่ไม่ดำเนินการหรือไม่ส่งเอกสารภายในกำหนดตามข้อ 1.3.9 | กฎทะเบียนจากการตรวจเอกสาร; trigger/สิทธิ์/การเก็บย้อนหลัง OPEN | N-S02 | foundation.test.js; staffWorkspaceV16.test.js (partial/guards) | BLOCKED | OPEN-19 registry removal authority/trigger disabled |
| FR-REG-03 | ระบบต้องเก็บข้อมูลการยกเลิกโครงการในทะเบียนโดยไม่ลบข้อมูลถาวร | CONFIRMED | N-S10 | foundation.test.js; staffWorkspaceV16.test.js (partial/guards) | BLOCKED | Cancellation record model/fixture retained; positive mutation blocked OPEN-20 |
| FR-CAN-01 | ระบบต้องรองรับการยกเลิกพร้อมเหตุผล | DESIGN — สิทธิ์/สถานะต้นทางอื่น OPEN | N-S10 | foundation.test.js; phase3.browser (validation/deny only) | BLOCKED | OPEN-20 permission: preview only, no positive cancellation |
| FR-CAN-02 | ระบบต้องป้องกันการยกเลิกที่ไม่ถูกต้อง | DESIGN | N-S10 | foundation.test.js; phase3.browser (validation/deny only) | BLOCKED | Validation/denial tested; successful cancellation/audit blocked OPEN-20 |
| FR-REG-04 | ระบบต้องรองรับข้อมูลผู้ประเมิน ผลประเมิน และขั้นตอนงานย่อยตามที่ใช้จริงในทะเบียน | พบใน Excel; Data Dictionary OPEN | N-S02 | foundation.test.js; staffWorkspaceV16.test.js (partial/guards) | BLOCKED | OPEN-21 actual Excel mapping unavailable |

## Transition traceability

| Rule | From → To | Result | Evidence / limits |
|---|---|---|---|
| TR-01 |  → DRAFT | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-02 | DRAFT → DRAFT | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-03 | DRAFT → AFFILIATION_REVIEW | BLOCKED | Local positive tested; Backend OPEN-04 denial |
| TR-04 | AFFILIATION_REVIEW → AFFILIATION_REVIEW | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-05 | AFFILIATION_REVIEW → STAFF_REVIEW | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-06 | STAFF_REVIEW → STAFF_REVIEW | BLOCKED | Local scoped correction passed; Backend OPEN-13 edits blocked |
| TR-07 | STAFF_REVIEW → AFFILIATION_REVIEW | BLOCKED | OPEN-05 positive blocked; rejection tested |
| TR-08 | STAFF_REVIEW → COMMITTEE_ACKNOWLEDGEMENT | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-09 | COMMITTEE_ACKNOWLEDGEMENT → IN_PROGRESS | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-10 | IN_PROGRESS → IN_PROGRESS | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-11 | IN_PROGRESS → CLOSURE_REVIEW | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-12 | CLOSURE_REVIEW → CLOSURE_REVIEW | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-13 | CLOSURE_REVIEW → REPORT_EVALUATION | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-14 | CLOSURE_REVIEW → CLOSED | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-15 | REPORT_EVALUATION → REPORT_EVALUATION | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-16 | REPORT_EVALUATION → CLOSED | PASS | foundation.test.js / workflowIntegrationV16.test.js / phase2–5 browser / HTTP suites |
| TR-17 | IN_PROGRESS → CANCELLED | BLOCKED | OPEN-20 positive blocked; validation/terminal denial tested |

FR totals: PASS 48; BLOCKED 27; FAIL 0; NOT TESTED 0 ในระดับการตรวจรายการ (ไม่ได้หมายความว่าทุก AC/production scenario ถูกทดสอบ) รายการย่อยที่ยังไม่ทดสอบดู [Test Results](TEST_CASES_RESULTS.md) และ [Known Issues](KNOWN_ISSUES.md)
