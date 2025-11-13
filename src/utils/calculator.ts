import type { Event, Expense, PersonBalance, FundContributions } from '../types';

/**
 * Tính toán số dư của từng người dựa trên các chi phí
 */
export function calculateBalances(
  event: Event,
  expenses: Expense[]
): PersonBalance[] {
  const balances: { [person: string]: PersonBalance } = {};

  // Khởi tạo balance cho tất cả thành viên
  event.members.forEach((member) => {
    balances[member] = {
      person: member,
      totalPaid: 0,
      totalOwed: 0,
      balance: 0,
    };
  });

  // Tính toán từng chi phí
  expenses.forEach((expense) => {
    const amountPerPerson = expense.amount / expense.splitBetween.length;

    // Nếu trả từ quỹ chung, không tính vào totalPaid của cá nhân
    if (expense.paidBy !== 'Quỹ chung') {
      balances[expense.paidBy].totalPaid += expense.amount;
    }

    // Tính số tiền mỗi người phải trả
    expense.splitBetween.forEach((person) => {
      balances[person].totalOwed += amountPerPerson;
    });
  });

  // Tính số dư cuối cùng
  Object.values(balances).forEach((balance) => {
    balance.balance = balance.totalPaid - balance.totalOwed;
  });

  return Object.values(balances);
}

/**
 * Tính toán tiền trả lại từ quỹ chung
 */
export function calculateFundRefunds(
  event: Event,
  expenses: Expense[]
): { remainingFund: number; fundRefunds: FundContributions } {
  if (!event.hasFund || !event.fundContributions) {
    return { remainingFund: 0, fundRefunds: {} };
  }

  // Tính tổng quỹ ban đầu
  const totalFund = Object.values(event.fundContributions).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Tính tổng chi từ quỹ chung
  const totalSpentFromFund = expenses
    .filter((expense) => expense.paidBy === 'Quỹ chung')
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Tiền còn lại trong quỹ
  const remainingFund = totalFund - totalSpentFromFund;

  // Tính chi phí thực tế của từng người
  const balances = calculateBalances(event, expenses);
  
  // Tính tiền trả lại cho từng người
  const fundRefunds: FundContributions = {};
  balances.forEach((balance) => {
    const contributed = event.fundContributions![balance.person] || 0;
    const actualCost = balance.totalOwed;
    const refund = contributed - actualCost;
    
    if (refund > 0) {
      fundRefunds[balance.person] = refund;
    }
  });

  return { remainingFund, fundRefunds };
}

