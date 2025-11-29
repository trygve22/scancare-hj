import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
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
