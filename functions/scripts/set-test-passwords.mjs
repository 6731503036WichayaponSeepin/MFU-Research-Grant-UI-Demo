// Operator-only password maintenance. No user creation and no Firestore access.
import { initializeApp, applicationDefault, deleteApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const projectId = 'mfu-researchgrantmanagement'
const accounts = [
  {uid:'test-researcher',email:'researcher@example.test',env:'MFU_RESEARCHER_PASSWORD'},
  {uid:'test-staff',email:'staff@example.test',env:'MFU_STAFF_PASSWORD'},
  {uid:'test-reviewer',email:'reviewer@example.test',env:'MFU_REVIEWER_PASSWORD'},
]
const identity = user => JSON.stringify({
  uid:user.uid,email:user.email,customClaims:user.customClaims || {},
  displayName:user.displayName,photoURL:user.photoURL,disabled:user.disabled,
  emailVerified:user.emailVerified,tenantId:user.tenantId,
})

let app
try {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) throw Object.assign(new Error(),{code:'local/emulator-not-allowed'})
  for (const account of accounts) {
    const password = process.env[account.env]
    if (!password || password.length < 6 || password.length > 4096) {
      throw Object.assign(new Error(),{code:`local/missing-or-invalid-${account.env}`})
    }
  }
  app = initializeApp({projectId,credential:applicationDefault()},'test-password-maintenance')
  const auth = getAuth(app)
  // Validate ALL existing identities before the first mutation. Missing users abort;
  // this script intentionally never calls createUser or writes profile/role data.
  const before = await Promise.all(accounts.map(async account => {
    const user = await auth.getUser(account.uid)
    if (user.email !== account.email) throw Object.assign(new Error(),{code:'local/email-mismatch'})
    return user
  }))
  console.log(`Verified ${accounts.length} existing accounts in ${projectId}.`)
  let completed = 0
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i]
    const updated = await auth.updateUser(account.uid,{password:process.env[account.env]})
    const verified = await auth.getUser(account.uid)
    if (identity(before[i]) !== identity(updated) || identity(before[i]) !== identity(verified)) {
      throw Object.assign(new Error(),{code:'local/identity-verification-failed'})
    }
    if (!verified.providerData.some(provider => provider.providerId === 'password')) {
      throw Object.assign(new Error(),{code:'local/password-provider-verification-failed'})
    }
    completed++
    console.log(`SUCCESS: ${account.uid} (${account.email}); password update acknowledged; identity and claims unchanged.`)
  }
  console.log(`Verified ${completed}/${accounts.length} password updates. No accounts created; no Firestore operations.`)
} catch (error) {
  // Never print SDK request bodies, tokens, credentials, or raw error messages.
  const code = typeof error.code === 'string' && /^[a-zA-Z0-9_/-]+$/.test(error.code) ? error.code : 'operation-failed'
  console.error(`Password maintenance failed (${code}). Earlier successful updates are not rolled back.`)
  process.exitCode = 1
} finally {
  for (const account of accounts) delete process.env[account.env]
  if (app) await deleteApp(app)
}
