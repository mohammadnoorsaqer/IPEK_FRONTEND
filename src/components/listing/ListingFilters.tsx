'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { localizedName, localizedSlug, type Category, type Locale } from '@/lib/types';
import clsx from 'clsx';

export function ListingFilters({
  locale,
  departmentSlug,
  categorySlug,
  categories,
  sort,
}: {
  locale: Locale;
  departmentSlug: string;
  categorySlug?: string;
  categories: Category[];
  sort: 'best_selling' | 'newest';
}) {
  const t = useTranslations('listing');
  const router = useRouter();
  const pathname = usePathname();

  function setSort(next: string) {
    router.replace(`${pathname}?sort=${next}`);
  }

  return (
    <aside className="lg:sticky lg:top-24">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">{t('filters')}</p>
      <div className="mt-4 flex flex-col gap-2">
        {categories.map((category) => {
          const slug = localizedSlug(category, locale);
          const active = categorySlug === slug;
          return (
            <Link
              key={category.id}
              href={`/${departmentSlug}/${slug}`}
              className={clsx(
                'text-sm',
                active ? 'text-accent' : 'text-muted hover:text-ink',
              )}
            >
              {localizedName(category, locale)}
            </Link>
          );
        })}
      </div>

      <label className="mt-8 block text-xs uppercase tracking-[0.25em] text-muted">
        {t('sort')}
      </label>
      <select
        className="mt-3 w-full border border-sand bg-transparent px-3 py-2 text-sm"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
      >
        <option value="newest">{t('newest')}</option>
        <option value="best_selling">{t('bestSelling')}</option>
      </select>
    </aside>
  );
}
