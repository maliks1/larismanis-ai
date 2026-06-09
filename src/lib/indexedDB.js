// src/lib/indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'larismanis-ai-db';
const STORE_NAME = 'transactions';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveTransaction = async (transaction) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.add(transaction);
  await tx.done;
};

export const getAllTransactions = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const clearTransactions = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
};