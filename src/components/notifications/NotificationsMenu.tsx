'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import type { AppNotification, Locale } from '@/lib/types';

export function NotificationsMenu() {
  const t = useTranslations('notifications');
  const navT = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { user, ready } = useAuth();
  const { items, unreadCount, markRead, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  if (!ready || !user) return null;

  async function openItem(item: AppNotification) {
    if (!item.is_read) await markRead(item.id);
    setOpen(false);
    const href = notificationHref(item);
    if (href) router.push(href);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative p-1"
        aria-label={navT('notifications')}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void refresh();
        }}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-cream">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute end-0 z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] border border-sand bg-cream shadow-[0_16px_40px_rgba(43,43,43,0.12)]">
          <p className="border-b border-sand px-4 py-3 text-sm">{t('title')}</p>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">{t('empty')}</p>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-sand last:border-b-0">
                  <button
                    type="button"
                    onClick={() => void openItem(item)}
                    className="flex w-full flex-col gap-1 px-4 py-3 text-start"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {!item.is_read ? (
                        <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                      ) : null}
                      <span className={item.is_read ? 'text-muted' : 'text-ink'}>
                        {locale === 'ar' ? item.title_ar : item.title_en}
                      </span>
                    </span>
                    <span className="text-xs leading-5 text-muted">
                      {locale === 'ar' ? item.message_ar : item.message_en}
                    </span>
                    {item.created_at ? (
                      <span className="text-[11px] text-muted">
                        {formatTime(item.created_at, locale)}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function notificationHref(item: AppNotification) {
  if (item.redirect_type === 'order') return '/account';
  if (item.redirect_type === 'favorite') return '/account/favorites';
  return null;
}

function formatTime(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-JO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 stroke-current" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 18.5a2 2 0 0 0 4 0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
