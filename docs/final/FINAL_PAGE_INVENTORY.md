# Final Page Inventory

31 functional definitions จาก Audit 05 ไม่ใช่ 31 URLs: dashboards/lists, shared reader, feedback, modals และ tabs reuse components ไม่บวกนับซ้ำ

| ID | Page | Role | Actual route example | Source | Verification / availability |
|---|---|---|---|---|---|
| N-C01 | Demo Scenario Entry | common | `#/roles` | [src/components/DemoEntry.jsx](../../src/components/DemoEntry.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-C02 | Sign In | common | Firebase mode root (no public registration) | [src/components/FirebaseGate.jsx](../../src/components/FirebaseGate.jsx) | Auth emulator Browser; profile roles enforced |
| N-C03 | Not Found / Access Denied | common | `#/researcher/projects/UNKNOWN/details` | [src/components/SharedFeedback.jsx](../../src/components/SharedFeedback.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-X01 | Project Overview | shared | `#/researcher/projects/V16-ACTIVE/details` | [src/pages/SharedProjectOverview.jsx](../../src/pages/SharedProjectOverview.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-X02 | Document Library | shared | `#/researcher/projects/V16-ACTIVE/documents` | [src/pages/ProjectDocuments.jsx](../../src/pages/ProjectDocuments.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-X03 | Activity & History | shared | `#/researcher/projects/V16-ACTIVE/timeline` | [src/pages/ActivityHistory.jsx](../../src/pages/ActivityHistory.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-X04 | Notifications & Tasks | shared | `#/researcher/notifications` | [src/pages/NotificationsTasks.jsx](../../src/pages/NotificationsTasks.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R01 | Researcher Dashboard | researcher | `#/researcher/dashboard` | [src/pages/ResearcherHome.jsx](../../src/pages/ResearcherHome.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R02 | My Projects | researcher | `#/researcher/projects` | [src/pages/ResearcherHome.jsx](../../src/pages/ResearcherHome.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R03 | RS-1 Editor | researcher | `#/researcher/projects/V16-DRAFT/manual` | [src/pages/ResearcherEditor.jsx](../../src/pages/ResearcherEditor.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R04 | Import & Extraction | researcher | `#/researcher/upload` | [src/pages/UploadDocument.jsx](../../src/pages/UploadDocument.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R05 | PDF & Affiliation | researcher | `#/researcher/projects/V16-DRAFT/proposal-pdf` | [src/pages/ResearcherProposalPDF.jsx](../../src/pages/ResearcherProposalPDF.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R06 | Signed Submission | researcher | `#/researcher/projects/V16-AFFILIATION/submission` | [src/pages/ResearcherSubmission.jsx](../../src/pages/ResearcherSubmission.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R07 | Closure Submission | researcher | `#/researcher/projects/V16-ACTIVE/closure` | [src/pages/ResearcherClosure.jsx](../../src/pages/ResearcherClosure.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R08 | Revised Report | researcher | `#/researcher/projects/V16-RELEASED/revised-report` | [src/pages/ResearcherClosure.jsx](../../src/pages/ResearcherClosure.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-R09 | Released Evaluations | researcher | `#/researcher/projects/V16-RELEASED/results` | [src/pages/ResearcherResults.jsx](../../src/pages/ResearcherResults.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S01 | Staff Dashboard | staff | `#/staff/dashboard` | [src/pages/StaffHomeV16.jsx](../../src/pages/StaffHomeV16.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S02 | Registry & Queues | staff | `#/staff/projects` | [src/pages/StaffHomeV16.jsx](../../src/pages/StaffHomeV16.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S03 | Proposal Review | staff | `#/staff/projects/V16-STAFF/staff-review` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S04 | Acknowledgement & Certification | staff | `#/staff/projects/V16-COMMITTEE/administrative-records` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S05 | External Changes & Extensions | staff | `#/staff/projects/V16-ACTIVE/project-change-record` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S06 | Closure Review | staff | `#/staff/projects/V16-CLOSURE/closure-review` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S07 | Assign Reviewers | staff | `#/staff/projects/V16-CLOSURE/reviewer-assignment` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S08 | Tracking & Release | staff | `#/staff/projects/V16-EVALUATION-3/evaluation-tracking` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S09 | Final Verification | staff | `#/staff/projects/V16-RELEASED/final-verification` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-S10 | Cancellation Preparation | staff | `#/staff/projects/V16-ACTIVE/cancellation` | [src/pages/StaffPages.jsx](../../src/pages/StaffPages.jsx) | UI/validation tested; mutation BLOCKED OPEN-20 |
| N-V01 | Assigned Reviews | reviewer | `#/reviewer/dashboard` | [src/pages/ReviewerHomeV16.jsx](../../src/pages/ReviewerHomeV16.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-V02 | Assigned Report Reader | reviewer | `#/reviewer/projects/V16-EVALUATION-0/assigned-report` | [src/pages/ReviewerPages.jsx](../../src/pages/ReviewerPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-V03 | Evaluation Editor | reviewer | `#/reviewer/projects/V16-EVALUATION-0/evaluation` | [src/pages/ReviewerPages.jsx](../../src/pages/ReviewerPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-V04 | Review & Submit | reviewer | `#/reviewer/projects/V16-EVALUATION-0/answers` | [src/pages/ReviewerPages.jsx](../../src/pages/ReviewerPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |
| N-V05 | Submitted Evaluation & PDF | reviewer | `#/reviewer/projects/V16-EVALUATION-1/my-evaluation` | [src/pages/ReviewerPages.jsx](../../src/pages/ReviewerPages.jsx) | Local route/responsive smoke + role workflow suites; see evidence |

Shared routes ใช้ `:role/projects/:id/details`, `documents`, `timeline` และ `:role/notifications`; access denied แสดง Feedback โดยไม่เปิดข้อมูล ตัวอย่าง ID เป็น fictional fixture เท่านั้น

Additional existing navigation: `#/researcher/choose` เป็น entry เลือก manual/import ไม่เพิ่ม functional definition; Staff `closure` เป็น alias/context เดียวกับ closure-review; Reviewer `projects` ใช้ Assigned Reviews component เดียวกับ dashboard; `correction` แสดง retired feedback; unsupported routes แสดง not-found. Query tabs/filters, confirmation modals และ PDF canvases ไม่ใช่หน้าใหม่

Canonical uses SharedWorkspace / shared reducers. Legacy dataset remains explicitly separate and is not counted as v1.6 conformance; no automatic route/data migration. Page rendering PASS does not imply every OPEN feature on that page is enabled.
