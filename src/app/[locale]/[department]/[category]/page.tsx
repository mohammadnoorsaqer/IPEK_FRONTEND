import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  emptyPage,
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
import { parseListingSearch, toProductQuery, type ListingSearch } from '@/lib/listing';
import {
  categoriesForDepartment,
  getFilterFacets,
  sizeGroupForDepartment,
} from '@/lib/listing-data';

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
  const title = `${name} · ${departmentName}`;
  const description = `${name}. ${departmentName}.`;
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
  searchParams: Promise<ListingSearch>;
}) {
  const { locale, department, category } = await params;
  const search = await searchParams;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const listing = parseListingSearch(search);

  const categoryItem = await getCategoryBySlug(
    typedLocale,
    category,
    department,
  ).catch(() => null);
  if (!categoryItem?.department) notFound();
  const departmentItem = categoryItem.department;

  const productQuery = toProductQuery(listing, {
    locale: typedLocale,
    department_slug: department,
    category_slug: category,
    limit: 12,
  });

  const [categories, products, facets, t] = await Promise.all([
    safeFetch(
      () =>
        getCategories({
          department_id: departmentItem.id,
          department_slug: department,
          locale: typedLocale,
          limit: 100,
        }),
      emptyPage(100),
    ),
    safeFetch(() => getProducts(productQuery), emptyPage(12)),
    getFilterFacets(sizeGroupForDepartment(departmentItem)),
    getTranslations('home'),
  ]);

  const name = localizedName(categoryItem, typedLocale);
  const departmentName = localizedName(departmentItem, typedLocale);
  const departmentCategories = categoriesForDepartment(
    categories.results,
    departmentItem.id,
  );

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
        <h1 className="mb-6 mt-2 text-3xl">{name}</h1>
        <div className="grid gap-8 lg:grid-cols-[15.5rem_1fr]">
          <ListingFilters
            locale={typedLocale}
            departmentSlug={department}
            categorySlug={category}
            categories={departmentCategories}
            colors={facets.colors}
            sizes={facets.sizes}
            brands={facets.brands}
            seasons={facets.seasons}
            values={listing}
          />
          <ProductGrid
            key={`${department}-${category}-${JSON.stringify(listing)}`}
            locale={typedLocale}
            query={productQuery}
            initialProducts={products.results}
            compact
          />
        </div>
      </div>
    </>
  );
}
