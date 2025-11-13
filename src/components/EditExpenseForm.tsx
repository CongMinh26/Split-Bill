import { useState, useEffect } from 'react';
import { updateExpense } from '../services/expenseService';
import type { Event, Expense } from '../types';

interface EditExpenseFormProps {
  event: Event;
  expense: Expense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditExpenseForm({ event, expense, onSuccess, onCancel }: EditExpenseFormProps) {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [splitBetween, setSplitBetween] = useState<string[]>(expense.splitBetween);
  const [splitAll, setSplitAll] = useState(expense.splitBetween.length === event.members.length);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Format số tiền ban đầu
    const formattedAmount = expense.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(formattedAmount);
  }, [expense]);

  // Format số với dấu phẩy ngăn cách hàng nghìn
  const formatNumber = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse số từ string có dấu phẩy
  const parseNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatNumber(inputValue);
    setAmount(formatted);
  };

  // Cập nhật splitBetween khi splitAll thay đổi
  useEffect(() => {
    if (splitAll) {
      setSplitBetween([...event.members]);
    }
  }, [splitAll, event.members]);

  const handleSplitToggle = (member: string) => {
    if (splitAll) {
      setSplitAll(false);
      setSplitBetween([member]);
    } else {
      if (splitBetween.includes(member)) {
        setSplitBetween(splitBetween.filter((m) => m !== member));
      } else {
        setSplitBetween([...splitBetween, member]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Vui lòng nhập tên khoản chi');
      return;
    }

    const numAmount = parseNumber(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!paidBy) {
      setError('Vui lòng chọn người trả');
      return;
    }

    if (splitBetween.length === 0) {
      setError('Vui lòng chọn ít nhất một người để chia');
      return;
    }

    setLoading(true);
    try {
      await updateExpense(expense.id, {
        name: name.trim(),
        amount: numAmount,
        paidBy,
        splitBetween,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật chi phí');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tạo danh sách options cho "Ai trả" (bao gồm Quỹ chung nếu có)
  const paidByOptions = event.hasFund
    ? [...event.members, 'Quỹ chung']
    : event.members;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-blue-500">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Sửa khoản chi</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tên khoản chi *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Xăng xe, Ăn trưa"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Số tiền (VNĐ) *
          </label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="500,000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ai đã trả? *
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {paidByOptions.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chia cho ai? *
          </label>
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={splitAll}
                onChange={(e) => setSplitAll(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Chia cho tất cả</span>
            </label>
          </div>
          
          {!splitAll && (
            <div className="space-y-2">
              {event.members.map((member) => (
                <label key={member} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={splitBetween.includes(member)}
                    onChange={() => handleSplitToggle(member)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{member}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

