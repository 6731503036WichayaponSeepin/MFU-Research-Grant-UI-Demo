# X04 Reviewer Notifications — UI only

15 November 2026

- เพิ่ม ReviewerNotifications.jsx/CSS: one compact list, notification title/project/description/localized timestamp, light maroon unread background/dot, existing project links และ mark-one/mark-all controls
- NotificationsTasks ใช้ Reviewer presentation branch โดยส่ง unread predicate และ mark handler เดิมทั้งหมด ไม่เปลี่ยน workspaceNotifications, recipient filtering, read key, remote adapter หรือ notification events
- ซ่อน outer heading/Back เฉพาะ Reviewer notification presentation; ไม่แสดง task/deadline sections หรือ summary cards; มี empty/loading/error/success states และ in-app-only note
- TH/EN, desktop/tablet/mobile; unknown technical action labels ใช้ Status Update เป็น display fallback โดยไม่เปลี่ยน event ข้อมูลจริง
- Staff/Researcher render branches และ styles เดิมไม่เปลี่ยน

ไฟล์: src/pages/ReviewerNotifications.jsx/CSS, NotificationsTasks.jsx, presentation condition ใน components/SharedWorkspace.jsx และ tests/reviewerNotificationsUI.browser.mjs

PASS: Reviewer Notifications UI 60 checks (3 personas; exact authorized list count, independent unread/read keys, mark-one/mark-all/header badge, reload persistence, links, non-mutation, TH/EN responsive, empty state, other-role isolation); Common 44; Reviewer regression 21; cross-role integration 25; lint/build PASS พร้อม bundle-size warning เดิม

Screenshots tmp/reviewer-notifications-ui/ ไม่มี domain/backend/database/Firebase changes หรือ deployment
