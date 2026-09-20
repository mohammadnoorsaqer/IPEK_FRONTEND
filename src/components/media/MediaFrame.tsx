'use client';

import Image from 'next/image';
import clsx from 'clsx';
import {
  useCallback,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

function isSvg(src: string) {
  return /\.svg($|\?)/i.test(src);
}

export function MediaFrame({
  src,
  alt,
  aspect = 'aspect-[3/4]',
  priority = false,
  sizes,
  className,
  children,
  zoomOnHover = false,
  fit = 'cover',
}: {
  src?: string | null;
  alt: string;
  aspect?: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  children?: ReactNode;
  zoomOnHover?: boolean;
  fit?: 'cover' | 'contain';
}) {
  const [origin, setOrigin] = useState('50% 50%');

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!zoomOnHover) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setOrigin(`${x}% ${y}%`);
    },
    [zoomOnHover],
  );

  const onLeave = useCallback(() => {
    if (!zoomOnHover) return;
    setOrigin('50% 50%');
  }, [zoomOnHover]);

  const mediaClass = clsx(
    'transition-[transform,filter] duration-500 ease-out will-change-transform',
    fit === 'contain' ? 'object-contain' : 'object-cover',
    zoomOnHover &&
      'group-hover/media:scale-[1.12] group-hover/media:brightness-[1.03]',
  );

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-sand media-frame',
        aspect,
        className,
        zoomOnHover && 'group/media cursor-zoom-in',
      )}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {src ? (
        isSvg(src) ? (
          // next/image does not reliably render remote SVGs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className={clsx(
              fit === 'contain'
                ? 'absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]'
                : 'absolute inset-0 h-full w-full',
              mediaClass,
            )}
            style={zoomOnHover ? { transformOrigin: origin } : undefined}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className={clsx(mediaClass, fit === 'contain' && '!inset-4')}
            style={zoomOnHover ? { transformOrigin: origin } : undefined}
          />
        )
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(160deg,#e8dfd3,#f7f3ee)]"
          aria-hidden
        />
      )}
      {zoomOnHover && src ? (
        <span
          className="pointer-events-none absolute inset-0 bg-ink/0 transition duration-500 group-hover/media:bg-ink/[0.04]"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );
}
