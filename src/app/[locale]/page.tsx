import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getDepartments, getProducts } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { site } from '@/lib/site';
import { localizedName, localizedSlug, type Locale } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { AlternateLinks } from '@/components/i18n/AlternateLinks';
import { absoluteUrl, languageAlternates } from '@/lib/paths';
import { Reveal } from '@/components/motion/Reveal';
import { Marquee } from '@/components/layout/Marquee';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const title = `${site.name} · ${t('eyebrow')}`;
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

  const saleItems = newest.results
    .filter(
      (product) =>
        Number(product.current_price ?? product.base_price) <
        Number(product.base_price),
    )
    .slice(0, 3);

  const shopHref = departments.results[0]
    ? `/${localizedSlug(departments.results[0], typedLocale)}`
    : '/search';

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

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_end,rgba(180,83,42,0.16),transparent_42%)]" />
        <div className="mx-auto grid max-w-site items-end gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="reveal text-xs uppercase tracking-[0.35em] text-accent">
              {t('eyebrow')}
            </p>
            <h1 className="reveal reveal-delay-1 mt-4 max-w-3xl text-4xl leading-[1.08] sm:text-6xl">
              {t('title')}
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg leading-8 text-muted">
              {t('subtitle')}
            </p>
            <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center gap-5">
              <Link href={shopHref} className="btn-live">
                {t('shop')}
              </Link>
              <p className="text-sm text-muted">{t('ctaNote')}</p>
            </div>
          </div>
          <div className="reveal reveal-delay-4 float-slow hidden aspect-[4/5] border border-sand bg-white/40 p-4 lg:block">
            <div className="flex h-full flex-col justify-between bg-[linear-gradient(160deg,#e8dfd3_0%,#f7f3ee_48%,#dcc7b3_100%)] p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-accent">
                {t('lookbook')}
              </p>
              <p className="max-w-xs text-3xl leading-tight">
                {newest.results[0]
                  ? localizedName(newest.results[0], typedLocale)
                  : t('newArrivals')}
              </p>
              <p className="text-sm text-muted">{site.address}</p>
            </div>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          t('ticker1'),
          t('ticker2'),
          t('ticker3'),
          t('ticker4'),
          t('ticker5'),
        ]}
      />

      {departments.results.length > 0 ? (
        <section className="mx-auto max-w-site px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="mb-8 text-2xl">{t('departments')}</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {departments.results.map((department, index) => (
              <Reveal key={department.id} delay={index * 90}>
                <Link
                  href={`/${localizedSlug(department, typedLocale)}`}
                  className="group block border border-sand bg-white/50 px-6 py-12 text-xl transition duration-500 hover:-translate-y-1 hover:border-accent hover:shadow-[0_24px_50px_rgba(43,43,43,0.08)]"
                >
                  <span className="block text-xs uppercase tracking-[0.3em] text-accent">
                    0{index + 1}
                  </span>
                  <span className="mt-4 block">{localizedName(department, typedLocale)}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-site px-4 py-20 sm:px-6">
          <p className="border border-sand bg-white/40 px-6 py-16 text-center text-muted">
            {t('empty')}
          </p>
        </section>
      )}

      <section className="mx-auto max-w-site px-4 pb-20 sm:px-6">
        <Reveal>
          <h2 className="mb-10 text-2xl">{t('bestsellers')}</h2>
        </Reveal>
        {bestsellers.results.length ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {bestsellers.results.slice(0, 3).map((product, index) => (
              <Reveal key={product.id} delay={index * 80}>
                <ProductCard product={product} priority={index === 0} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-muted">{t('empty')}</p>
        )}
      </section>

      {newest.results.length > 0 ? (
        <section className="mx-auto max-w-site px-4 pb-20 sm:px-6">
          <Reveal>
            <h2 className="mb-10 text-2xl">{t('newArrivals')}</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {newest.results.slice(0, 6).map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {saleItems.length > 0 ? (
        <section className="mx-auto max-w-site px-4 pb-24 sm:px-6">
          <Reveal>
            <h2 className="mb-10 text-2xl">{t('sale')}</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {saleItems.map((product, index) => (
              <Reveal key={product.id} delay={index * 80}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
