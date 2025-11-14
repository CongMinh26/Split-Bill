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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Event } from '../types';
import { generateAccessCode } from '../utils/generateAccessCode';

const EVENTS_COLLECTION = 'events';

/**
 * Tạo sự kiện mới với mã truy cập ngẫu nhiên
 */
export async function createEvent(
  name: string,
  members: string[],
  createdBy: string,
  hasFund: boolean = false,
  fundContributions?: { [personName: string]: number }
): Promise<string> {
  // Tạo mã truy cập duy nhất
  let accessCode = generateAccessCode();
  let isUnique = false;
  
  // Kiểm tra mã truy cập đã tồn tại chưa (tối đa 10 lần thử)
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    const existingEvent = await getEventByAccessCode(accessCode);
    if (!existingEvent) {
      isUnique = true;
    } else {
      accessCode = generateAccessCode();
      attempts++;
    }
  }

  // Tạo object eventData, chỉ include fundContributions nếu hasFund là true
  const eventData: Omit<Event, 'id'> = {
    name,
    accessCode,
    createdBy,
    members,
    createdAt: Timestamp.now(),
    hasFund,
    // Chỉ thêm fundContributions nếu hasFund là true và có giá trị
    ...(hasFund && fundContributions && { fundContributions }),
  };

  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
  return docRef.id;
}

/**
 * Lấy sự kiện theo ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Event;
  }
  return null;
}

/**
 * Lấy sự kiện theo mã truy cập
 */
export async function getEventByAccessCode(accessCode: string): Promise<Event | null> {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('accessCode', '==', accessCode)
  );
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Event;
  }
  return null;
}

/**
 * Lấy tất cả sự kiện của một người tạo
 */
export async function getEventsByCreator(createdBy: string): Promise<Event[]> {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('createdBy', '==', createdBy)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Cập nhật sự kiện
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await updateDoc(docRef, updates);
}

/**
 * Xóa sự kiện
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await deleteDoc(docRef);
}

/**
 * Cập nhật QR code cho thành viên
 */
export async function updateMemberQRCode(
  eventId: string,
  memberName: string,
  qrCodeURL: string
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  const event = await getEventById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }

  const memberQRCodes = event.memberQRCodes || {};
  memberQRCodes[memberName] = qrCodeURL;

  await updateDoc(docRef, {
    memberQRCodes,
  });
}

/**
 * Cập nhật danh sách thành viên
 */
export async function updateMembers(
  eventId: string,
  members: string[]
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await updateDoc(docRef, {
    members,
  });
}

/**
 * Cập nhật tên thành viên trong event (bao gồm fundContributions và memberQRCodes)
 * Lưu ý: Hàm này cũng cập nhật danh sách thành viên
 */
export async function updateMemberName(
  eventId: string,
  oldName: string,
  newName: string
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  const event = await getEventById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }

  // Cập nhật danh sách thành viên
  const updatedMembers = event.members.map((member) =>
    member === oldName ? newName : member
  );

  const updates: any = {
    members: updatedMembers,
  };

  // Cập nhật fundContributions nếu có
  if (event.fundContributions && event.fundContributions[oldName] !== undefined) {
    const updatedFundContributions = { ...event.fundContributions };
    updatedFundContributions[newName] = updatedFundContributions[oldName];
    delete updatedFundContributions[oldName];
    updates.fundContributions = updatedFundContributions;
  }

  // Cập nhật memberQRCodes nếu có
  if (event.memberQRCodes && event.memberQRCodes[oldName]) {
    const updatedMemberQRCodes = { ...event.memberQRCodes };
    updatedMemberQRCodes[newName] = updatedMemberQRCodes[oldName];
    delete updatedMemberQRCodes[oldName];
    updates.memberQRCodes = updatedMemberQRCodes;
  }

  await updateDoc(docRef, updates);
}

/**
 * Chỉ cập nhật fundContributions và memberQRCodes khi đổi tên thành viên
 * (không cập nhật danh sách thành viên)
 */
export async function updateMemberNameInEventData(
  eventId: string,
  oldName: string,
  newName: string
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  const event = await getEventById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }

  const updates: any = {};

  // Cập nhật fundContributions nếu có
  if (event.fundContributions && event.fundContributions[oldName] !== undefined) {
    const updatedFundContributions = { ...event.fundContributions };
    updatedFundContributions[newName] = updatedFundContributions[oldName];
    delete updatedFundContributions[oldName];
    updates.fundContributions = updatedFundContributions;
  }

  // Cập nhật memberQRCodes nếu có
  if (event.memberQRCodes && event.memberQRCodes[oldName]) {
    const updatedMemberQRCodes = { ...event.memberQRCodes };
    updatedMemberQRCodes[newName] = updatedMemberQRCodes[oldName];
    delete updatedMemberQRCodes[oldName];
    updates.memberQRCodes = updatedMemberQRCodes;
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(docRef, updates);
  }
}

