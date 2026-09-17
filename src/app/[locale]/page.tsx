import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDepartments, getProducts } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { site } from '@/lib/site';
import { type Locale, type Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { DepartmentCard } from '@/components/catalog/DepartmentCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { absoluteUrl, languageAlternates } from '@/lib/paths';
import { Reveal } from '@/components/motion/Reveal';
import { primaryImageUrl } from '@/components/media/MediaFrame';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const title = `${site.name} · ${t('title')}`;
  const description = t('subtitle');
  const languages = languageAlternates('/en', '/ar').languages;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}`),
      languages,
    },
    openGraph: { title, description, locale, url: absoluteUrl(`/${locale}`) },
  };
}

function coverByDepartment(products: Product[]) {
  const covers = new Map<string, string>();
  for (const product of products) {
    const departmentId = product.category?.department?.id;
    const image = primaryImageUrl(product.images);
    if (departmentId && image && !covers.has(departmentId)) {
      covers.set(departmentId, image);
    }
  }
  return covers;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const t = await getTranslations('home');

  const [departments, bestsellers, newest] = await Promise.all([
    safeFetch(getDepartments, {
      results: [],
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    }),
    safeFetch(
      () => getProducts({ locale: typedLocale, sort: 'best_selling', limit: 6 }),
      { results: [], page: 1, limit: 6, total: 0, totalPages: 0 },
    ),
    safeFetch(
      () => getProducts({ locale: typedLocale, sort: 'newest', limit: 12 }),
      { results: [], page: 1, limit: 12, total: 0, totalPages: 0 },
    ),
  ]);

  const visibleDepartments = departments.results.filter(
    (item) => item.is_visible !== false,
  );
  const covers = coverByDepartment([
    ...bestsellers.results,
    ...newest.results,
  ]);

  return (
    <>
      <AlternateLinks en="/" ar="/" />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: site.name,
          url: site.url,
          telephone: site.phone,
          address: {
            '@type': 'PostalAddress',
            addressLocality: site.address,
            addressCountry: 'JO',
          },
          areaServed: 'JO',
        }}
      />

      <section className="mx-auto max-w-site px-4 pb-4 pt-10 sm:px-6">
        <p className="reveal text-xs uppercase tracking-[0.28em] text-accent">
          {t('eyebrow')}
        </p>
        <h1 className="reveal reveal-delay-1 mt-3 text-3xl leading-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="reveal reveal-delay-2 mt-3 max-w-xl text-base leading-7 text-muted">
          {t('subtitle')}
        </p>
      </section>

      {visibleDepartments.length > 0 ? (
        <section className="mx-auto max-w-site px-4 py-10 sm:px-6">
          <Reveal>
            <h2 className="mb-5 text-xl">{t('departments')}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {visibleDepartments.map((department, index) => (
              <Reveal key={department.id} delay={index * 50}>
                <DepartmentCard
                  department={department}
                  locale={typedLocale}
                  imageUrl={covers.get(department.id)}
                  priority={index < 4}
                />
              </Reveal>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-site px-4 py-16 sm:px-6">
          <p className="border border-sand bg-white/40 px-6 py-12 text-center text-muted">
            {t('empty')}
          </p>
        </section>
      )}

      <section className="mx-auto max-w-site px-4 pb-12 sm:px-6">
        <Reveal>
          <h2 className="mb-5 text-xl">{t('bestsellers')}</h2>
        </Reveal>
        {bestsellers.results.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {bestsellers.results.slice(0, 4).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                compact
                priority={index === 0}
                delay={index * 50}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted">{t('empty')}</p>
        )}
      </section>

      {newest.results.length > 0 ? (
        <section className="mx-auto max-w-site px-4 pb-20 sm:px-6">
          <Reveal>
            <h2 className="mb-5 text-xl">{t('newArrivals')}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {newest.results.slice(0, 8).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                compact
                delay={index * 40}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
