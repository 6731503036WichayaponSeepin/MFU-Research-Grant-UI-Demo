import { sharedMode, executeSharedFoundation } from '../utils/sharedStore'
import { dispatchFoundationDemo } from './foundationStore'
export async function workspaceCommand(projectId, previous, action, payload, actor) {
  const command = { id: crypto.randomUUID(), action, payload, expectedVersion: previous?._version || 0 }
  return sharedMode ? executeSharedFoundation(projectId, command, actor) : dispatchFoundationDemo(projectId, command, actor.uid)
}
