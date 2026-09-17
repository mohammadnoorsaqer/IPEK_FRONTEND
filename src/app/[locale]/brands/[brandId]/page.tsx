import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { emptyPage, getBrand, getProducts } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { localizedName, type Locale } from '@/lib/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { absoluteUrl } from '@/lib/paths';
import { site } from '@/lib/site';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; brandId: string }>;
}): Promise<Metadata> {
  const { locale, brandId } = await params;
  const brand = await getBrand(brandId).catch(() => null);
  if (!brand) return { title: site.name };
  const name = localizedName(brand, locale as Locale);
  return {
    title: name,
    description: name,
    alternates: {
      canonical: absoluteUrl(`/${locale}/brands/${brandId}`),
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string; brandId: string }>;
}) {
  const { locale, brandId } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const t = await getTranslations('home');

  const brand = await getBrand(brandId).catch(() => null);
  if (!brand) notFound();

  const products = await safeFetch(
    () =>
      getProducts({
        locale: typedLocale,
        brand_id: brand.id,
        sort: 'newest',
        limit: 12,
      }),
    emptyPage(12),
  );

  const name = localizedName(brand, typedLocale);

  return (
    <>
      <AlternateLinks en={`/brands/${brand.id}`} ar={`/brands/${brand.id}`} />
      <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{t('brands')}</p>
        <h1 className="mb-6 mt-2 text-3xl font-semibold">{name}</h1>
        <ProductGrid
          locale={typedLocale}
          query={{ brand_id: brand.id, sort: 'newest' }}
          initialProducts={products.results}
          compact
        />
      </div>
    </>
  );
}
