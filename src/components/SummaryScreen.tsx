import { useEffect, useState } from 'react';
import { getEventById } from '../services/eventService';
import { getExpensesByEventId } from '../services/expenseService';
import { calculateBalances, calculateFundRefunds } from '../utils/calculator';
import { optimizeDebts } from '../utils/debtOptimizer';
import { exportSummaryToPDF } from '../utils/exportPDF';
import type { SummaryResult, Event } from '../types';

interface SummaryScreenProps {
  eventId: string;
}

export default function SummaryScreen({ eventId }: SummaryScreenProps) {
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        if (!eventData) {
          setError('Không tìm thấy sự kiện');
          return;
        }

        setEvent(eventData);

        const expenses = await getExpensesByEventId(eventId);
        const balances = calculateBalances(eventData, expenses);
        const debts = optimizeDebts(balances);
        
        // Tính tổng chi phí chuyến đi
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        let remainingFund = 0;
        let fundRefunds: { [personName: string]: number } | undefined;

        if (eventData.hasFund) {
          const fundData = calculateFundRefunds(eventData, expenses);
          remainingFund = fundData.remainingFund;
          fundRefunds = fundData.fundRefunds;
        }

        setSummary({
          balances,
          debts,
          totalExpenses,
          remainingFund: eventData.hasFund ? remainingFund : undefined,
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

  const handleExportPDF = async () => {
    if (event && summary) {
      try {
        await exportSummaryToPDF(event, summary);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Đang tính toán...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!summary || !event) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kết quả tổng kết</h2>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Xuất PDF
        </button>
      </div>

      {/* Hiển thị tổng chi phí chuyến đi */}
      <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
        <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Tổng chi phí chuyến đi</h3>
        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
          {formatCurrency(summary.totalExpenses)} VNĐ
        </p>
      </div>

      {/* Hiển thị quỹ còn lại nếu có */}
      {summary.remainingFund !== undefined && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Quỹ chung còn lại</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(summary.remainingFund)} VNĐ
          </p>
        </div>
      )}

      {/* Hiển thị tiền trả lại từ quỹ */}
      {summary.fundRefunds && Object.keys(summary.fundRefunds).length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Tiền trả lại từ quỹ:</h3>
          <ul className="space-y-2">
            {Object.entries(summary.fundRefunds).map(([person, amount]) => (
              <li key={person} className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">{person}:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(amount)} VNĐ
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hiển thị số dư của từng người */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Số dư của từng người:</h3>
        <div className="space-y-2">
          {summary.balances.map((balance) => (
            <div key={balance.person} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{balance.person}</span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Đã trả: {formatCurrency(balance.totalPaid)} | 
                  Phải trả: {formatCurrency(balance.totalOwed)}
                </div>
              </div>
              <div className={`font-semibold ${balance.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {balance.balance >= 0 ? '+' : ''}
                {formatCurrency(Math.round(balance.balance))} VNĐ
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hiển thị các khoản nợ đã tối ưu */}
      {summary.debts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
            Các khoản cần thanh toán (đã tối ưu):
          </h3>
          <ul className="space-y-2">
            {summary.debts.map((debt, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{debt.from}</span> cần trả cho{' '}
                  <span className="font-medium">{debt.to}</span>:
                </span>
                <span className="font-bold text-yellow-700 dark:text-yellow-400">
                  {formatCurrency(debt.amount)} VNĐ
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.debts.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
          <p className="text-green-700 dark:text-green-300 font-medium">
            Tất cả đã được cân bằng! Không có khoản nợ nào.
          </p>
        </div>
      )}
    </div>
  );
}

