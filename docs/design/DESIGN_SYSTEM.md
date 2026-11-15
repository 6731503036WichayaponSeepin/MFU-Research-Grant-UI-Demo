# MFU Research — Global Design System

Phase 3.1 | v1.6 | 15 November 2026

เอกสารนี้เป็น Visual Design Decision ตามคำสั่งผู้ใช้ ไม่ใช่ Requirement/Business Rule ใหม่ ใช้ก่อนสร้างหรือแก้ UI ทุก Phase รวม Phase 4 ไม่เปลี่ยน Roles, Permissions, State Transitions หรือ OPEN policies

## Implementation

ใช้ `src/theme.css` เป็นแหล่ง Design Tokens และ shared visual rules โหลดหลัง Entry styles ใน `src/main.jsx` ทั้ง Local Demo/Firebase เพื่อควบคุม CSS เดิมที่ซ้อนกัน ใช้ Existing Components/semantic classes ก่อนสร้าง abstraction ใหม่ ห้ามเพิ่ม `!important` หรือ hardcoded palette เฉพาะหน้าโดยไม่จำเป็น

## Palette

| Token | Value | Usage |
|---|---|---|
| --primary / --primary-hover | #931638 / #79112E | primary actions, selected navigation, focus |
| --primary-light | #F8EDF0 | selected menu, subtle accents |
| --background / --surface | #F5F6F8 / #FFFFFF | workspace / cards |
| --border | #E2E4E9 | thin dividers and outlines |
| --text-primary | #202938 | main content |
| --text-secondary | #667386 | secondary labels |
| --text-muted | #8490A1 | decorative/disabled detail; avoid small essential body text |
| --success | #61886E | semantic accent |
| --warning | #BD9047 | semantic accent |
| --information | #6486B0 | semantic accent |
| --danger | #B74B4B | semantic accent |
| --evaluation | #8260AF | evaluation accent |

Status text ใช้เฉดเข้มบนพื้นอ่อนเพื่ออ่านง่าย ไม่ใช้ semantic accent อ่อนเป็น body text บนขาว State badges ต้องมีชื่อ/State ID ไม่สื่อความหมายด้วยสีอย่างเดียว CLOSED ใช้เขียว CANCELLED ใช้แดง REPORT_EVALUATION ใช้ม่วง

## Typography และ Spacing

ใช้ Noto Sans Thai variable font ที่ bundle ใน `public/fonts/NotoSansThai-Variable.ttf` พร้อม OFL license จาก Google Fonts repository; ไม่มี runtime CDN request รองรับไทย/อังกฤษ fallback IBM Plex Sans Thai, bundled Sarabun (`MFU Thai`), Segoe UI

Body 15px/1.7, input 15px, table 14px, supporting text 13–14px, page heading 24–30px, section 19px ใช้ weight 400/600/700 ตามลำดับข้อมูล ไม่ลดขนาดเพื่อเลียนแบบภาพทั้งหมด

Spacing tokens: 4, 8, 12, 16, 24, 32px; main 32px desktop, 24px tablet, 16px horizontal mobile Card padding 24px desktop/20px mobile Inputs/buttons radius 6px, cards 10px, status pill Border 1px และ shadow เบามาก

## Layout

Sidebar สีขาว width 264px desktop/224px tablet, collapsed 80/72px; mobile เป็น navigation ด้านบนที่ย่อได้ แสดงเฉพาะเมนูจาก `roleNavigation` เดิม มี Role indicator และ account identity ด้านล่าง ส่ง currentUser ที่ได้รับอยู่แล้ว ไม่อ่านข้อมูลใหม่

Header ใช้ page context, breadcrumb เดิมใน content, language switch, notification indicator และ Account Menu เดิม ไม่เพิ่ม search box ที่ไม่มี handler ไม่เพิ่ม role picker ใน Firebase Sign In การเปลี่ยนบทบาทยังผ่าน Demo Entry เดิมเท่านั้น

Cards เป็นพื้นขาว ไม่มี gradient/illustration เพื่อการตกแต่ง Summary Cards ใช้ยอดและลิงก์เดิม 4/2/1 columns ตามพื้นที่ Tables เลื่อนแนวนอนได้ใน container เมื่อคอลัมน์มาก ห้ามทำให้ทั้ง document overflow

Project Timeline ใช้ `timelineStates` ที่มีอยู่ แสดงเฉพาะ state ที่บันทึกแล้ว ตัวเลขบน node หมายถึงลำดับที่แสดง ไม่ใช่ State ID หรือข้อบังคับให้ผ่านทุกขั้น Publication ไม่บังคับ REPORT_EVALUATION และ CANCELLED ไม่รวมเป็น CLOSED

## Reusable Component Mapping

ไม่สร้าง React wrappers ที่ซ้ำกับ components ปัจจุบัน ใช้ชื่อแนวคิดด้านซ้ายเป็นมาตรฐาน design และ implementation ด้านขวา

| Standard | Existing implementation |
|---|---|
| PageHeader | focused-page-heading / page-heading / dashboard-heading |
| SummaryCard | researcher-summary > shared-card; stat-card; review-stats |
| StatusBadge | ProjectStateBadge; shared-status; existing reviewer badges |
| DataTable | shared-table-wrap / shared-table; existing role tables |
| FilterBar / SearchInput | shared-filters / labeled search input พร้อม handler เดิม |
| PrimaryButton / SecondaryButton / TextButton | primary / outline-button / text-button |
| DocumentCard / FileUpload | ProjectDocuments, ResearcherFiles และ existing upload cards |
| ActivityTimeline / ProjectTimeline | ActivityHistory/shared-history, shared-timeline |
| ConfirmationModal | shared-dialog และ StaffActionForm confirmation เดิม |
| EmptyState / LoadingState / ErrorState | SharedFeedback/Feedback variants เดิม |
| TaskCard / Pagination | existing contextual actions, shared-project-row, shared-actions navigation |
| FormSection | shared-card / shared-fields และ existing labeled form sections |

## Accessibility และ Visual Guidelines

- Interactive target อย่างน้อย 44px สำหรับ controls หลัก ใช้ visible focus 3px; รักษา labels, semantic tables, keyboard handlers, dialog semantics และ unsaved draft guards
- ตรวจ 1440/1280/768/390px; ใช้ minmax(0,1fr), wrapping และ container scrolling ไม่ซ่อนข้อมูลเพื่อให้พอดี
- รองรับ prefers-reduced-motion; ไม่ใช้ hover-only affordance สำหรับ action สำคัญ
- Error/success/disabled messages ต้องใช้ข้อความเดิม ไม่แสดง service pending ว่าทำงานแล้ว
- UI-only ห้ามแก้ record/state เพราะ preview/download/layout; เมื่อเพิ่มหน้าใหม่ให้ reuse tokens และ existing components ก่อน

## Visual References

ตรวจภาพทั้งสองจาก `C:/Users/User/Downloads/Visual Reference 2 ภาพ/`:

- `904605401_3219330818276754_3027190073537019723_n.png` — academic dashboard, white sidebar, summary cards, thin tables
- `910287609_2168577730419208_2221517785768663943_n.png` — project card layout และ timeline

อ้างเฉพาะการออกแบบ ไม่คัดลอกชื่อโครงการ ยอด เมนูที่ไม่มีฟังก์ชัน หรือสถานะจากภาพมาแทน v1.6
