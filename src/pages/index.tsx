import { useEffect, useState, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Layout from '@/components/Layout';
import LocationStat from '@/components/LocationStat';
import RunMap from '@/components/RunMap';
import RunTable from '@/components/RunTable';
import SVGStat from '@/components/SVGStat';
import YearsStat from '@/components/YearsStat';
import useActivities from '@/hooks/useActivities';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { IS_CHINESE, LATEST_RACE_EVENT } from '@/utils/const';
import {
  Activity,
  IViewState,
  filterAndSortRuns,
  filterCityRuns,
  filterTitleRuns,
  filterYearRuns,
  geoJsonForRuns,
  getBoundsForGeoData,
  scrollToMap,
  sortDateFunc,
  titleForShow,
  RunIds,
} from '@/utils/utils';

const Index = () => {
  const { siteTitle } = useSiteMetadata();
  const { activities, thisYear } = useActivities();
  const [year, setYear] = useState(thisYear);
  const [runIndex, setRunIndex] = useState(-1);
  const [runs, setActivity] = useState(
    filterAndSortRuns(activities, year, filterYearRuns, sortDateFunc)
  );
  const [title, setTitle] = useState('');
  const [geoData, setGeoData] = useState(geoJsonForRuns(runs));

  // Custom logic to get bounds for ONLY the latest run to prevent extreme zoom outs
  const getLatestBounds = (currentRuns: Activity[]) => {
    if (currentRuns.length === 0)
      return getBoundsForGeoData(geoJsonForRuns([]));
    const latestRun = [...currentRuns].sort(sortDateFunc)[0];
    return getBoundsForGeoData(geoJsonForRuns([latestRun]));
  };

  const bounds = getLatestBounds(runs);
  const [intervalId, setIntervalId] = useState<number>();
  const [viewState, setViewState] = useState<IViewState>({ ...bounds });

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const progress = Math.min(scrollY / (windowHeight * 0.6), 1);

  const mapStyle = {
    transform: `scale(${1 - progress * 0.05})`,
    filter: `blur(${progress * 15}px)`,
    opacity: 1 - progress * 0.5,
    pointerEvents: progress > 0.1 ? 'none' : ('auto' as any),
  };

  const [isMobile, setIsMobile] = useState(false);
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBio = () => {
    bioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const lastRun = [...activities].sort(sortDateFunc)[0];
  const lastRunDate = lastRun ? new Date(lastRun.start_date_local) : new Date();
  const daysAgo = Math.floor(
    (new Date().getTime() - lastRunDate.getTime()) / (1000 * 3600 * 24)
  );

  const changeByItem = (
    item: string,
    name: string,
    func: (_run: Activity, _value: string) => boolean
  ) => {
    scrollToMap();
    if (name != 'Year') {
      setYear(thisYear);
    }
    const newRuns = filterAndSortRuns(activities, item, func, sortDateFunc);
    setActivity(newRuns);
    setRunIndex(-1);
    setTitle(`${item} ${name} Running Heatmap`);
    setViewState({ ...getLatestBounds(newRuns) });
  };

  const changeYear = (y: string) => {
    setYear(y);
    changeByItem(y, 'Year', filterYearRuns);
    clearInterval(intervalId);
  };

  const changeCity = (city: string) => {
    changeByItem(city, 'City', filterCityRuns);
  };

  const changeTitle = (title: string) => {
    changeByItem(title, 'Title', filterTitleRuns);
  };

  const locateActivity = (runIds: RunIds) => {
    const ids = new Set(runIds);
    const selectedRuns = !runIds.length
      ? runs
      : runs.filter((r: any) => ids.has(r.run_id));

    if (!selectedRuns.length) {
      return;
    }

    const lastRun = selectedRuns.sort(sortDateFunc)[0];

    if (!lastRun) {
      return;
    }
    setGeoData(geoJsonForRuns(selectedRuns));
    setTitle(titleForShow(lastRun));
    clearInterval(intervalId);

    // Smooth fly to the specific activity
    setViewState({
      ...getBoundsForGeoData(geoJsonForRuns(selectedRuns)),
      transitionDuration: 1000,
    } as any);
    scrollToMap();
  };

  // Original drawing animation
  useEffect(() => {
    const runsNum = runs.length;
    const sliceNume = runsNum >= 20 ? runsNum / 20 : 1;
    let i = sliceNume;
    const id = setInterval(() => {
      if (i >= runsNum) {
        clearInterval(id);
      }
      const tempRuns = runs.slice(0, i);
      setGeoData(geoJsonForRuns(tempRuns));
      i += sliceNume;
    }, 100);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [runs]);

  return (
    <Layout>
      <div className="fixed inset-0 z-0 h-screen w-full overflow-hidden bg-[#050505]">
        <div
          className="relative h-full w-full transition-all duration-500 ease-out"
          style={mapStyle}
        >
          <RunMap
            title={title}
            viewState={viewState}
            geoData={geoData}
            setViewState={setViewState}
            changeYear={changeYear}
            thisYear={year}
          />
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at center, transparent 0%, #050505 ${80 + progress * 20}%)`,
              opacity: 0.1 + progress * 0.9,
            }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/80 via-black/20 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
        </div>
      </div>

      <div className="pointer-events-none relative z-30 w-full text-white">
        <section className={`${isMobile ? 'h-[45vh]' : 'h-[80vh]'} w-full relative`}>
          {isMobile && progress < 0.1 && (
            <div 
              onClick={scrollToBio}
              className="pointer-events-auto absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer animate-bounce group"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-brand transition-colors">Explore Stats</span>
              <div className="h-8 w-px bg-gradient-to-b from-brand to-transparent" />
              <svg 
                className="w-4 h-4 text-brand" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </section>

        <section ref={bioRef} className="relative flex flex-col items-center">
          <div
            className="mb-24 flex w-full max-w-5xl flex-col gap-12 px-8 transition-all duration-1000 ease-out"
            style={{
              opacity: progress,
              transform: `translateY(${(1 - progress) * 100}px)`,
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="drop-shadow-glow text-xs font-black uppercase tracking-[0.5em] text-brand">
                AuraDawn&apos;s
              </span>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-7xl">
                {siteTitle}
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="space-y-8">
                <p className="text-justify text-xl font-bold italic leading-snug text-white/90 sm:text-2xl">
                  {IS_CHINESE
                    ? '在城市的脉络中，用呼吸测量大地的广度。每一次奔跑，都是一场关于自我的探索与重塑。'
                    : 'Measuring the earth with every breath. Each run is a journey of self-discovery and transformation.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    'Marathoner',
                    'Tech Enthusiast',
                    'Urban Explorer',
                    '5AM Club',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase italic tracking-widest text-white/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* 1. Latest Pulse */}
                <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                        Latest Pulse
                      </span>
                      <h4 className="text-sm font-bold italic text-white/80">
                        {daysAgo === 0 ? '就在今天' : `${daysAgo}天前`}{' '}
                        刚刚结束一场奔跑
                      </h4>
                    </div>
                    <div className="flex h-6 w-6 animate-pulse items-center justify-center rounded-lg bg-brand/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(255,166,48,0.8)]" />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black italic tracking-tighter text-brand">
                        {(lastRun?.distance / 1000).toFixed(1)}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">
                        KM DISTANCE
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black italic tracking-tighter text-white/90">
                        {lastRun?.average_speed
                          ? (1000 / lastRun.average_speed / 60)
                              .toFixed(2)
                              .replace('.', ':')
                          : '--'}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">
                        PACE
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Milestone / Latest Race */}
                {LATEST_RACE_EVENT && (
                  <div className="flex flex-col justify-between rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 to-transparent p-6 shadow-xl backdrop-blur-sm transition-colors hover:border-brand/40">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-brand">
                          Milestone Event
                        </span>
                        <h4 className="text-sm font-bold italic text-white/90">
                          {LATEST_RACE_EVENT.name}
                        </h4>
                      </div>
                      <div className="rounded-md bg-brand/10 px-2 py-1 text-[10px] font-bold text-brand">
                        {LATEST_RACE_EVENT.type}
                      </div>
                    </div>
                    <div className="mt-6 flex gap-8">
                      <div className="flex flex-col">
                        <span className="text-xl font-black italic tracking-tighter text-white">
                          {LATEST_RACE_EVENT.pace}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">
                          AVG PACE
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black italic tracking-tighter text-white/70">
                          {LATEST_RACE_EVENT.date}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">
                          DATE COMPLETED
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto mb-16 w-full max-w-7xl px-4 sm:px-6">
            <div className="rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]/40 p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] backdrop-blur-[80px] sm:rounded-[4rem] sm:p-20">
              <div className="flex flex-col gap-12 sm:gap-16">
                <header className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-brand">
                      Current Analytics
                    </span>
                    <span className="text-6xl font-black italic leading-none tracking-tighter text-white">
                      {year} Season
                    </span>
                  </div>
                  <div className="mx-12 mb-4 hidden h-px flex-1 bg-gradient-to-r from-white/10 to-transparent sm:block" />
                </header>
                {(viewState.zoom ?? 0) <= 3 && IS_CHINESE ? (
                  <LocationStat
                    changeYear={changeYear}
                    changeCity={changeCity}
                    changeTitle={changeTitle}
                  />
                ) : (
                  <YearsStat year={year} onClick={changeYear} />
                )}
              </div>
            </div>
          </div>

          <section className="w-full max-w-7xl space-y-16 px-6 pb-24">
            {year !== 'Total' && (
              <div className="pointer-events-auto overflow-hidden rounded-[4rem] border border-white/5 bg-[#0a0a0a]/40 p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] backdrop-blur-[80px] sm:p-20">
                <header className="mb-16 flex items-center gap-8 px-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black uppercase italic tracking-[0.3em] text-white/90">
                      {IS_CHINESE ? '详细记录' : 'Detailed Log'}
                    </h2>
                    <span className="text-[10px] font-bold uppercase italic tracking-[0.4em] text-white/30">
                      Detailed Log
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </header>
                <RunTable
                  runs={runs}
                  locateActivity={locateActivity}
                  setActivity={setActivity}
                  runIndex={runIndex}
                  setRunIndex={setRunIndex}
                />
              </div>
            )}

            {year === 'Total' && (
              <div className="pointer-events-auto rounded-[4rem] bg-black/40 p-8 backdrop-blur-[80px] sm:p-24">
                <SVGStat />
              </div>
            )}
          </section>
        </section>
      </div>

      {import.meta.env.VERCEL && <Analytics />}
    </Layout>
  );
};

export default Index;
