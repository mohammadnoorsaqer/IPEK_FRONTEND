import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getDepartments } from '@/lib/api';
import { safeFetch } from '@/lib/safe';
import { site } from '@/lib/site';
import { localizedName, localizedSlug, type Locale } from '@/lib/types';
import { WhatsAppIcon } from '@/components/layout/WhatsAppIcon';

export async function Footer() {
  const t = await getTranslations('footer');
  const locale = (await getLocale()) as Locale;
  const phone = site.phone.replace(/[^\d]/g, '');
  const departments = await safeFetch(getDepartments, {
    results: [],
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const visible = departments.results.filter((item) => item.is_visible !== false);

  return (
    <footer className="mt-8 border-t border-sand bg-[linear-gradient(180deg,transparent,rgba(232,223,211,0.55))]">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl tracking-[0.35em]">IPEK</p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted">{t('blurb')}</p>
          <p className="mt-3 text-sm text-muted">{site.address}</p>
        </div>

        <div>
          <p className="text-sm">{t('shop')}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-ink">
                {t('home')}
              </Link>
            </li>
            {visible.map((department) => (
              <li key={department.id}>
                <Link
                  href={`/${localizedSlug(department, locale)}`}
                  className="hover:text-ink"
                >
                  {localizedName(department, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm">{t('help')}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link href="/search" className="hover:text-ink">
                {t('search')}
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-ink">
                {t('cart')}
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-ink">
                {t('account')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm">{t('contact')}</p>
          <p className="mt-4 text-sm leading-7 text-muted">{t('hours')}</p>
          <a
            href={`https://wa.me/${phone}`}
            className="mt-4 inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#1ebe57]"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="size-6" />
          </a>
        </div>
      </div>
      <p className="border-t border-sand/70 px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} IPEK. {t('rights')}
      </p>
    </footer>
  );
}
