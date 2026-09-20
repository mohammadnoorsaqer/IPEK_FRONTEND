import { Link } from '@/i18n/navigation';
import { MediaFrame } from '@/components/media/MediaFrame';
import { localizedName, localizedSlug, type Department, type Locale } from '@/lib/types';

export function DepartmentCard({
  department,
  locale,
  imageUrl,
  priority = false,
}: {
  department: Department;
  locale: Locale;
  imageUrl?: string | null;
  priority?: boolean;
}) {
  const name = localizedName(department, locale);
  const src = department.image_url || imageUrl || null;

  return (
    <article>
      <Link
        href={`/${localizedSlug(department, locale)}`}
        className="group block overflow-hidden rounded-xl border border-sand bg-white shadow-[0_8px_24px_rgba(43,43,43,0.04)] transition hover:-translate-y-0.5 hover:border-accent/40"
      >
        <MediaFrame
          src={src}
          alt={name}
          aspect="aspect-[5/4]"
          priority={priority}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 50vw"
        >
          {!src ? (
            <span className="absolute inset-0 flex items-center justify-center text-3xl text-ink/20">
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
