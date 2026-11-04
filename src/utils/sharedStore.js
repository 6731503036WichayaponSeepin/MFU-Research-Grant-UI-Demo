import { initializeDemo } from './projectStorage.js'
export const sharedMode = false
const status = {loading:false,busy:false,error:'',shared:false}
const reviewers = [{uid:'demo-reviewer',label:'รศ. ดร. ปาริชาติ วิจิตรศึกษา (สมมติ)'}]
const notifications = []
export const subscribeStore = () => () => {}
export const getStoreStatus = () => status
export const getReviewerDirectory = () => reviewers
export const getNotifications = () => notifications
export function startSharedStore() { initializeDemo(); return () => {} }
export async function markNotificationsRead() {}
