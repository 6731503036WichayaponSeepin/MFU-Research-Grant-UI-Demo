# Reviewer My Assigned Reviews — UI refinement

16 November 2026

- เฉพาะ `page=projects`: ตัด summary strip, Action Required/progress cards และ View All; ใช้ full-width table พร้อม search/filter, project/status/actions และ sidebar counts เดิม
- Dashboard markup/cards คงเดิม; CSS ใหม่ scope ด้วย `.rv-registry` และแก้ mobile grid containment ให้ตารางเลื่อนในกรอบ ไม่ทำให้ทั้งหน้า overflow
- ไม่เปลี่ยน routes, handlers, data, permission helpers หรือ business logic
- ไฟล์: src/pages/ReviewerHomeV16.jsx/CSS และ tests/reviewerDashboardUI.browser.mjs
- PASS: dashboard/assigned-list UI 120 checks (3 personas, TH/EN, desktop/tablet/mobile, full-width, search/filter, no mutation และ Dashboard cards retained); Common 44, Reviewer workflow 21, cross-role integration 25 รวม affected browser 210 checks; lint/build PASS พร้อม bundle warning เดิม
- Mobile check รอบแรกพบ overflow แล้วแก้และรันทวนผ่าน; screenshots: tmp/reviewer-dashboard-ui/assigned-1.png ถึง assigned-3.png

ไม่มี backend/Firebase changes หรือ deployment
