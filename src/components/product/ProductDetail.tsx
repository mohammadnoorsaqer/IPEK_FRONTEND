'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/format';
import { localizedName, localizedSlug, type Locale, type Product } from '@/lib/types';
import { useCart, productToCartItem } from '@/components/cart/CartProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from '@/i18n/navigation';
import { MediaFrame } from '@/components/media/MediaFrame';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

export function ProductDetail({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('product');
  const authT = useTranslations('auth');
  const { addItem } = useCart();
  const { user } = useAuth();
  const [colorId, setColorId] = useState(product.variants?.[0]?.color?.id);
  const [sizeId, setSizeId] = useState<string>();
  const [guideOpen, setGuideOpen] = useState(false);
  const [message, setMessage] = useState('');

  const images = useMemo(() => {
    const all = product.images || [];
    const matching = colorId
      ? all.filter((image) => image.color_id === colorId)
      : [];
    return matching.length ? matching : all;
  }, [product.images, colorId]);

  const hero = images.find((image) => image.is_primary) || images[0];
  const colors = Array.from(
    new Map(
      (product.variants || [])
        .filter((variant) => variant.color)
        .map((variant) => [variant.color!.id, variant.color!]),
    ).values(),
  );
  const sizes = (product.variants || []).filter(
    (variant) => !colorId || variant.color?.id === colorId,
  );
  const uniqueSizes = Array.from(
    new Map(sizes.filter((v) => v.size).map((v) => [v.size!.id, v])).values(),
  );
  const selected = uniqueSizes.find((variant) => variant.size?.id === sizeId);
  const inStock = (selected?.stock_quantity ?? 0) > 0;
  const current = Number(product.current_price ?? product.base_price);
  const base = Number(product.base_price);

  return (
    <div className="mx-auto grid max-w-site gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative">
          <MediaFrame
            src={hero?.image_url}
            alt={localizedName(product, locale)}
            aspect="aspect-[4/5]"
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
          <div className="absolute end-3 top-3 z-10">
            <FavoriteButton productId={product.id} />
          </div>
        </div>
        {images.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((image) => (
              <MediaFrame
                key={image.id}
                src={image.image_url}
                alt=""
                aspect="aspect-square"
                sizes="120px"
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="pt-2">
        <h1 className="reveal text-3xl leading-tight sm:text-4xl">
          {localizedName(product, locale)}
        </h1>
        <p className="mt-4 text-lg">
          {current < base ? (
            <>
              <span className="me-3 text-muted line-through">
                {formatPrice(base, locale)}
              </span>
              <span className="text-accent">{formatPrice(current, locale)}</span>
            </>
          ) : (
            formatPrice(current, locale)
          )}
        </p>
        <p className="mt-6 max-w-prose text-base leading-8 text-muted">
          {locale === 'ar' ? product.description_ar : product.description_en}
        </p>

        {colors.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm tracking-wide">{t('selectColor')}</p>
            <div className="mt-3 flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    setColorId(color.id);
                    setSizeId(undefined);
                  }}
                  className="size-8 rounded-full border border-sand transition hover:scale-110"
                  style={{
                    backgroundColor: color.hex_code,
                    outline: colorId === color.id ? '2px solid #2B2B2B' : undefined,
                    outlineOffset: 2,
                  }}
                  aria-label={localizedName(color, locale)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm tracking-wide">{t('selectSize')}</p>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="text-sm text-muted underline underline-offset-4"
            >
              {t('sizeGuide')}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {uniqueSizes.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={variant.stock_quantity <= 0}
                onClick={() => setSizeId(variant.size?.id)}
                className={`min-w-14 border px-3 py-2 text-sm ${
                  sizeId === variant.size?.id
                    ? 'border-ink bg-ink text-cream'
                    : 'border-sand'
                } disabled:opacity-40`}
              >
                {variant.size?.code}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-muted">
          {selected
            ? inStock
              ? t('inStock')
              : t('outOfStock')
            : t('selectSize')}
        </p>

        {!user ? (
          <Link
            href={`/login?next=/products/${localizedSlug(product, locale)}`}
            className="mt-8 btn-live inline-block"
          >
            {authT('loginToShop')}
          </Link>
        ) : (
          <button
            type="button"
            disabled={!selected || !inStock}
            onClick={async () => {
              try {
                await addItem(
                  productToCartItem(product, {
                    variantId: selected?.id,
                    color: selected?.color
                      ? localizedName(selected.color, locale)
                      : undefined,
                    size: selected?.size?.code,
                  }),
                );
                setMessage(t('added'));
              } catch {
                setMessage(t('addError'));
              }
            }}
            className="mt-8 btn-live inline-block disabled:opacity-40"
          >
            {t('addToCart')}
          </button>
        )}
        {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
      </div>

      {guideOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="max-w-md bg-cream p-8">
            <h2 className="text-xl">{t('sizeGuide')}</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{t('sizeGuideBody')}</p>
            <button
              type="button"
              className="mt-6 text-sm underline"
              onClick={() => setGuideOpen(false)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
