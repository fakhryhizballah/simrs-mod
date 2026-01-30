// Contoh sederhana cache response API ke IndexedDB tanpa library eksternal
// Cocok untuk SPA / PWA (misalnya React, Next.js client-side)

const DB_NAME = 'api_cache_db';
const DB_VERSION = 1;
const STORE_NAME = 'api_responses';

// 1. Inisialisasi / buka IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 2. Simpan response ke IndexedDB
async function setCache(key, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        store.put({
            key,
            data,
            timestamp: Date.now(),
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

// 3. Ambil cache dari IndexedDB (dengan TTL)
async function getCache(key, ttlMs) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
            const result = req.result;
            if (!result) return resolve(null);

            // cek TTL
            if (ttlMs && Date.now() - result.timestamp > ttlMs) {
                resolve(null);
            } else {
                resolve(result.data);
            }
        };

        req.onerror = () => resolve(null);
    });
}

export { setCache, getCache };