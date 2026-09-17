'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from '@/lib/api';
import type { Cart, Product } from '@/lib/types';
import { localizedName, type Locale } from '@/lib/types';

const GUEST_CART_KEY = 'ipek-guest-cart';

export type CartItem = {
  id?: string;
  productId: string;
  slug_en: string;
  slug_ar: string;
  name_en: string;
  name_ar: string;
  image?: string | null;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  variantId?: string;
};

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string, variantId?: string, lineId?: string) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  refresh: () => Promise<void>;
  clearCart: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function guestLineId(variantId: string) {
  return `guest-${variantId}`;
}

function readGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function mapCart(cart: Cart, locale: Locale = 'en'): CartItem[] {
  return (cart.items || []).map((item) => {
    const product = item.variant?.product;
    const image =
      product?.images?.find((entry) => entry.is_primary) || product?.images?.[0];
    const color = item.variant?.color
      ? localizedName(item.variant.color, locale)
      : undefined;
    return {
      id: item.id,
      productId: product?.id || '',
      variantId: item.product_variant_id,
      slug_en: product?.slug_en || '',
      slug_ar: product?.slug_ar || '',
      name_en: product?.name_en || '',
      name_ar: product?.name_ar || '',
      image: image?.image_url,
      price: Number(
        item.variant?.price_override ??
          product?.current_price ??
          product?.base_price ??
          0,
      ),
      quantity: item.quantity,
      color,
      size: item.variant?.size?.code,
    };
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems(readGuestCart());
      return;
    }
    setLoading(true);
    try {
      const guest = readGuestCart();
      if (guest.length) {
        writeGuestCart([]);
        for (const item of guest) {
          if (!item.variantId) continue;
          try {
            await addCartItem(item.variantId, item.quantity || 1);
          } catch {
            // keep going so the rest of the cart still merges
          }
        }
      }
      const cart = await getCart();
      setItems(mapCart(cart));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, refresh]);

  const addItem = useCallback(
    async (item: CartItem) => {
      if (!item.variantId) {
        throw new Error('variant-required');
      }
      if (!user) {
        setItems((prev) => {
          const existing = prev.find((entry) => entry.variantId === item.variantId);
          const next = existing
            ? prev.map((entry) =>
                entry.variantId === item.variantId
                  ? { ...entry, quantity: entry.quantity + (item.quantity || 1) }
                  : entry,
              )
            : [
                ...prev,
                {
                  ...item,
                  id: guestLineId(item.variantId!),
                  quantity: item.quantity || 1,
                },
              ];
          writeGuestCart(next);
          return next;
        });
        return;
      }
      const cart = await addCartItem(item.variantId, item.quantity || 1);
      setItems(mapCart(cart));
    },
    [user],
  );

  const removeItem = useCallback(
    async (_productId: string, _variantId?: string, lineId?: string) => {
      if (!user) {
        setItems((prev) => {
          const next = prev.filter((entry) => {
            if (lineId) return entry.id !== lineId;
            if (_variantId) return entry.variantId !== _variantId;
            return entry.productId !== _productId;
          });
          writeGuestCart(next);
          return next;
        });
        return;
      }
      const id = lineId || items.find((entry) => entry.variantId === _variantId)?.id;
      if (!id) return;
      const cart = await removeCartItem(id);
      setItems(mapCart(cart));
    },
    [items, user],
  );

  const setQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!user) {
        setItems((prev) => {
          const next = prev.map((entry) =>
            entry.id === lineId ? { ...entry, quantity } : entry,
          );
          writeGuestCart(next);
          return next;
        });
        return;
      }
      const cart = await updateCartItem(lineId, quantity);
      setItems(mapCart(cart));
    },
    [user],
  );

  const clearCart = useCallback(() => {
    writeGuestCart([]);
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      loading,
      addItem,
      removeItem,
      setQuantity,
      refresh,
      clearCart,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    [items, loading, addItem, removeItem, setQuantity, refresh, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export function productToCartItem(
  product: Product,
  extras: Partial<CartItem> = {},
): CartItem {
  const primary =
    product.images?.find((image) => image.is_primary) || product.images?.[0];
  return {
    productId: product.id,
    slug_en: product.slug_en,
    slug_ar: product.slug_ar,
    name_en: product.name_en,
    name_ar: product.name_ar,
    image: primary?.image_url,
    price: Number(product.current_price ?? product.base_price),
    quantity: 1,
    ...extras,
  };
}
