// src/utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'MyStoreDB';
const DB_VERSION = 1;
const STORE_NAME = 'user-products';

let dbPromise;

// Initialize IndexedDB
export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

// ✅ Add a product to DB
export const addProductToDB = async (product) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const id = await store.add(product);
  await tx.done;
  return id;
};

// ✅ Get all products
export const getAllProductsFromDB = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

// ✅ Delete product by ID
export const deleteProductFromDB = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
};

// ✅ Update product
export const updateProductInDB = async (updatedProduct) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const existing = await store.get(updatedProduct.id);
  if (!existing) {
    throw new Error(`Product with ID ${updatedProduct.id} not found.`);
  }

  await store.put({ ...existing, ...updatedProduct });
  await tx.done;
};
