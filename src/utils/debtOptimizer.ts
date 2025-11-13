import type { PersonBalance, DebtResult } from '../types';

/**
 * Thuật toán tối ưu hóa nợ - Minimum Cash Flow
 * Giảm số lượng giao dịch cần thiết để cân bằng nợ
 */
export function optimizeDebts(balances: PersonBalance[]): DebtResult[] {
  // Tách thành 2 nhóm: người được nhận tiền (balance > 0) và người nợ tiền (balance < 0)
  const creditors: PersonBalance[] = [];
  const debtors: PersonBalance[] = [];

  balances.forEach((balance) => {
    if (balance.balance > 0) {
      creditors.push({ ...balance });
    } else if (balance.balance < 0) {
      debtors.push({ ...balance });
    }
  });

  // Sắp xếp theo số tiền giảm dần
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance);

  const transactions: DebtResult[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  // Thuật toán greedy: ghép người nợ với người được trả
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

    if (amount > 0) {
      transactions.push({
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(amount),
      });

      creditor.balance -= amount;
      debtor.balance += amount;

      // Nếu người này đã được xử lý hết, chuyển sang người tiếp theo
      if (creditor.balance === 0) {
        creditorIndex++;
      }
      if (debtor.balance === 0) {
        debtorIndex++;
      }
    } else {
      break;
    }
  }

  return transactions;
}

