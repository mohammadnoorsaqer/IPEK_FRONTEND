'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { getProducts } from '@/lib/api';
import type { Locale, Product, ProductQuery } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/Skeletons';
import clsx from 'clsx';

export function ProductGrid({
  locale,
  query,
  initialProducts,
  emptyLabel,
  compact = false,
}: {
  locale: Locale;
  query?: Omit<ProductQuery, 'locale' | 'limit' | 'page'>;
  initialProducts: Product[];
  emptyLabel?: string;
  compact?: boolean;
}) {
  const t = useTranslations('listing');
  const { data, isFetching } = useQuery({
    queryKey: ['products', locale, query],
    queryFn: () =>
      getProducts({
        locale,
        ...query,
        limit: 12,
      }),
    initialData: {
      results: initialProducts,
      page: 1,
      limit: 12,
      total: initialProducts.length,
      totalPages: 1,
    },
  });

  if (isFetching && !data?.results?.length) {
    return <ProductGridSkeleton compact={compact} />;
  }

  if (!data?.results?.length) {
    return <p className="py-16 text-muted">{emptyLabel || t('empty')}</p>;
  }

  return (
    <div
      className={clsx(
        'grid',
        compact
          ? 'grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4',
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
  );
}
