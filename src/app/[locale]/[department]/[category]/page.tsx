import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getSitemapData,
} from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { localizedName, type Locale } from '@/lib/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ListingFilters } from '@/components/listing/ListingFilters';
import { absoluteUrl, categoryPath, departmentPath } from '@/lib/paths';
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
    data.categories
      .filter((category) => category.department && category.slug_en && category.slug_ar)
      .map((category) => ({
        locale,
        department:
          locale === 'ar'
            ? category.department.slug_ar
            : category.department.slug_en,
        category: locale === 'ar' ? category.slug_ar : category.slug_en,
      })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; department: string; category: string }>;
}): Promise<Metadata> {
  const { locale, department, category } = await params;
  const item = await getCategoryBySlug(
    locale as Locale,
    category,
    department,
  ).catch(() => null);
  if (!item?.department) return { title: site.name };

  const name = localizedName(item, locale as Locale);
  const departmentName = localizedName(item.department, locale as Locale);
  const title = `${name} · ${departmentName} · ${site.name}`;
  const description = `${name} — ${departmentName}`;
  const en = categoryPath('en', item.department, item);
  const ar = categoryPath('ar', item.department, item);

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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; department: string; category: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { locale, department, category } = await params;
  const { sort: sortParam } = await searchParams;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const sort = sortParam === 'best_selling' ? 'best_selling' : 'newest';

  const categoryItem = await getCategoryBySlug(
    typedLocale,
    category,
    department,
  ).catch(() => null);
  if (!categoryItem?.department) notFound();

  const [categories, products, t] = await Promise.all([
    safeFetch(
      () =>
        getCategories({
          department_slug: department,
          locale: typedLocale,
          limit: 50,
        }),
      { results: [], page: 1, limit: 50, total: 0, totalPages: 0 },
    ),
    safeFetch(
      () =>
        getProducts({
          locale: typedLocale,
          department_slug: department,
          category_slug: category,
          sort,
          limit: 12,
        }),
      { results: [], page: 1, limit: 12, total: 0, totalPages: 0 },
    ),
    getTranslations('home'),
  ]);

  const name = localizedName(categoryItem, typedLocale);
  const departmentName = localizedName(categoryItem.department, typedLocale);

  return (
    <>
      <AlternateLinks
        en={`/${categoryItem.department.slug_en}/${categoryItem.slug_en}`}
        ar={`/${categoryItem.department.slug_ar}/${categoryItem.slug_ar}`}
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
              name: departmentName,
              item: absoluteUrl(
                departmentPath(typedLocale, categoryItem.department),
              ),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name,
              item: absoluteUrl(
                categoryPath(typedLocale, categoryItem.department, categoryItem),
              ),
            },
          ],
        }}
      />
      <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          {departmentName}
        </p>
        <h1 className="mb-10 mt-3 text-4xl">{name}</h1>
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <ListingFilters
            locale={typedLocale}
            departmentSlug={department}
            categorySlug={category}
            categories={categories.results}
            sort={sort}
          />
          <ProductGrid
            key={`${department}-${category}-${sort}`}
            locale={typedLocale}
            departmentSlug={department}
            categorySlug={category}
            sort={sort}
            initialProducts={products.results}
          />
        </div>
      </div>
    </>
  );
}
