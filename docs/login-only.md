# Existing-account login only

The MFU application uses Firebase Email/Password Authentication. The login page contains Email, Password, Sign In and authentication errors. There is no registration button, form, approval screen, role selector, or client account-creation service.

## Existing stakeholder accounts

| UID | Email | Role | Workspace | Dashboard |
| --- | --- | --- | --- | --- |
| test-researcher | researcher@example.test | researcher | testing | Researcher Dashboard |
| test-staff | staff@example.test | staff | testing | Research Administration Dashboard |
| test-reviewer | reviewer@example.test | reviewer | testing | Reviewer Dashboard |

Passwords are not stored in this guide, the frontend, or configuration files. The existing `App.jsx` role-based dashboard routing is preserved. An authenticated identity must also have an active, administrator-controlled `/users/{uid}` profile with an allowed role and workspace. Authentication alone never creates a profile or grants access.

## Removed code and retained data

- `FirebaseGate.jsx` no longer imports registration components, subscribes to requests, displays pending approval, or offers role selection. Its single form signs in existing users and reads their protected profile.
- The registration action/import were removed from `researchApi`. Authorized callers receive an invalid-operation error for that action; unprovisioned identities remain denied before any write. Proposal saves, upload tickets, review transitions, notifications and audit writes are unchanged.
- The special `/registrationRequests/{uid}` rules were removed. The existing default-deny rule now blocks all client reads and writes to those records. `/users` writes remain denied; Storage rules are unchanged.
- Deleted `src/pages/Register.jsx`, `functions/registration.js`, `functions/scripts/approve-registration.mjs`, registration unit/integration tests, the registration npm command and obsolete approval documentation.
- Existing registration records, Auth users, project data, role/workspace values and credentials are not deleted, migrated, or updated. Trusted administrator provisioning remains in `functions/scripts/provision.mjs`; do not run provisioning or password maintenance merely to deploy this cleanup.

## Verification

Required checks:

```powershell
npm test
npm run lint
npm run build
```

`npm run test:login` starts isolated Auth/Firestore/Functions emulators, creates fictional fixtures with the Admin SDK, and checks existing-account login, all three protected roles, denied registration API/Firestore writes, unchanged legacy records, proposal submission, correction/resubmission and fresh-sign-in persistence. It also runs the Firestore rules suite. No emulator fixtures are created in the live project.

`functions/scripts/verify-existing-login.mjs` is an operator-only verification script. It accepts `MFU_RESEARCHER_PASSWORD`, `MFU_STAFF_PASSWORD`, and `MFU_REVIEWER_PASSWORD` from process environment variables. It performs real Email/Password sign-in and reads the existing UID/email/profile/claims, checking the `testing` workspace and unchanged profile update timestamps. It never creates users, updates passwords, changes permissions or writes Firestore. Firebase naturally updates its last-sign-in metadata during authentication. It logs no passwords or tokens.

Real sign-in checks passed for all three existing accounts with their supplied credentials. Profile and claims comparisons passed. The unit/domain suite covers report submission, assignments, evaluations, feedback, revisions and closure; live document submissions were deliberately not performed because they would alter existing Firebase data. Full Storage integration remains unverified here because its emulator runtime is unavailable. Browser dashboard interaction has not been visually tested.

## Local environment and reviewed deployment commands

An ignored `.env.local` was copied from the project's existing `.env.example` public Firebase web configuration because the repository had no active local Vite environment. It contains no passwords or Admin credentials. Preserve the operator's deployment environment. For Vite development against deployed Functions, configure `VITE_RESEARCH_API_URL` as described in the Firebase setup guide; Hosting uses its existing `/api/research` rewrite.

No deployment was performed. To publish the reviewed cleanup, run:

```powershell
npm run build
npx firebase deploy --project mfu-researchgrantmanagement --only "hosting,functions:researchApi,firestore:rules"
```

These commands replace the frontend and the existing `researchApi` implementation and deploy the tightened Firestore rules. They do not delete stored documents or users. Storage rules, the retired demo endpoint and other functions do not need deployment for this cleanup.

## Provider-level account creation

Removing the application form/API and denying profile writes blocks public registration into this application. Firebase Authentication's own client signup API is a separate project setting, not governed by Firestore rules. For an absolute provider-level prohibition, an authorized operator must verify that end-user account creation is disabled in Identity Platform user-action settings while Email/Password sign-in remains enabled. See [Google's user-management documentation](https://cloud.google.com/identity-platform/docs/concepts-manage-users). Do not disable the Email/Password provider, which would also prevent existing users from signing in.

The read-only attempt to inspect that live provider setting returned PERMISSION_DENIED for the available ADC. Its current state is therefore unknown; no authentication settings were changed and no public signup was attempted. No Identity Platform upgrade or project-setting modification is performed automatically.

Recorded results for this cleanup: `npm test` passed 36 tests; `npm run lint` passed; `npm run build` passed with the existing bundle-size advisory. `npm run test:login` passed 43 API/login/workflow checks plus 25 Firestore rules checks (68 total). The first emulator launch hit a Functions discovery timeout; retrying with `FUNCTIONS_DISCOVERY_TIMEOUT=60` passed. The installed emulator host used Node 24 while deployment remains configured for Node 22. No live deployment or live application-data writes were performed.
