'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/http';
import { normalizeJordanPhone, sendPhoneOtp } from '@/lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';
import clsx from 'clsx';

type RegisterMode = 'email' | 'phone';

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
  const { login, register, registerPhone, loginPhone } = useAuth();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [registerMode, setRegisterMode] = useState<RegisterMode>('email');
  const [phone, setPhone] = useState('+962');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const phoneHint = useMemo(
    () =>
      locale === 'ar'
        ? 'رقم أردني: +9627XXXXXXXX'
        : 'Jordan mobile: +9627XXXXXXXX',
    [locale],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'login') {
        const email = String(form.get('email') || '').trim();
        if (email) {
          await login(email, String(form.get('password')));
        } else {
          if (!confirmation) throw new Error(t('sendCodeFirst'));
          const credential = await confirmation.confirm(otp.trim());
          const idToken = await credential.user.getIdToken();
          await loginPhone(idToken);
        }
      } else if (registerMode === 'email') {
        await register({
          username: String(form.get('username') || '').trim(),
          email: String(form.get('email') || '').trim(),
          password: String(form.get('password') || ''),
          phone_number: normalizeJordanPhone(String(form.get('phone') || '')) || undefined,
        });
      } else {
        const username = String(form.get('username') || '').trim();
        if (!confirmation) throw new Error(t('sendCodeFirst'));
        const credential = await confirmation.confirm(otp.trim());
        const idToken = await credential.user.getIdToken();
        await registerPhone({
          username,
          phone_number: normalizeJordanPhone(phone),
          idToken,
        });
      }
      router.replace(nextPath || '/account');
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        locale === 'ar' && apiError.messageAr
          ? apiError.messageAr
          : apiError.message || String(err),
      );
    } finally {
      setPending(false);
    }
  }

  async function onSendCode() {
    setError('');
    setPending(true);
    try {
      const result = await sendPhoneOtp(phone);
      setConfirmation(result);
      setOtpSent(true);
    } catch (err) {
      const apiError = err as Error;
      setError(apiError.message || t('smsFailed'));
    } finally {
      setPending(false);
    }
  }

  const phoneRegister = mode === 'register' && registerMode === 'phone';
  const emailRegister = mode === 'register' && registerMode === 'email';

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 reveal">
      <p className="text-sm uppercase tracking-[0.3em] text-accent">IPEK</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">
        {mode === 'login' ? t('loginTitle') : t('registerTitle')}
      </h1>
      <p className="mt-3 text-base leading-8 text-muted">
        {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
      </p>

      {mode === 'register' ? (
        <div className="mt-8 grid grid-cols-2 gap-2 rounded-xl border border-sand bg-white p-1">
          <button
            type="button"
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              registerMode === 'email' ? 'bg-ink text-cream' : 'text-muted hover:text-ink',
            )}
            onClick={() => setRegisterMode('email')}
          >
            {t('withEmail')}
          </button>
          <button
            type="button"
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              registerMode === 'phone' ? 'bg-ink text-cream' : 'text-muted hover:text-ink',
            )}
            onClick={() => setRegisterMode('phone')}
          >
            {t('withPhone')}
          </button>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {mode === 'register' ? (
          <Field label={t('name')} name="username" required />
        ) : null}

        {mode === 'login' || emailRegister ? (
          <>
            <Field label={t('email')} name="email" type="email" required={emailRegister} />
            <Field
              label={t('password')}
              name="password"
              type="password"
              required={mode === 'login' || emailRegister}
            />
            {emailRegister ? <p className="text-sm text-muted">{t('passwordHint')}</p> : null}
          </>
        ) : null}

        {emailRegister ? (
          <label className="block">
            <span className="text-sm font-medium text-muted">
              {t('phone')} ({t('optional')})
            </span>
            <input
              name="phone"
              type="tel"
              defaultValue="+962"
              className="mt-2 w-full border-b border-sand bg-transparent py-2.5 text-base outline-none focus:border-ink"
              placeholder="+9627XXXXXXXX"
            />
          </label>
        ) : null}

        {mode === 'login' ? <p className="text-sm text-muted">{t('orPhone')}</p> : null}

        {mode === 'login' || phoneRegister ? (
          <>
            <label className="block">
              <span className="text-sm font-medium text-muted">{t('phone')}</span>
              <div className="mt-2 flex gap-2">
                <input
                  name="phone_sms"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required={phoneRegister}
                  className="w-full border-b border-sand bg-transparent py-2.5 text-base outline-none focus:border-ink"
                  placeholder="+9627XXXXXXXX"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={onSendCode}
                  className="shrink-0 rounded-md bg-ink px-3 py-2 text-sm text-cream disabled:opacity-50"
                >
                  {otpSent ? t('resendCode') : t('sendCode')}
                </button>
              </div>
              <p className="mt-1.5 text-sm text-muted">{phoneHint}</p>
            </label>

            {otpSent ? (
              <label className="block">
                <span className="text-sm font-medium text-muted">{t('otp')}</span>
                <input
                  name="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  required={phoneRegister || (mode === 'login' && otpSent)}
                  className="mt-2 w-full border-b border-sand bg-transparent py-2.5 text-base tracking-[0.3em] outline-none focus:border-ink"
                  placeholder="123456"
                />
              </label>
            ) : null}
            <div id="phone-recaptcha" />
          </>
        ) : null}

        {error ? <p className="text-base text-accent">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || (phoneRegister && !otpSent)}
          className="btn-live w-full text-sm disabled:opacity-50"
        >
          {pending ? t('pleaseWait') : mode === 'login' ? t('login') : t('register')}
        </button>
      </form>

      <p className="mt-8 text-base text-muted">
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
      <span className="text-sm font-medium text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border-b border-sand bg-transparent py-2.5 text-base outline-none focus:border-ink"
      />
    </label>
  );
}
