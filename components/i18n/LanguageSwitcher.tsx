'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/hooks/useI18n';
import { localeBase } from '@/lib/i18n/locale';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  isOpen?: boolean;
  onSelect?: () => void;
}

const C = {
  card: 'hsl(228,32%,8%)',
  border: 'rgba(255,255,255,0.07)',
  fg: 'hsl(38,25%,90%)',
  muted: 'hsl(228,12%,47%)',
  gold: 'hsl(38,84%,61%)',
};

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
    const html = document.documentElement;
    html.lang = code;
    html.dir = code === 'he' ? 'rtl' : 'ltr';
    html.setAttribute('data-theme', code === 'he' ? 'rtl' : 'ltr');
    setShowDropdown(false);
    onSelect?.();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-start"
        style={{ color: C.muted }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
      >
        <Globe className="w-4 h-4 shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate" style={{ color: C.fg }}>{t('user.language')}</span>
          <span className="shrink-0 text-xs font-medium tabular-nums" style={{ color: C.muted }}>
            {activeBase === 'en' ? 'EN' : 'HE'}
          </span>
        </span>
      </button>

      {showDropdown && (
        <div className="absolute end-0 top-full z-50 mt-1 w-40 rounded-xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full text-start px-4 py-2.5 text-sm transition-colors"
              style={activeBase === lang.code
                ? { background: 'rgba(200,136,26,0.1)', color: C.gold, fontWeight: 500 }
                : { color: C.fg }
              }
              onMouseEnter={e => { if (activeBase !== lang.code) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeBase !== lang.code) (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
