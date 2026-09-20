'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/format';
import { localizedName, type Locale, type Product } from '@/lib/types';
import { useCart, productToCartItem } from '@/components/cart/CartProvider';
import { MediaFrame } from '@/components/media/MediaFrame';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

function stockOf(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function ProductDetail({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('product');
  const { addItem } = useCart();
  const [colorId, setColorId] = useState(product.variants?.[0]?.color?.id);
  const [sizeId, setSizeId] = useState<string>();
  const [guideOpen, setGuideOpen] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [activeImageId, setActiveImageId] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const images = useMemo(() => {
    const all = product.images || [];
    // Prefer color-matched shots, but always fall back to the full gallery.
    const matching = colorId
      ? all.filter((image) => !image.color_id || image.color_id === colorId)
      : all;
    return matching.length ? matching : all;
  }, [product.images, colorId]);

  const hero =
    images.find((image) => image.id === activeImageId) ||
    images.find((image) => image.is_primary) ||
    images[0];

  const colors = Array.from(
    new Map(
      (product.variants || [])
        .filter((variant) => variant.color)
        .map((variant) => [variant.color!.id, variant.color!]),
    ).values(),
  );

  const sizesForColor = (product.variants || []).filter(
    (variant) => !colorId || variant.color?.id === colorId,
  );
  const uniqueSizes = Array.from(
    new Map(
      sizesForColor.filter((v) => v.size).map((v) => [v.size!.id, v]),
    ).values(),
  );
  const selected = uniqueSizes.find((variant) => variant.size?.id === sizeId);
  const selectedStock = stockOf(selected?.stock_quantity);
  const inStock = selectedStock > 0;
  const current = Number(product.current_price ?? product.base_price);
  const base = Number(product.base_price);
  const brandName = product.brand ? localizedName(product.brand, locale) : null;
  const description =
    locale === 'ar' ? product.description_ar : product.description_en;

  useEffect(() => {
    const firstInStock = uniqueSizes.find((v) => stockOf(v.stock_quantity) > 0);
    setSizeId(firstInStock?.size?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when color changes
  }, [colorId]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false);
      if (event.key === '+' || event.key === '=') setZoom((z) => Math.min(4, z + 0.25));
      if (event.key === '-') setZoom((z) => Math.max(1, z - 0.25));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  function openLightbox() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setLightbox(true);
  }

  function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const next = event.deltaY < 0 ? zoom + 0.2 : zoom - 0.2;
    setZoom(Math.min(4, Math.max(1, Number(next.toFixed(2)))));
    if (next <= 1) setOffset({ x: 0, y: 0 });
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current || zoom <= 1) return;
    setOffset({
      x: dragRef.current.ox + (event.clientX - dragRef.current.x),
      y: dragRef.current.oy + (event.clientY - dragRef.current.y),
    });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <div className="mx-auto grid max-w-site gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative">
          <button
            type="button"
            className="relative block w-full text-start"
            onClick={openLightbox}
            aria-label={t('zoom')}
          >
            <MediaFrame
              src={hero?.image_url}
              alt={localizedName(product, locale)}
              aspect="aspect-[4/5]"
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
            <span className="absolute bottom-3 start-3 rounded bg-ink/70 px-3 py-1.5 text-sm text-cream">
              {t('tapToZoom')}
            </span>
          </button>
          <div className="absolute end-3 top-3 z-10">
            <FavoriteButton productId={product.id} />
          </div>
        </div>
        {images.length > 1 ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((image) => {
              const active = (hero?.id || '') === image.id;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageId(image.id)}
                  className={`overflow-hidden rounded-md border-2 transition ${
                    active ? 'border-ink' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <MediaFrame
                    src={image.image_url}
                    alt=""
                    aspect="aspect-square"
                    sizes="140px"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="pt-2">
        {brandName ? (
          <p className="text-base font-semibold uppercase tracking-[0.18em] text-accent sm:text-lg">
            {brandName}
          </p>
        ) : null}
        <h1 className="reveal mt-3 text-4xl leading-tight sm:text-5xl">
          {localizedName(product, locale)}
        </h1>
        <p className="mt-5 text-2xl font-medium sm:text-3xl">
          {current < base ? (
            <>
              <span className="me-3 text-lg text-muted line-through sm:text-xl">
                {formatPrice(base, locale)}
              </span>
              <span className="text-accent">{formatPrice(current, locale)}</span>
            </>
          ) : (
            formatPrice(current, locale)
          )}
        </p>
        {description ? (
          <p className="mt-7 max-w-prose text-lg leading-9 text-ink/80 sm:text-xl sm:leading-10">
            {description}
          </p>
        ) : null}

        {colors.length > 0 ? (
          <div className="mt-10">
            <p className="text-base font-medium tracking-wide sm:text-lg">
              {t('selectColor')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    setColorId(color.id);
                    setActiveImageId(undefined);
                  }}
                  className="size-10 rounded-full border border-sand transition hover:scale-110 sm:size-11"
                  style={{
                    backgroundColor: color.hex_code,
                    outline: colorId === color.id ? '2px solid #2B2B2B' : undefined,
                    outlineOffset: 3,
                  }}
                  aria-label={localizedName(color, locale)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-base font-medium tracking-wide sm:text-lg">
              {t('selectSize')}
            </p>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="text-base text-muted underline underline-offset-4"
            >
              {t('sizeGuide')}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {uniqueSizes.map((variant) => {
              const qty = stockOf(variant.stock_quantity);
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={qty <= 0}
                  onClick={() => setSizeId(variant.size?.id)}
                  className={`min-w-16 border px-4 py-2.5 text-base ${
                    sizeId === variant.size?.id
                      ? 'border-ink bg-ink text-cream'
                      : 'border-sand'
                  } disabled:opacity-40`}
                >
                  {variant.size?.code}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-base text-muted sm:text-lg">
          {selected
            ? inStock
              ? t('stockCount', { count: selectedStock })
              : t('outOfStock')
            : t('selectSize')}
        </p>

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
          className="mt-8 btn-live inline-block text-base disabled:opacity-40 sm:text-lg"
        >
          {t('addToCart')}
        </button>
        {message ? <p className="mt-3 text-base text-muted">{message}</p> : null}
      </div>

      {guideOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="max-w-md bg-cream p-8">
            <h2 className="text-2xl">{t('sizeGuide')}</h2>
            <p className="mt-4 text-base leading-8 text-muted">{t('sizeGuideBody')}</p>
            <button
              type="button"
              className="mt-6 text-base underline"
              onClick={() => setGuideOpen(false)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      ) : null}

      {lightbox && hero?.image_url ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/90"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-cream">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded bg-cream/15 px-3 py-1.5 text-lg"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
              >
                −
              </button>
              <span className="min-w-14 text-center text-sm">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="rounded bg-cream/15 px-3 py-1.5 text-lg"
                onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
              >
                +
              </button>
              <button
                type="button"
                className="rounded bg-cream/15 px-3 py-1.5 text-sm"
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                {t('resetZoom')}
              </button>
            </div>
            <button
              type="button"
              className="rounded bg-cream px-4 py-2 text-base text-ink"
              onClick={() => setLightbox(false)}
            >
              {t('close')}
            </button>
          </div>
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ cursor: zoom > 1 ? 'grab' : 'zoom-in', touchAction: 'none' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.image_url}
              alt={localizedName(product, locale)}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              }}
            />
          </div>
          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto px-4 pb-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    setActiveImageId(image.id);
                    setZoom(1);
                    setOffset({ x: 0, y: 0 });
                  }}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded border-2 ${
                    hero?.id === image.id ? 'border-cream' : 'border-transparent opacity-70'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.image_url || ''} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
