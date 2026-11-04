# Advisor demonstration guide

The prepared set contains **15 fictional shared projects and 28 readable Thai PDFs**, all marked `isDemo: true`, `demoSeedId: mfu-advisor-v1`, in the `testing` workspace. The project/file IDs are stable. No live seed or deployment has been performed.

The existing Word evaluation document is authoritative: its four question groups, conditional explanations, utilization choices, narrative recommendations and three numeric result values are retained. The seven broad criteria in the task are presentation guidance rather than a new scoring scale. Friendly outcome labels include the exact original wording underneath; result 2 remains the document's **ไม่รับรอง**, presented as requiring correction/resubmission subject to staff action. The added optional comments field does not change scoring.

## Files and contents

Local generated artifacts: `output/advisor-demo/manifest.json` and 28 PDFs. The manifest includes protected evaluation examples for operator preview; it is not served as a public application asset. PDFs cover proposals, progress/final reports, publication evidence, reviewer feedback and a verification summary. All research content, researchers, contact details, datasets and findings are synthetic.

| Group | IDs | Five initial examples |
| --- | --- | --- |
| Researcher | MFU-ADVISOR-V1-A01 through A05 | AI learning draft; IoT submission; community clinic corrections; agricultural-waste packaging active research; Chiang Rai community tourism final-report preparation |
| Staff | MFU-ADVISOR-V1-B01 through B05 | Document verification; returned proposal; external committee outcome pending; draft report awaiting assignment; final verification/closure |
| Reviewer | MFU-ADVISOR-V1-C01 through C05 | Pending; saved partial draft; approved evaluation; approved with revisions; revision required/non-certified |

**Access remains shared:** all 15 projects belong to the existing researcher account, so its full project list/count can show 15. The Researcher dashboard features the five Group A scenarios, while also exposing staff-released feedback. Staff can access all workspace projects and get a dedicated five-example Group B panel plus evaluation-management table. Reviewer has exactly the five Group C assignments. These are shared canonical records, not disconnected per-role copies.

C04 has staff-released feedback; C03 and C05 evaluations and their feedback PDFs remain hidden from the researcher until staff release. B05 uses the existing publication-evidence closure route, with a real readable verification summary and an explicit staff closure confirmation. This avoids inventing an extra reviewer identity or changing the report-review rules. None of the 15 projects starts closed; reviewer approval never closes a project.

## Preview without connecting to Firebase

From the project directory:

```powershell
npm run demo:preview
```

This creates/recreates the local PDF/manifest bundle and prints a summary. It does not initialize Firebase Admin, access credentials, create accounts or write live data.

Inspect the generated files and review this plan before applying. The existing test accounts must already exist and have active server-controlled profiles:

| UID | Email | Role | Workspace |
| --- | --- | --- | --- |
| test-researcher | researcher@example.test | researcher | testing |
| test-staff | staff@example.test | staff | testing |
| test-reviewer | reviewer@example.test | reviewer | testing |

The seed never creates, updates or deletes these users/profiles and never handles their passwords.

## Explicitly apply the reviewed seed to live Firebase

This is an administrator-only operation using the existing Application Default Credentials. Run only after approving the fictional data and target project:

```powershell
node functions/scripts/seed-advisor-demo.mjs --project mfu-researchgrantmanagement --apply --confirm-project mfu-researchgrantmanagement --confirm-seed mfu-advisor-v1
```

Live writes are impossible without both explicit confirmations. The workspace is fixed to `testing`. Any mixed emulator/live configuration is rejected. The default bucket is `mfu-researchgrantmanagement.firebasestorage.app`.

Before writing, the seed verifies all three existing identities/profiles, checks every canonical ID for collision, verifies local PDF bytes/checksums and checks existing Storage objects. Storage creates use generation preconditions. Canonical projects, private projections, indexes, tickets, seed-audit records and seed-notifications use transaction `create`, never overwrite. An existing project is skipped only when it is already marked as this exact demo set. User-created projects and existing demo edits are preserved. Re-running the command creates no duplicates and does not reset earlier demonstrations. A failed partial run can be retried; matching seed-owned objects are reused, while foreign/mismatched objects cause an error. No rollback deletes are performed automatically.

Seed upload tickets are expired intentionally: files are already uploaded by the trusted operator, and clients cannot reuse tickets to recreate or overwrite them. Existing authenticated Storage reads and backend reference validation continue to work.

## What to demonstrate

1. Sign in as Researcher. Show the five Group A rows. Open every scenario; A01 can be edited/saved, A03 shows correction feedback, A04 has a progress PDF under related documents, A05 has a prepared report that has not yet been submitted.
2. Sign in as Staff in a separate session or use Sign Out. The five Group B cards open the correct task directly. B03 records an external decision; B04 checks the report and assigns an existing reviewer; B05 requires explicit staff confirmation before closure. Once B04 is assigned, the reviewer will correctly have more than the initial five assignments.
3. Sign in as Reviewer. The five cards show assignment date, deadline, researcher, document availability and outcome. C01 offers **เริ่มประเมิน**, C02 **ประเมินต่อ**, completed examples **ดูผลการประเมิน**.
4. Open C02. Read the embedded PDF.js report or download it. Complete the authoritative questions, add recommendations, Save Draft and reload. Draft saving persists through the authenticated API. Unsaved changes also retain a per-account/project working copy in this browser; that copy is not a server save.
5. Choose **ตรวจสอบก่อนส่ง**, inspect the confirmation summary, then **ยืนยันส่งผลการประเมิน**. Submitted results are locked. Success is shown only after the real save succeeds.
6. Staff opens the comparison table, reviews findings and records the feedback release. Researcher then sees those released comments and can submit a revised final report. Staff performs final verification and explicitly closes the project. The nine-stage workflow remains unchanged.

The historical seed entries are visibly marked as synthetic. New Save/Submit/Release actions use real Firebase operations in the selected workspace. PDF preview and browser working copies are local viewing/editing aids; they do not pretend to submit anything. Unit/committee/e-Office decisions still happen outside this application and are manually recorded by staff. No AI/OCR, external decision integration or automatic project closure was added.

## Tests and local emulator/browser use

```powershell
npm test
npm run lint
npm run build
npm run test:advisor
```

The advisor suite starts Auth, Firestore, Functions and Storage emulators using `demo-mfu-secure`. It creates local-only account fixtures, tests 15 projects/28 files, unchanged profiles, collision protection, idempotence, privacy, persistence, draft/submitted reviews, staff release, revised reports and explicit closure. It never uses live users or production research records.

To include browser verification, provide Playwright and a browser executable in your environment:

```powershell
$env:RUN_ADVISOR_BROWSER = 'true'
$env:MFU_PLAYWRIGHT_MODULE = 'PATH_TO_PLAYWRIGHT_PACKAGE'
$env:MFU_BROWSER_PATH = 'PATH_TO_CHROME_OR_EDGE_EXECUTABLE'
npm run test:advisor
```

The browser test uses isolated sessions for each role and blocks non-local HTTP requests. It verifies all 15 project links, dashboard counts, PDF rendering/download, Save Draft/reload, confirmation/submission, staff release and researcher feedback. Screenshots are QA artifacts under `output/advisor-demo/qa`.

For a persistent local advisor rehearsal, start the emulators normally (not `emulators:exec`), set all three emulator-host environment variables for the operator shell, and apply against the demo project:

```powershell
npx firebase emulators:start --project demo-mfu-secure --only auth,firestore,functions,storage
# In another shell, after provisioning the three fictional emulator accounts:
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
$env:FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199'
node functions/scripts/seed-advisor-demo.mjs --project demo-mfu-secure --apply --confirm-project demo-mfu-secure --confirm-seed mfu-advisor-v1
npm run dev -- --mode emulator
```

Do not use the real account passwords for emulator fixtures. The seed does not provision missing accounts; use the existing trusted operator provisioning script with a demo project and temporary secrets, or the automated isolated test suite.

## Changed code

- `functions/demo/advisorSpecs.mjs`, `advisorProjects.mjs`, `advisorBundle.mjs`, `seedAdvisor.mjs`: coherent synthetic content, deterministic PDF files, existing reducer-based snapshots and safe create-only seeding.
- `functions/scripts/seed-advisor-demo.mjs`: preview/apply CLI with explicit confirmation.
- `src/pages/ReviewerDashboard.jsx`, `ReviewerEvaluation.jsx`, `Reviewer.css`, `src/utils/reviewerPresentation.js`: five-state cards, readable authoritative evaluation, optional comments, review/confirm/submit, persisted drafts and comparison views.
- `src/components/DocumentPreview.jsx`: PDF.js canvas reader with page controls and authenticated-data download. The old native iframe could be blank. `UploadDocument.jsx` cleanup was updated for the installed PDF.js version.
- `AdvisorShowcase.jsx`, `ResearchDocuments.jsx`, `Dashboard.jsx`, `StaffDashboard.jsx`, `ProjectDetail.jsx`, `ActiveProjectDetail.jsx`, `ClosureWorkspace.jsx`, `App.jsx`: correct task navigation, related PDFs, seeded-data notices, staff tracking and released-feedback access.
- `Header.jsx`, `Sidebar.jsx`, `DataConnection.jsx`: correct report-review/Sign Out labels and no empty connection banner.
- `functions/securePolicy.js`, `src/utils/evaluation.js`: accepted/validated optional additional comments; authoritative rubric and access restrictions remain unchanged.
- `tests/advisorDemo.test.js`, `advisor.integration.mjs`, `advisor.browser.mjs`, `scripts/qa-advisor-pdfs.py`, `package.json`: data/safety/workflow/browser/PDF QA and repeatable commands.

No Firestore/Storage access rules, production project records, account roles, registration policy or nine-stage transitions were changed for this task. Existing Firebase project limits remain (PDFs up to 2 MB, project metadata under 750 KB, workspace fanout limit).

## Remaining operator steps

Live data loading still requires the explicit apply command above. The new UI/backend optional field also needs a reviewed frontend/`researchApi` deployment before appearing on the hosted site. No deployment is performed automatically. Browser QA is local/emulated, not a live Firebase Hosting acceptance test. If seeding or deployment permissions are unavailable, use the generated local PDFs and emulator rehearsal; do not claim that the live dashboards already contain the seed.

## Verification recorded for this change

- `npm test`: **51 passing unit tests**.
- `npm run lint`: passed.
- `npm run build`: passed, with the existing large-bundle advisory.
- Advisor emulator integration: **79 passing checks**, including all 28 actual authenticated PDF downloads, safe collision rejection, unchanged Auth/profile identities, idempotence and full feedback/revision/closure behavior.
- Headless Chrome browser integration: **31 passing checks**, including separate real emulator sign-ins, all 15 project routes, five featured examples per dashboard, actual PDF.js canvas rendering/download, mobile width, saved/reloaded evaluation drafts, confirmation/final submit, staff release and researcher visibility. No browser page errors were recorded in the passing run.
- All **28 final PDFs** render as one-page Thai documents with embedded fonts. Their rendered pages were visually reviewed. Unreleased reviewer outcomes are absent from researcher projections and from shared proposal/report headers; private feedback files retain the intended outcome examples.
- The installed local emulator host used Node 24 rather than configured deployment Node 22. Expected denied-access assertions produce Storage security messages; an SDK stream-listener warning did not fail the passing checks.
- Live Firebase data loading, existing-user modification and deployment were **not performed**. The only account creation/data mutation was inside the isolated demo emulators for testing.

Manual deployment, only after reviewing and approving the code:

```powershell
npm run build
npx firebase deploy --project mfu-researchgrantmanagement --only "hosting,functions:researchApi"
```

No Security Rules deployment or real-data migration is required for this task. Apply the seed separately with the explicit confirmation command above; deployment does not automatically load demo projects.
