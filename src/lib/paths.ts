import type { Locale } from './types';
import { localizedSlug } from './types';
import { site } from './site';

export const reservedDepartmentSlugs = new Set([
  'products',
  'cart',
  'checkout',
  'account',
  'search',
  'login',
  'register',
]);

export function localePath(locale: Locale, pathname = '') {
  const suffix = pathname.startsWith('/') ? pathname : pathname ? `/${pathname}` : '';
  return `/${locale}${suffix}`;
}

export function absoluteUrl(pathname: string) {
  return `${site.url}${pathname}`;
}

export function departmentPath(
  locale: Locale,
  department: { slug_en: string; slug_ar: string },
) {
  return localePath(locale, `/${encodeURIComponent(localizedSlug(department, locale))}`);
}

export function categoryPath(
  locale: Locale,
  department: { slug_en: string; slug_ar: string },
  category: { slug_en: string; slug_ar: string },
) {
  return localePath(
    locale,
    `/${encodeURIComponent(localizedSlug(department, locale))}/${encodeURIComponent(localizedSlug(category, locale))}`,
  );
}

export function productPath(
  locale: Locale,
  product: { slug_en: string; slug_ar: string },
) {
  return localePath(
    locale,
    `/products/${encodeURIComponent(localizedSlug(product, locale))}`,
  );
}

export function languageAlternates(enPath: string, arPath: string) {
  return {
    canonical: undefined as string | undefined,
    languages: {
      en: absoluteUrl(enPath),
      ar: absoluteUrl(arPath),
      'x-default': absoluteUrl(enPath),
    },
  };
}
