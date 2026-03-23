import type { RefObject } from 'react';
import { IS_CHINESE, LATEST_RACE_EVENT } from '@/utils/const';
import type { Activity } from '@/utils/utils';

interface HeroSectionProps {
  siteTitle: string;
  isMobile: boolean;
  progress: number;
  bioRef: RefObject<HTMLDivElement>;
  lastRun?: Activity;
  daysAgo: number;
  totalRuns: number;
  cityCount: number;
  yearCount: number;
  onScrollToBio: () => void;
}

const formatDistance = (distance?: number) =>
  distance ? (distance / 1000).toFixed(1) : '--';

const formatPace = (speed?: number) => {
  if (!speed) {
    return '--';
  }
  return (1000 / speed / 60).toFixed(2).replace('.', ':');
};

const HeroSection = ({
  siteTitle,
  isMobile,
  progress,
  bioRef,
  lastRun,
  daysAgo,
  totalRuns,
  cityCount,
  yearCount,
  onScrollToBio,
}: HeroSectionProps) => (
  <>
    <section className={`${isMobile ? 'h-[45vh]' : 'h-[80vh]'} relative w-full`} />

    {isMobile && progress < 0.1 ? (
      <button
        type="button"
        onClick={onScrollToBio}
        className="fixed bottom-12 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 text-left transition group"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45 transition-colors group-hover:text-[var(--accent-strong)]">
          Explore Stats
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-[var(--accent-strong)] to-transparent" />
        <svg
          className="h-4 w-4 text-[var(--accent-strong)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    ) : null}

    <section ref={bioRef} className="relative flex flex-col items-center">
      <div
        className="mx-auto mb-24 flex w-full max-w-6xl flex-col gap-12 px-6 sm:px-8"
        style={{
          opacity: progress,
          transform: `translateY(${(1 - progress) * 100}px)`,
          transition: 'opacity 800ms ease, transform 800ms ease',
        }}
      >
        <div className="max-w-4xl space-y-6">
          <span className="section-shell__eyebrow">AuraDawn&apos;s running archive</span>
          <div className="space-y-4">
            <h1 className="display-title max-w-5xl text-white">{siteTitle}</h1>
            <p className="max-w-3xl text-lg leading-8 text-white/72 sm:text-xl">
              {IS_CHINESE
                ? '把奔跑当成一种长期表达。用路线记录城市，用配速记录心境，用每一次出发累计一个更清晰的自己。'
                : 'A long-horizon running archive shaped by routes, rhythm, and the cities crossed along the way.'}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel-surface panel-surface--hero grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <p className="text-xl font-semibold italic leading-9 text-white/88 sm:text-2xl">
                {IS_CHINESE
                  ? '在城市的脉络中，用呼吸测量大地的广度。每一次奔跑，都是一场关于自我的探索与重塑。'
                  : 'Measuring the earth with every breath. Each run reshapes the self a little more.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {['Marathoner', 'Tech Enthusiast', 'Urban Explorer', '5AM Club'].map(
                  (tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="metric-card">
                <span className="metric-card__label">
                  {IS_CHINESE ? '累计活动' : 'Total Activities'}
                </span>
                <strong className="metric-card__value">{totalRuns}</strong>
                <p className="metric-card__hint">
                  {IS_CHINESE ? '持续记录每一次出发' : 'Every logged outing adds to the archive'}
                </p>
              </div>
              <div className="metric-card">
                <span className="metric-card__label">
                  {IS_CHINESE ? '点亮城市' : 'Cities Covered'}
                </span>
                <strong className="metric-card__value">{cityCount}</strong>
                <p className="metric-card__hint">
                  {IS_CHINESE ? '城市维度的跑步足迹' : 'A growing urban footprint'}
                </p>
              </div>
              <div className="metric-card">
                <span className="metric-card__label">
                  {IS_CHINESE ? '记录年份' : 'Years Logged'}
                </span>
                <strong className="metric-card__value">{yearCount}</strong>
                <p className="metric-card__hint">
                  {IS_CHINESE ? '长期主义已经具象化' : 'A sustained body of work over time'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="panel-surface panel-surface--compact">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="metric-card__label">Latest Pulse</span>
                  <h4 className="text-sm font-bold italic text-white/82">
                    {daysAgo === 0 ? '就在今天' : `${daysAgo}天前`} 刚刚结束一场奔跑
                  </h4>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[color:var(--accent-soft)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)] shadow-[0_0_10px_rgba(255,166,48,0.8)]" />
                </div>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="metric-card__value metric-card__value--small">
                    {formatDistance(lastRun?.distance)}
                  </span>
                  <span className="metric-card__label">KM Distance</span>
                </div>
                <div className="space-y-2">
                  <span className="metric-card__value metric-card__value--small text-white/92">
                    {formatPace(lastRun?.average_speed)}
                  </span>
                  <span className="metric-card__label">Pace</span>
                </div>
              </div>
            </div>

            {LATEST_RACE_EVENT ? (
              <div className="panel-surface panel-surface--accent">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="section-shell__eyebrow !mb-0 !text-[var(--accent-strong)]">
                      Milestone Event
                    </span>
                    <h4 className="text-base font-bold italic text-white/92">
                      {LATEST_RACE_EVENT.name}
                    </h4>
                  </div>
                  <div className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                    {LATEST_RACE_EVENT.type}
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="metric-card__value metric-card__value--small text-white">
                      {LATEST_RACE_EVENT.pace}
                    </span>
                    <span className="metric-card__label">Avg Pace</span>
                  </div>
                  <div className="space-y-2">
                    <span className="metric-card__value metric-card__value--small text-white/76">
                      {LATEST_RACE_EVENT.date}
                    </span>
                    <span className="metric-card__label">Date Completed</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  </>
);

export default HeroSection;
