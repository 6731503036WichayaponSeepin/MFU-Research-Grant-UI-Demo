# V01 Reviewer Dashboard — UI only

15 November 2026

- เปลี่ยน ReviewerHomeV16 เป็น compact summary strip, assigned-review table และ responsive 65:35 layout; ด้านขวาแสดง pending/draft tasks และ donut จาก submitted/assigned จริง
- Sidebar ใช้ branding/collapse/header แบบล่าสุด มี DEMO MODE และ 4 count/filter links; account ด้านล่าง ไม่มี role box หรือ large demo banner
- SharedWorkspace เปลี่ยนเฉพาะ presentation สำหรับ Reviewer; Researcher/Staff branches เดิมไม่เปลี่ยน
- คง reviewerRows/reviewStatus, assignments, routes, search/filter handler, report links, evaluation/PDF actions, due date/report revision/project state; ไม่มี backend/data/permission changes
- TH/EN labels และ localized dates; donut ไม่ถือ draft เป็น submitted; 0 assigned ไม่หารศูนย์

ไฟล์: `src/pages/ReviewerHomeV16.jsx`, `ReviewerHomeV16.css`, Reviewer presentation wiring ใน `src/components/SharedWorkspace.jsx`; UI selectors ใน `tests/phase1.browser.mjs`, `tests/phase4.browser.mjs`; เพิ่ม `tests/reviewerDashboardUI.browser.mjs`

ผล: PASS unit 116/116; Reviewer UI 66 checks (3 personas, TH/EN, 1440/1280/390px, counts/filters/assigned-only/non-mutation); Common 44, Reviewer regression 21, cross-role integration 25; lint/build PASS (bundle-size warning เดิม)

Regression รอบแรกพบ selector ของ summary cards เดิม; แก้เป็น summary strip selector แล้วผ่าน ไม่เปลี่ยน assertions ของ workflow/permissions ใช้ temporary screenshot paths สำหรับ Reviewer/integration เพื่อหลีกเลี่ยงภาพเดิมถูกล็อก

Screenshots: `tmp/reviewer-dashboard-ui/persona-1.png` ถึง `persona-3.png`; ตรวจภาพ desktop แล้ว ไม่มี deployment/Firebase changes
