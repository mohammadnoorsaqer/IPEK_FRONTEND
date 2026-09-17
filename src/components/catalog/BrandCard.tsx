import { Link } from '@/i18n/navigation';
import { MediaFrame } from '@/components/media/MediaFrame';
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

  return (
    <article>
      <Link
        href={`/brands/${brand.id}`}
        className="group block overflow-hidden rounded-xl border border-sand bg-white shadow-[0_8px_24px_rgba(43,43,43,0.04)] transition hover:-translate-y-0.5 hover:border-accent/40"
      >
        <MediaFrame
          src={imageUrl}
          alt={name}
          aspect="aspect-[5/4]"
          priority={priority}
          sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 50vw"
        >
          {!imageUrl ? (
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-ink/20">
              {name.slice(0, 1)}
            </span>
          ) : null}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent px-3 py-2.5 text-sm font-medium text-cream">
            {name}
          </span>
        </MediaFrame>
      </Link>
    </article>
  );
}
