import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/eventService';
import type { Event } from '../types';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import MemberQRCodeManager from '../components/MemberQRCodeManager';
import ThemeToggle from '../components/ThemeToggle';

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showQRManager, setShowQRManager] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError('Không tìm thấy sự kiện');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        if (eventData) {
          setEvent(eventData);
          setError('');
        } else {
          setError('Không tìm thấy sự kiện');
        }
      } catch (err) {
        setError('Không thể tải thông tin sự kiện');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleExpenseAdded = () => {
    setShowExpenseForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Không tìm thấy sự kiện'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Về trang chủ
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{event.name}</h1>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Mã truy cập:</span>{' '}
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{event.accessCode}</span>
              </p>
              <p>
                <span className="font-medium">Thành viên:</span> {event.members.join(', ')}
              </p>
              {event.hasFund && event.fundContributions && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                  <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">Quỹ chung:</p>
                  <ul className="space-y-1">
                    {Object.entries(event.fundContributions).map(([person, amount]) => (
                      <li key={person} className="text-sm">
                        {person}: {formatCurrency(amount)} VNĐ
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-semibold text-blue-600 dark:text-blue-400">
                    Tổng quỹ: {formatCurrency(
                      Object.values(event.fundContributions).reduce((sum, amt) => sum + amt, 0)
                    )} VNĐ
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => {
              setShowExpenseForm(!showExpenseForm);
              setShowQRManager(false);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md"
          >
            {showExpenseForm ? 'Ẩn form' : 'Thêm khoản chi'}
          </button>
          <button
            onClick={() => {
              setShowQRManager(!showQRManager);
              setShowExpenseForm(false);
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md"
          >
            {showQRManager ? 'Ẩn QR Codes' : 'Quản lý QR Code'}
          </button>
          <button
            onClick={() => navigate(`/event/${eventId}/summary`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md"
          >
            Xem kết quả
          </button>
        </div>

        {showQRManager && eventId && (
          <div className="mb-6">
            <MemberQRCodeManager eventId={eventId} />
          </div>
        )}

        {showExpenseForm && (
          <div className="mb-6">
            <ExpenseForm event={event} onSuccess={handleExpenseAdded} />
          </div>
        )}

        <ExpenseList key={refreshKey} eventId={event.id} onExpenseChange={() => setRefreshKey((prev) => prev + 1)} />
      </div>
    </div>
  );
}

