'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import { SearchForm } from '@/components/layout/SearchForm';
import { useCart } from '@/components/cart/CartProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { localizedName, localizedSlug, type Department, type Locale } from '@/lib/types';

export function Header({ departments }: { departments: Department[] }) {
  const t = useTranslations('nav');
  const authT = useTranslations('auth');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const { count } = useCart();
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sand/80 bg-cream/85 backdrop-blur-md transition">
      <div className="mx-auto flex max-w-site items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <button
          type="button"
          className="md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          <span className="block h-px w-6 bg-ink" />
          <span className="mt-1.5 block h-px w-6 bg-ink" />
        </button>

        <Link href="/" className="font-sans text-xl tracking-[0.35em] transition hover:text-accent">
          IPEK
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {departments.map((department) => (
            <Link
              key={department.id}
              href={`/${localizedSlug(department, locale)}`}
              className="text-muted transition-colors hover:text-accent"
            >
              {localizedName(department, locale)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <div className="hidden w-44 lg:block">
            <SearchForm />
          </div>
          <LocaleSwitcher />
          {ready && user ? (
            <div className="hidden items-center gap-4 sm:flex">
              <Link href="/account" className="text-sm text-muted hover:text-ink">
                {user.username || t('account')}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-sm text-muted hover:text-ink"
              >
                {authT('logout')}
              </button>
            </div>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="hidden text-sm text-muted hover:text-ink sm:inline"
            >
              {authT('login')}
            </Link>
          )}
          <Link href="/cart" className="relative p-1" aria-label={t('cart')}>
            <BagIcon />
            {count > 0 ? (
              <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-cream">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {open ? (
        <div className="border-t border-sand px-4 py-4 md:hidden">
          <SearchForm compact />
          <div className="mt-4 flex flex-col gap-3">
            {departments.map((department) => (
              <Link
                key={department.id}
                href={`/${localizedSlug(department, locale)}`}
                onClick={() => setOpen(false)}
              >
                {localizedName(department, locale)}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)}>
                  {t('account')}
                </Link>
                <button type="button" className="text-start" onClick={() => void logout()}>
                  {authT('logout')}
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                {authT('login')}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 stroke-current" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V7a3 3 0 0 1 6 0v1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
