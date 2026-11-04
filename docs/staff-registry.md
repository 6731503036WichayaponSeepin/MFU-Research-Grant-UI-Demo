# Staff research registry

The staff dashboard now prioritizes the personal research grant register. Its fields follow worksheet `2567-1`, row 5, columns A:S in the supplied Excel workbook. Project title and leader share one table cell; the remaining source fields are available in the information, closure, and all-columns views. The four report-assessment statuses follow C1:C4, and the three closure-step choices follow the workbook's validation list.

Staff can edit registry fields, report-assessment status, final-report receipt, and the six closure tracking steps. A submitted closure request is required before editing receipt or closure steps. These tracking values do not automatically close the project. Existing document checks and closure completion remain required. Staff can also update the main status using the existing transition policy, with a required reason and an appended status-history record.

Registry data lives in `project.registry`; before/after changes, actor, and time live in `project.registryHistory`. Existing project, proposal, closure, and history data are preserved. Shared-mode validation checks status values, request prerequisites, and appended registry history. The application's existing demo role selection is unchanged; this is not production authentication.

The workbook was read as a schema reference. Real project rows have not been imported into the fictional demo database. This change has not been deployed.

Validation: production build and ESLint pass, and all 26 automated tests pass. Browser verification covered staff entry, searching, editing a closure step on a fictional submitted project, saving, and persistence after page reload. Vite still reports its large-bundle warning.

## Readability and sample-data update

The registry now uses responsive project cards with three key facts and expandable details instead of a horizontally scrolling table. Four scope filters, text search, assessment filtering, and six records per page support scanning. Source fields remain in the expanded detail, and the six closure steps are shown as a vertical checklist. Editors open inside the selected project card.

Fictional demo records receive missing registry text from a deterministic sample generator. Local demo records are upgraded once and the shared-demo seed fixture is updated for future seeding. Existing nonblank values, boolean flags, closure steps, and non-demo records are preserved. The upgrade is idempotent. Existing remote records are not modified by this local change.

Validation: 27 automated tests, ESLint and production build pass. Browser checks cover details, populated sample fields, saving, searching and pagination. Deployment has not been performed.

## Three-role workflow

Normal work queues now use a shared next-task resolver so submitted work appears for the receiving role. Report corrections return through staff to the researcher, then through staff to the assigned reviewer for a fresh evaluation. Completion requires the latest accepted evaluation and final verification. Closure actions synchronize relevant registry fields and record before/after changes; expert payment remains a staff-recorded step.

The dedicated demo panel, role-switch toolbar, and new-demo controls were removed at the user's request. Role selection remains available through the existing account menu and login page. Sample data and normal submission forms remain available.

Validation: all 28 automated tests cover the complete proposal-to-closure flow through the shared save contract. Browser checks exercised researcher submission, staff assignment, reviewer revision request, researcher corrections, re-evaluation, acceptance, closure, and closure notice. New proposal submission to staff was also verified. Build and lint pass; no deployment performed.
