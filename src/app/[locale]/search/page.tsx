import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProducts } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import type { Locale } from '@/lib/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SearchForm } from '@/components/layout/SearchForm';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('search');
  const typedLocale = locale as Locale;
  const query = q?.trim() || '';

  const products = query
    ? await safeFetch(
        () => getProducts({ locale: typedLocale, search: query, limit: 12 }),
        { results: [], page: 1, limit: 12, total: 0, totalPages: 0 },
      )
    : { results: [], page: 1, limit: 12, total: 0, totalPages: 0 };

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6">
      <h1 className="text-3xl">{t('title')}</h1>
      <div className="mt-8 max-w-lg">
        <SearchForm compact />
      </div>
      <div className="mt-12">
        <ProductGrid
          locale={typedLocale}
          query={{ search: query || undefined }}
          initialProducts={products.results}
          compact
        />
      </div>
    </div>
  );
}
