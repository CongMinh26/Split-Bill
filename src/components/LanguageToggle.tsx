import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle language"
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 min-w-[20px] inline-block text-center">
        {language === 'vi' ? 'EN' : 'VI'}
      </span>
    </button>
  );
}

