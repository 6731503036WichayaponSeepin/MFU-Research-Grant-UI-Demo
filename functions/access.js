import { timingSafeEqual, createHash } from 'node:crypto'
import { EDITING_EXPIRES_AT, ensure } from './policy.js'
const digest = value => createHash('sha256').update(value).digest()
export function authorizeWorkshop(code, secret, now = Date.now()) {
  ensure(now < Date.parse(EDITING_EXPIRES_AT), 'Workshop editing expired. The demo is now read-only.', 403)
  ensure(typeof secret === 'string' && secret.length >= 24 && typeof code === 'string' && code.length <= 256 && timingSafeEqual(digest(code), digest(secret)), 'Invalid workshop access code', 403)
}
