'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/format';
import { localizedName, localizedSlug, type Product } from '@/lib/types';
import type { Locale } from '@/lib/types';

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations('product');
  const image =
    product.images?.find((item) => item.is_primary) || product.images?.[0];
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
    <article className="group transition duration-500 hover:-translate-y-1">
      <Link
        href={`/products/${localizedSlug(product, locale)}`}
        className="block"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-sand media-frame">
          {image?.image_url ? (
            <Image
              src={image.image_url}
              alt={localizedName(product, locale)}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(160deg,#e8dfd3,#f7f3ee)]" />
          )}
          {onSale ? (
            <span className="absolute start-3 top-3 bg-accent px-2 py-1 text-[10px] uppercase tracking-widest text-cream">
              {t('sale')}
            </span>
          ) : null}
        </div>
        <h3 className="mt-4 text-base leading-6">{localizedName(product, locale)}</h3>
        <p className="mt-1 text-sm">
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
        <div className="mt-3 flex gap-2">
          {colors.slice(0, 5).map((color) => (
            <span
              key={color.id}
              title={localizedName(color, locale)}
              className="size-3.5 rounded-full border border-sand"
              style={{ backgroundColor: color.hex_code }}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
