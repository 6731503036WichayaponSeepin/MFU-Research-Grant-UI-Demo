// A single transactional record keeps the fictional projects and their PDF bytes together.
const DB_NAME = 'mfu-foundation-v16-demo'
const STORE = 'projects'
const KEY = 'all'
let connection

function database() {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('ไม่สามารถเปิดพื้นที่เก็บข้อมูลได้ กรุณาปิดแท็บ Demo อื่นแล้วลองใหม่'))
  })
  return connection
}

export async function updateDemoDatabase(update) {
  const db = await database()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE), request = store.get(KEY)
    let result
    request.onsuccess = () => {
      try { result = update(request.result); store.put(result.rows, KEY) }
      catch (error) { result = { error }; tx.abort() }
    }
    tx.oncomplete = () => resolve(result)
    tx.onabort = tx.onerror = () => reject(result?.error || tx.error || new Error('บันทึกข้อมูล Demo ไม่สำเร็จ'))
  })
}
