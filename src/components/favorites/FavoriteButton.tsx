'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFavorites } from '@/components/favorites/FavoritesProvider';
import clsx from 'clsx';

export function FavoriteButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const t = useTranslations('product');
  const authT = useTranslations('auth');
  const pathname = usePathname();
  const { user } = useAuth();
  const { isFavorite, toggle, pending } = useFavorites();
  const saved = isFavorite(productId);
  const busy = pending === productId;

  const classes = clsx(
    'inline-flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition',
    saved ? 'text-red-600' : 'text-ink/70 hover:text-ink',
    className,
  );

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className={classes}
        aria-label={authT('loginToSave')}
        onClick={(event) => event.stopPropagation()}
      >
        <HeartIcon filled={false} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle(productId);
      }}
      className={clsx(classes, 'disabled:opacity-50')}
      aria-label={saved ? t('unfavorite') : t('favorite')}
      aria-pressed={saved}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        d="M12.1 20.3 4.8 13c-2.2-2.3-2.1-6 0.3-8.1 2.2-1.9 5.4-1.5 7 0.7 1.6-2.2 4.8-2.6 7-0.7 2.4 2.1 2.5 5.8 0.3 8.1l-7.3 7.3Z"
        fill={filled ? '#dc2626' : 'none'}
        stroke={filled ? '#dc2626' : 'currentColor'}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
