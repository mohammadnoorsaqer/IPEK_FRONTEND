'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/http';

export function AuthForm({
  mode,
  nextPath,
}: {
  mode: 'login' | 'register';
  nextPath?: string;
}) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { login, register } = useAuth();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'login') {
        await login(String(form.get('email')), String(form.get('password')));
      } else {
        await register({
          username: String(form.get('username')),
          email: String(form.get('email')),
          password: String(form.get('password')),
          phone_number: String(form.get('phone') || '') || undefined,
        });
      }
      router.replace(nextPath || '/account');
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        locale === 'ar' && apiError.messageAr ? apiError.messageAr : apiError.message,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 reveal">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">IPEK</p>
      <h1 className="mt-3 text-3xl">{mode === 'login' ? t('loginTitle') : t('registerTitle')}</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
      </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
        {mode === 'register' ? (
          <Field label={t('name')} name="username" required />
        ) : null}
        <Field label={t('email')} name="email" type="email" required />
        {mode === 'register' ? (
          <Field label={t('phone')} name="phone" />
        ) : null}
        <Field label={t('password')} name="password" type="password" required />
        {mode === 'register' ? (
          <p className="text-xs text-muted">{t('passwordHint')}</p>
        ) : null}
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="btn-live w-full disabled:opacity-50"
        >
          {pending ? t('pleaseWait') : mode === 'login' ? t('login') : t('register')}
        </button>
      </form>

      <p className="mt-8 text-sm text-muted">
        {mode === 'login' ? (
          <>
            {t('noAccount')}{' '}
            <Link href="/register" className="text-ink underline underline-offset-4">
              {t('register')}
            </Link>
          </>
        ) : (
          <>
            {t('hasAccount')}{' '}
            <Link href="/login" className="text-ink underline underline-offset-4">
              {t('login')}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border-b border-sand bg-transparent py-2 outline-none focus:border-ink"
      />
    </label>
  );
}
