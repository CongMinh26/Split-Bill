import { useEffect, useState } from 'react';
import { getEventById } from '../services/eventService';
import { getExpensesByEventId } from '../services/expenseService';
import { calculateBalances, calculateFundRefunds } from '../utils/calculator';
import { optimizeDebts } from '../utils/debtOptimizer';
import type { SummaryResult } from '../types';

interface SummaryScreenProps {
  eventId: string;
}

export default function SummaryScreen({ eventId }: SummaryScreenProps) {
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const event = await getEventById(eventId);
        if (!event) {
          setError('Không tìm thấy sự kiện');
          return;
        }

        const expenses = await getExpensesByEventId(eventId);
        const balances = calculateBalances(event, expenses);
        const debts = optimizeDebts(balances);
        
        // Tính tổng chi phí chuyến đi
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        let remainingFund = 0;
        let fundRefunds: { [personName: string]: number } | undefined;

        if (event.hasFund) {
          const fundData = calculateFundRefunds(event, expenses);
          remainingFund = fundData.remainingFund;
          fundRefunds = fundData.fundRefunds;
        }

        setSummary({
          balances,
          debts,
          totalExpenses,
          remainingFund: event.hasFund ? remainingFund : undefined,
          fundRefunds,
        });
        setError('');
      } catch (err) {
        setError('Không thể tải kết quả');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [eventId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Đang tính toán...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Kết quả tổng kết</h2>

      {/* Hiển thị tổng chi phí chuyến đi */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-800 mb-2">Tổng chi phí chuyến đi</h3>
        <p className="text-3xl font-bold text-purple-600">
          {formatCurrency(summary.totalExpenses)} VNĐ
        </p>
      </div>

      {/* Hiển thị quỹ còn lại nếu có */}
      {summary.remainingFund !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quỹ chung còn lại</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.remainingFund)} VNĐ
          </p>
        </div>
      )}

      {/* Hiển thị tiền trả lại từ quỹ */}
      {summary.fundRefunds && Object.keys(summary.fundRefunds).length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3">Tiền trả lại từ quỹ:</h3>
          <ul className="space-y-2">
            {Object.entries(summary.fundRefunds).map(([person, amount]) => (
              <li key={person} className="flex justify-between">
                <span className="text-gray-700">{person}:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(amount)} VNĐ
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hiển thị số dư của từng người */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Số dư của từng người:</h3>
        <div className="space-y-2">
          {summary.balances.map((balance) => (
            <div key={balance.person} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <span className="font-medium text-gray-700">{balance.person}</span>
                <div className="text-xs text-gray-500">
                  Đã trả: {formatCurrency(balance.totalPaid)} | 
                  Phải trả: {formatCurrency(balance.totalOwed)}
                </div>
              </div>
              <div className={`font-semibold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {balance.balance >= 0 ? '+' : ''}
                {formatCurrency(Math.round(balance.balance))} VNĐ
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hiển thị các khoản nợ đã tối ưu */}
      {summary.debts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-3">
            Các khoản cần thanh toán (đã tối ưu):
          </h3>
          <ul className="space-y-2">
            {summary.debts.map((debt, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-gray-700">
                  <span className="font-medium">{debt.from}</span> cần trả cho{' '}
                  <span className="font-medium">{debt.to}</span>:
                </span>
                <span className="font-bold text-yellow-700">
                  {formatCurrency(debt.amount)} VNĐ
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.debts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-700 font-medium">
            Tất cả đã được cân bằng! Không có khoản nợ nào.
          </p>
        </div>
      )}
    </div>
  );
}

