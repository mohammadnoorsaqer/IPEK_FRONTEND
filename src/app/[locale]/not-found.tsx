import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-site px-4 py-24 text-center">
      <h1 className="text-4xl">404</h1>
      <Link href="/" className="mt-6 inline-block text-accent underline underline-offset-4">
        IPEK
      </Link>
    </div>
  );
}
