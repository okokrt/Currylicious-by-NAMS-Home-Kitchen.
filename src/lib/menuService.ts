import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
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
        batch.set(itemRef, item);
      }

      // Seed feedbacks
      for (const fb of INITIAL_FEEDBACKS) {
        const fbRef = doc(db, FEEDBACKS_COLLECTION, fb.id);
        batch.set(fbRef, fb);
      }

      await batch.commit();
      console.log('Database seeding completed successfully.');
    }
  } catch (err) {
    console.error('Error in ensureDbInitialized:', err);
  }
}

// Call initialization check on module import
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
      if (onError) onError(err);
    }
  );
}

/**
 * Save or Update a Dish in Firestore
 */
export async function saveDishToDb(dish: MenuItem): Promise<void> {
  try {
    const dishRef = doc(db, MENU_COLLECTION, dish.id);
    await setDoc(dishRef, dish, { merge: true });
  } catch (err) {
    console.error(`Error saving dish ${dish.id}:`, err);
    throw err;
  }
}

/**
 * Delete a Dish from Firestore
 */
export async function deleteDishFromDb(dishId: string): Promise<void> {
  try {
    const dishRef = doc(db, MENU_COLLECTION, dishId);
    await deleteDoc(dishRef);
  } catch (err) {
    console.error(`Error deleting dish ${dishId}:`, err);
    throw err;
  }
}

/**
 * Save or Update Store Settings in Firestore
 */
export async function updateStoreSettingsInDb(settings: StoreSettings): Promise<void> {
  try {
    const storeDocRef = doc(db, SETTINGS_COLLECTION, STORE_DOC_ID);
    await setDoc(
      storeDocRef,
      {
        ...settings,
        isInitialized: true,
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error updating store settings:', err);
    throw err;
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
      batch.set(itemRef, item);
    }

    await batch.commit();
  } catch (err) {
    console.error('Error resetting menu:', err);
    throw err;
  }
}

/**
 * Add Feedback to Firestore
 */
export async function addFeedbackToDb(feedback: Feedback): Promise<void> {
  try {
    const fbRef = doc(db, FEEDBACKS_COLLECTION, feedback.id);
    await setDoc(fbRef, feedback);
  } catch (err) {
    console.error('Error adding feedback:', err);
    throw err;
  }
}

/**
 * Delete Feedback from Firestore
 */
export async function deleteFeedbackFromDb(id: string): Promise<void> {
  try {
    const fbRef = doc(db, FEEDBACKS_COLLECTION, id);
    await deleteDoc(fbRef);
  } catch (err) {
    console.error('Error deleting feedback:', err);
    throw err;
  }
}
