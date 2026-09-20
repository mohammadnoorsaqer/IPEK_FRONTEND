import { Link } from '@/i18n/navigation';
import { localizedName, type Brand, type Locale } from '@/lib/types';

export function BrandCard({
  brand,
  locale,
  imageUrl,
  priority = false,
}: {
  brand: Brand;
  locale: Locale;
  imageUrl?: string | null;
  priority?: boolean;
}) {
  const name = localizedName(brand, locale);
  const logo = brand.logo_url || brand.image_url || imageUrl || null;

  return (
    <article>
      <Link
        href={`/brands/${brand.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-sand bg-white transition hover:border-accent/50 hover:shadow-[0_8px_24px_rgba(43,43,43,0.06)]"
      >
        <div className="flex aspect-[5/3] items-center justify-center bg-[#faf8f5] px-6 py-5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={name}
              className="max-h-16 w-full object-contain transition duration-300 group-hover:scale-[1.03] sm:max-h-20"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <span className="text-3xl font-semibold text-ink/20">{name.slice(0, 1)}</span>
          )}
        </div>
        <p className="border-t border-sand px-3 py-3 text-center text-sm font-medium text-ink">
          {name}
        </p>
      </Link>
    </article>
  );
}
