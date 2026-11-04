export function documentUrl(project) {
  const url=project?.documentUrl
  if(typeof url!=='string' || url==='/mock/RS-1-Research-Proposal.pdf')return undefined
  return /^(data:application\/pdf;base64,|https:\/\/|blob:|\/(?!\/))/.test(url) ? url : undefined
}
