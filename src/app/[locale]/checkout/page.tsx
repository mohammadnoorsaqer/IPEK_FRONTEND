'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCart } from '@/components/cart/CartProvider';
import { createOrder } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { ApiError } from '@/lib/http';
import type { Locale } from '@/lib/types';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const cartT = useTranslations('cart');
  const authT = useTranslations('auth');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { user, ready } = useAuth();
  const { items, total, refresh } = useCart();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (ready && !user) {
    return (
      <Gate title={t('title')} body={t('loginRequired')} href="/login?next=/checkout" cta={authT('login')} />
    );
  }

  if (ready && !items.length) {
    return <Gate title={t('title')} body={cartT('empty')} href="/cart" cta={cartT('title')} />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const order = await createOrder({
        street_address: String(form.get('address')),
        payment_method: String(form.get('payment')) as 'cliq' | 'cash',
      });
      await refresh();
      router.replace(`/account?placed=${order.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(locale === 'ar' && apiError.messageAr ? apiError.messageAr : apiError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-site gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="text-3xl">{t('title')}</h1>
        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">{t('address')}</span>
            <textarea
              name="address"
              required
              rows={4}
              className="mt-2 w-full border border-sand bg-transparent p-3 outline-none focus:border-ink"
            />
          </label>
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.2em] text-muted">{t('payment')}</legend>
            <label className="mt-4 flex items-center gap-3">
              <input type="radio" name="payment" value="cash" defaultChecked />
              {t('cash')}
            </label>
            <label className="mt-3 flex items-center gap-3">
              <input type="radio" name="payment" value="cliq" />
              {t('cliq')}
            </label>
          </fieldset>
          {error ? <p className="text-sm text-accent">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="btn-live disabled:opacity-50"
          >
            {pending ? authT('pleaseWait') : t('place')}
          </button>
        </form>
      </div>
      <aside className="h-fit border border-sand p-6">
        <h2 className="text-sm uppercase tracking-[0.2em] text-muted">{t('summary')}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                {locale === 'ar' ? item.name_ar : item.name_en} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex justify-between border-t border-sand pt-4 font-medium">
          <span>{t('total')}</span>
          <span>{formatPrice(total, locale)}</span>
        </p>
      </aside>
    </div>
  );
}

function Gate({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-6 text-muted">{body}</p>
      <Link
        href={href}
        className="mt-8 inline-block bg-ink px-8 py-3 text-xs uppercase tracking-[0.25em] text-cream"
      >
        {cta}
      </Link>
    </div>
  );
}
