'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { favoriteProducts, useFavorites } from '@/components/favorites/FavoritesProvider';
import { ProductCard } from '@/components/product/ProductCard';

export default function FavoritesPage() {
  const t = useTranslations('account');
  const router = useRouter();
  const { user, ready } = useAuth();
  const { items } = useFavorites();
  const products = favoriteProducts(items);

  useEffect(() => {
    if (ready && !user) router.replace('/login?next=/account/favorites');
  }, [ready, user, router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-site px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">{t('title')}</p>
      <h1 className="mt-2 text-3xl">{t('favorites')}</h1>
      {products.length === 0 ? (
        <p className="mt-8 text-muted">{t('emptyFavorites')}</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} compact delay={index * 50} />
          ))}
        </div>
      )}
      <Link
        href="/account"
        className="mt-12 inline-block text-sm text-muted underline underline-offset-4"
      >
        {t('title')}
      </Link>
    </div>
  );
}
