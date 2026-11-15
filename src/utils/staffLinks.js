export function staffTaskLinks(p) {
  const links = []
  if (p.status === 'STAFF_REVIEW') links.push(['staff-review', 'Proposal Review'])
  if (p.status === 'COMMITTEE_ACKNOWLEDGEMENT') links.push(['administrative-records', 'Acknowledgement & Certification'])
  if (p.status === 'IN_PROGRESS') links.push(['project-change-record', 'Change & Extension Records'])
  if (p.status === 'CLOSURE_REVIEW') {
    links.push(['closure-review', 'Closure Document Review'])
    if (p.closure?.method === 'report' && p.closure.check?.revision === p.closure.revision) links.push(['reviewer-assignment', 'Reviewer Assignment'])
  }
  if (p.status === 'REPORT_EVALUATION') { links.push(['evaluation-tracking', 'Evaluation Tracking & Release']); if (p.closure?.release) links.push(['final-verification', 'Final Verification & Closure']) }
  if (p.status === 'CLOSED') links.push(['final-verification', 'Closure / External Notice'])
  if (['IN_PROGRESS', 'CANCELLED'].includes(p.status)) links.push(['cancellation', 'Cancellation Record (OPEN-20)'])
  return links
}
