'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/format';
import { localizedName, localizedSlug, type Product } from '@/lib/types';
import type { Locale } from '@/lib/types';
import { MediaFrame } from '@/components/media/MediaFrame';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { Reveal } from '@/components/motion/Reveal';
import { primaryImageUrl } from '@/lib/media';
import clsx from 'clsx';

export function ProductCard({
  product,
  priority = false,
  delay = 0,
  compact = false,
}: {
  product: Product;
  priority?: boolean;
  delay?: number;
  compact?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations('product');
  const image = primaryImageUrl(product.images);
  const href = `/products/${localizedSlug(product, locale)}`;
  const current = Number(product.current_price ?? product.base_price);
  const base = Number(product.base_price);
  const onSale = current < base;
  const colors = Array.from(
    new Map(
      (product.variants || [])
        .filter((variant) => variant.color)
        .map((variant) => [variant.color!.id, variant.color!]),
    ).values(),
  );

  return (
    <Reveal delay={delay}>
      <article className="group h-full">
        <div className="relative">
          <Link href={href} className="block">
            <MediaFrame
              src={image}
              alt={localizedName(product, locale)}
              aspect="aspect-[3/4]"
              priority={priority}
              className="rounded-lg"
              sizes={
                compact
                  ? '(min-width: 1280px) 18vw, (min-width: 640px) 30vw, 48vw'
                  : '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'
              }
            >
              {onSale ? (
                <span className="absolute start-2 top-2 bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-cream">
                  {t('sale')}
                </span>
              ) : null}
            </MediaFrame>
          </Link>
          <div className="absolute end-2 top-2 z-10">
            <FavoriteButton productId={product.id} />
          </div>
        </div>
        <Link href={href} className="block">
          <h3
            className={clsx(
              'mt-3 font-medium',
              compact ? 'text-lg leading-7' : 'text-xl leading-8',
            )}
          >
            {localizedName(product, locale)}
          </h3>
          <p className={clsx('mt-1.5 font-medium', compact ? 'text-base' : 'text-lg')}>
            {onSale ? (
              <>
                <span className="me-2 text-muted line-through">
                  {formatPrice(base, locale)}
                </span>
                <span className="text-accent">{formatPrice(current, locale)}</span>
              </>
            ) : (
              formatPrice(current, locale)
            )}
          </p>
        </Link>
        {colors.length > 0 ? (
          <div className="mt-2 flex gap-1.5">
            {colors.slice(0, 5).map((color) => (
              <span
                key={color.id}
                title={localizedName(color, locale)}
                className="size-2.5 rounded-full border border-sand"
                style={{ backgroundColor: color.hex_code }}
              />
            ))}
          </div>
        ) : null}
      </article>
    </Reveal>
  );
}
