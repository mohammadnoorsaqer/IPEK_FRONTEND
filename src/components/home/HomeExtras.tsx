import { getTranslations } from 'next-intl/server';
import { site } from '@/lib/site';
import { WhatsAppIcon } from '@/components/layout/WhatsAppIcon';

export async function HomeFeatures() {
  const t = await getTranslations('home');
  const features = [
    { title: t('featureDeliveryTitle'), text: t('featureDeliveryText') },
    { title: t('featurePayTitle'), text: t('featurePayText') },
    { title: t('featureChatTitle'), text: t('featureChatText') },
  ];

  return (
    <section className="mx-auto max-w-site px-4 pb-12 sm:px-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-sand bg-white/70 px-4 py-5"
          >
            <h3 className="text-base font-semibold">{feature.title}</h3>
            <p className="mt-2 text-base font-medium leading-7 text-ink/75">{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export async function HomeHelp() {
  const t = await getTranslations('home');
  const phone = site.phone.replace(/[^\d]/g, '');
  const steps = [
    { n: '01', title: t('step1Title'), text: t('step1Text') },
    { n: '02', title: t('step2Title'), text: t('step2Text') },
    { n: '03', title: t('step3Title'), text: t('step3Text') },
  ];

  return (
    <>
      <section className="mx-auto max-w-site px-4 pb-16 sm:px-6">
        <h2 className="mb-5 text-2xl font-semibold">{t('howTitle')}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.n}
              className="rounded-xl border border-sand bg-white px-5 py-6"
            >
              <p className="text-xs font-semibold tracking-[0.25em] text-accent">{step.n}</p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-base font-medium leading-7 text-ink/75">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-sand bg-[linear-gradient(160deg,#f7f3ee_0%,#efe4d6_100%)] px-6 py-8 sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="text-2xl font-semibold">{t('helpTitle')}</h2>
            <p className="mt-2 max-w-lg text-base font-medium leading-7 text-ink/75">
              {t('helpText')}
            </p>
          </div>
          <a
            href={`https://wa.me/${phone}`}
            className="inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-[#1ebe57]"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="size-7" />
          </a>
        </div>
      </section>
    </>
  );
}
