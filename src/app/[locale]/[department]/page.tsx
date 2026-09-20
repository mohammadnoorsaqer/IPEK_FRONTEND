import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { emptyPage, getCategories, getDepartmentBySlug, getProducts, getSitemapData } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { localizedName, type Locale } from '@/lib/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ListingFilters } from '@/components/listing/ListingFilters';
import { ActiveFilterChips } from '@/components/listing/ActiveFilterChips';
import {
  absoluteUrl,
  departmentPath,
  reservedDepartmentSlugs,
} from '@/lib/paths';
import { site } from '@/lib/site';
import { parseListingSearch, toProductQuery, type ListingSearch } from '@/lib/listing';
import {
  categoriesForDepartment,
  getFilterFacets,
  sizeGroupForDepartment,
} from '@/lib/listing-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
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
  const title = name;
  const description = `${t('eyebrow')}. ${name}.`;
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
  searchParams: Promise<ListingSearch>;
}) {
  const { locale, department } = await params;
  const search = await searchParams;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const listing = parseListingSearch(search);

  const departmentItem = await getDepartmentBySlug(typedLocale, department).catch(
    () => null,
  );
  if (!departmentItem) notFound();

  const productQuery = toProductQuery(listing, {
    locale: typedLocale,
    department_slug: department,
    limit: 10,
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
    safeFetch(() => getProducts(productQuery), emptyPage(10)),
    getFilterFacets(sizeGroupForDepartment(departmentItem)),
    getTranslations('home'),
  ]);

  const name = localizedName(departmentItem, typedLocale);
  const departmentCategories = categoriesForDepartment(
    categories.results,
    departmentItem.id,
  );

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
        <h1 className="mb-6 text-3xl">{name}</h1>
        <div className="grid gap-8 lg:grid-cols-[15.5rem_1fr]">
          <ListingFilters
            locale={typedLocale}
            departmentSlug={department}
            categories={departmentCategories}
            colors={facets.colors}
            sizes={facets.sizes}
            brands={facets.brands}
            seasons={facets.seasons}
            values={listing}
          />
          <div>
            <ActiveFilterChips
              locale={typedLocale}
              departmentSlug={department}
              categories={departmentCategories}
              colors={facets.colors}
              sizes={facets.sizes}
              brands={facets.brands}
              seasons={facets.seasons}
              values={listing}
            />
            <ProductGrid
              key={`${department}-${listingQueryKey(listing)}`}
              locale={typedLocale}
              query={productQuery}
              initialProducts={products.results}
              initialPage={products.page}
              initialTotal={products.total}
              initialTotalPages={products.totalPages}
              compact
            />
          </div>
        </div>
      </div>
    </>
  );
}

function listingQueryKey(listing: ReturnType<typeof parseListingSearch>) {
  return [
    listing.sort,
    listing.min_price,
    listing.max_price,
    listing.color_id,
    listing.size_id,
    listing.brand_id,
    listing.season_id,
  ].join('-');
}
