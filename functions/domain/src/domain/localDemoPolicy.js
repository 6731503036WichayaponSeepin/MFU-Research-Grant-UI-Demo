// Temporary Local Demo design authorized by the user. Never a production policy.
export const DEMO_POLICY_ID = 'LOCAL-V16-OPEN04-13'
export const EDITABLE_SECTIONS = Object.freeze({
  projectTitle: ['projectTitle', 'projectTitleEn'],
  researcherInformation: ['leaderName', 'leaderAffiliation', 'leaderPhone', 'leaderEmail', 'leaderPercent', 'bioName', 'bioPosition', 'bioResearchId', 'bioEducation', 'bioExperience', 'bioExpertise', 'bioPublications', 'bioPresentations', 'bioIP', 'bioManagement', 'bioCompleted', 'bioOngoing'],
  coResearchers: ['participants'], advisor: ['advisorName', 'advisorQualification', 'advisorPosition', 'advisorAffiliation'],
  researchDetails: ['strategy', 'researchType', 'keywords', 'background', 'literature', 'references', 'cooperationName', 'cooperationAffiliation', 'cooperationAddress', 'cooperationType', 'standards', 'clarifications'],
  objectives: ['objectives'], methodology: ['methodology'], researchScope: ['scope'], researchPlan: ['workPlan', 'progress'],
  researchDuration: ['startDate', 'endDate'], expectedOutcomes: ['outcomeType', 'outcomeDetail', 'integration', 'publicationLevel'],
  budget: ['compensation', 'compensationDetail', 'directCost', 'directDetail', 'materials', 'materialsDetail', 'utility', 'utilityDetail'],
  supportingDocuments: [],
})
for (const fields of Object.values(EDITABLE_SECTIONS)) Object.freeze(fields)
export const localDemoPolicyEnabled = (project, actor, mode) => mode === 'local-demo' && actor?.simulation === true &&
  actor.workspace === 'local-demo-v16' && project?.workspace === actor.workspace && project.fictional === true && project.simulationOnly === true
export function correctionFields(project, actor, mode) {
  if (!localDemoPolicyEnabled(project, actor, mode)) return []
  return (project.proposalReview?.editableSections || []).flatMap(section => EDITABLE_SECTIONS[section] || [])
}
