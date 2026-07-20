import { openDB } from 'idb';

const DB_NAME = 'SplitItLocal';
const STORE_NAME = 'receipts';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'receiptId', autoIncrement: true });
        store.createIndex('expenseId', 'expenseId', { unique: false });
      }
    },
  });
};

export const saveReceipt = async (expenseId, file) => {
  if (!file) return null;
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  // Create object URL from file or read as blob
  const imageBlob = new Blob([await file.arrayBuffer()], { type: file.type });
  
  // Check if expense already has a receipt, to replace it
  const index = store.index('expenseId');
  const existing = await index.get(expenseId);
  
  if (existing) {
    existing.imageBlob = imageBlob;
    existing.fileName = file.name;
    existing.mimeType = file.type;
    existing.createdAt = new Date().toISOString();
    await store.put(existing);
  } else {
    await store.add({
      expenseId,
      imageBlob,
      fileName: file.name,
      mimeType: file.type,
      createdAt: new Date().toISOString()
    });
  }
  
  await tx.done;
};

export const getReceiptByExpenseId = async (expenseId) => {
  if (!expenseId) return null;
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.objectStore(STORE_NAME).index('expenseId');
  const receipt = await index.get(expenseId);
  return receipt || null;
};

export const deleteReceiptByExpenseId = async (expenseId) => {
  if (!expenseId) return;
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('expenseId');
  const receipt = await index.get(expenseId);
  if (receipt) {
    await store.delete(receipt.receiptId);
  }
  await tx.done;
};
