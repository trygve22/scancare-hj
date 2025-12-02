import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { getCurrentUser } from './auth';

// Collection: reviews
// Each document: { productId, productName, userId, userName, rating, text, createdAt }

const REVIEWS_COLLECTION = 'reviews';

export async function fetchReviewsForProduct(productId) {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Failed to fetch reviews', e);
    return [];
  }
}

export async function submitReviewForProduct({ productId, productName, rating, text }) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Du skal være logget ind for at skrive en anmeldelse');
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Vælg en rating mellem 1 og 5');
  }

  try {
    // Check if this user already has a review for this product
    const existingQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId),
      where('userId', '==', user.id),
      limit(1)
    );
    const existingSnap = await getDocs(existingQuery);
    if (!existingSnap.empty) {
      return {
        success: false,
        message: 'Du har allerede skrevet en anmeldelse for dette produkt.',
      };
    }

    await addDoc(collection(db, REVIEWS_COLLECTION), {
      productId,
      productName,
      rating,
      text: text?.trim() || '',
      userId: user.id,
      userName: user.name || 'Bruger',
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (e) {
    console.error('Failed to submit review', e);
    return { success: false, message: 'Kunne ikke gemme anmeldelse. Prøv igen senere.' };
  }
}

// Delete a specific review document if it belongs to the current user
export async function deleteReview(reviewId, reviewUserId) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Du skal være logget ind for at slette en anmeldelse');
  }

  if (user.id !== reviewUserId) {
    throw new Error('Du kan kun slette dine egne anmeldelser');
  }

  try {
    const ref = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(ref);
    return { success: true };
  } catch (e) {
    console.error('Failed to delete review', e);
    return { success: false, message: 'Kunne ikke slette anmeldelse. Prøv igen senere.' };
  }
}
