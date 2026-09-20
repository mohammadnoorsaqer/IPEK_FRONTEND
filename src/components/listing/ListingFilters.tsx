'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { listingHref, toggleId, type ListingValues } from '@/lib/listing';
import { groupCategories } from '@/lib/listing-data';
import {
  decodeParam,
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

const PARENT_PREVIEW = 8;
const COLOR_PREVIEW = 12;
const BRAND_PREVIEW = 6;

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
  const [showAllParents, setShowAllParents] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [stableSeasons, setStableSeasons] = useState(seasons);
  const [stableBrands, setStableBrands] = useState(brands);
  const [stableColors, setStableColors] = useState(colors);
  const [stableSizes, setStableSizes] = useState(sizes);
  const activeCategory = decodeParam(categorySlug);
  const deptSlug = decodeParam(departmentSlug);

  useEffect(() => {
    setMinPrice(values.min_price?.toString() || '');
    setMaxPrice(values.max_price?.toString() || '');
  }, [values.min_price, values.max_price]);

  useEffect(() => {
    if (seasons.length) setStableSeasons(seasons);
  }, [seasons]);
  useEffect(() => {
    if (brands.length) setStableBrands(brands);
  }, [brands]);
  useEffect(() => {
    if (colors.length) setStableColors(colors);
  }, [colors]);
  useEffect(() => {
    if (sizes.length) setStableSizes(sizes);
  }, [sizes]);

  const categoryGroups = useMemo(() => groupCategories(categories), [categories]);

  useEffect(() => {
    const next = new Set<string>();
    for (const parent of categoryGroups.parents) {
      const children = categoryGroups.childrenByParent.get(parent.id) || [];
      const parentSlug = decodeParam(localizedSlug(parent, locale));
      const childHit = children.some(
        (child) => decodeParam(localizedSlug(child, locale)) === activeCategory,
      );
      if (parentSlug === activeCategory || childHit) next.add(parent.id);
    }
    setExpandedParents(next);
  }, [activeCategory, categoryGroups, locale]);

  const activeCount =
    Number(Boolean(values.min_price)) +
    Number(Boolean(values.max_price)) +
    values.color_ids.length +
    values.size_ids.length +
    values.brand_ids.length +
    values.season_ids.length +
    Number(Boolean(activeCategory)) +
    Number(values.sort !== 'newest');

  const hasActive = activeCount > 0;
  const visibleParents = showAllParents
    ? categoryGroups.parents
    : categoryGroups.parents.slice(0, PARENT_PREVIEW);

  function go(partial: Partial<ListingValues>) {
    router.replace(listingHref(pathname, { ...values, ...partial }));
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
    router.replace(`/${deptSlug}`);
  }

  function toggleExpand(parentId: string) {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }

  const body = (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {t('filters')}
          {activeCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-cream">
              {activeCount}
            </span>
          ) : null}
        </h2>
        <p className="mt-1.5 text-base leading-7 text-muted">{t('hint')}</p>
      </div>

      <section>
        <p className="mb-2 text-base font-medium">{t('category')}</p>
        <div className="space-y-2">
          <Link
            href={listingHref(`/${deptSlug}`, { ...values })}
            className={chipClass(!activeCategory)}
            aria-pressed={!activeCategory}
          >
            {!activeCategory ? <CheckIcon className="size-3.5" /> : null}
            {t('all')}
          </Link>
          {visibleParents.map((parent) => {
            const slug = decodeParam(localizedSlug(parent, locale));
            const children = categoryGroups.childrenByParent.get(parent.id) || [];
            const childActive = children.some(
              (child) => decodeParam(localizedSlug(child, locale)) === activeCategory,
            );
            const parentActive = activeCategory === slug;
            const selected = parentActive || childActive;
            const expanded = expandedParents.has(parent.id);
            return (
              <div key={parent.id} className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Link
                    href={listingHref(`/${deptSlug}/${slug}`, { ...values })}
                    className={clsx(chipClass(selected), 'flex-1')}
                    aria-pressed={selected}
                  >
                    {selected ? <CheckIcon className="size-3.5" /> : null}
                    {parent.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={parent.image_url}
                        alt=""
                        className="size-5 rounded object-cover"
                      />
                    ) : null}
                    {localizedName(parent, locale)}
                  </Link>
                  {children.length > 0 ? (
                    <button
                      type="button"
                      className="rounded-md border border-sand px-2 py-1.5 text-xs text-muted hover:border-ink/30 hover:text-ink"
                      aria-expanded={expanded}
                      onClick={() => toggleExpand(parent.id)}
                    >
                      {expanded ? '−' : '+'}
                    </button>
                  ) : null}
                </div>
                {expanded && children.length > 0 ? (
                  <div className="flex flex-wrap gap-2 ps-1">
                    {children.map((child) => {
                      const childSlug = decodeParam(localizedSlug(child, locale));
                      const childSelected = activeCategory === childSlug;
                      return (
                        <Link
                          key={child.id}
                          href={listingHref(`/${deptSlug}/${childSlug}`, {
                            ...values,
                          })}
                          className={chipClass(childSelected)}
                          aria-pressed={childSelected}
                        >
                          {childSelected ? <CheckIcon className="size-3.5" /> : null}
                          {localizedName(child, locale)}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
          {categoryGroups.parents.length > PARENT_PREVIEW ? (
            <button
              type="button"
              className="text-xs font-medium text-accent underline underline-offset-4"
              onClick={() => setShowAllParents((v) => !v)}
            >
              {showAllParents ? t('showLess') : t('showMore')}
            </button>
          ) : null}
        </div>
      </section>

      <form onSubmit={applyPrice}>
        <p className="mb-2 text-base font-medium">{t('price')}</p>
        <p className="mb-2 text-sm text-muted">{t('priceHint')}</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm text-muted">
            {t('from')}
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="mt-1 w-full rounded-md border border-sand bg-white px-2.5 py-2.5 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <label className="text-sm text-muted">
            {t('to')}
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="200"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="mt-1 w-full rounded-md border border-sand bg-white px-2.5 py-2.5 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-md bg-ink px-3 py-2 text-sm text-cream"
        >
          {t('apply')}
        </button>
      </form>

      {stableColors.length > 0 ? (
        <section>
          <p className="mb-2 text-base font-medium">{t('color')}</p>
          <div className="flex flex-wrap gap-2">
            {(showAllColors ? stableColors : stableColors.slice(0, COLOR_PREVIEW)).map((color) => {
              const active = values.color_ids.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => go({ color_ids: toggleId(values.color_ids, color.id) })}
                  className={clsx(
                    'size-8 rounded-full border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    active
                      ? 'border-ink ring-2 ring-accent/40'
                      : 'border-white ring-1 ring-sand hover:ring-ink/40',
                  )}
                  style={{ backgroundColor: color.hex_code }}
                  aria-label={localizedName(color, locale)}
                  aria-pressed={active}
                  title={localizedName(color, locale)}
                />
              );
            })}
          </div>
          {stableColors.length > COLOR_PREVIEW ? (
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

      {stableSizes.length > 0 ? (
        <section>
          <p className="mb-2 text-base font-medium">{t('size')}</p>
          <div className="flex flex-wrap gap-2">
            {stableSizes.map((size) => {
              const active = values.size_ids.includes(size.id);
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => go({ size_ids: toggleId(values.size_ids, size.id) })}
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

      {stableBrands.length > 0 ? (
        <section>
          <p className="mb-2 text-base font-medium">{t('brand')}</p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => go({ brand_ids: [] })}
              className={chipClass(values.brand_ids.length === 0)}
              aria-pressed={values.brand_ids.length === 0}
            >
              {values.brand_ids.length === 0 ? <CheckIcon className="size-3.5" /> : null}
              {t('all')}
            </button>
            {(showAllBrands ? stableBrands : stableBrands.slice(0, BRAND_PREVIEW)).map((brand) => {
              const active = values.brand_ids.includes(brand.id);
              const logo = brand.logo_url;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => go({ brand_ids: toggleId(values.brand_ids, brand.id) })}
                  className={chipClass(active)}
                  aria-pressed={active}
                >
                  {active ? <CheckIcon className="size-3.5" /> : null}
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-4 w-8 object-contain" />
                  ) : null}
                  {localizedName(brand, locale)}
                </button>
              );
            })}
            {stableBrands.length > BRAND_PREVIEW ? (
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

      {stableSeasons.length > 0 ? (
        <section>
          <p className="mb-2 text-base font-medium">{t('season')}</p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => go({ season_ids: [] })}
              className={chipClass(values.season_ids.length === 0)}
              aria-pressed={values.season_ids.length === 0}
            >
              {values.season_ids.length === 0 ? <CheckIcon className="size-3.5" /> : null}
              {t('all')}
            </button>
            {stableSeasons.map((season) => {
              const active = values.season_ids.includes(season.id);
              return (
                <button
                  key={season.id}
                  type="button"
                  onClick={() =>
                    go({ season_ids: toggleId(values.season_ids, season.id) })
                  }
                  className={chipClass(active)}
                  aria-pressed={active}
                >
                  {active ? <CheckIcon className="size-3.5" /> : null}
                  {localizedName(season, locale)}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <label className="block text-base font-medium">
        {t('sort')}
        <select
          className="mt-2 w-full rounded-md border border-sand bg-white px-3 py-2.5 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
    'inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    active
      ? 'border-accent border-s-4 border-s-accent bg-accent/20 font-semibold text-ink shadow-sm ring-2 ring-accent/35'
      : 'border-sand bg-white text-muted hover:border-ink/40 hover:bg-sand/40 hover:text-ink',
  );
}
