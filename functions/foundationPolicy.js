import { executeProjectAction } from './domain/src/domain/actions.js'
import { assertActor, hasCapability, projectProjection } from './domain/src/domain/permissions.js'
import { isFoundationProject, requireDomain } from './domain/src/domain/contracts.js'

// actor and directory are supplied by researchApi after Auth/profile reads inside the transaction.
// No command may inject an actor, context, profile directory or OPEN-policy approvals.
export function executeFoundationCommand(previous, command, actor, profiles, now = new Date().toISOString()) {
  requireDomain(!previous || isFoundationProject(previous), 'MIGRATION_REVIEW_REQUIRED', 'Legacy records require a reviewed migration; the API cannot auto-convert them', 409)
  requireDomain(!command?.actor && !command?.context && !command?.approvals && !command?.project, 'INVALID_COMMAND', 'Send an action payload, not a replacement aggregate or authorization context')
  const authoritativeActor = { ...actor, authenticated: true, simulation: false }
  const next = executeProjectAction(previous, command, { actor: authoritativeActor, profiles, mode: 'backend', now })
  requireDomain(Buffer.byteLength(JSON.stringify(next)) < 750000, 'METADATA_LIMIT', 'Project metadata exceeds the current server storage limit', 413)
  return { ...next, serverUpdatedAt: now }
}
export function foundationView(project, actor) {
  assertActor({ ...actor, authenticated: true }, 'backend')
  return { ...projectProjection(project, actor), viewerRole: actor.role }
}
export function canUploadFoundation(project, actor) {
  return hasCapability(project, actor, 'upload')
}
