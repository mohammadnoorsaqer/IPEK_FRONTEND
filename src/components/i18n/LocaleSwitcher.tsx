'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useAlternateLinks } from '@/components/i18n/AlternateLinks';
import clsx from 'clsx';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const alternates = useAlternateLinks();

  const enHref = alternates?.en || pathname;
  const arHref = alternates?.ar || pathname;

  return (
    <div className="flex items-center gap-1 text-xs uppercase tracking-[0.2em]">
      <Link
        href={enHref}
        locale="en"
        className={clsx(
          'px-1 py-0.5',
          locale === 'en' ? 'text-accent' : 'text-muted hover:text-ink',
        )}
      >
        EN
      </Link>
      <span className="text-sand">/</span>
      <Link
        href={arHref}
        locale="ar"
        className={clsx(
          'px-1 py-0.5',
          locale === 'ar' ? 'text-accent' : 'text-muted hover:text-ink',
        )}
      >
        AR
      </Link>
    </div>
  );
}
