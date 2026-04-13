'use client';

import { useI18n } from '@/lib/hooks/useI18n';

export default function Home() {
  const { t } = useI18n('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('home.title')}</h1>
        <p className="text-lg text-gray-600 mb-8">{t('home.tagline')}</p>
        <p className="text-gray-500">{t('home.launch')}</p>
      </div>
    </main>
  );
}
