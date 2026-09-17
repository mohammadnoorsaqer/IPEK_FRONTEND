import { site } from './site';

export function formatPrice(value: string | number | undefined, locale: string) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
    style: 'currency',
    currency: site.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
