import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import ThemeToggle from '../components/ThemeToggle';

export default function HomePage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleEventCreated = (eventId: string, accessCode: string) => {
    alert(`Sự kiện đã được tạo thành công!\nMã truy cập: ${accessCode}\nHãy chia sẻ mã này với các thành viên khác.`);
    navigate(`/event/${eventId}`);
  };

  const handleJoinEvent = async () => {
    if (!accessCode.trim()) {
      setJoinError('Vui lòng nhập mã truy cập');
      return;
    }

    try {
      const { getEventByAccessCode } = await import('../services/eventService');
      const event = await getEventByAccessCode(accessCode.trim().toUpperCase());
      
      if (event) {
        navigate(`/event/${event.id}`);
      } else {
        setJoinError('Mã truy cập không hợp lệ');
      }
    } catch (err) {
      setJoinError('Có lỗi xảy ra khi tìm sự kiện');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Split Bill</h1>
          <p className="text-gray-600 dark:text-gray-400">Group money sharing app designed by Grok</p>
        </div>

        {!showForm && !showJoinForm && (
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => {
                setShowForm(true);
                setShowJoinForm(false);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md"
            >
              Tạo sự kiện mới
            </button>
            <button
              onClick={() => {
                setShowJoinForm(true);
                setShowForm(false);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md"
            >
              Tham gia sự kiện
            </button>
          </div>
        )}

        {showJoinForm && (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Tham gia sự kiện</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mã truy cập
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                  placeholder="Nhập mã truy cập (ví dụ: ABC123)"
                  maxLength={6}
                />
              </div>
              {joinError && (
                <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
                  {joinError}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleJoinEvent}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Tham gia
                </button>
                <button
                  onClick={() => {
                    setShowJoinForm(false);
                    setAccessCode('');
                    setJoinError('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div>
            <button
              onClick={() => {
                setShowForm(false);
              }}
              className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ← Quay lại
            </button>
            <EventForm onSuccess={handleEventCreated} />
          </div>
        )}
      </div>
    </div>
  );
}

