import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, typeof viTranslations> = {
  vi: viTranslations,
  en: enTranslations,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Kiểm tra localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
      return savedLanguage;
    }
    // Kiểm tra browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'vi' ? 'vi' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Cập nhật lang attribute của html
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Trả về key nếu không tìm thấy
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

