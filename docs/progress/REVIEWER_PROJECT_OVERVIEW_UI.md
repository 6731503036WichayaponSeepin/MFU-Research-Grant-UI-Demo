# X01 Reviewer Project Overview — UI only

15 November 2026

- เพิ่ม ReviewerProjectOverview.jsx/CSS โดย reuse so-* layout ของ Staff/Researcher, underline tabs, compact summary และ 65:35 layout; CSS เพิ่มเฉพาะ Reviewer selectors
- แสดง project title/ref และ personal review status, assignment date, five-chapter report type, authorized document count
- ใช้ ownAssignment/ownEvaluation/reviewStatus, permittedDocuments และ capability เดิม; ไม่เพิ่มสิทธิ์/เปลี่ยน data selection ที่ domain
- personal progress 3 ขั้นแทน project lifecycle; recent activity เฉพาะ assignment และ actor ของตนจากประวัติที่ได้รับสิทธิ์แล้ว
- Start/Continue → evaluation split workspace; submitted → my-evaluation; คง assigned-report/documents/history routes และไม่มีข้อมูลผลประเมินคนอื่น
- คง researcher/affiliation/start/end/objectives/methodology/report revision/project status, assigned report และ own feedback ที่เข้าถึงได้; ไม่มี budget หรือ administrative records เพิ่มให้ Reviewer

ไฟล์: src/pages/ReviewerProjectOverview.jsx/CSS, Reviewer-only branch ใน SharedProjectOverview.jsx, presentation flags ใน components/SharedWorkspace.jsx; tests/reviewerOverviewUI.browser.mjs และปรับ Common regression ให้ตรวจ title ภาษาอังกฤษจริงแทน heading แบบเก่า

PASS: Reviewer Overview UI 85 checks (3 personas, pending/draft/submitted/CLOSED cases, canonical document counts, actual actions, assigned-only restriction, non-mutation, TH/EN responsive และ Staff/Researcher branch isolation); Common 44; Reviewer regression 21; cross-role integration 25; lint/build PASS พร้อม bundle-size warning เดิม

Screenshots: tmp/reviewer-overview-ui/ ตรวจภาพ desktop แล้ว ไม่แก้ backend/database/Firebase หรือ deploy อ้างอิง FR-REV-02/03/05/06 และ existing role/document permissions; ไม่เปลี่ยน transition หรือ OPEN policies
