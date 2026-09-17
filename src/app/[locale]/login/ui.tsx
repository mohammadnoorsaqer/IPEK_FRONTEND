'use client';

import { useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';

export function LoginClient() {
  const params = useSearchParams();
  return <AuthForm mode="login" nextPath={params.get('next') || '/account'} />;
}
