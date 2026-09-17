'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { listingHref, type ListingValues } from '@/lib/listing';
import { groupCategories } from '@/lib/listing-data';
import {
  localizedName,
  localizedSlug,
  type Brand,
  type Category,
  type Color,
  type Locale,
  type Season,
  type Size,
} from '@/lib/types';
import clsx from 'clsx';

export function ListingFilters({
  locale,
  departmentSlug,
  categorySlug,
  categories,
  colors,
  sizes,
  brands,
  seasons,
  values,
}: {
  locale: Locale;
  departmentSlug: string;
  categorySlug?: string;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  brands: Brand[];
  seasons: Season[];
  values: ListingValues;
}) {
  const t = useTranslations('listing');
  const router = useRouter();
  const pathname = usePathname();
  const [minPrice, setMinPrice] = useState(values.min_price?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(values.max_price?.toString() || '');

  useEffect(() => {
    setMinPrice(values.min_price?.toString() || '');
    setMaxPrice(values.max_price?.toString() || '');
  }, [values.min_price, values.max_price]);

  const hasActive =
    Boolean(values.min_price) ||
    Boolean(values.max_price) ||
    Boolean(values.color_id) ||
    Boolean(values.size_id) ||
    Boolean(values.brand_id) ||
    Boolean(values.season_id) ||
    Boolean(categorySlug) ||
    values.sort !== 'newest';

  const nextValues = useMemo(() => values, [values]);
  const categoryGroups = useMemo(() => groupCategories(categories), [categories]);

  function go(partial: Partial<ListingValues>) {
    router.replace(listingHref(pathname, { ...nextValues, ...partial }));
  }

  function applyPrice(event: FormEvent) {
    event.preventDefault();
    go({
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  function clear() {
    setMinPrice('');
    setMaxPrice('');
    router.replace(`/${departmentSlug}`);
  }

  const body = (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium">{t('filters')}</h2>
        <p className="mt-1.5 text-sm leading-6 text-muted">{t('hint')}</p>
      </div>

      <section>
        <p className="mb-2 text-sm">{t('category')}</p>
        <div className="space-y-3">
          <Link
            href={listingHref(`/${departmentSlug}`, { ...values })}
            className={chipClass(!categorySlug)}
          >
            {t('all')}
          </Link>
          {categoryGroups.parents.map((parent) => {
            const slug = localizedSlug(parent, locale);
            const children = categoryGroups.childrenByParent.get(parent.id) || [];
            const childActive = children.some(
              (child) => localizedSlug(child, locale) === categorySlug,
            );
            const parentActive = categorySlug === slug;
            const open = parentActive || childActive;
            return (
              <div key={parent.id}>
                <Link
                  href={listingHref(`/${departmentSlug}/${slug}`, { ...values })}
                  className={chipClass(parentActive || childActive)}
                >
                  {localizedName(parent, locale)}
                </Link>
                {open && children.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2 ps-1">
                    {children.map((child) => {
                      const childSlug = localizedSlug(child, locale);
                      return (
                        <Link
                          key={child.id}
                          href={listingHref(`/${departmentSlug}/${childSlug}`, {
                            ...values,
                          })}
                          className={chipClass(categorySlug === childSlug)}
                        >
                          {localizedName(child, locale)}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <form onSubmit={applyPrice}>
        <p className="mb-2 text-sm">{t('price')}</p>
        <p className="mb-2 text-xs text-muted">{t('priceHint')}</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted">
            {t('from')}
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="mt-1 w-full rounded-md border border-sand bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="text-xs text-muted">
            {t('to')}
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="200"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="mt-1 w-full rounded-md border border-sand bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-md bg-ink px-3 py-1.5 text-xs text-cream"
        >
          {t('apply')}
        </button>
      </form>

      {colors.length > 0 ? (
        <section>
          <p className="mb-2 text-sm">{t('color')}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const active = values.color_id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => go({ color_id: active ? undefined : color.id })}
                  className={clsx(
                    'size-7 rounded-full border-2',
                    active ? 'border-ink' : 'border-white ring-1 ring-sand',
                  )}
                  style={{ backgroundColor: color.hex_code }}
                  aria-label={localizedName(color, locale)}
                  aria-pressed={active}
                  title={localizedName(color, locale)}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {sizes.length > 0 ? (
        <section>
          <p className="mb-2 text-sm">{t('size')}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = values.size_id === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => go({ size_id: active ? undefined : size.id })}
                  className={chipClass(active)}
                >
                  {size.code}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {brands.length > 0 ? (
        <label className="block text-sm">
          {t('brand')}
          <select
            className="mt-2 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            value={values.brand_id || ''}
            onChange={(event) => go({ brand_id: event.target.value || undefined })}
          >
            <option value="">{t('all')}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {localizedName(brand, locale)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {seasons.length > 0 ? (
        <label className="block text-sm">
          {t('season')}
          <select
            className="mt-2 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            value={values.season_id || ''}
            onChange={(event) => go({ season_id: event.target.value || undefined })}
          >
            <option value="">{t('all')}</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {localizedName(season, locale)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="block text-sm">
        {t('sort')}
        <select
          className="mt-2 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          value={values.sort}
          onChange={(event) =>
            go({ sort: event.target.value as ListingValues['sort'] })
          }
        >
          <option value="newest">{t('newest')}</option>
          <option value="best_selling">{t('bestSelling')}</option>
        </select>
      </label>

      {hasActive ? (
        <button
          type="button"
          onClick={clear}
          className="text-sm text-accent underline underline-offset-4"
        >
          {t('clear')}
        </button>
      ) : null}
    </div>
  );

  return (
    <aside className="lg:sticky lg:top-24">
      <details className="rounded-xl border border-sand bg-white px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm">{t('filters')}</summary>
        <div className="pb-2 pt-4">{body}</div>
      </details>
      <div className="hidden rounded-xl border border-sand bg-white p-5 lg:block">
        {body}
      </div>
    </aside>
  );
}

function chipClass(active: boolean) {
  return clsx(
    'rounded-full border px-3 py-1 text-xs transition',
    active
      ? 'border-ink bg-ink text-cream'
      : 'border-sand bg-white text-muted hover:border-ink hover:text-ink',
  );
}
