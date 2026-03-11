/**
 * IndexedDB utility for storing large media files (avatars)
 * This prevents localStorage quota errors by using IndexedDB's larger storage capacity
 */

const DB_NAME = 'memoaid_media';
const STORE_NAME = 'avatars';
const DB_VERSION = 1;

/**
 * Initialize and open the IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

/**
 * Save media data to IndexedDB
 * @param personId - Unique identifier for the person
 * @param mediaData - Base64-encoded media data (data URL)
 */
export const saveMediaToIndexedDB = async (
    personId: string,
    mediaData: string
): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const request = store.put(mediaData, personId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to save media to IndexedDB'));
        });

        db.close();
    } catch (error) {
        console.error('Error saving media to IndexedDB:', error);
        throw error;
    }
};

/**
 * Retrieve media data from IndexedDB
 * @param personId - Unique identifier for the person
 * @returns Base64-encoded media data or null if not found
 */
export const getMediaFromIndexedDB = async (
    personId: string
): Promise<string | null> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const result = await new Promise<string | null>((resolve, reject) => {
            const request = store.get(personId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(new Error('Failed to retrieve media from IndexedDB'));
        });

        db.close();
        return result;
    } catch (error) {
        console.error('Error retrieving media from IndexedDB:', error);
        return null;
    }
};

/**
 * Delete media data from IndexedDB
 * @param personId - Unique identifier for the person
 */
export const deleteMediaFromIndexedDB = async (
    personId: string
): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const request = store.delete(personId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete media from IndexedDB'));
        });

        db.close();
    } catch (error) {
        console.error('Error deleting media from IndexedDB:', error);
        throw error;
    }
};

/**
 * Get all media entries from IndexedDB
 * Useful for debugging or migration purposes
 */
export const getAllMediaFromIndexedDB = async (): Promise<Map<string, string>> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const result = await new Promise<Map<string, string>>((resolve, reject) => {
            const request = store.openCursor();
            const mediaMap = new Map<string, string>();

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    mediaMap.set(cursor.key as string, cursor.value);
                    cursor.continue();
                } else {
                    resolve(mediaMap);
                }
            };

            request.onerror = () => reject(new Error('Failed to retrieve all media from IndexedDB'));
        });

        db.close();
        return result;
    } catch (error) {
        console.error('Error retrieving all media from IndexedDB:', error);
        return new Map();
    }
};
