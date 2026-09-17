import { getTranslations } from 'next-intl/server';
import { site } from '@/lib/site';

export async function Footer() {
  const t = await getTranslations('footer');
  const phone = site.phone.replace(/[^\d]/g, '');

  return (
    <footer className="mt-20 border-t border-sand bg-[linear-gradient(180deg,transparent,rgba(232,223,211,0.45))]">
      <div className="mx-auto flex max-w-site flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-xl tracking-[0.35em]">IPEK</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-muted">{site.address}</p>
        </div>
        <a
          href={`https://wa.me/${phone}`}
          className="text-sm text-accent hover:text-accent-dark"
          target="_blank"
          rel="noreferrer"
        >
          {t('contact')}
        </a>
      </div>
      <p className="border-t border-sand/70 px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} IPEK. {t('rights')}
      </p>
    </footer>
  );
}
