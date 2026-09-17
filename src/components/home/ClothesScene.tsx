'use client';

import { useTranslations } from 'next-intl';

export function ClothesScene() {
  const t = useTranslations('home');

  return (
    <div className="clothes-story relative overflow-hidden rounded-2xl border border-sand bg-white/80">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(180,83,42,0.1),transparent_46%)]" />

      <figure className="story-scene story-scene-pick">
        <svg viewBox="0 0 420 220" className="mx-auto block h-[210px] w-full max-w-md">
          <line x1="36" y1="34" x2="384" y2="34" stroke="#c4b6a6" strokeWidth="4" strokeLinecap="round" />
          <g transform="translate(70 0)">
            <g className="story-dress-idle">
              <Hanger />
              <path d="M48 62c8-10 24-10 32 0l6 8v86c0 8-8 14-22 14s-22-6-22-14V70l6-8Z" fill="#e8dfd3" stroke="#b4532a" strokeWidth="1.4" />
            </g>
          </g>
          <g transform="translate(168 0)">
            <g className="story-dress-lift">
              <Hanger />
              <path d="M40 70h48l8 10v78c0 10-12 16-32 16s-32-6-32-16V80l8-10Z" fill="#dcc7b3" stroke="#8f3e1d" strokeWidth="1.4" />
              <path d="M48 108h32" stroke="#b9a08c" strokeWidth="1" />
            </g>
          </g>
          <g transform="translate(278 0)">
            <g className="story-dress-idle" style={{ animationDelay: '0.4s' }}>
              <Hanger />
              <path d="M46 70h36l10 92H36l10-92Z" fill="#c9b8a6" stroke="#6b6560" strokeWidth="1.3" />
            </g>
          </g>
          <g className="story-hand">
            <path d="M214 214c8-28 18-46 34-58" fill="none" stroke="#c4a484" strokeWidth="10" strokeLinecap="round" />
            <path d="M248 156c12-8 28-6 34 4 4 8-2 16-12 18-8 2-16 0-22-6" fill="#e8c9a8" stroke="#b08968" strokeWidth="1.2" />
          </g>
        </svg>
        <figcaption className="story-caption">{t('storyPick')}</figcaption>
      </figure>

      <figure className="story-scene story-scene-ship">
        <svg viewBox="0 0 420 220" className="mx-auto block h-[210px] w-full max-w-md">
          <path d="M24 168h372" stroke="#e8dfd3" strokeWidth="6" strokeLinecap="round" />
          <path d="M40 168c36-18 80-28 128-28" fill="none" stroke="#c4b6a6" strokeWidth="2" strokeDasharray="6 8" />
          <g className="story-box">
            <rect x="86" y="86" width="78" height="58" rx="4" fill="#e8dfd3" stroke="#8f3e1d" strokeWidth="1.6" />
            <path d="M86 104h78" stroke="#b4532a" strokeWidth="1.4" />
            <path d="M125 86v58" stroke="#b4532a" strokeWidth="1.4" />
            <path d="M98 78h54l8 8H90l8-8Z" fill="#dcc7b3" stroke="#8f3e1d" strokeWidth="1.3" />
          </g>
          <g className="story-truck">
            <rect x="248" y="104" width="92" height="48" rx="6" fill="#b4532a" />
            <rect x="340" y="120" width="38" height="32" rx="4" fill="#2b2b2b" />
            <rect x="352" y="128" width="18" height="12" rx="2" fill="#f7f3ee" />
            <circle cx="272" cy="160" r="12" fill="#2b2b2b" />
            <circle cx="272" cy="160" r="5" fill="#e8dfd3" />
            <circle cx="348" cy="160" r="12" fill="#2b2b2b" />
            <circle cx="348" cy="160" r="5" fill="#e8dfd3" />
          </g>
        </svg>
        <figcaption className="story-caption">{t('storyShip')}</figcaption>
      </figure>

      <figure className="story-scene story-scene-wear">
        <svg viewBox="0 0 420 220" className="mx-auto block h-[210px] w-full max-w-md">
          <g className="story-person">
            <circle cx="210" cy="58" r="22" fill="#e8c9a8" />
            <path d="M198 48c6-10 20-10 26 2" fill="none" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
            <path d="M200 66c6 8 16 8 22 0" fill="none" stroke="#8f3e1d" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M168 92c8-16 28-22 42-22s34 6 42 22l12 86c0 12-14 18-54 18s-54-6-54-18l12-86Z" fill="#dcc7b3" stroke="#8f3e1d" strokeWidth="1.5" />
            <path d="M186 118h48" stroke="#b9a08c" strokeWidth="1.2" />
          </g>
          <g transform="translate(286 48)">
            <g className="story-heart">
              <path d="M12 22c8-10 18-6 18 4 0 12-18 22-18 22S-6 38-6 26c0-10 10-14 18-4Z" fill="#b4532a" />
            </g>
          </g>
          <g transform="translate(112 64)">
            <g className="story-heart story-heart-delay">
              <path d="M10 18c6-8 14-5 14 3 0 10-14 18-14 18S-4 31-4 21c0-8 8-11 14-3Z" fill="#dcc7b3" />
            </g>
          </g>
        </svg>
        <figcaption className="story-caption">{t('storyWear')}</figcaption>
      </figure>
    </div>
  );
}

function Hanger() {
  return (
    <>
      <path d="M64 34v16" stroke="#8a7a6a" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M46 54c0-10 8-18 18-18s18 8 18 18" fill="none" stroke="#8a7a6a" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}
