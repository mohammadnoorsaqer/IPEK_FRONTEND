'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { getProducts } from '@/lib/api';
import type { Locale, Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/Skeletons';

export function ProductGrid({
  locale,
  departmentSlug,
  categorySlug,
  sort = 'newest',
  search,
  initialProducts,
  emptyLabel,
}: {
  locale: Locale;
  departmentSlug?: string;
  categorySlug?: string;
  sort?: 'best_selling' | 'newest';
  search?: string;
  initialProducts: Product[];
  emptyLabel?: string;
}) {
  const t = useTranslations('listing');
  const { data, isFetching } = useQuery({
    queryKey: ['products', locale, departmentSlug, categorySlug, sort, search],
    queryFn: () =>
      getProducts({
        locale,
        department_slug: departmentSlug,
        category_slug: categorySlug,
        sort,
        search,
        limit: 12,
      }),
    initialData: { results: initialProducts, page: 1, limit: 12, total: initialProducts.length, totalPages: 1 },
  });

  if (isFetching && !data?.results?.length) {
    return <ProductGridSkeleton />;
  }

  if (!data?.results?.length) {
    return <p className="py-20 text-muted">{emptyLabel || t('empty')}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {data.results.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </div>
  );
}
