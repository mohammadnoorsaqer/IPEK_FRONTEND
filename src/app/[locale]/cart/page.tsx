'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/format';
import type { Locale } from '@/lib/types';

export default function CartPage() {
  const t = useTranslations('cart');
  const authT = useTranslations('auth');
  const locale = useLocale() as Locale;
  const { user, ready } = useAuth();
  const { items, removeItem, setQuantity, total, loading } = useCart();

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
        <h1 className="text-3xl">{t('title')}</h1>
        <p className="mt-6 text-muted">{t('loginRequired')}</p>
        <Link
          href="/login?next=/cart"
          className="mt-8 inline-block bg-ink px-8 py-3 text-xs uppercase tracking-[0.25em] text-cream"
        >
          {authT('login')}
        </Link>
      </div>
    );
  }

  if (loading && !items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="skeleton h-8 w-40" />
        <div className="mt-10 space-y-4">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-site px-4 py-20 sm:px-6">
        <h1 className="text-3xl">{t('title')}</h1>
        <p className="mt-6 text-muted">{t('empty')}</p>
        <Link href="/" className="mt-8 inline-block text-accent underline underline-offset-4">
          {t('continue')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl">{t('title')}</h1>
      <ul className="mt-10 divide-y divide-sand">
        {items.map((item) => (
          <li key={item.id || `${item.productId}-${item.variantId}`} className="flex gap-5 py-6">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-sand">
              {item.image ? (
                <Image src={item.image} alt="" fill className="object-cover" sizes="80px" />
              ) : null}
            </div>
            <div className="flex flex-1 items-start justify-between gap-4">
              <div>
                <Link href={`/products/${locale === 'ar' ? item.slug_ar : item.slug_en}`}>
                  {locale === 'ar' ? item.name_ar : item.name_en}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {[item.size, item.color].filter(Boolean).join(' · ')}
                </p>
                {item.id ? (
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => void setQuantity(item.id!, Math.max(1, item.quantity - 1))}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => void setQuantity(item.id!, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted">× {item.quantity}</p>
                )}
              </div>
              <div className="text-end">
                <p>{formatPrice(item.price * item.quantity, locale)}</p>
                <button
                  type="button"
                  className="mt-2 text-xs text-muted underline"
                  onClick={() => void removeItem(item.productId, item.variantId, item.id)}
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex items-center justify-between border-t border-sand pt-6">
        <p className="text-lg">{formatPrice(total, locale)}</p>
        <Link href="/checkout" className="bg-ink px-8 py-3 text-xs uppercase tracking-[0.25em] text-cream">
          {t('checkout')}
        </Link>
      </div>
    </div>
  );
}
