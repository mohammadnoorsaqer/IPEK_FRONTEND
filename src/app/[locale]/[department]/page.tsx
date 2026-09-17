import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCategories, getDepartmentBySlug, getProducts, getSitemapData } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { localizedName, type Locale } from '@/lib/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ListingFilters } from '@/components/listing/ListingFilters';
import {
  absoluteUrl,
  departmentPath,
  reservedDepartmentSlugs,
} from '@/lib/paths';
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
    data.departments
      .map((department) => ({
        locale,
        department: locale === 'ar' ? department.slug_ar : department.slug_en,
      }))
      .filter(
        (entry) =>
          Boolean(entry.department) &&
          !reservedDepartmentSlugs.has(entry.department),
      ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; department: string }>;
}): Promise<Metadata> {
  const { locale, department } = await params;
  const item = await getDepartmentBySlug(locale as Locale, department).catch(
    () => null,
  );
  if (!item) return { title: site.name };

  const name = localizedName(item, locale as Locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const title = `${name} · ${site.name}`;
  const description = `${t('eyebrow')} — ${name}`;
  const en = departmentPath('en', item);
  const ar = departmentPath('ar', item);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(locale === 'ar' ? ar : en),
      languages: {
        en: absoluteUrl(en),
        ar: absoluteUrl(ar),
        'x-default': absoluteUrl(en),
      },
    },
  };
}

export default async function DepartmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; department: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { locale, department } = await params;
  const { sort: sortParam } = await searchParams;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const sort = sortParam === 'best_selling' ? 'best_selling' : 'newest';

  const departmentItem = await getDepartmentBySlug(typedLocale, department).catch(
    () => null,
  );
  if (!departmentItem) notFound();

  const emptyList = {
    results: [],
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  };
  const [categories, products, t] = await Promise.all([
    safeFetch(
      () =>
        getCategories({
          department_slug: department,
          locale: typedLocale,
          limit: 50,
        }),
      emptyList,
    ),
    safeFetch(
      () =>
        getProducts({
          locale: typedLocale,
          department_slug: department,
          sort,
          limit: 12,
        }),
      emptyList,
    ),
    getTranslations('home'),
  ]);

  const name = localizedName(departmentItem, typedLocale);

  return (
    <>
      <AlternateLinks
        en={`/${departmentItem.slug_en}`}
        ar={`/${departmentItem.slug_ar}`}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: t('shop'),
              item: absoluteUrl(`/${locale}`),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name,
              item: absoluteUrl(departmentPath(typedLocale, departmentItem)),
            },
          ],
        }}
      />
      <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
        <h1 className="mb-10 text-4xl">{name}</h1>
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <ListingFilters
            locale={typedLocale}
            departmentSlug={department}
            categories={categories.results}
            sort={sort}
          />
          <ProductGrid
            key={`${department}-${sort}`}
            locale={typedLocale}
            departmentSlug={department}
            sort={sort}
            initialProducts={products.results}
          />
        </div>
      </div>
    </>
  );
}
