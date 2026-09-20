import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { emptyPage, getBrand, getProducts } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { localizedName, type Locale } from '@/lib/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { MediaFrame } from '@/components/media/MediaFrame';
import { absoluteUrl } from '@/lib/paths';
import { site } from '@/lib/site';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
        limit: 10,
      }),
    emptyPage(10),
  );

  const name = localizedName(brand, typedLocale);
  const logo = brand.logo_url || brand.image_url || null;

  return (
    <>
      <AlternateLinks en={`/brands/${brand.id}`} ar={`/brands/${brand.id}`} />
      <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end gap-5">
          {logo ? (
            <div className="w-28 shrink-0 overflow-hidden rounded-xl border border-sand bg-white sm:w-36">
              <MediaFrame
                src={logo}
                alt={name}
                aspect="aspect-square"
                fit="contain"
                sizes="144px"
                className="bg-white"
              />
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{t('brands')}</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{name}</h1>
          </div>
        </div>
        <ProductGrid
          locale={typedLocale}
          query={{ brand_id: brand.id, sort: 'newest' }}
          initialProducts={products.results}
          initialPage={products.page}
          initialTotal={products.total}
          initialTotalPages={products.totalPages}
          compact
        />
      </div>
    </>
  );
}
