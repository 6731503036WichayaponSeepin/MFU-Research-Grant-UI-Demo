# Changed files — Back navigation and unsaved drafts

- src/App.jsx — common visible Back button, contextual breadcrumbs, safe list/dashboard fallback, and action completion redirects.
- src/components/DemoEntry.jsx — install guarded client-side navigation; keep role-dashboard switching and clear working drafts on Reset.
- src/utils/demoRouter.js — record in-app history, skip duplicate Back destinations, guard native links and browser Back/Forward, and warn before browser unload.
- src/utils/navigationGuard.js — shared dirty-form confirmation and same-draft evaluation navigation rules.
- src/utils/useFormDraft.js — preserve working form copies separately from saved projects; retain selected files during in-tab Back/Forward.
- src/pages/ManualEntry.jsx — guard unsaved RS-1 input and open Project Details after explicit Save; keep the confirmation/submission flow.
- src/pages/ReviewerEvaluation.jsx — track unsaved evaluation input and clear its warning after successful draft/save submission.
- src/pages/CorrectionRequest.jsx — preserve comments and open Project Details after approval.
- src/pages/ClosureWorkspace.jsx — preserve closure/check/final-verification drafts and open Project Details after closing.
- src/pages/ProposalReview.jsx — preserve unsaved staff comments and clear them after a successful review action.
- src/pages/AdministrativeRecords.jsx — preserve record-form drafts through navigation.
- src/pages/ProjectChangeRecord.jsx — preserve change-form inputs and selected PDF files through navigation.
- src/pages/UploadDocument.jsx — preserve extracted proposal inputs and selected source files through navigation.
- tests/demo.browser.mjs — assert visible Back buttons throughout the existing 11 scenario flows and updated Save behavior.
- tests/navigation.browser.mjs — Back/Forward, warning cancellation and acceptance, role switching, draft/file restoration, action redirects, deep-link fallback, and no navigation reloads.
- tests/navigationGuard.test.js — unsaved/saved decisions and shared evaluation draft boundaries.
- package.json — add test:navigation:browser.
- README.md — document Back, breadcrumbs, working drafts and browser checks.
- docs/frontend-demo-changes.md — this file list.

Generated frontend output: dist/. Existing Firebase configuration and backend code were not changed. No deployment was performed.
