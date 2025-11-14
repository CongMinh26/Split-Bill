import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import HeaderControls from '../components/HeaderControls';
import { useLanguage } from '../contexts/LanguageContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleEventCreated = (eventId: string, accessCode: string) => {
    alert(`${t('eventForm.eventCreatedSuccess')}\n${t('eventForm.accessCodeMessage')} ${accessCode}\n${t('eventForm.shareAccessCode')}`);
    navigate(`/event/${eventId}`);
  };

  const handleJoinEvent = async () => {
    if (!accessCode.trim()) {
      setJoinError(t('home.pleaseEnterAccessCode'));
      return;
    }

    try {
      const { getEventByAccessCode } = await import('../services/eventService');
      const event = await getEventByAccessCode(accessCode.trim().toUpperCase());
      
      if (event) {
        navigate(`/event/${event.id}`);
      } else {
        setJoinError(t('home.invalidAccessCode'));
      }
    } catch (err) {
      setJoinError(t('home.errorFindingEvent'));
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <HeaderControls />
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('home.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('home.subtitle')}</p>
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
              {t('home.createEvent')}
            </button>
            <button
              onClick={() => {
                setShowJoinForm(true);
                setShowForm(false);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md"
            >
              {t('home.joinEvent')}
            </button>
          </div>
        )}

        {showJoinForm && (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('home.joinEventTitle')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('home.accessCode')}
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                  placeholder={t('home.accessCodePlaceholder')}
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
                  {t('home.join')}
                </button>
                <button
                  onClick={() => {
                    setShowJoinForm(false);
                    setAccessCode('');
                    setJoinError('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {t('common.cancel')}
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
              ← {t('common.goBack')}
            </button>
            <EventForm onSuccess={handleEventCreated} />
          </div>
        )}
      </div>
    </div>
  );
}

