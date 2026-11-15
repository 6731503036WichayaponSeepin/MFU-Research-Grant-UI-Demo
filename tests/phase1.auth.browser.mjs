// Admin setup is restricted to isolated local emulators; no live Firebase endpoint.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { createServer } from 'vite'
import { createFoundationFixtures, foundationActors } from '../src/data/foundationDemo.js'
import { projectProjection, canAccess } from '../src/domain/permissions.js'
for (const name of ['FIREBASE_AUTH_EMULATOR_HOST', 'FIRESTORE_EMULATOR_HOST']) assert.match(process.env[name] || '', /^(127\.0\.0\.1|localhost):\d+$/)
assert.equal(process.env.GCLOUD_PROJECT, 'demo-mfu-secure')
const require = createRequire(import.meta.url), adminRequire = createRequire(new URL('../functions/package.json', import.meta.url))
const { chromium } = require(process.env.MFU_PLAYWRIGHT_MODULE || 'playwright')
const adminApp = adminRequire('firebase-admin/app').initializeApp({ projectId: 'demo-mfu-secure' })
const db = adminRequire('firebase-admin/firestore').getFirestore(adminApp), auth = adminRequire('firebase-admin/auth').getAuth(adminApp)
const password = randomUUID() + '!', workspace = 'local-demo-v16'
const settings = { VITE_FIREBASE_API_KEY: 'demo-key', VITE_FIREBASE_AUTH_DOMAIN: 'localhost', VITE_FIREBASE_PROJECT_ID: 'demo-mfu-secure', VITE_FIREBASE_APP_ID: 'demo-phase1-app', VITE_USE_FIREBASE_EMULATORS: 'true', VITE_STORAGE_ENABLED: 'false', VITE_RESEARCH_API_URL: 'http://127.0.0.1:5001/demo-mfu-secure/asia-southeast1/researchApi' }
const server = await createServer({ mode: 'firebase', envDir: 'tmp/phase1-no-env', define: Object.fromEntries(Object.entries(settings).map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])), server: { host: '127.0.0.1', port: 5179, strictPort: true } })
await server.listen()
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = [], external = []
page.on('pageerror', e => errors.push(e.message))
page.on('request', r => { if (/^https?:/.test(r.url()) && !/^http:\/\/(127\.0\.0\.1|localhost):/.test(r.url())) external.push(r.url()) })
let checks = 0
const check = (value, message) => { assert.ok(value, message); checks++ }
const signIn = async uid => {
  await page.getByLabel('อีเมล / Email', { exact: true }).fill(`${uid}@example.test`)
  await page.getByLabel('รหัสผ่าน / Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ / Sign in', exact: true }).click()
}
const logout = async () => { await page.locator('.account-trigger').click(); await page.getByRole('button', { name: 'ออกจากระบบ', exact: true }).click(); await page.getByLabel('อีเมล / Email', { exact: true }).waitFor() }
try {
  if (process.env.PHASE2_WRITE_TEST === 'true' || process.env.PHASE3_WRITE_TEST === 'true' || process.env.PHASE4_WRITE_TEST === 'true') {
    // Reset only the explicitly asserted local demo emulator after the HTTP suite.
    assert.equal(new URL(settings.VITE_RESEARCH_API_URL).hostname, '127.0.0.1')
    const clearedAuth = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-mfu-secure/accounts`, { method: 'DELETE' })
    const clearedDb = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-mfu-secure/databases/(default)/documents`, { method: 'DELETE' })
    assert.ok(clearedAuth.ok && clearedDb.ok)
  }
  for (const uid of ['demo-user', 'demo-staff', 'demo-reviewer-1', 'unprovisioned']) {
    await auth.createUser({ uid, email: `${uid}@example.test`, password })
    if (uid !== 'unprovisioned') await db.doc(`users/${uid}`).set({ ...foundationActors[uid], simulation: false, displayName: uid, active: true })
  }
  const fixtures = createFoundationFixtures()
  for (const p of fixtures) {
    await db.doc(`workspaces/${workspace}/projects/${p.id}`).set(p)
    for (const uid of ['demo-user', 'demo-reviewer-1']) if (canAccess(p, foundationActors[uid])) await db.doc(`workspaces/${workspace}/users/${uid}/projects/${p.id}`).set({ ...projectProjection(p, foundationActors[uid]), viewerRole: foundationActors[uid].role })
  }
  await page.goto('http://127.0.0.1:5179/')
  await page.getByLabel('อีเมล / Email', { exact: true }).waitFor()
  check(await page.getByRole('combobox').count() === 0, 'no real role selection')
  check(!(await page.locator('body').innerText()).includes('Registration'), 'no registration')
  await page.screenshot({ path: 'docs/progress/screenshots/phase1-signin-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile sign-in layout')
  await page.screenshot({ path: 'docs/progress/screenshots/phase1-signin-mobile.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByLabel('อีเมล / Email', { exact: true }).fill('wrong@example.test')
  await page.getByLabel('รหัสผ่าน / Password', { exact: true }).fill('invalid-password')
  let releaseLogin
  await page.route('**/accounts:signInWithPassword*', route => new Promise(resolve => { releaseLogin = () => route.continue().then(resolve) }))
  await page.getByRole('button', { name: 'เข้าสู่ระบบ / Sign in', exact: true }).click()
  await page.getByRole('button', { name: 'กำลังเข้าสู่ระบบ… / Signing in…', exact: true }).waitFor()
  check(await page.getByLabel('อีเมล / Email', { exact: true }).isDisabled(), 'sign-in loading state')
  releaseLogin()
  await page.unroute('**/accounts:signInWithPassword*')
  await page.getByRole('alert').waitFor()
  check((await page.getByRole('alert').innerText()).includes('เข้าสู่ระบบไม่สำเร็จ'), 'authentication error')
  for (const [uid, role, count] of [['demo-user', 'researcher', 14], ['demo-staff', 'staff', 14], ['demo-reviewer-1', 'reviewer', 6]]) {
    await signIn(uid)
    await page.waitForURL(new RegExp(`/${role}/dashboard$`))
    await (role === 'staff' ? page.locator('[data-staff-total]') : page.locator('.shared-project-row').first()).waitFor()
    check(role === 'researcher' ? await page.locator(`[data-researcher-total="${count}"]`).count() === 1 : role === 'staff' ? await page.locator(`[data-staff-total="${count + (process.env.PHASE2_WRITE_TEST === 'true' ? 1 : 0)}"]`).count() === 1 : await page.locator('.shared-project-row').count() === count, `${role} server scoped project list`)
    await page.goto(`http://127.0.0.1:5179/#/${role === 'staff' ? 'researcher' : 'staff'}/dashboard`)
    await page.waitForURL(new RegExp(`/${role}/dashboard$`))
    check(page.url().includes(`/${role}/dashboard`), 'server profile role overrides URL')
    if (role === 'reviewer') {
      await page.goto('http://127.0.0.1:5179/#/reviewer/projects/V16-DRAFT/details')
      await page.getByRole('heading', { name: 'ไม่พบโครงการหรือไม่มีสิทธิ์เข้าถึง' }).waitFor()
      check(await page.locator('.shared-fields').count() === 0, 'unauthorized metadata hidden')
    }
    if (role === 'researcher') {
      await page.evaluate(async () => { const { registerNavigationGuard } = await import('/src/utils/navigationGuard.js'); window.phase1RemoveGuard = registerNavigationGuard('phase1-signout-test', () => true) })
      await page.locator('.account-trigger').click()
      page.once('dialog', dialog => dialog.dismiss())
      await page.getByRole('button', { name: 'ออกจากระบบ', exact: true }).click()
      check(await page.locator('#page-title').count() === 1, 'sign-out respects unsaved guard')
      await page.evaluate(() => window.phase1RemoveGuard())
      await page.locator('.account-trigger').click()
    }
    if (role === 'researcher' && process.env.PHASE2_WRITE_TEST === 'true') {
      assert.equal(new URL(settings.VITE_RESEARCH_API_URL).hostname, '127.0.0.1')
      await page.goto('http://127.0.0.1:5179/#/researcher/manual')
      await page.getByLabel('ชื่อโครงการ *', {exact:true}).fill('Phase 2 authenticated draft')
      await page.getByRole('button', {name:'บันทึกร่าง',exact:true}).first().click()
      await page.waitForURL(/details$/)
      const id = decodeURIComponent(page.url().split('/').at(-2)), saved = (await db.doc(`workspaces/${workspace}/projects/${id}`).get()).data()
      check(saved.status === 'DRAFT' && saved.ownerUid === 'demo-user' && saved.schemaVersion === '1.6', 'authenticated browser command writes guarded canonical draft')
    }
    if (role === 'staff' && process.env.PHASE3_WRITE_TEST === 'true') {
      await page.goto('http://127.0.0.1:5179/#/staff/projects/V16-STAFF/staff-review')
      const passed = page.getByRole('heading',{name:'บันทึกผลตรวจผ่าน',exact:true}).locator('..')
      await passed.getByRole('button',{name:'บันทึกผลตรวจผ่าน',exact:true}).click()
      await page.getByRole('dialog').getByRole('button',{name:'ยืนยัน',exact:true}).click()
      await passed.getByRole('status').waitFor()
      const record = (await db.doc(`workspaces/${workspace}/projects/V16-STAFF`).get()).data()
      check(record.status === 'COMMITTEE_ACKNOWLEDGEMENT' && record.statusHistory.at(-1).updatedBy === 'demo-staff', 'Staff Browser executes guarded TR08 with authoritative identity')
    }
    if(role==='reviewer' && process.env.PHASE4_WRITE_TEST==='true') {
      await page.goto('http://127.0.0.1:5179/#/reviewer/projects/V16-EVALUATION-0/evaluation')
      await page.getByLabel('ความคิดเห็นเพิ่มเติม',{exact:true}).fill('Authenticated reviewer draft')
      await page.getByRole('button',{name:'บันทึกร่าง',exact:true}).click()
      await page.getByText('บันทึกสำเร็จ',{exact:true}).waitFor()
      const record=(await db.doc(`workspaces/${workspace}/projects/V16-EVALUATION-0`).get()).data()
      check(record.closure.evaluations['demo-reviewer-1'].additionalComments==='Authenticated reviewer draft' && !record.closure.evaluations['demo-reviewer-1'].submitted && record.statusHistory.at(-1).updatedBy==='demo-reviewer-1','authenticated Reviewer UI saves independent guarded draft')
    }
    await logout()
  }
  await signIn('unprovisioned')
  await page.getByText('ไม่มีสิทธิ์เข้าถึง / Access Denied ·', { exact: true }).waitFor()
  check(await page.locator('.shared-project-row').count() === 0, 'unprovisioned denied')
  await page.getByRole('button', { name: 'ใช้บัญชีอื่น / Sign out and use another account' }).click()
  await page.getByRole('button', { name: 'ใช้บัญชีอื่น / Sign out and use another account' }).waitFor({ state: 'hidden' })
  check(errors.length === 0, JSON.stringify(errors)); check(external.length === 0, JSON.stringify(external))
  console.log(`PASS Phase 1 Auth browser: ${checks} checks; 3 server-profile roles; emulators only`)
} finally { await browser.close(); await server.close(); await adminApp.delete() }
