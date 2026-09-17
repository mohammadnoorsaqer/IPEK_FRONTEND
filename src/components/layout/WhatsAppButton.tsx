import { site } from '@/lib/site';
import { WhatsAppIcon } from '@/components/layout/WhatsAppIcon';

export function WhatsAppButton() {
  const phone = site.phone.replace(/[^\d]/g, '');

  return (
    <a
      href={`https://wa.me/${phone}`}
      className="whatsapp-live fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.35)] transition hover:scale-105 hover:bg-[#1ebe57]"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
