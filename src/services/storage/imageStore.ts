/**
 * Receipt images are stored in IndexedDB (keyed by session id) so they don't blow the
 * ~5MB localStorage quota. Every call degrades gracefully when IndexedDB is unavailable.
 */

const DB_NAME = 'bill-dong';
const STORE = 'receipt-images';
const VERSION = 1;

function hasIDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function saveImage(id: string, dataUrl: string): Promise<boolean> {
  if (!hasIDB()) return false;
  try {
    await withStore('readwrite', (store) => store.put(dataUrl, id));
    return true;
  } catch {
    return false;
  }
}

export async function loadImage(id: string): Promise<string | null> {
  if (!hasIDB()) return null;
  try {
    const result = await withStore<string | undefined>('readonly', (store) => store.get(id));
    return result ?? null;
  } catch {
    return null;
  }
}

export async function deleteImage(id: string): Promise<void> {
  if (!hasIDB()) return;
  try {
    await withStore('readwrite', (store) => store.delete(id));
  } catch {
    /* ignore */
  }
}
