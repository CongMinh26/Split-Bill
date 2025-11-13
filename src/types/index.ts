import { Timestamp } from 'firebase/firestore';

export interface Person {
  name: string;
}

export interface FundContributions {
  [personName: string]: number;
}

export interface Event {
  id: string;
  name: string;
  accessCode: string;
  createdBy: string;
  members: string[];
  createdAt: Timestamp;
  hasFund: boolean;
  fundContributions?: FundContributions;
  memberQRCodes?: { [personName: string]: string }; // URL của QR code nhận tiền
}

export interface Expense {
  id: string;
  eventId: string;
  name: string;
  amount: number;
  paidBy: string; // Tên người trả hoặc "Quỹ chung"
  splitBetween: string[]; // Danh sách người được chia
  createdAt: Timestamp;
}

export interface DebtResult {
  from: string;
  to: string;
  amount: number;
}

export interface PersonBalance {
  person: string;
  totalPaid: number;
  totalOwed: number;
  balance: number; // Số dư: dương = được nhận lại, âm = cần trả
}

export interface SummaryResult {
  balances: PersonBalance[];
  debts: DebtResult[];
  totalExpenses: number;
  remainingFund?: number;
  fundRefunds?: FundContributions;
}

