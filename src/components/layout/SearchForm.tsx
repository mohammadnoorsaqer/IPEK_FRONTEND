'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('search');
  const router = useRouter();
  const [query, setQuery] = useState('');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'w-full' : 'hidden md:block'}>
      <label className="sr-only" htmlFor="site-search">
        {t('title')}
      </label>
      <input
        id="site-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('placeholder')}
        className="w-full border-b border-sand bg-transparent py-2 text-sm outline-none placeholder:text-muted focus:border-ink"
      />
    </form>
  );
}
