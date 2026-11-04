# Three-role workflow prototype

## Implementation and inspection

The existing application is React 19 + Vite, with state-based routing in App.jsx, Thai/English i18next strings, reusable staff/researcher layouts, and a nine-step project status model. Local persistence uses localStorage. The optional Firestore workshop adapter writes fictional demoProjects through a temporary-code Cloud Function with version checks. Neither the role-selection login nor the workshop code is production authentication.

Existing working features retained: manual RS-1 entry, selectable-text PDF/DOCX import with editable extracted fields, proposal drafts and submission, unit/e-Office/committee records, proposal corrections, project changes, registry, PDF downloads, report uploads, and publication-route closure. The old reviewer form used invented prototype scores and one reviewer. New assignments now use the supplied four-section Thai evaluation, with no scores. Old saved rubric records remain readable and their legacy workflow remains supported.

Implemented: five demo identities across three roles; separate reviewer assignments and evaluation drafts; conditional explanations; utilization details; additional PDF feedback; confirmation and immutable submitted evaluations with timestamps; staff review of all evaluations; explicit simulated release of feedback; revised/final report submission; final document verification and staff closure; external notification-to-proceed recording. Status and audit records include project ID, previous/new status, action, role, timestamp and notes. The main nine steps are unchanged; evaluation states are separate.

## Start and switch roles

```sh
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite (normally http://127.0.0.1:5173). Select a role, then use **Demo Role Switcher** above the dashboard. Researcher: demo-user; staff: demo-staff; reviewers: demo-user, demo-reviewer-2, demo-reviewer-3. The first reviewer retains the old demo username for compatibility, but role and identity are checked together. Save evaluation drafts before switching. Refresh returns to role selection and preserves saved records.

For an explicitly fictional static demo: `npm run build -- --mode demo`, then `npm run preview`. A normal `npm run build` deliberately disables access instead of exposing the unauthenticated prototype as a production system. Do not deploy the demo build as a real research system. No live services or emails are needed for local testing.

## End-to-end scenario

1. Researcher: create a manual proposal, or use fictional draft MFU-DEMO-002 as prefilled sample information. Review title, leader, objectives, methodology, dates and positive budget. Save draft, review and submit. Alternatively import a document, inspect extracted text, and edit before submission.
2. Staff: open External records & decisions; record the affiliated-unit result and the external e-Office reference/date. These are records of an external process, not approvals performed by this app.
3. Staff: open Proposal Review; request corrections with a reason. Researcher edits/resubmits the same proposal. Staff checks it and forwards it to committee records.
4. Staff: record certification, committee acknowledgement, meeting number/date and notes. The existing certified/endorsed rule moves the project to active. From External records, select the active project and record the external notification-to-proceed reference and date.
5. Researcher: open the active project, choose Project Closure and the report route. Enter summary/completion date and attach a PDF (up to 2 MB). Seeded fictional projects offer a sample report button. Save or submit.
6. Staff: inspect report documents. Try returning them with an explanation, then have the researcher resubmit. Mark documents complete and select all three demo reviewers. One or two may be selected for a shorter prototype run; no real people are required.
7. Reviewer 1: open the assigned report, download the PDF, and complete sections 1–4. Test partial achievement and rejection to see required explanations. Add a feedback PDF if desired. Save a partial draft, refresh, select the same reviewer and reopen it. Submit and confirm; the result is read-only.
8. Switch to reviewers 2 and 3 and submit their independent forms. MFU-DEMO-018 is a shortcut already assigned to all three; reviewer 3 has fictional sample chapter feedback. An unassigned reviewer cannot open or mutate an evaluation through the workflow functions.
9. Staff: inspect each submitted evaluation and assignment status. The project remains awaiting evaluation until all assigned reviewers submit, then awaits staff action. Select request revision or request final version, enter instructions and release feedback. This is an in-app simulation, not email delivery or an automatic combined decision.
10. Researcher: read the released evaluations and attachments, upload the revised/final report, and submit. The project goes to final staff verification. Staff may return missing documents with a reason and repeat this loop.
11. Staff: verify final documents, record verification notes, confirm closure, and optionally record the external closure-notice reference. Researcher sees Completed. Refresh and verify that evaluations, reports, history and closure persist.

## Persistence and migrations

No database migration or new collection is required. New closure records add evaluationVersion: 2, reviewers[], evaluations keyed by username, feedbackReleasedAt and staffDisposition. Evaluations contain the four form sections, attachments and submittedAt. proceedNotice records the external start notification. Audit fields are appended to new history entries; historical entries are not rewritten.

Local browser demos use fresh keys mfu-role-demo-v2-projects, mfu-role-demo-v2-draft and mfu-role-demo-v2-seeded. Existing prototype project/draft keys are untouched and are not exposed through the fresh local demo. Existing fictional shared workshop records continue through the existing adapter. Shared storage remains a fictional workshop, not a per-user secured database; its access code is not production identity. Production identity, per-user backend authorization and private file storage must be implemented before real information is used.

## Verification

- 31 Node tests pass, including the full new three-reviewer workflow, required fields, unauthorized reviewer/role rejection, draft persistence, immutable submission, partial-review blocking, correction loops, explicit staff disposition and backend closure validation.
- Existing legacy closure, administrative, registry, project-change and shared-store regression coverage passes. Two fixtures were updated for the new seeded evaluation, with legacy coverage explicitly retained.
- ESLint passes. Production and explicit demo builds succeed; Vite reports the existing large-bundle warning.
- Production preview browser check confirmed the access-disabled screen and absence of role selection.
- Browser smoke checks: role switching, assigned-project filtering, conditional explanation display, saved draft restored after refresh, timestamped read-only submission, and an independent blank form for reviewer 2. Responsive navigation was inspected and a pre-existing tablet flex-direction issue was corrected.
- The full workflow was exercised by automated domain/persistence tests. It was not replayed entirely through browser clicks. Live Firebase emulator/deployed backend integration was not run.

## Changed files

Created:
- src/utils/evaluation.js
- src/utils/demoMode.js
- src/pages/ReviewerEvaluation.jsx
- tests/evaluation.test.js
- docs/role-workflow-demo.md

Modified:
- src/App.jsx, src/main.jsx
- src/pages/Login.jsx, src/pages/ReviewerDashboard.jsx, src/pages/ClosureWorkspace.jsx
- src/pages/AdministrativeRecords.jsx
- src/pages/ManualEntry.jsx, src/pages/SubmissionConfirmation.jsx, src/pages/UploadDocument.jsx (isolated draft storage)
- src/components/WorkQueue.jsx
- src/data/demoProjects.js
- src/utils/closure.js, src/utils/closureRegistry.js, src/utils/handoff.js
- src/utils/projectStorage.js, src/utils/administrativeRecords.js
- src/utils/projectChanges.js, src/utils/registry.js, src/utils/generateRS1PDF.js
- src/workspace.css
- functions/policy.js
- tests/shared.test.js, tests/workflow.test.js
- README.md

Build output in dist was regenerated. No dependencies were added.

## Stakeholder decisions and limitations

The reviewer form was compared with the stakeholder-supplied Word document แบบประเมินผล (ร่าง) รายงานวิจัยฉบับสมบูรณ์ .docx. Question wording, section headings and submitted-result order now follow that document. Utilization options 2.1, 2.2, 2.4 and 2.5 request their corresponding details; 2.3 patent/copyright has no additional detail field or requirement. Narrative sections 1.5–1.7 and 3 remain optional. The output item uses 1.6 in the web form to preserve the sequence between 1.5 and 1.7. Existing stored answers are preserved; stale explanations for deselected answers are not displayed.

There is deliberately no algorithm combining reviewer results, no automatic closure, and no newly invented rejection policy. Staff selects the next step with a recorded explanation. Confirm the handling of conflicting/rejected evaluations and whether re-evaluation rounds are required before production. The new workflow preserves the initial evaluations through revision and relies on staff final verification.

Local role authorization is a prototype simulation, not a security boundary against someone editing browser storage. Default production access is disabled. Import is text extraction, not OCR. PDFs remain inline in existing persistence (browser quota applies; shared workshop projects have a 750 KB total limit). The new official Thai form stays in Thai even if the surrounding interface is English. Unsaved evaluation edits are not auto-saved; use Save draft before switching roles.
