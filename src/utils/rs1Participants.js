export const PARTICIPANT_FIELDS = ['name','affiliation','phone','email','percent']
export const PARTICIPANT_LEGACY_KEYS = ['participantName','participantAffiliation','participantPhone','participantEmail','participantPercent']
export function projectParticipants(proposal = {}) {
  if(Array.isArray(proposal.participantRecords))return proposal.participantRecords
  const first=Object.fromEntries(PARTICIPANT_FIELDS.map((key,i)=>[key,proposal[PARTICIPANT_LEGACY_KEYS[i]]??'']))
  return Object.values(first).some(value=>String(value).trim())?[first]:[]
}
export function participantPatch(rows) {
  return {participantRecords:rows,...Object.fromEntries(PARTICIPANT_LEGACY_KEYS.map((key,i)=>[key,rows[0]?.[PARTICIPANT_FIELDS[i]]??'']))}
}
