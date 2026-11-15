# Gap Analysis — Requirements v1.6

วันที่ตรวจ 14 November 2026. หลักฐานจาก working tree; file/function references เป็นตำแหน่งค้นพฤติกรรมจริง ไม่ใช่ข้อสรุปจากชื่อไฟล์. Priority และ Recommended Action เป็นข้อเสนอ audit ไม่ใช่ Stakeholder approval. อ่าน AC ในคอลัมน์ FR ที่อ้าง และ AC-TR ใน State Specification

## ช่องว่างหลักและผลกระทบ

| Gap | Priority | เรื่อง | Evidence | Current behavior | Required / proposed resolution | Requirement / TR | Impacted pages | Action |
|---|---|---|---|---|---|---|---|---|
| G01 | P0 | State model / timeline | statuses.js workflow, closure.transition, functions/policy.stages | 9 legacy stages + revision_required; no REPORT_EVALUATION/CANCELLED; review uses closure_review | ใช้9StateIDและTR;แยกaction_requiredจากmainstatus;ไม่renameblind | FR-RES-18; NFR-04; TR-01–17 | ทุกrole; R07/08,S03/04,V03/04 | REDESIGN |
| G02 | P0 | Role routes / authentication / drafts | App.restricted,canRead; DemoEntry; useFormDraft | localrolemock;reviewercorrection/closureไม่ถูกrestrictระดับApp;formsdraftบางkeyไม่UID | explicit capability guards;แยกlocaldemoกับauth;draftscopeUID/workspace | FR-COM-01–04; NFR-01/02/10 | ทุกrole; C01/02 | MODIFY |
| G03 | P1 | Import mapping/source fidelity | UploadDocument.extractRS1Fields/continueToForm | 9fieldsregex;blankไม่ล้างค่าเก่า;DOCX/largePDFเหลือmetadata;noOCR | fieldprovenance/missing/clearvalueและsourceversion;รอfile/mapping/accuracyAC | FR-RES-04–08; NFR-06/07; OPEN-01–03 | R04/05,S05 | MODIFY |
| G04 | P0 | Ready-for-affiliation / PDF | ManualEntry,ProposalPDF,buildProposal | ไม่มีTR-03แยก;PDFgenerictextlayoutไม่officialsigningtemplate | แยกPreviewกับReadyconfirmation/version;triggerรอOPEN-04;ตรวจtemplateจริง | FR-RES-09–12; FR-SIG-01; NFR-05; TR-03/04 | R05/06 | SPLIT |
| G05 | P0 | Submission evidence / consent | SubmissionConfirmation; proposalValidation | ไม่ตรวจsignedRS1+affiliation+consent;reviewedcheckboxแทนไม่ได้ | documentkinds+signatorychecklist+conditionalconsent/audit;gateTR-05ทั้งclient/server | FR-RES-13–15; FR-SIG-02–06; BR-03/04/11/12; TR-05 | R06,S06 | REDESIGN |
| G06 | P0 | Staff proposal revision | updateProjectStatus/buildProposal | revision_requiredเป็นmainstate;reviewnotesมีแต่focusedไม่แสดงประวัติชัด | คงSTAFF_REVIEWเมื่อreturn/resubmit;taskowner+revisionversion;checklistรอOPEN-06 | FR-ADM-01–05; FR-RES-16/17; TR-06/08 | S06,R05 | MODIFY |
| G07 | P0 | Acknowledgement / certification | AdministrativeRecords; recordAdministrativeResult | รวมunit/eOffice/committee/active;extraeoffice_pending;outcomeแนวdecision | separate acknowledgement/recordcertification;noCommitteeapproval;ไม่สร้างloginexternal | FR-ADM-06/07/11; BR-02/05/06; TR-09 | S07 | REDESIGN |
| G08 | P0 | Staff-only approved changes / extension | demoCorrection; applyChange; ProjectChangeRecord | researcherแก้หลังWebapproval;extensionanynoncompleted/unlimited;noDeniedrecord | mergeexternalresultsเป็นstaffworkspace;recordapproved/denied;onlyIN_PROGRESS;2×6months;researcherviewreadonly | FR-ADM-09/13; BR-14; TR-10; OPEN-13 | R10,S08/09 | MERGE |
| G09 | P0 | Closure evidence by path | ResearcherForm; transition.submit/check | publicationrequireevidencePDFแต่ไม่บังคับsummaryreportfile;eligibilitylegacy;supportoptional | สองpath checklist/files/version/explicitconfirm;publicationnoreviewer;criteriaOPEN-14 | FR-CLS-01–08; TR-11–14 | R11,S10 | MODIFY |
| G10 | P0 | Exactly3 reviewers / fixed progress | evaluation.allEvaluationsSubmitted; closure.check; securePolicy | localdirectory1;reducer≥1;server1–10;ครบ1/1ก็releaseได้ | exactly3 uniqueactiveassigned;countsubmittedonly0/3–3/3;APIgatesด้วย | FR-REV-01/09/10; TR-13/15 | S10/11,V01/02 | SPLIT |
| G11 | P0 | One round only | closure.submit/final_check; interactiveDemo; reviewerScenarios.test | nextReviewRoundรีเซ็ตevaluationsและเพิ่มรอบ;legacyreviseก็วน | ส่งฉบับแก้ไขให้staffตรวจเท่านั้น;preserveevaluations;reportversionไม่ใช่reviewround | FR-REV-08; FR-CLS-09/10; BR-08; TR-15/16 | R11,S10,V01/08 | MODIFY |
| G12 | P0 | Release / revised upload / final close | release_feedback; ResearcherForm.editable; final_check | finaloptionsetsrevisedAfterEvaluation=trueก่อนuploadและล็อกresearcher;revisionoptionไปround2 | releaseoneidempotentevent3/3;researcheruploadจริง;staffverifynewversionแล้วclose | FR-REV-10; FR-CLS-09/10; TR-15/16 | R11/12,S10/11 | SPLIT |
| G13 | P0 | Nested evaluation/file privacy | projectView; ProjectDocuments; timeline; firebaseFiles.hydrateFiles | currentevaluationsถูกfilterแต่reviewRounds/submissionsไม่redact;reviewercanReadprojectแล้วproposal/metadataกว้าง;hydratefailfileอาจfailwholeproject | fieldallowlistsทุกnestedarchive;filepermissionsแยก;PDFจริงเป็นsource;ไม่เปิดรายอื่น/ก่อนrelease | FR-COM-02; FR-REV-01/03/07; NFR-01/02 | R09/12,S05,V03/05/08 | MODIFY |
| G14 | P1 | Evaluation PDF | EvaluationDetails/FeedbackFiles; generateRS1PDFเท่านั้น | ไม่มีgeneratorผลประเมิน;downloadinputfeedbackแทนกันไม่ได้ | on-demandindividualPDFจากsubmittedrecord;role/releasegate;noinventedsignature | FR-REV-07; NFR-05; UseCase3.18 | R12,S11,V08 | ADD |
| G15 | P1 | Unconfirmed policies / standards / rubric | ManualEntry.standardOptions; data/registry; evaluation.js | มาตรฐานเลือกsinglevalue/ไม่มีevidence;enumregistry4และ6stepตั้งแล้ว;rubric3resultไม่ใช่proofactualExcel | รอOPEN-01/06/11/17/21;designformsได้แต่ไม่บังคับpolicy/enumเอง | FR-STD-01–03; FR-REV-04; FR-REG-04; BR-13/16 | R05,S07/registry,V06 | PENDING |
| G16 | P1 | Notifications vs email | Notifications; deadlines; functions/index | มีactivityและ30dayalertแต่ไม่มีsender/scheduler/deliveryaudit | notificationworkspace+futureemailserviceหลังยืนยันschedule;ไม่อ้างส่งemailจริงในdemo | FR-RES-20; UseCase3.8; OPEN-10; NFR-03 | R13,S12,V09 | MODIFY |
| G17 | P1 | Documents / history / closure notice reachability | ProjectDetailfocused;ClosureWorkspacefocused | changes/docstabซ่อนแต่queryเปิด;closedbranchไม่mountnotice/history;staffrelease/finalnestedข้อมูลกระจัดกระจาย | sharedDocumentLibrary+Audit;closedreadonlydetail+externalnoticepanelตามสิทธิ์ | FR-CLS-11/12; FR-ADM-10/11; NFR-03 | R07–09,S03–05/10 | MERGE |
| G18 | P2 | Navigation and mock consistency | DemoScenarios,ReviewerDashboard,ProjectDocuments,README | 12seedแทนREADME7;round2scenario;hardcodedreportใช้ทุกproject;resetcallbackไม่ได้consumeในApp | newfixturesv1.6;mocklabelทุกsyntheticdata;contextactions;remove duplicatelegacyentryafterparity | NFR-08/10/11; FR-REV-08 | ทุกrole | REDESIGN |
| G19 | P1 | Local/server action parity | demoCorrection vs securePolicy.replayProject | correction_*localpersistแต่backendunknownaction;ต่างโหมดทำงานไม่เท่ากัน | retireoldcorrectionflowหลังnewstaffchange;sharedactioncontract;testmodeparity | FR-ADM-13; NFR-04/11 | R10,S09 | REMOVE |
| G20 | P0 | Cancellation absent | statuses,APIreplay,pages; registrylabelonly | ไม่มีCANCELLED/TR-17reasonandterminalguards | addcancelrecord/readonlyoutcome;RESIGNED/EXCEEDED_DURATION/OTHER+detail;permissionOPEN-20ก่อนenable | FR-CAN-01/02; FR-REG-03; BR-14/15; TR-17 | ใหม่ cancellation และprojectdetails | ADD |
| G21 | P2 | Registry UI and enrollment windows | StaffRegistrylegacy; data/registry; functions/records | legacyeditorunmounted;registrationroundไม่มี;indexไม่ใช่UI | staffregistrylistviewmergeprojectlist;unconfirmedfieldsreadonly/PENDING;noharddelete/windowblock | FR-REG-01/02/04; BR-01/16; OPEN-18/19/21 | S02 + proposedregistry | MERGE |
| G22 | P0 | Verification coverage / server packaging | tests*, scripts/sync-server-domain | 67testsผ่านแต่testsreroundถูกเขียนเป็นexpected;no v1.6conformance;domaincopies | baselinepreserved+newconformancecases17 TR/ACL/PDF;comparecopiesก่อนdeploy;ไม่ใช้oldpassclaimcompliance | NFR-04/09/11/12; ทุกFRที่กระทบ | ทุกphase | MODIFY |

## Transition conformance ครบ TR-01–TR-17

| Rule | พฤติกรรม v1.6 | Current / status | Gap |
|---|---|---|---|
| TR-01 | เริ่ม→DRAFT หลังsaveครั้งแรก | Partial: draft local; newsubmitสามารถข้ามinitialsavedraftในAPI | G01/G04 |
| TR-02 | DRAFT selfเมื่อกรอก/import/save | Partial: draftคงเดิม;importworkingcopyจริง;ไม่ควรstatechange | G01/G03 |
| TR-03 | readyconfirmation→AFFILIATION_REVIEW | Missing explicitreadyversion;genericSubmission→unit_review;triggerOPEN | G04 |
| TR-04 | affiliationrevision→เดิม | Partial: editlockedในunit_reviewจนreturnrevision_required | G04/G06 |
| TR-05 | signed+affiliation+consent+confirm→STAFF_REVIEW | Nonconforming: nobothfilesgate;submit→unit_review | G05 |
| TR-06 | staffreturn/researcherresubmitคงSTAFF_REVIEW | Nonconforming: revision_requiredmainstate | G06 |
| TR-07 | backaffiliationตามเกณฑ์ที่ยังOPEN | ยังไม่ยืนยัน ห้ามใช้legacyreturndecisionเป็นpolicy | G06; OPEN-05 |
| TR-08 | staffpass→COMMITTEE_ACKNOWLEDGEMENT | Partial: committee_reviewใกล้เคียงแต่enumเก่า | G01/G06 |
| TR-09 | หลังเพื่อทราบ staffcertify→IN_PROGRESS | Partial: endorsed+certification fields;standardsruleOPEN | G07/G15 |
| TR-10 | staffrecordextension e-Office;IN_PROGRESSself | Partial: no2×6months/onlyactive;ไม่ส่งeOfficeAPI | G08 |
| TR-11 | confirmsubmitclosure→CLOSURE_REVIEW | Partial: closure_review;เอกสารเผยแพร่ขั้นต่ำไม่ครบ | G09 |
| TR-12 | request/addclosurefilesคงCLOSURE_REVIEW | Partial: stateclosure_reviewselfแต่subform/versionsต้องปรับ | G09 |
| TR-13 | reportpath→REPORT_EVALUATION | Nonconforming: คงclosure_review;reviewersvariable | G01/G10 |
| TR-14 | publicationstaffclose→CLOSED | Partial: completeswithoutReviewerจริงแต่checklistไม่ครบ | G09 |
| TR-15 | 3 submitted→staffrelease→revisedupload;REPORT_EVALUATIONself | Nonconforming: 1/1ผ่าน;round2หรือfinalflagก่อนupload | G10/G11/G12 |
| TR-16 | staffverifyrevisedfilesแล้วCLOSED | Partial: guardsบางส่วนมีแต่bypassnewversion/legacyreround | G11/G12 |
| TR-17 | IN_PROGRESScancelreason/confirm→CANCELLED | Not Implemented;permissionandotheroriginsOPEN | G20 |

## Functional Requirement coverage (ครบทุก FR)

ตารางใช้ **Partial/Mock/Not Implemented** เทียบเป้าหมาย v1.6; “Partial” อาจมี utilityทำงานแล้วแต่ผิดstate/สิทธิ์หรือไม่มีreachableUI. ไม่ใช่คะแนนผ่านการตรวจรับ

| FR | สิ่งที่พบ / ผลเทียบ | Features / Gaps |
|---|---|---|
| FR-COM-01 | Partial: auth/read/list/detail/history มีแต่localmock/ACL projectionต้องปรับ | F01–03/F15; G02/G13/G17 |
| FR-COM-02 | Partial: auth/read/list/detail/history มีแต่localmock/ACL projectionต้องปรับ | F01–03/F15; G02/G13/G17 |
| FR-COM-03 | Partial: auth/read/list/detail/history มีแต่localmock/ACL projectionต้องปรับ | F01–03/F15; G02/G13/G17 |
| FR-COM-04 | Partial: auth/read/list/detail/history มีแต่localmock/ACL projectionต้องปรับ | F01–03/F15; G02/G13/G17 |
| FR-COM-05 | Partial: auth/read/list/detail/history มีแต่localmock/ACL projectionต้องปรับ | F01–03/F15; G02/G13/G17 |
| FR-RES-01 | Partial: create/manual/saveจริง ใช้draftlegacy | F04/F05; G01 |
| FR-RES-02 | Partial: create/manual/saveจริง ใช้draftlegacy | F04/F05; G01 |
| FR-RES-03 | Partial: create/manual/saveจริง ใช้draftlegacy | F04/F05; G01 |
| FR-RES-04 | Partial: import/extract9fields+reviewจริง;mapping/sourceversionไม่ครบ | F06; G03 |
| FR-RES-05 | Partial: import/extract9fields+reviewจริง;mapping/sourceversionไม่ครบ | F06; G03 |
| FR-RES-06 | Partial: import/extract9fields+reviewจริง;mapping/sourceversionไม่ครบ | F06; G03 |
| FR-RES-07 | Partial: import/extract9fields+reviewจริง;mapping/sourceversionไม่ครบ | F06; G03 |
| FR-RES-08 | Partial: import/extract9fields+reviewจริง;mapping/sourceversionไม่ครบ | F06; G03 |
| FR-RES-09 | Partial: basicvalidation/PDFจริง;readytrigger/version/editoraffiliationไม่ครบ | F05/F07/F08; G04 |
| FR-RES-10 | Partial: basicvalidation/PDFจริง;readytrigger/version/editoraffiliationไม่ครบ | F05/F07/F08; G04 |
| FR-RES-11 | Partial: basicvalidation/PDFจริง;readytrigger/version/editoraffiliationไม่ครบ | F05/F07/F08; G04 |
| FR-RES-12 | Partial: basicvalidation/PDFจริง;readytrigger/version/editoraffiliationไม่ครบ | F05/F07/F08; G04 |
| FR-RES-13 | Not Implemented gate/affiliationevidenceแยก;genericcheckboxไม่พอ | F09/F11; G05 |
| FR-RES-14 | Not Implemented gate/affiliationevidenceแยก;genericcheckboxไม่พอ | F09/F11; G05 |
| FR-RES-15 | Partial:receipt/revisionnotes/resubmitจริงแต่ผิดstateและgates | F11/F12; G05/G06 |
| FR-RES-16 | Partial:receipt/revisionnotes/resubmitจริงแต่ผิดstateและgates | F11/F12; G05/G06 |
| FR-RES-17 | Partial:receipt/revisionnotes/resubmitจริงแต่ผิดstateและgates | F11/F12; G05/G06 |
| FR-RES-18 | Partial:legacytimeline+history ไม่ใช่9StateIDใหม่ | F15; G01/G17 |
| FR-RES-19 | Partial:legacytimeline+history ไม่ใช่9StateIDใหม่ | F15; G01/G17 |
| FR-RES-20 | Partial:date/alert30days ไม่มีemailและกฎscheduleยังOPEN | F17/F31; G16 |
| FR-SIG-01 | Partial:PDFแสดงsignatorytext ไม่ใช่officialsigningtemplate | F07; G04 |
| FR-SIG-02 | Not Implemented signedkind/checklist/conditionalconsent/audit | F09/F10; G05 |
| FR-SIG-03 | Not Implemented signedkind/checklist/conditionalconsent/audit | F09/F10; G05 |
| FR-SIG-04 | Not Implemented signedkind/checklist/conditionalconsent/audit | F09/F10; G05 |
| FR-SIG-05 | Not Implemented signedkind/checklist/conditionalconsent/audit | F09/F10; G05 |
| FR-SIG-06 | Partial:staffเปิดgeneratedPDFได้แต่ไม่มีsignedsubmissionbundle | F09; G05 |
| FR-ADM-01 | Partial:queue/review/return/passจริง;checklist/evidence/stateไม่ครบ | F03/F12/F13; G06 |
| FR-ADM-02 | Partial:queue/review/return/passจริง;checklist/evidence/stateไม่ครบ | F03/F12/F13; G06 |
| FR-ADM-03 | Partial:queue/review/return/passจริง;checklist/evidence/stateไม่ครบ | F03/F12/F13; G06 |
| FR-ADM-04 | Partial:queue/review/return/passจริง;checklist/evidence/stateไม่ครบ | F03/F12/F13; G06 |
| FR-ADM-05 | Partial:queue/review/return/passจริง;checklist/evidence/stateไม่ครบ | F03/F12/F13; G06 |
| FR-ADM-06 | Partial:externalrecordมีแต่acknowledgement/certificationควรแยก | F14; G07 |
| FR-ADM-07 | Partial:externalrecordมีแต่acknowledgement/certificationควรแยก | F14; G07 |
| FR-ADM-08 | Partial:search/listมี;registryfullUIunmounted | F03/F30; G21 |
| FR-ADM-09 | Partial:extensionrecordจริงแต่limits/eligibilityไม่ครบ | F17; G08 |
| FR-ADM-10 | Partial:historyหลายที่;private/actortrust/visibilityต้องจัด | F15; G13/G17 |
| FR-ADM-11 | Partial:externalreferenceมี;closureNoticeunreachable | F14/F27; G07/G17 |
| FR-ADM-12 | Partial:serverreplayจริงแต่ใช้legacytransition/ACLcoverage | F01/F02; G01/G02 |
| FR-ADM-13 | Partial:staffrecordมีแต่researcherWebcorrectionขัด | F16/F18; G08/G19 |
| FR-CLS-01 | Partial:twooptions/reportPDFมี;checklist/versionต้องปรับ | F19; G09 |
| FR-CLS-02 | Partial:twooptions/reportPDFมี;checklist/versionต้องปรับ | F19; G09 |
| FR-CLS-03 | Partial:publicationPDFมีแต่summaryreportfileไม่บังคับ;criteriaOPEN | F20; G09 |
| FR-CLS-04 | Partial:submit/check/returnจริง;canonicalstate/rulesต้องปรับ | F19; G01/G09 |
| FR-CLS-05 | Partial:submit/check/returnจริง;canonicalstate/rulesต้องปรับ | F19; G01/G09 |
| FR-CLS-06 | Partial:submit/check/returnจริง;canonicalstate/rulesต้องปรับ | F19; G01/G09 |
| FR-CLS-07 | Partial:publicationbypassจริงแต่reportไม่มีREPORT_EVALUATION | F20/F21; G01/G09/G10 |
| FR-CLS-08 | Partial:publicationbypassจริงแต่reportไม่มีREPORT_EVALUATION | F20/F21; G01/G09/G10 |
| FR-CLS-09 | Partial/nonconforming:revision→round2หรือflagก่อนnewupload | F24/F26; G11/G12 |
| FR-CLS-10 | Partial/nonconforming:revision→round2หรือflagก่อนnewupload | F24/F26; G11/G12 |
| FR-CLS-11 | Partial:history/documents/closedinfoกระจัดกระจายและnoticeunreachable | F26/F27; G17 |
| FR-CLS-12 | Partial:history/documents/closedinfoกระจัดกระจายและnoticeunreachable | F26/F27; G17 |
| FR-REV-01 | Partial:server1–10/local1 ไม่exactly3 | F21; G10 |
| FR-REV-02 | Partial:assignedlist/reportจริงแต่readableMock/overscope | F02/F03; G13/G18 |
| FR-REV-03 | Partial:assignedlist/reportจริงแต่readableMock/overscope | F02/F03; G13/G18 |
| FR-REV-04 | Partial:form/draft/sendจริง;rubricOPEN/mainstateเก่า | F22; G01/G15 |
| FR-REV-05 | Partial:form/draft/sendจริง;rubricOPEN/mainstateเก่า | F22; G01/G15 |
| FR-REV-06 | Partial:form/draft/sendจริง;rubricOPEN/mainstateเก่า | F22; G01/G15 |
| FR-REV-07 | Not Implemented evaluationPDFgenerator | F25; G14 |
| FR-REV-08 | Nonconforming:มีreroundในcode/seed/tests | F24; G11 |
| FR-REV-09 | Partial:countervariableและreleaseallassignedไม่ใช่exact3 | F23; G10/G12 |
| FR-REV-10 | Partial:countervariableและreleaseallassignedไม่ใช่exact3 | F23; G10/G12 |
| FR-STD-01 | Partial/PENDING:standardsselectgeneric;types/evidence/permissions/blockOPEN | F29; G15 |
| FR-STD-02 | Partial/PENDING:standardsselectgeneric;types/evidence/permissions/blockOPEN | F29; G15 |
| FR-STD-03 | Partial/PENDING:standardsselectgeneric;types/evidence/permissions/blockOPEN | F29; G15 |
| FR-REG-01 | Not Implemented enrollmentroundview;datefieldมีแต่ไม่mapround | F30; G21 |
| FR-REG-02 | Not Implemented confirmedregistryremovalworkflow;ยังOPEN ห้ามauto/harddelete | F30; G21 |
| FR-REG-03 | Not Implemented cancellationrecordครบชุด | F28; G20 |
| FR-REG-04 | Partial:hardcodedregistryและindexesมี แต่ExcelmappingOPEN | F30; G15/G21 |
| FR-CAN-01 | Not Implemented cancelreason/confirm/guards;permissionOPEN | F28; G20 |
| FR-CAN-02 | Not Implemented cancelreason/confirm/guards;permissionOPEN | F28; G20 |

## NFR coverage

| NFR | หลักฐาน / สิ่งที่ยังขาด |
|---|---|
| NFR-01 | BackendAuth/replay/rulesมี แต่localroleไม่secure; nestedarchives/routecapabilitiesต้องtest |
| NFR-02 | privateStorage+viewsมี; localrecordsallbrowser; synthetictext/filehydrationprivacyต้องแก้ |
| NFR-03 | appendhistoryมี; cancel/release/newfileversion/auditvisibilityต้องเติม |
| NFR-04 | testsใช้legacytransitions ไม่ครบTR17;ต้องdomain redesign |
| NFR-05 | RS1generatorจริงแต่officialtemplateไม่QA; evaluationPDFไม่มี |
| NFR-06 | editableextraction9fields; accuracythresholdOPEN ไม่อ้างprecisionจริง |
| NFR-07 | fileparseerror,quotaerrorมี; importclear/sourcebytes/hydrationfailureต้องตรวจเพิ่ม |
| NFR-08 | hash/Back/draftguard/keyboardskipมี; ยังไม่browser/responsive/usabilityauditจริงในงานนี้;80%/4จาก5รอยืนยัน |
| NFR-09 | 67 Node testsผ่าน แต่v1.6casesไม่ครบ;90%เกณฑ์รอยืนยัน |
| NFR-10 | seedสมมติ/labelsมี แต่hardcodedreportใช้ทุกproject;draftsควรUIDscope |
| NFR-11 | state/UI/backend/domaincopy/test/READMEไม่ตรง;ต้องtraceabilityต่อpage |
| NFR-12 | ยังไม่benchmark;จำนวนผู้ใช้/ขนาด/latencyเป้าหมายOPEN |

## Business Rules coverage

| BR | ผลเทียบ |
|---|---|
| BR-01 | ไม่พบenrollmentroundUI/autoWindow; automaticrestrictionยังOPEN ไม่ถือmissingblockเป็นbug |
| BR-02 | ไม่มีaffiliationaccount; externalrecordมีแต่staffรับผลแทนresearcherattachmentflow |
| BR-03 | ไม่พบaffiliationmeeting-or-confirmationfilegate |
| BR-04 | submitexplicitมี;preview/saveไม่submit แต่submittriggerต้องแยกTR03/05 |
| BR-05 | ไม่มีcommitteeaccount แต่recordwordingยังรวมendorsement/certificationให้ปรับ |
| BR-06 | ไม่พบe-OfficeAPI ตรงscope;Webcorrectionapprovalไม่ตรงexternalchangeflow |
| BR-07 | สองclosurepathsมี;publicationbypassReviewerจริง |
| BR-08 | ผิด:code/seed/testsรองรับevaluationround2 |
| BR-09 | staffcompleteเป็นrequired ไม่ปิดเพียงupload;finalfilegateยังขาด |
| BR-10 | OPENเกณฑ์TR07 ไม่อนุมานจากlegacyreturn |
| BR-11 | signedRS1gateไม่พบ;signatorytextไม่เท่ากับsignedfile |
| BR-12 | consentconditionalrecordไม่พบ |
| BR-13 | standardsmetadata/evidence/roleไม่ครบ;เตือนหรือblockยังOPEN |
| BR-14 | noauto-cancelตรงหลัก แต่extensionlimits2×6เดือนไม่มี |
| BR-15 | registrylabelยกเลิก/ลาออกมีแต่ไม่ใช่CANCELLEDterminal/auditbundle |
| BR-16 | hardcoded4labels/6stepsมี;actualExcelmappingยังOPEN ห้ามนับว่ายืนยันแล้ว |

## หน้าซ้ำ การรวม/แยก และสิ่งที่ควรถอด

- MERGE project detail implementations: ProjectDetail กับ ActiveProjectDetail; เก็บ shared project shell, ไม่ทำ Active/Closed/Cancelled เป็นสามschema
- MERGE MyProjects กับ ProjectList/StaffProjectList ใน reusable list+roleconfig; เก็บstafffilterพิเศษ; scenariosเป็นdemo-onlyview
- REMOVE old Dashboard/StaffDashboard navigation หลังmigrationparityเท่านั้น; reusableStaffRegistryต้องไม่หายโดยไม่ย้ายrequirementsที่อนุมัติ
- SPLIT ClosureWorkspace เป็น Submission, Staff Closure Review, Reviewer Assignment, Evaluation Tracking/Release, Final Verification; ลดปุ่มตามclosure.stateในหน้ารวมใหญ่และทำdeep-link taskได้
- MERGE old CorrectionRequest เข้าสู่staffexternalChangeRecord; researcherเปลี่ยนเป็นreadonlyhistory+คำแนะนำe-Office ไม่ใช่Webapproval
- KEEP reviewerEvaluation+Answersเป็นeditor/reviewsteps; resultsเป็นreadonly componentร่วม; ลดsectiontabsที่ส่งpropsแล้วไม่ทำงาน
- REDESIGN Documents ให้เลือกจริงทุกkind/versionและอ่านPDFจริง; remove fabricatedreadableparagraphsจากrealprojectview. Trainingtextแสดงเฉพาะdemoที่labelชัด
- ADD Evidence Submission, fixed3ReviewerAssignment/Tracking, Cancellation Record, EvaluationPDF action; PDFไม่จำเป็นต้องเพิ่มrouteใหม่

## OPEN / ข้อขัดแย้งที่ต้องยืนยันก่อนลงมือส่วนที่เกี่ยวข้อง

| Decision | เอกสาร / ผลกระทบ | สิ่งที่ทำแผนต่อได้ |
|---|---|---|
| D01 | OPEN-01–03,06:fields/types/extraction/checklist | ออกแบบcomponent/provenance;ไม่ตรึงapprovedfilelimits/accuracy |
| D02 | OPEN-04:TR03readytrigger;UserFlowใช้คำว่าสร้างPDFแล้วไปaffiliation แต่StateยังOPEN | แยกPreviewกับConfirmในproposal;ยังไม่enabletransitionโดยเดา |
| D03 | OPEN-05:TR07กลับต้นสังกัด | ทำTR06selfloop;เว้นTR07PENDING |
| D04 | OPEN-11/07/21:actualrubric/4registryresults | เก็บdraftcomponentไม่อ้างofficialapproval;ไม่inventenum |
| D05 | OPEN-10:datecalculation/reminders;BR14กำหนด2×6เดือนแล้วแต่calendar/edgecasesยังต้องตกลง | วางhistory/extensioncounter;ไม่ตั้งemailcadenceเอง |
| D06 | OPEN-13:postsubmitpermissions/versioning | staff-onlyapprovedchangeแน่นอนตามFR-ADM13;ฟิลด์revisionอื่นรอ |
| D07 | OPEN-14:publicationevidencecriteria | ทำtwo-pathcomponent;ไม่กำหนดconferenceacceptanceเอง |
| D08 | OPEN-15/16:consentproof/signedfiletypes | conditionalattestationไม่อ้างverifyauthenticity;awaitfilepolicy |
| D09 | OPEN-17:standards types/evidence/warn-or-blockTR09 | recorddesignได้;ไม่blockทุกproject |
| D10 | OPEN-09/18:submissionwindows | showdates/roundproposal;ไม่auto-rejectoutofwindow |
| D11 | OPEN-19:registryremovalauthority/meaning | ห้ามharddelete/auto-cancel;ออกแบบreadonlyrecord |
| D12 | OPEN-20:cancelpermission/otheroriginstates;UseCaseDiagramโยงStaffแต่StateระบุOPEN | reason/auditreadonlydesignได้;disablepermissiondependentactionจนตอบ |
| D13 | FR-REV07:combinedPDF/retention/downloadafterCLOSEDยังDESIGN/OPEN | implementplanindividualPDFduringauthorizedevaluation;postclosepending |
| D14 | Workflowemailเป็นsideeventแต่ResearcherFlowวางในmainline | ไม่สร้างemailreceivedprerequisite;ยืนยันลำดับหากกระทบงาน |
| D15 | OPEN-12:SeminarMVP;เป้าหมายNFR08/09/12 | prioritiesนี้เป็นข้อเสนอให้ผู้ใช้เลือก ไม่อนุมัติทั้งscopeเอง |

ไม่พบความขัดแย้งหลักเรื่อง3 roles/9 states/one-round/3 reviewersในเอกสารชุดv1.6;ความต่างหลักอยู่ในimplementationและรายละเอียดOPENข้างต้น. ไม่แก้ต้นฉบับRequirementsในauditนี้

