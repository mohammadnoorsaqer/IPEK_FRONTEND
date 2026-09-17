import Image from 'next/image';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export function MediaFrame({
  src,
  alt,
  aspect = 'aspect-[3/4]',
  priority = false,
  sizes,
  className,
  children,
}: {
  src?: string | null;
  alt: string;
  aspect?: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-sand media-frame',
        aspect,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(160deg,#e8dfd3,#f7f3ee)]"
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}

export function primaryImageUrl(
  images?: Array<{ image_url: string | null; is_primary: boolean }> | null,
) {
  return images?.find((image) => image.is_primary)?.image_url || images?.[0]?.image_url || null;
}
