import { apiRequest, firebaseServices } from './firebaseClient.js'
import { prepareFiles } from './firebaseFiles.js'

// Explicit remote command adapter. Not called by the legacy page router in Phase 0.
// Authentication is still Firebase Auth; a local demo actor is never sent as authorization.
export async function executeFoundationApi(projectId, command) {
  const uid = firebaseServices().auth.currentUser?.uid
  if (!uid) throw new Error('Sign in before saving')
  const prepared = { ...command, payload: await prepareFiles(command.payload || {}, projectId) }
  if (firebaseServices().auth.currentUser?.uid !== uid) throw new Error('Account changed during file preparation; save cancelled')
  const { project } = await apiRequest({ action: 'execute', projectId, command: prepared })
  if (project?.id !== projectId || project.schemaVersion !== '1.6' || project._version !== command.expectedVersion + 1) {
    throw new Error('Invalid v1.6 backend save acknowledgement')
  }
  return project
}
