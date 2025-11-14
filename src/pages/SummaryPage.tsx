import { useParams, useNavigate } from 'react-router-dom';
import SummaryScreen from '../components/SummaryScreen';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

export default function SummaryPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ThemeToggle />
        <LanguageToggle />
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{t('summary.eventNotFound')}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('eventDetail.goToHomepage')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <ThemeToggle />
      <LanguageToggle />
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(`/event/${eventId}`)}
          className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ← {t('common.goBack')}
        </button>
        <SummaryScreen eventId={eventId} />
      </div>
    </div>
  );
}

