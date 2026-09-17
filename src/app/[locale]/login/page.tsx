import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginClient } from './ui';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
