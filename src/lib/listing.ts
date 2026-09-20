import type { ProductQuery } from '@/lib/types';

export type ListingSearch = {
  sort?: string;
  min_price?: string;
  max_price?: string;
  color_id?: string;
  size_id?: string;
  brand_id?: string;
  season_id?: string;
};

export type ListingValues = {
  sort: 'best_selling' | 'newest';
  min_price?: number;
  max_price?: number;
  color_id?: string;
  size_id?: string;
  brand_id?: string;
  season_id?: string;
};

function positiveNumber(value?: string) {
  if (!value) return undefined;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  return amount;
}

function optionalId(value?: string) {
  return value?.trim() || undefined;
}

export function parseListingSearch(search: ListingSearch): ListingValues {
  return {
    sort: search.sort === 'best_selling' ? 'best_selling' : 'newest',
    min_price: positiveNumber(search.min_price),
    max_price: positiveNumber(search.max_price),
    color_id: optionalId(search.color_id),
    size_id: optionalId(search.size_id),
    brand_id: optionalId(search.brand_id),
    season_id: optionalId(search.season_id),
  };
}

export function listingQueryString(values: ListingValues) {
  const query = new URLSearchParams();
  query.set('sort', values.sort);
  if (values.min_price != null) query.set('min_price', String(values.min_price));
  if (values.max_price != null) query.set('max_price', String(values.max_price));
  if (values.color_id) query.set('color_id', values.color_id);
  if (values.size_id) query.set('size_id', values.size_id);
  if (values.brand_id) query.set('brand_id', values.brand_id);
  if (values.season_id) query.set('season_id', values.season_id);
  return query.toString();
}

export function activeFilterCount(
  values: ListingValues,
  categorySelected = false,
) {
  return [
    categorySelected,
    values.min_price != null || values.max_price != null,
    Boolean(values.color_id),
    Boolean(values.size_id),
    Boolean(values.brand_id),
    Boolean(values.season_id),
  ].filter(Boolean).length;
}

export function listingHref(pathname: string, values: ListingValues) {
  const query = listingQueryString(values);
  return query ? `${pathname}?${query}` : pathname;
}

export function toProductQuery(
  values: ListingValues,
  extra: Omit<ProductQuery, keyof ListingValues> = {},
): ProductQuery {
  return { ...extra, ...values };
}
