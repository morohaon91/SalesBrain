'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/hooks/useI18n';
import { localeBase } from '@/lib/i18n/locale';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  isOpen?: boolean;
  onSelect?: () => void;
}

export function LanguageSwitcher({ isOpen = false, onSelect }: LanguageSwitcherProps) {
  const { i18n, t, language } = useI18n('common');
  const activeBase = localeBase(language);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'he', label: 'עברית', nativeName: 'Hebrew' },
  ];

  const handleLanguageChange = async (code: string) => {
    localStorage.setItem('language', code);
    await i18n.changeLanguage(code);

    // Update HTML attributes for RTL
    const html = document.documentElement;
    html.lang = code;
    html.dir = code === 'he' ? 'rtl' : 'ltr';
    html.setAttribute('data-theme', code === 'he' ? 'rtl' : 'ltr');

    setShowDropdown(false);
    onSelect?.();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-start"
      >
        <Globe className="w-4 h-4 shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate">{t('user.language')}</span>
          <span className="shrink-0 text-xs font-medium text-gray-500 tabular-nums">
            {activeBase === 'en' ? 'EN' : 'HE'}
          </span>
        </span>
      </button>

      {showDropdown && (
        <div className="absolute end-0 top-full z-50 mt-1 w-40 rounded-lg border border-gray-100 bg-white shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-start px-4 py-2 text-sm transition-colors ${
                activeBase === lang.code
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
