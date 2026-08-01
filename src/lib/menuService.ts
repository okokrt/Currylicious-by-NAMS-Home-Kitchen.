import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { MenuItem, StoreSettings, Feedback } from '../types';
import { INITIAL_MENU_ITEMS, DEFAULT_STORE_SETTINGS } from '../data/initialMenu';
import { INITIAL_FEEDBACKS } from '../data/initialFeedbacks';

const MENU_COLLECTION = 'menuItems';
const SETTINGS_COLLECTION = 'settings';
const STORE_DOC_ID = 'storeSettings';
const FEEDBACKS_COLLECTION = 'feedbacks';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    operationType,
    path,
    timestamp: new Date().toISOString(),
  };
  console.error('[Firestore Error Details]:', JSON.stringify(errInfo, null, 2));
  throw new Error(message);
}

/**
 * Remove any undefined properties from an object so Firestore setDoc does not throw errors
 */
function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  });
  return clean;
}

/**
 * Validate Connection to Firestore on startup
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, SETTINGS_COLLECTION, STORE_DOC_ID));
    console.log('[Firestore] Connected to database server successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firestore] Please check your Firebase/Network configuration. The client is offline.');
    }
  }
}

/**
 * Initialize Firestore data if it's the first time running
 */
async function ensureDbInitialized() {
  try {
    const storeDocRef = doc(db, SETTINGS_COLLECTION, STORE_DOC_ID);
    const storeSnap = await getDoc(storeDocRef);

    if (!storeSnap.exists()) {
      console.log('Database not initialized. Seeding initial store settings, menu items, and feedbacks...');
      
      // Seed store settings
      await setDoc(storeDocRef, {
        ...DEFAULT_STORE_SETTINGS,
        isInitialized: true,
      });

      // Seed menu items
      const batch = writeBatch(db);
      for (const item of INITIAL_MENU_ITEMS) {
        const itemRef = doc(db, MENU_COLLECTION, item.id);
        batch.set(itemRef, sanitizeForFirestore(item));
      }

      // Seed feedbacks
      for (const fb of INITIAL_FEEDBACKS) {
        const fbRef = doc(db, FEEDBACKS_COLLECTION, fb.id);
        batch.set(fbRef, sanitizeForFirestore(fb));
      }

      await batch.commit();
      console.log('Database seeding completed successfully.');
    } else {
      // Ensure feedbacks collection has sample items if empty
      const fbSnap = await getDocs(collection(db, FEEDBACKS_COLLECTION));
      if (fbSnap.empty) {
        console.log('Feedbacks collection empty. Seeding initial feedbacks...');
        const batch = writeBatch(db);
        for (const fb of INITIAL_FEEDBACKS) {
          const fbRef = doc(db, FEEDBACKS_COLLECTION, fb.id);
          batch.set(fbRef, sanitizeForFirestore(fb));
        }
        await batch.commit();
      }
    }
  } catch (err) {
    console.error('Error in ensureDbInitialized:', err);
  }
}

// Call connection test and initialization check on module import
testConnection();
ensureDbInitialized();

/**
 * Real-time subscription to Menu Items
 */
export function subscribeToMenuItems(onData: (items: MenuItem[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, MENU_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: MenuItem[] = snapshot.docs.map((d) => ({
        ...(d.data() as MenuItem),
        id: d.id,
      }));
      onData(items);
    },
    (err) => {
      console.error('Error fetching menu items:', err);
      handleFirestoreError(err, OperationType.LIST, MENU_COLLECTION);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time subscription to Store Settings
 */
export function subscribeToStoreSettings(onData: (settings: StoreSettings) => void, onError?: (err: Error) => void) {
  const storeDocRef = doc(db, SETTINGS_COLLECTION, STORE_DOC_ID);
  return onSnapshot(
    storeDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const settings: StoreSettings = {
          whatsappNumber: data.whatsappNumber || DEFAULT_STORE_SETTINGS.whatsappNumber,
          phoneNumber: data.phoneNumber || DEFAULT_STORE_SETTINGS.phoneNumber,
          restaurantName: data.restaurantName || DEFAULT_STORE_SETTINGS.restaurantName,
          tagline: data.tagline || DEFAULT_STORE_SETTINGS.tagline,
          isStoreOpen: data.isStoreOpen !== undefined ? data.isStoreOpen : DEFAULT_STORE_SETTINGS.isStoreOpen,
          announcement: data.announcement !== undefined ? data.announcement : DEFAULT_STORE_SETTINGS.announcement,
        };
        onData(settings);
      } else {
        onData(DEFAULT_STORE_SETTINGS);
      }
    },
    (err) => {
      console.error('Error fetching store settings:', err);
      handleFirestoreError(err, OperationType.GET, `${SETTINGS_COLLECTION}/${STORE_DOC_ID}`);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time subscription to Feedbacks
 */
export function subscribeToFeedbacks(onData: (feedbacks: Feedback[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, FEEDBACKS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const feedbacks: Feedback[] = snapshot.docs.map((d) => ({
        ...(d.data() as Feedback),
        id: d.id,
      }));
      // Sort newest first
      feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(feedbacks);
    },
    (err) => {
      console.error('Error fetching feedbacks:', err);
      handleFirestoreError(err, OperationType.LIST, FEEDBACKS_COLLECTION);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or Update a Dish in Firestore
 */
export async function saveDishToDb(dish: MenuItem): Promise<void> {
  const path = `${MENU_COLLECTION}/${dish.id}`;
  try {
    const dishRef = doc(db, MENU_COLLECTION, dish.id);
    await setDoc(dishRef, sanitizeForFirestore(dish), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete a Dish from Firestore
 */
export async function deleteDishFromDb(dishId: string): Promise<void> {
  const path = `${MENU_COLLECTION}/${dishId}`;
  try {
    const dishRef = doc(db, MENU_COLLECTION, dishId);
    await deleteDoc(dishRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Save or Update Store Settings in Firestore
 */
export async function updateStoreSettingsInDb(settings: StoreSettings): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${STORE_DOC_ID}`;
  try {
    const storeDocRef = doc(db, SETTINGS_COLLECTION, STORE_DOC_ID);
    await setDoc(
      storeDocRef,
      sanitizeForFirestore({
        ...settings,
        isInitialized: true,
      }),
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Reset Menu Items in Firestore back to default sample items
 */
export async function resetMenuInDb(): Promise<void> {
  try {
    // 1. Delete all existing docs in menuItems
    const snapshot = await getDocs(collection(db, MENU_COLLECTION));
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });

    // 2. Add INITIAL_MENU_ITEMS
    for (const item of INITIAL_MENU_ITEMS) {
      const itemRef = doc(db, MENU_COLLECTION, item.id);
      batch.set(itemRef, sanitizeForFirestore(item));
    }

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, MENU_COLLECTION);
  }
}

/**
 * Add Feedback to Firestore
 */
export async function addFeedbackToDb(feedback: Feedback): Promise<void> {
  const path = `${FEEDBACKS_COLLECTION}/${feedback.id}`;
  try {
    const cleanFeedback = sanitizeForFirestore(feedback);
    const fbRef = doc(db, FEEDBACKS_COLLECTION, feedback.id);
    await setDoc(fbRef, cleanFeedback);
    console.log(`[Firestore] Feedback successfully saved to ${path}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Delete Feedback from Firestore
 */
export async function deleteFeedbackFromDb(id: string): Promise<void> {
  const path = `${FEEDBACKS_COLLECTION}/${id}`;
  try {
    const fbRef = doc(db, FEEDBACKS_COLLECTION, id);
    await deleteDoc(fbRef);
    console.log(`[Firestore] Feedback successfully deleted from ${path}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

