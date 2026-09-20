'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import type { Locale, Product, ProductQuery } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/Skeletons';
import clsx from 'clsx';

export const LISTING_PAGE_SIZE = 10;

export function ProductGrid({
  locale,
  query,
  initialProducts,
  initialPage = 1,
  initialTotal = 0,
  initialTotalPages = 1,
  emptyLabel,
  compact = false,
  pageSize = LISTING_PAGE_SIZE,
}: {
  locale: Locale;
  query?: Omit<ProductQuery, 'locale' | 'limit' | 'page'>;
  initialProducts: Product[];
  initialPage?: number;
  initialTotal?: number;
  initialTotalPages?: number;
  emptyLabel?: string;
  compact?: boolean;
  pageSize?: number;
}) {
  const t = useTranslations('listing');
  const [page, setPage] = useState(initialPage);
  const queryKey = JSON.stringify(query || {});

  useEffect(() => {
    setPage(1);
  }, [locale, queryKey]);

  const { data, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['products', locale, query, page, pageSize],
    queryFn: () =>
      getProducts({
        locale,
        ...query,
        limit: pageSize,
        page,
      }),
    placeholderData: (previous) => previous,
    initialData:
      page === initialPage
        ? {
            results: initialProducts,
            page: initialPage,
            limit: pageSize,
            total: initialTotal,
            totalPages: Math.max(1, initialTotalPages || 1),
          }
        : undefined,
    staleTime: 0,
  });

  const totalPages = Math.max(1, data?.totalPages || 1);
  const total = data?.total || 0;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (isFetching && !data?.results?.length) {
    return <ProductGridSkeleton compact={compact} />;
  }

  if (!data?.results?.length) {
    return <p className="py-16 text-lg text-muted">{emptyLabel || t('empty')}</p>;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        {t('showing', { from, to, total })}
      </p>
      <div
        className={clsx(
          'grid',
          compact
            ? 'grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4',
          isPlaceholderData && isFetching && 'opacity-60',
        )}
      >
        {data.results.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            compact
            priority={index < 4}
            delay={index * 40}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 pt-2"
          aria-label={t('pagination')}
        >
          <button
            type="button"
            disabled={page <= 1 || isFetching}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-md border border-sand px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            {t('prev')}
          </button>
          {pages.map((p, index) => {
            const prev = pages[index - 1];
            const showEllipsis = prev != null && p - prev > 1;
            return (
              <span key={p} className="contents">
                {showEllipsis ? <span className="px-1 text-muted">…</span> : null}
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={clsx(
                    'min-w-10 rounded-md border px-3 py-2 text-sm font-medium',
                    p === page
                      ? 'border-ink bg-ink text-cream'
                      : 'border-sand hover:border-ink/40',
                  )}
                >
                  {p}
                </button>
              </span>
            );
          })}
          <button
            type="button"
            disabled={page >= totalPages || isFetching}
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-md border border-sand px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            {t('next')}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
