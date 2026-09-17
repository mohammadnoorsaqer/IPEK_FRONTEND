export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/3" />
      <div className="flex gap-2">
        <div className="skeleton size-4 rounded-full" />
        <div className="skeleton size-4 rounded-full" />
        <div className="skeleton size-4 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
      <div className="skeleton mb-16 h-[28rem] w-full" />
      <div className="mb-6 skeleton h-8 w-40" />
      <ProductGridSkeleton count={3} />
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="mx-auto grid max-w-site gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_1fr]">
      <div className="hidden lg:block">
        <div className="skeleton mb-4 h-6 w-24" />
        <div className="skeleton mb-2 h-4 w-full" />
        <div className="skeleton mb-2 h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-site gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div className="skeleton aspect-[4/5] w-full" />
      <div className="flex flex-col gap-4 pt-4">
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-6 w-24" />
        <div className="skeleton h-24 w-full" />
        <div className="flex gap-2">
          <div className="skeleton h-10 w-16" />
          <div className="skeleton h-10 w-16" />
          <div className="skeleton h-10 w-16" />
        </div>
        <div className="skeleton h-12 w-48" />
      </div>
    </div>
  );
}
