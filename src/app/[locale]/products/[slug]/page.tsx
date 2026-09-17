import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProductBySlug, getSitemapData } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { localizedName, type Locale } from '@/lib/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { ProductDetail } from '@/components/product/ProductDetail';
import { absoluteUrl, categoryPath, departmentPath, productPath } from '@/lib/paths';
import { site } from '@/lib/site';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const data = await safeFetch(getSitemapData, {
    departments: [],
    categories: [],
    products: [],
  });

  return (['en', 'ar'] as Locale[]).flatMap((locale) =>
    data.products
      .filter((product) => product.slug_en && product.slug_ar)
      .map((product) => ({
        locale,
        slug: locale === 'ar' ? product.slug_ar : product.slug_en,
      })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(locale as Locale, slug).catch(() => null);
  if (!product) return { title: site.name };

  const name = localizedName(product, locale as Locale);
  const description =
    (locale === 'ar' ? product.description_ar : product.description_en) || name;
  const en = productPath('en', product);
  const ar = productPath('ar', product);
  const image = product.images?.find((item) => item.is_primary)?.image_url;

  return {
    title: `${name} · ${site.name}`,
    description,
    alternates: {
      canonical: absoluteUrl(locale === 'ar' ? ar : en),
      languages: {
        en: absoluteUrl(en),
        ar: absoluteUrl(ar),
        'x-default': absoluteUrl(en),
      },
    },
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const product = await getProductBySlug(typedLocale, slug).catch(() => null);
  if (!product) notFound();

  const t = await getTranslations('home');
  const name = localizedName(product, typedLocale);
  const image =
    product.images?.find((item) => item.is_primary)?.image_url ||
    product.images?.[0]?.image_url;
  const availability = (product.variants || []).some(
    (variant) => variant.stock_quantity > 0,
  )
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: t('shop'),
      item: absoluteUrl(`/${locale}`),
    },
  ];

  if (product.category?.department) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 2,
      name: localizedName(product.category.department, typedLocale),
      item: absoluteUrl(departmentPath(typedLocale, product.category.department)),
    });
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 3,
      name: localizedName(product.category, typedLocale),
      item: absoluteUrl(
        categoryPath(typedLocale, product.category.department, product.category),
      ),
    });
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 4,
      name,
      item: absoluteUrl(productPath(typedLocale, product)),
    });
  }

  return (
    <>
      <AlternateLinks
        en={`/products/${product.slug_en}`}
        ar={`/products/${product.slug_ar}`}
      />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name,
            image: image ? [image] : undefined,
            sku: product.sku,
            description:
              (locale === 'ar' ? product.description_ar : product.description_en) ||
              name,
            offers: {
              '@type': 'Offer',
              priceCurrency: site.currency,
              price: Number(product.current_price ?? product.base_price),
              availability,
              url: absoluteUrl(productPath(typedLocale, product)),
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs,
          },
        ]}
      />
      <ProductDetail product={product} />
    </>
  );
}
