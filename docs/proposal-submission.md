# Real RS-1 proposal submission

## Root cause and existing behavior

The old `submitPrototype()` handler was **already calling the real Firebase save adapter**, not a mock endpoint. Its obsolete simulation warning and Prototype success label were misleading. The call path was `SubmissionConfirmation -> saveProposal -> sharedStore -> researchApi -> Firestore`.

The actual draft handoff had a bug: `ManualEntry.jsx` captured `const KEY = DRAFT_KEY` when its module loaded, before Firebase restored the signed-in identity. Confirmation read the live per-account `DRAFT_KEY`. The pages could therefore write/read different draft keys, producing an empty or stale proposal at submission. Broad catch messages hid the missing fields and upload/backend errors. `saveProposal` also returned the client candidate rather than the authoritative response, and DOCX/large-file extraction metadata could be treated as a persistable attachment despite PDF-only Storage.

## Changes

- **Draft isolation:** `proposalDraft.js` is shared by manual entry, submission and confirmation. It reads the current account key each time, rejects malformed drafts without clearing data, and omits hydrated binary duplicates for existing Storage references. Manual entry uses these helpers rather than a captured key.
- **Real submit action:** `proposalSubmission.js` validates the form, pins a stable project ID before work begins, generates the current RS-1 PDF, preserves any supported uploaded source PDF, and calls the existing authenticated persistence adapter. Confirmation reports success only for a backend record with the same ID, a submitted timestamp and a positive version. Rapid repeat clicks are blocked; failed writes remain errors. Backend versions and submitted-project locks continue protecting existing records.
- **Separate drafts:** Save Draft still permits incomplete RS-1 fields. Confirmation generates/uploads the final PDF and submits as a separate action. Draft writes never advance the official status.
- **Validation:** `proposalValidation.js` supplies exact Thai/English field errors for title, researcher, objectives, methodology, real calendar start/end dates, ordered dates, each nonnegative budget category and a positive total. UI and the server share this validator. Backend submit additionally requires a private PDF Storage reference; optional source PDFs are validated too.
- **Documents:** Submitted PDFs must be nonempty, valid PDFs and at most 2 MB each. Local byte/signature/size checks run before upload. The backend verifies the ticket, workspace/project, filename, size, content type, stored object and `%PDF-` signature before committing. DOCX and PDFs over 2 MB remain extraction inputs only; the reviewed form generates the submitted RS-1 PDF. Their unsupported original bytes are not uploaded to PDF-only Storage.
- **Backend acknowledgement:** `sharedStore` returns the acknowledged record and rejects malformed acknowledgements/account changes. `saveProposal` returns that response. Structured validation errors and actual backend errors reach confirmation instead of a generic storage message.
- **Staff visibility:** The server derives workspace/ownership from the authorized profile. Proposals, audit entries, notification records and private views are committed together. The existing staff realtime query reads `workspaces/testing/projects`, so staff see the newly submitted project in `testing`.
- **Workflow/security:** Initial submission remains `unit_review` (stage 2). External unit, e-Office and committee boundaries are unchanged. Nine stages, login-only access, assignments and evaluations remain intact; no registration or role switcher was added. Firestore rules are unchanged. Storage keeps its existing access policy, with an explicit `resource == null` create guard preserving the existing immutable-upload requirement. This also fixes the installed Storage emulator treating overwrites as creates. No test assertion was removed to hide that failure.

## File inventory

Frontend: `src/pages/ManualEntry.jsx`, `SubmissionConfirmation.jsx`, `UploadDocument.jsx`; `src/utils/proposalDraft.js`, `proposalSubmission.js`, `proposalValidation.js`, `projectStorage.js`, `sharedStore.js`, `firebaseClient.js`; `src/App.css` (renamed obsolete mock selectors, preserving appearance).

Backend: `functions/securePolicy.js`, `functions/index.js`, `storage.rules`, `scripts/sync-server-domain.mjs`, and the generated shared Functions domain modules. The copy script now packages the validator with the reducers.

Tests/config: `tests/proposalSubmission.test.js`, `tests/firebase.integration.mjs`, `tests/login-only.integration.mjs`, `package.json`, `.env.emulator`. The login regression command now includes Storage because submission requires a real PDF. `.env.emulator` was restored to `demo-mfu-secure` and local endpoints, avoiding its previous misleading live-project settings. The ignored local `functions/.env.mfu-researchgrantmanagement` origin list was extended to include existing Firebase Hosting domains and local development; this does not alter deployed settings until explicitly deployed.

## Verification and limits

- `npm test`: **46 passing tests**. Includes dynamic per-account draft identity, malformed drafts, complete Thai errors, PDF size/signature/reference validation, separate draft behavior, failed/unfinished saves, authoritative acknowledgements, source retention, stable IDs and server validation.
- `npm run lint`: passed.
- `npm run build`: passed; the existing bundle-size advisory remains.
- `npm run test:firebase`: **65 authenticated emulator checks passed**, using Auth, Firestore, Functions and Storage. Covers draft and actual PDF submission, exact server missing-field errors, rejected missing objects/forged metadata, stored document metadata, staff realtime visibility and document download in `testing`, correction/resubmission, external administrative outcomes, final-report upload, assignments, three reviewer evaluations, feedback, revised report, final verification/closure, notifications, revoked access and fresh-sign-in persistence.
- The Storage runtime was successfully obtained for this run, so the earlier missing-runtime limitation no longer applies to this emulator verification. Functions used installed Node 24 locally; deployment stays configured for Node 22.

No live Firebase records, existing users, passwords or roles were modified. All submitted test records/files were created only inside the isolated `demo-mfu-secure` emulators. No live submission, deployment, browser visual acceptance, or deployed bucket CORS acceptance test was performed.

## Required deployment steps — not executed

1. Keep the existing Firebase web configuration. Local `.env.local` already targets the deployed `asia-southeast1` `researchApi`. For Firebase Hosting, `/api/research` remains supported by the existing rewrite. Do not point emulator mode at the live backend.
2. Review `functions/.env.mfu-researchgrantmanagement`: keep `STORAGE_ENABLED=true`, the actual project bucket, and `APP_ORIGINS` containing each frontend origin that calls the function directly. The local file now includes the existing web.app/firebaseapp.com hosts and localhost/127.0.0.1:5173. Add the exact origin if using another port or custom domain. Confirm authenticated Storage download CORS for the deployed site using the existing Firebase setup guide.
3. Build/deploy the reviewed frontend, function and immutable Storage rule together:

```powershell
npm run build
npx firebase deploy --project mfu-researchgrantmanagement --only "hosting,functions:researchApi,storage"
```

No Firestore data migration, user provisioning, password maintenance, record deletion or Firestore rule change is required. Stakeholders should then submit a legitimate proposal through the Researcher account and verify its appearance in Staff, respecting the existing external consideration boundaries.

Additional regression verification: updated `npm run test:login` passed **43 login/API/proposal checks plus 25 Firestore security checks** with real PDF uploads in the isolated emulators. Existing login-only access and rejection of registration/profile/role writes remain verified.
