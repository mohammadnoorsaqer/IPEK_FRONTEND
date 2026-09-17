'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Alternates = { en: string; ar: string };

const AlternateLinksContext = createContext<{
  links: Alternates | null;
  setLinks: (value: Alternates | null) => void;
}>({
  links: null,
  setLinks: () => {},
});

export function AlternateLinksProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [links, setLinks] = useState<Alternates | null>(null);
  const value = useMemo(() => ({ links, setLinks }), [links]);

  return (
    <AlternateLinksContext.Provider value={value}>
      {children}
    </AlternateLinksContext.Provider>
  );
}

export function AlternateLinks({ en, ar }: Alternates) {
  const { setLinks } = useContext(AlternateLinksContext);

  useEffect(() => {
    setLinks({ en, ar });
    return () => setLinks(null);
  }, [en, ar, setLinks]);

  return null;
}

export function useAlternateLinks() {
  return useContext(AlternateLinksContext).links;
}
