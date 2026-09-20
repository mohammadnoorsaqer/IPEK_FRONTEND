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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    setMinPrice(values.min_price?.toString() || '');
    setMaxPrice(values.max_price?.toString() || '');
  }, [values.min_price, values.max_price]);

  const activeCount =
    Number(Boolean(values.min_price)) +
    Number(Boolean(values.max_price)) +
    Number(Boolean(values.color_id)) +
    Number(Boolean(values.size_id)) +
    Number(Boolean(values.brand_id)) +
    Number(Boolean(values.season_id)) +
    Number(Boolean(categorySlug)) +
    Number(values.sort !== 'newest');

  const hasActive = activeCount > 0;
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
        <h2 className="flex items-center gap-2 text-base font-semibold">
          {t('filters')}
          {activeCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-cream">
              {activeCount}
            </span>
          ) : null}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-muted">{t('hint')}</p>
      </div>

      <section>
        <p className="mb-2 text-sm font-medium">{t('category')}</p>
        <div className="space-y-3">
          <Link
            href={listingHref(`/${departmentSlug}`, { ...values })}
            className={chipClass(!categorySlug)}
            aria-pressed={!categorySlug}
          >
            {!categorySlug ? <CheckIcon className="size-3.5" /> : null}
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
                  aria-pressed={parentActive || childActive}
                >
                  {parentActive || childActive ? <CheckIcon className="size-3.5" /> : null}
                  {'image_url' in parent && (parent as Category & { image_url?: string }).image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(parent as Category & { image_url?: string }).image_url}
                      alt=""
                      className="size-5 rounded object-cover"
                    />
                  ) : null}
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
                          aria-pressed={categorySlug === childSlug}
                        >
                          {categorySlug === childSlug ? <CheckIcon className="size-3.5" /> : null}
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
        <p className="mb-2 text-sm font-medium">{t('price')}</p>
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
              className="mt-1 w-full rounded-md border border-sand bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
              className="mt-1 w-full rounded-md border border-sand bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
          <p className="mb-2 text-sm font-medium">{t('color')}</p>
          <div className="flex flex-wrap gap-2">
            {(showAllColors ? colors : colors.slice(0, 12)).map((color) => {
              const active = values.color_id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => go({ color_id: active ? undefined : color.id })}
                  className={clsx(
                    'size-8 rounded-full border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    active ? 'border-ink ring-2 ring-accent/40' : 'border-white ring-1 ring-sand hover:ring-ink/40',
                  )}
                  style={{ backgroundColor: color.hex_code }}
                  aria-label={localizedName(color, locale)}
                  aria-pressed={active}
                  title={localizedName(color, locale)}
                />
              );
            })}
          </div>
          {colors.length > 12 ? (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-accent underline underline-offset-4"
              onClick={() => setShowAllColors((v) => !v)}
            >
              {showAllColors ? t('showLess') : t('showMore')}
            </button>
          ) : null}
        </section>
      ) : null}

      {sizes.length > 0 ? (
        <section>
          <p className="mb-2 text-sm font-medium">{t('size')}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = values.size_id === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => go({ size_id: active ? undefined : size.id })}
                  className={chipClass(active)}
                  aria-pressed={active}
                >
                  {active ? <CheckIcon className="size-3.5" /> : null}
                  {size.code}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {brands.length > 0 ? (
        <section>
          <p className="mb-2 text-sm font-medium">{t('brand')}</p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => go({ brand_id: undefined })}
              className={chipClass(!values.brand_id)}
              aria-pressed={!values.brand_id}
            >
              {!values.brand_id ? <CheckIcon className="size-3.5" /> : null}
              {t('all')}
            </button>
            {(showAllBrands ? brands : brands.slice(0, 8)).map((brand) => {
              const active = values.brand_id === brand.id;
              const logo = (brand as Brand & { logo_url?: string }).logo_url;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => go({ brand_id: active ? undefined : brand.id })}
                  className={chipClass(active)}
                  aria-pressed={active}
                >
                  {active ? <CheckIcon className="size-3.5" /> : null}
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="size-5 rounded object-cover" />
                  ) : null}
                  {localizedName(brand, locale)}
                </button>
              );
            })}
            {brands.length > 8 ? (
              <button
                type="button"
                className="mt-1 text-start text-xs font-medium text-accent underline underline-offset-4"
                onClick={() => setShowAllBrands((v) => !v)}
              >
                {showAllBrands ? t('showLess') : t('showMore')}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {seasons.length > 0 ? (
        <label className="block text-sm font-medium">
          {t('season')}
          <select
            className="mt-2 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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

      <label className="block text-sm font-medium">
        {t('sort')}
        <select
          className="mt-2 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
          className="text-sm font-medium text-accent underline underline-offset-4"
        >
          {t('clear')}
        </button>
      ) : null}
    </div>
  );

  return (
    <aside className="lg:sticky lg:top-24">
      <details className="rounded-xl border border-sand bg-white px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-medium">
          {t('filters')}
          {activeCount > 0 ? (
            <span className="ms-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-cream">
              {activeCount}
            </span>
          ) : null}
        </summary>
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
    'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    active
      ? 'border-accent border-s-4 border-s-accent bg-accent/10 font-semibold text-ink'
      : 'border-sand bg-white text-muted hover:border-ink/40 hover:bg-sand/40 hover:text-ink',
  );
}
