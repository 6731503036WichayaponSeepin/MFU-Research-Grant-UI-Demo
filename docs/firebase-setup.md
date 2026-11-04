# Firebase setup and database guide

## Configuration and deployment

1. Use the existing project in `.firebaserc` only after confirming it is the intended test destination. Enable Email/Password in Firebase Authentication, create a Firestore database, enable Cloud Storage and the billing required by Functions/Storage. Add the site domain to Authentication authorized domains.
2. Copy `.env.example` to `.env.local`. Copy the Firebase Console web app values into every `VITE_FIREBASE_*` setting, including the exact Storage bucket name. `VITE_STORAGE_ENABLED=true` enables authenticated PDF uploads. These web configuration values are not Admin credentials.
3. Configure Functions environment variables in `functions/.env.<PROJECT_ID>`: `STORAGE_ENABLED=true`, `STORAGE_BUCKET=<bucket>`, and `APP_ORIGINS=https://<hosting-domain>,http://localhost:5173`. Keep environment files and service-account keys outside Git. Configure browser Storage CORS for the deployed origin if authenticated SDK downloads encounter CORS errors.
4. Run `npm install` and `npm --prefix functions install`. Use an operator's Application Default Credentials for provisioning. Copy `functions/scripts/test-accounts.example.json` to a private file. It defines one researcher, one staff member and one reviewer, all in the `testing` workspace. Set each named password environment variable using a secret manager or an interactive shell; never commit passwords. The example `.test` emails are fictional, so password-reset delivery is unavailable until replaced by controlled addresses.
5. Preview provisioning: `node functions/scripts/provision.mjs --project PROJECT --file accounts.local.json`. Apply with `--apply --confirm-project PROJECT`. Existing identities are preserved; this script deliberately refuses to change existing roles/workspaces. If no password environment variable is supplied, use Firebase Console to establish credentials or send a password reset to a controlled address. The optional old seed facility is operator-only; the application never seeds mock projects.
6. Run `npm run build`, then deploy with `npx firebase deploy --project PROJECT --only firestore:rules,storage,functions,hosting`. The predeploy hook copies the shared workflow reducers into Functions. No live deployment or production account creation has been performed by this change.
7. For Vite development, set `VITE_RESEARCH_API_URL` to the deployed function URL or use local emulators. Firebase Hosting forwards `/api/research` automatically. The retired `/api/demo` returns HTTP 410.

## Emulator testing

Use Java 21+ and a supported Node runtime (Functions targets Node 22). `npm run test:firebase` starts Auth, Firestore, Functions and Storage on ports 9099, 8080, 5001 and 9199. It creates isolated fictional Auth accounts and exercises drafts, corrections, administrative outcomes, actual PDF uploads/downloads, assignments, three evaluations, feedback, revised report, closure, realtime updates, fresh sign-in persistence and rejected access. Test-only passwords are for the isolated emulator project, never live accounts.

For the browser, run `npm run dev -- --mode emulator`, with the emulator services running against `demo-mfu-secure`. Provision the three example identities against the same emulator project using `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` and `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`. No identities are automatically created in a real project.

## Data model

Server-controlled `/users/{uid}` stores uid, email, displayName, affiliation, role, workspace, active and createdAt. Clients cannot create or update profiles. Roles come from these protected records rather than frontend state; custom claims are not required.

The existing aggregate is retained at `/workspaces/{workspace}/projects/{projectId}`. Only staff can directly read the aggregate; writes go through the authenticated API. `/workspaces/{workspace}/users/{uid}/projects/{projectId}` contains a server-written private view used by realtime dashboards. Researchers receive only owned projects and released evaluations; reviewers receive assigned projects and their own evaluations. `/workspaces/{workspace}/projects/{projectId}/activity/{eventId}` is immutable to clients.

The same transaction also maintains the requested indexes at the database root:

| Collection | Data and access |
| --- | --- |
| projects | projectId, projectCode, titleTh/titleEn, researcherId/name, affiliation, proposalData (existing RS-1 object), status, currentStage (1-based), createdAt, updatedAt, submittedAt; owner/staff reads |
| projectDocuments | documentId, projectId, uploadedBy, documentType, fileName, storagePath, uploadedAt, version; staff reads; other users receive permitted document metadata through their private project views |
| reviewAssignments | assignmentId, projectId, reviewerId, assignedBy, status, assignedAt, dueAt; assigned reviewer/staff reads |
| reviews | reviewId, projectId, assignmentId, reviewerId, result, comments (full existing rubric), submittedAt, released; staff/own reviewer reads, owner after release |
| activityLogs | logId, projectId, actorId, actorRole, action, previousStatus, newStatus, timestamp; staff reads |

Index document IDs begin with `workspace~` to prevent cross-workspace collisions. Assignment and review IDs include the assignment date and reviewer; subsequent final revisions retain the original evaluation identity. New files produce immutable metadata records; existing files retain upload dates. Existing projects acquire indexes when next saved; this change does not silently migrate stored records.

Notifications intentionally remain under `/workspaces/{workspace}/users/{uid}/notifications/{notificationId}`, preserving the existing realtime consumer and avoiding a duplicate source of read state. Fields include notificationId, recipientId, projectId, title, message, isRead, createdAt, action, status and readAt. readAt and isRead are updated together by the application. Only the recipient can acknowledge readAt with a server timestamp; clients cannot forge notifications.

Files are private immutable PDFs, maximum 2 MB each, stored at `workspaces/{workspace}/projects/{projectId}/{uploaderUid}/{ticketId}`. A short-lived server-issued upload ticket gates creation. The backend verifies stored size, MIME type and `%PDF-` signature before attaching a file. Authenticated SDK downloads replace public download URLs. Deletion and overwrite are disabled.

## Preserved workflow and responsibility

| Stage | Status | Action / responsible role |
| --- | --- | --- |
| 1 | draft | Researcher saves RS-1 draft and submits |
| 2 | unit_review | Staff records the external affiliated-unit outcome |
| 3 | eoffice_pending | Staff records external e-Office reference |
| 4 | admin_review | Staff checks proposal, accepts or requests correction |
| 5 | committee_review | Staff records external certification and committee outcome |
| 6 | active | Researcher performs research; staff records proceed notice |
| 7 | final_report | Existing final-output stage retained; researcher prepares report |
| 8 | closure_review | Researcher submits report; staff checks/assigns; reviewers evaluate; staff releases feedback; researcher resubmits; staff verifies |
| 9 | completed | Staff explicitly closes project after final checks |

`revision_required` is a return state, not a tenth stage; the recorded return target determines resubmission. Report submission moves directly from active into closure_review in the existing reducer; final_report is an existing preparation state. Evaluation results map existing rubric values 0/1/2 to approved/approved_with_revisions/revision_required. The third rubric label remains the existing Thai non-certification wording, pending stakeholder validation. Evaluations never perform official approval or closure. e-Office, affiliated-unit and committee decisions occur outside the application.

## Security and practical limits

Every write replays an allowed workflow action on the server using a verified Auth token and a freshly read active profile. It ignores client-supplied ownership, status histories and timestamps, validates versions and reviewer membership, and atomically writes views, notifications and audit. Direct project/index/review writes are denied by rules. Firebase Admin SDK bypasses rules, so these server checks are essential: https://firebase.google.com/docs/firestore/security/insecure-rules

The existing implementation limits a workspace to 100 accounts, project metadata to 750 KB and attachments to 100 references. Larger deployments need scalable fanout, history archival and document pagination. PDF text extraction is browser-based; no OCR/AI extraction is added. Browser form working copies are local until explicitly saved to Firestore. Retained legacy mock generators support old unit fixtures and explicit operator seeding, never runtime login or a fallback database. No browser visual or live-project acceptance test has been completed in this environment.

## Verification recorded for this change

- `npm test`: 36 passing unit/domain tests, including database indexes and assignment identity across final revisions.
- `npm run lint`: passed.
- `npm run build`: passed; Vite reports a bundle-size advisory.
- `node tests/rules.integration.mjs` against the local Firestore emulator: 19 access-control checks passed. Expected PERMISSION_DENIED logs correspond to rejection assertions. `npm run test:rules` provides an isolated Firestore-only runner when other emulators are stopped.
- Full `npm run test:firebase`: attempted twice. The first run failed downloading `cloud-storage-rules-runtime-v1.1.3.jar`; the retry stalled at that same download. The full authenticated API and Storage workflow has **not passed** in this environment. Re-run it after the emulator runtime is available.
- Browser visual acceptance, actual browser reload, real-project configuration, live provisioning and deployment remain manual. Fresh-sign-in persistence is implemented in the full integration suite but is not claimed as verified here.
