'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { formatPrice } from '@/lib/format';
import { listingHref, type ListingValues } from '@/lib/listing';
import {
  decodeParam,
  humanizeParam,
  localizedName,
  localizedSlug,
  type Brand,
  type Category,
  type Color,
  type Locale,
  type Season,
  type Size,
} from '@/lib/types';
import { FilterThumb } from '@/components/listing/FilterThumb';

type Chip = {
  key: string;
  group: string;
  label: string;
  href: string;
  imageUrl?: string | null;
  hex?: string | null;
};

export function ActiveFilterChips({
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
  const pathname = usePathname();
  const chips: Chip[] = [];
  const activeCategory = decodeParam(categorySlug);
  const deptSlug = decodeParam(departmentSlug);

  function without(partial: Partial<ListingValues>) {
    return listingHref(pathname, { ...values, ...partial });
  }

  if (activeCategory) {
    const category = categories.find(
      (item) => decodeParam(localizedSlug(item, locale)) === activeCategory,
    );
    chips.push({
      key: 'category',
      group: t('category'),
      label: category ? localizedName(category, locale) : humanizeParam(activeCategory),
      imageUrl: category?.image_url,
      href: listingHref(`/${deptSlug}`, values),
    });
  }

  if (values.min_price != null || values.max_price != null) {
    const min =
      values.min_price != null ? formatPrice(values.min_price, locale) : null;
    const max =
      values.max_price != null ? formatPrice(values.max_price, locale) : null;
    chips.push({
      key: 'price',
      group: t('price'),
      label:
        min && max
          ? `${min} – ${max}`
          : min
            ? `${t('from')} ${min}`
            : `${t('to')} ${max}`,
      href: without({ min_price: undefined, max_price: undefined }),
    });
  }

  for (const colorId of values.color_ids) {
    const color = colors.find((item) => item.id === colorId);
    chips.push({
      key: `color-${colorId}`,
      group: t('color'),
      label: color ? localizedName(color, locale) : t('color'),
      hex: color?.hex_code,
      href: without({
        color_ids: values.color_ids.filter((id) => id !== colorId),
      }),
    });
  }

  for (const sizeId of values.size_ids) {
    const size = sizes.find((item) => item.id === sizeId);
    chips.push({
      key: `size-${sizeId}`,
      group: t('size'),
      label: size ? size.code : t('size'),
      href: without({
        size_ids: values.size_ids.filter((id) => id !== sizeId),
      }),
    });
  }

  for (const brandId of values.brand_ids) {
    const brand = brands.find((item) => item.id === brandId);
    chips.push({
      key: `brand-${brandId}`,
      group: t('brand'),
      label: brand ? localizedName(brand, locale) : t('brand'),
      imageUrl: brand?.logo_url || brand?.image_url,
      href: without({
        brand_ids: values.brand_ids.filter((id) => id !== brandId),
      }),
    });
  }

  for (const seasonId of values.season_ids) {
    const season = seasons.find((item) => item.id === seasonId);
    chips.push({
      key: `season-${seasonId}`,
      group: t('season'),
      label: season ? localizedName(season, locale) : t('season'),
      href: without({
        season_ids: values.season_ids.filter((id) => id !== seasonId),
      }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">{t('activeFilters')}</span>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          replace
          aria-label={t('remove', { label: `${chip.group}: ${chip.label}` })}
          className="inline-flex items-center gap-1.5 rounded-full border border-s-4 border-accent bg-accent/10 py-1.5 pe-2.5 ps-3 text-sm font-semibold text-accent-dark transition hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          {chip.imageUrl ? <FilterThumb src={chip.imageUrl} /> : null}
          {chip.hex ? (
            <span
              className="size-3 shrink-0 rounded-full ring-1 ring-ink/25"
              style={{ backgroundColor: chip.hex }}
              aria-hidden
            />
          ) : null}
          <span>{chip.label}</span>
          <CloseIcon />
        </Link>
      ))}
      <Link
        href={`/${deptSlug}`}
        replace
        className="ms-1 rounded-full px-1 text-xs text-accent underline underline-offset-4 transition hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {t('clearAll')}
      </Link>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 4 12 12M12 4 4 12" />
    </svg>
  );
}
