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
  color_ids: string[];
  size_ids: string[];
  brand_ids: string[];
  season_ids: string[];
};

function positiveNumber(value?: string) {
  if (!value) return undefined;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  return amount;
}

function parseIdList(value?: string) {
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseListingSearch(search: ListingSearch): ListingValues {
  return {
    sort: search.sort === 'best_selling' ? 'best_selling' : 'newest',
    min_price: positiveNumber(search.min_price),
    max_price: positiveNumber(search.max_price),
    color_ids: parseIdList(search.color_id),
    size_ids: parseIdList(search.size_id),
    brand_ids: parseIdList(search.brand_id),
    season_ids: parseIdList(search.season_id),
  };
}

export function listingQueryString(values: ListingValues) {
  const query = new URLSearchParams();
  query.set('sort', values.sort);
  if (values.min_price != null) query.set('min_price', String(values.min_price));
  if (values.max_price != null) query.set('max_price', String(values.max_price));
  if (values.color_ids.length) query.set('color_id', values.color_ids.join(','));
  if (values.size_ids.length) query.set('size_id', values.size_ids.join(','));
  if (values.brand_ids.length) query.set('brand_id', values.brand_ids.join(','));
  if (values.season_ids.length) query.set('season_id', values.season_ids.join(','));
  return query.toString();
}

export function activeFilterCount(
  values: ListingValues,
  categorySelected = false,
) {
  return [
    categorySelected,
    values.min_price != null || values.max_price != null,
    values.color_ids.length > 0,
    values.size_ids.length > 0,
    values.brand_ids.length > 0,
    values.season_ids.length > 0,
  ].filter(Boolean).length;
}

export function listingHref(pathname: string, values: ListingValues) {
  const query = listingQueryString(values);
  return query ? `${pathname}?${query}` : pathname;
}

export function toggleId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function toProductQuery(
  values: ListingValues,
  extra: Omit<ProductQuery, keyof ListingValues | 'color_id' | 'size_id' | 'brand_id' | 'season_id'> = {},
): ProductQuery {
  return {
    ...extra,
    sort: values.sort,
    min_price: values.min_price,
    max_price: values.max_price,
    color_id: values.color_ids.length ? values.color_ids.join(',') : undefined,
    size_id: values.size_ids.length ? values.size_ids.join(',') : undefined,
    brand_id: values.brand_ids.length ? values.brand_ids.join(',') : undefined,
    season_id: values.season_ids.length ? values.season_ids.join(',') : undefined,
  };
}
