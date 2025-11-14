import { useState, useEffect } from 'react';
import { createExpense } from '../services/expenseService';
import type { Event } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ExpenseFormProps {
  event: Event;
  onSuccess?: () => void;
}

export default function ExpenseForm({ event, onSuccess }: ExpenseFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [splitAll, setSplitAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Khởi tạo paidBy và splitBetween khi component mount
  useEffect(() => {
    if (event.members.length > 0 && !paidBy) {
      setPaidBy(event.members[0]);
      if (splitAll) {
        setSplitBetween([...event.members]);
      }
    }
  }, [event.members, paidBy, splitAll]);

  // Cập nhật splitBetween khi splitAll thay đổi
  useEffect(() => {
    if (splitAll) {
      setSplitBetween([...event.members]);
    } else {
      setSplitBetween([]);
    }
  }, [splitAll, event.members]);

  // Format số với dấu phẩy ngăn cách hàng nghìn
  const formatNumber = (value: string): string => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/\D/g, '');
    // Format với dấu phẩy
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse số từ string có dấu phẩy
  const parseNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Format số khi người dùng nhập
    const formatted = formatNumber(inputValue);
    setAmount(formatted);
  };

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
      setError(t('expenseForm.pleaseEnterExpenseName'));
      return;
    }

    // Parse số từ string có dấu phẩy
    const numAmount = parseNumber(amount);
    if (!numAmount || numAmount <= 0) {
      setError(t('expenseForm.pleaseEnterValidAmount'));
      return;
    }

    if (!paidBy) {
      setError(t('expenseForm.pleaseSelectPayer'));
      return;
    }

    if (splitBetween.length === 0) {
      setError(t('expenseForm.pleaseSelectAtLeastOnePerson'));
      return;
    }

    setLoading(true);
    try {
      await createExpense(event.id, name.trim(), numAmount, paidBy, splitBetween);
      // Reset form
      setName('');
      setAmount('');
      setPaidBy(event.members[0]);
      setSplitAll(true);
      setSplitBetween([...event.members]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(t('expenseForm.errorAddingExpense'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tạo danh sách options cho "Ai trả" (bao gồm Quỹ chung nếu có)
  const paidByOptions = event.hasFund
    ? [...event.members, t('expenseForm.commonFund')]
    : event.members;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('expenseForm.addExpense')}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('expenseForm.expenseName')} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('expenseForm.expenseNamePlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('expenseForm.amount')} (VNĐ) *
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
            {t('expenseForm.paidBy')} *
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
            {t('expenseForm.splitBetween')} *
          </label>
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={splitAll}
                onChange={(e) => setSplitAll(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('expenseForm.splitAll')}</span>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? t('expenseForm.adding') : t('common.save')}
        </button>
      </form>
    </div>
  );
}

