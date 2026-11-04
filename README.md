# MFU Research Grant — Interactive Demo

Frontend-only React + Vite prototype. No login, Firebase initialization, API, environment file, or internet connection is needed to use the installed application. All data is fictional and stored in this browser's localStorage.

## Run and verify

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

Dependency installation requires the packages to be available. Running the frontend afterwards needs only localhost. Local fonts and PDF workers are bundled.

Choose Researcher, Staff, or Reviewer on the opening page. The visible role selector switches roles at any time. Scenario cards provide five researcher, four staff, and two reviewer demonstrations over one shared dataset. Existing RS-1 forms, nine-stage timeline, official draft evaluation rubric, document preview, staff records, and closure forms remain in use. The existing rubric uses categorical judgments rather than numerical scores; completed evaluations preserve those judgments and comments.

## Focused page navigation

The existing demo router now uses static-host-compatible hash URLs. Browser Back/Forward and refresh restore the role, project, screen, and URL-based tabs/filters. Examples:

- `#/researcher/dashboard` — summary counts, three recent projects, quick links.
- `#/staff/projects` — staff's four example scenarios; an All Projects tab includes filtering and pagination.
- `#/researcher/projects/MFU-DEMO-001/details` — focused details with information/research/budget tabs.
- `#/researcher/projects/MFU-DEMO-001/timeline` — nine stages and paginated history.
- `#/reviewer/projects/MFU-DEMO-018/documents` — report chapters or one PDF viewer.
- `#/reviewer/projects/MFU-DEMO-018/evaluation?section=0` — one of seven evaluation sections.
- `#/reviewer/projects/MFU-DEMO-018/answers` — review saved answers before simulated submission.
- `#/reviewer/projects/MFU-DEMO-018/results` — evaluation answers or submission history.

Proposal forms, staff review/approval, closure, correction requests, external records and project changes each have their own project route. Dashboards contain no scenario grids or embedded forms. Project cards and sidebar links navigate to dedicated screens. The role in the URL is restored when navigating through browser history. RS-1 review is divided by part and Part A topic; notifications and status histories are paginated.

Every detail, form, review and evaluation screen has a visible **← ย้อนกลับ** button. It follows the current role's recorded browser history, skipping duplicate URLs; directly opened pages fall back to the relevant project list, then Dashboard. Breadcrumbs link Dashboard → Projects → Project Details → the current task.

Unsaved edits trigger a confirmation before following links, switching roles, or using the page/browser Back button. Browser reload/close also uses the standard unsaved-changes warning. Cancel keeps the current screen and inputs. Accept keeps working copies for Back/Forward; text/form drafts use localStorage, and unsubmitted File objects stay in memory while the tab is open. Evaluation sections and answer review share one draft and can be navigated without repeated warnings.

Saving a proposal opens Project Details. Approving a correction request or closing a project opens Project Details. Submitting an evaluation opens Evaluation Results. Role selection always opens the selected role's Dashboard after any unsaved-change confirmation. Reset also clears navigation working copies.

Reviewer flow: Project Details → Report → Evaluation (seven sections) → Review Answers → Submit → Evaluation Results. Drafts remain available when changing sections or refreshing.

The correction example starts with a pending request. Staff can reject it, the researcher can request again, and staff can approve. After approval, open the correction request page as researcher to edit RS-1 and confirm the corrected submission. Other projects retain their existing workflow. Staff can close the prepared closure case immediately after confirming final checks. Pending reviewer work supports draft, refresh, review answers and simulated submission; switch to staff to inspect results.

Reset Demo Data restores the original seven shared projects and clears demo working drafts. It only changes local demo data. Language preference and selected role are retained. No remote records, accounts or files are modified. Legacy local keys are separate from this demo dataset.

## Browser verification

The browser test uses Playwright with installed Chrome (or set MFU_BROWSER_CHANNEL=edge). Provide Playwright through the normal module path, or set MFU_PLAYWRIGHT_MODULE to its installed package directory.

```sh
npm run test:demo:browser
npm run test:navigation:browser
```

It covers all 11 dedicated scenario routes, compact dashboards, every role menu, URL/role synchronization, browser Back/Forward and deep links, accessible skip navigation, RS-1 submission, correction rejection/request/approval/edit, closure across roles, evaluation draft/refresh/review/submission, persistence, reset, mobile, and absence of external/API requests. The navigation suite additionally checks warning cancellation/acceptance, draft and selected-file restoration, action redirects, fallback routes and absence of page reloads. Screenshots are written to output/demo-qa.

## Build and optional frontend-only deployment

```sh
npm run build
npm run preview
npx firebase deploy --only hosting --config firebase.demo.json
```

Deployment is manual. The optional hosting configuration serves only static dist files and has no API rewrites. The original Firebase configuration, backend adapters and functions remain in the repository for future development; they are not imported by the demo entry point. Historical Firebase setup guides describe that inactive backend implementation.
