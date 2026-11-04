export function deadlineItems(projects, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)
  return projects.filter(p => ['active','final_report','closure_review'].includes(p.status)).flatMap(project => {
    const endDate = project.endDate || project.proposal?.endDate
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate || '')) return []
    const days = Math.round((Date.parse(endDate) - Date.parse(today)) / 86400000)
    return days <= 30 ? [{project, days, endDate, eventId:`deadline:${project.id}:${endDate}`} ] : []
  }).sort((a,b) => a.days - b.days)
}
