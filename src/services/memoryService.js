import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseInit';

export async function fetchMemoriesForUser(email) {
  const q = query(collection(db, 'memories'), where('user', '==', email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
