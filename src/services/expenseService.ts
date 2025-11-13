import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Expense } from '../types';

const EXPENSES_COLLECTION = 'expenses';

/**
 * Tạo chi phí mới
 */
export async function createExpense(
  eventId: string,
  name: string,
  amount: number,
  paidBy: string,
  splitBetween: string[]
): Promise<string> {
  const expenseData: Omit<Expense, 'id'> = {
    eventId,
    name,
    amount,
    paidBy,
    splitBetween,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(
    collection(db, EXPENSES_COLLECTION),
    expenseData
  );
  return docRef.id;
}

/**
 * Lấy chi phí theo ID
 */
export async function getExpenseById(expenseId: string): Promise<Expense | null> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Expense;
  }
  return null;
}

/**
 * Lấy tất cả chi phí của một sự kiện
 */
export async function getExpensesByEventId(eventId: string): Promise<Expense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('eventId', '==', eventId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];
}

/**
 * Cập nhật chi phí
 */
export async function updateExpense(
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'createdAt' | 'eventId'>>
): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  await updateDoc(docRef, updates);
}

/**
 * Xóa chi phí
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  await deleteDoc(docRef);
}

