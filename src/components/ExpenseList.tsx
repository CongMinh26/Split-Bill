import { useState, useEffect } from 'react';
import { getExpensesByEventId, deleteExpense } from '../services/expenseService';
import type { Expense } from '../types';

interface ExpenseListProps {
  eventId: string;
  onExpenseChange?: () => void;
}

export default function ExpenseList({ eventId, onExpenseChange }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpensesByEventId(eventId);
      setExpenses(data);
      setError('');
    } catch (err) {
      console.log(err,'err');
      
      setError('Không thể tải danh sách chi phí');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [eventId]);

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Bạn có chắc muốn xóa khoản chi này?')) {
      return;
    }

    try {
      await deleteExpense(expenseId);
      await loadExpenses();
      if (onExpenseChange) {
        onExpenseChange();
      }
    } catch (err) {
      alert('Không thể xóa khoản chi');
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có khoản chi nào. Hãy thêm khoản chi đầu tiên!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800">Danh sách chi phí</h3>
      <div className="space-y-3">
        {expenses.map((expense) => {
          const amountPerPerson = expense.amount / expense.splitBetween.length;
          return (
            <div
              key={expense.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{expense.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Trả bởi: <span className="font-medium">{expense.paidBy}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Chia cho: {expense.splitBetween.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(expense.createdAt)}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(expense.amount)} VNĐ
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(amountPerPerson)} VNĐ/người
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Xóa
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

