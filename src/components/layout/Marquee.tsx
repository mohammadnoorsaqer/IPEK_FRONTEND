export function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-sand bg-ink text-cream">
      <div className="marquee-track py-3 text-[11px] uppercase tracking-[0.35em]">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="mx-8 inline-flex items-center gap-8">
            {item}
            <span className="text-accent" aria-hidden>
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
