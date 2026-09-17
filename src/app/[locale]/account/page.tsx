'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getOrders } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Locale, Order } from '@/lib/types';

export default function AccountPage() {
  const t = useTranslations('account');
  const authT = useTranslations('auth');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const placed = params.get('placed');

  useEffect(() => {
    if (ready && !user) router.replace('/login?next=/account');
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    getOrders()
      .then((data) => setOrders(data.results || []))
      .catch(() => setOrders([]));
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{t('title')}</p>
          <h1 className="mt-2 text-3xl">{user.username || user.email}</h1>
          <p className="mt-2 text-sm text-muted">{user.email}</p>
        </div>
        <button type="button" onClick={() => void logout()} className="text-sm underline">
          {authT('logout')}
        </button>
      </div>

      {placed ? (
        <p className="mt-8 border border-sand bg-white/50 px-4 py-3 text-sm">
          {t('placed')}
        </p>
      ) : null}

      <Link
        href="/account/favorites"
        className="mt-8 inline-block text-sm underline underline-offset-4"
      >
        {t('favorites')}
      </Link>

      <h2 className="mt-12 text-xl">{t('orders')}</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-muted">{t('emptyOrders')}</p>
      ) : (
        <ul className="mt-6 divide-y divide-sand">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm tracking-wide">#{order.id.slice(0, 8)}</p>
                <p className="mt-1 text-sm text-muted">
                  {t(`status.${order.status}`)} · {order.payment_method}
                </p>
              </div>
              <p>{formatPrice(order.total_amount, locale)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
