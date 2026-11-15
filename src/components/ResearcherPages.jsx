import ResearcherEditor from '../pages/ResearcherEditor'
import ResearcherProposalPDF from '../pages/ResearcherProposalPDF'
import ResearcherSubmission from '../pages/ResearcherSubmission'
import ResearcherClosure from '../pages/ResearcherClosure'
import ResearcherResults from '../pages/ResearcherResults'
import ChooseSubmissionMethod from '../pages/ChooseSubmissionMethod'
import '../pages/ResearcherProposalChoice.css'
export default function ResearcherPages(props) {
  const { page, project, go } = props
  if (page === 'choose') return <ChooseSubmissionMethod manualHref={go.href('manual', project?.id)} uploadHref={go.href('upload', project?.id)} headingId="page-title" hideBack />
  if (['manual', 'upload'].includes(page)) return <ResearcherEditor {...props} />
  if (page === 'proposal-pdf') return <ResearcherProposalPDF {...props} />
  if (page === 'submission') return <ResearcherSubmission {...props} />
  if (page === 'closure') return <ResearcherClosure {...props} />
  if (page === 'revised-report') return <ResearcherClosure {...props} revised />
  if (page === 'results') return <ResearcherResults {...props} />
  return null
}
