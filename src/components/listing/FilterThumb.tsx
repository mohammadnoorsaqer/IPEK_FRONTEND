import Image from 'next/image';

export function FilterThumb({ src, alt = '' }: { src: string; alt?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={20}
      height={20}
      sizes="20px"
      className="size-5 shrink-0 rounded-full border border-sand bg-white object-cover"
    />
  );
}
