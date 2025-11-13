import { useState, useEffect } from 'react';
import { getExpensesByEventId, deleteExpense } from '../services/expenseService';
import { getEventById } from '../services/eventService';
import type { Expense, Event } from '../types';
import EditExpenseForm from './EditExpenseForm';

interface ExpenseListProps {
  eventId: string;
  onExpenseChange?: () => void;
}

export default function ExpenseList({ eventId, onExpenseChange }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

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

  const loadEvent = async () => {
    try {
      const eventData = await getEventById(eventId);
      setEvent(eventData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadExpenses();
    loadEvent();
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

  const handleEdit = (expenseId: string) => {
    setEditingExpenseId(expenseId);
  };

  const handleEditSuccess = () => {
    setEditingExpenseId(null);
    loadExpenses();
    if (onExpenseChange) {
      onExpenseChange();
    }
  };

  const handleEditCancel = () => {
    setEditingExpenseId(null);
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
    return <div className="text-center py-4 text-gray-600 dark:text-gray-400">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Chưa có khoản chi nào. Hãy thêm khoản chi đầu tiên!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Danh sách chi phí</h3>
      <div className="space-y-3">
        {expenses.map((expense) => {
          const amountPerPerson = expense.amount / expense.splitBetween.length;
          const isEditing = editingExpenseId === expense.id;

          if (isEditing && event) {
            return (
              <div key={expense.id} className="mb-4">
                <EditExpenseForm
                  event={event}
                  expense={expense}
                  onSuccess={handleEditSuccess}
                  onCancel={handleEditCancel}
                />
              </div>
            );
          }

          return (
            <div
              key={expense.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">{expense.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Trả bởi: <span className="font-medium">{expense.paidBy}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chia cho: {expense.splitBetween.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(expense.createdAt)}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(expense.amount)} VNĐ
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(amountPerPerson)} VNĐ/người
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(expense.id)}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

