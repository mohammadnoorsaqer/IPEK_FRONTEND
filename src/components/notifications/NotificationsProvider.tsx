'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getNotifications, markNotificationRead } from '@/lib/api';
import type { AppNotification } from '@/lib/types';

type NotificationsContextValue = {
  items: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const data = await getNotifications({ limit: 50 });
      setItems(data.results || []);
    } catch {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, refresh]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, 45000);
    return () => window.clearInterval(timer);
  }, [user, refresh]);

  const markRead = useCallback(async (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );
    try {
      await markNotificationRead(id);
    } catch {
      await refresh();
    }
  }, [refresh]);

  const unreadCount = items.filter((item) => !item.is_read).length;

  const value = useMemo(
    () => ({ items, unreadCount, markRead, refresh }),
    [items, unreadCount, markRead, refresh],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
