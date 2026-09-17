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
import { getFavorites, toggleFavorite } from '@/lib/api';
import type { Favorite, Product } from '@/lib/types';

type FavoritesContextValue = {
  items: Favorite[];
  pending: string | null;
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const [items, setItems] = useState<Favorite[]>([]);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) {
      setItems([]);
      return;
    }
    let cancelled = false;
    getFavorites(50)
      .then((data) => {
        if (!cancelled) setItems(data.results || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const isFavorite = useCallback(
    (productId: string) => items.some((item) => item.product_id === productId),
    [items],
  );

  const toggle = useCallback(async (productId: string) => {
    if (!user) return;
    const previous = items;
    const existing = previous.find((item) => item.product_id === productId);
    setPending(productId);
    setItems(
      existing
        ? previous.filter((item) => item.product_id !== productId)
        : [{ id: `temp-${productId}`, product_id: productId }, ...previous],
    );
    try {
      const result = await toggleFavorite(productId);
      if (result.favorited) {
        const data = await getFavorites(50);
        setItems(data.results || []);
      } else {
        setItems((current) => current.filter((item) => item.product_id !== productId));
      }
    } catch {
      setItems(previous);
    } finally {
      setPending(null);
    }
  }, [items, user]);

  const value = useMemo(
    () => ({ items, pending, isFavorite, toggle }),
    [items, pending, isFavorite, toggle],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}

export function favoriteProducts(items: Favorite[]): Product[] {
  return items
    .map((item) => item.product)
    .filter((product): product is Product => Boolean(product));
}
