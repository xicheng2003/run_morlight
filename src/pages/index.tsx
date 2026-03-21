import { useEffect, useState } from 'react';
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
    if (currentRuns.length === 0) return getBoundsForGeoData(geoJsonForRuns([]));
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
    pointerEvents: progress > 0.3 ? 'none' : 'auto' as any,
  };

  const lastRun = [...activities].sort(sortDateFunc)[0];
  const lastRunDate = lastRun ? new Date(lastRun.start_date_local) : new Date();
  const daysAgo = Math.floor((new Date().getTime() - lastRunDate.getTime()) / (1000 * 3600 * 24));

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
      transitionDuration: 1000
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
      <div className="fixed inset-0 z-0 h-screen w-full bg-[#050505] overflow-hidden">
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
            className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700" 
            style={{ 
              background: `radial-gradient(circle at center, transparent 0%, #050505 ${80 + progress * 20}%)`,
              opacity: 0.1 + progress * 0.9
            }} 
          />
        </div>
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/80 via-black/20 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
        </div>
      </div>

      <div className="relative z-30 w-full pointer-events-none text-white">
        <section className="h-[80vh] w-full" />

        <section className="relative flex flex-col items-center">
          <div 
            className="w-full max-w-5xl px-8 mb-24 transition-all duration-1000 ease-out flex flex-col gap-12"
            style={{ 
              opacity: progress,
              transform: `translateY(${(1 - progress) * 100}px)`
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.5em] text-brand drop-shadow-glow">AuraDawn's</span>
              <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none">
                {siteTitle}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <p className="text-xl sm:text-2xl font-bold leading-snug italic text-white/90 text-justify">
                  {IS_CHINESE 
                    ? "在城市的脉络中，用呼吸测量大地的广度。每一次奔跑，都是一场关于自我的探索与重塑。" 
                    : "Measuring the earth with every breath. Each run is a journey of self-discovery and transformation."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Marathoner', 'Tech Enthusiast', 'Urban Explorer', '5AM Club'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* 1. Latest Pulse */}
                <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Latest Pulse</span>
                      <h4 className="text-sm font-bold text-white/80 italic">
                        {daysAgo === 0 ? '就在今天' : `${daysAgo}天前`} 刚刚结束一场奔跑
                      </h4>
                    </div>
                    <div className="h-6 w-6 rounded-lg bg-brand/10 flex items-center justify-center animate-pulse">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(255,166,48,0.8)]" />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black italic tracking-tighter text-brand">{(lastRun?.distance / 1000).toFixed(1)}</span>
                      <span className="text-[8px] font-bold uppercase text-white/20 tracking-widest">KM DISTANCE</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black italic tracking-tighter text-white/90">
                        {lastRun?.average_speed ? (1000 / lastRun.average_speed / 60).toFixed(2).replace('.', ':') : '--'}
                      </span>
                      <span className="text-[8px] font-bold uppercase text-white/20 tracking-widest">PACE</span>
                    </div>
                  </div>
                </div>

                {/* 2. Milestone / Latest Race */}
                {LATEST_RACE_EVENT && (
                  <div className="rounded-3xl bg-gradient-to-br from-brand/10 to-transparent border border-brand/20 p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl hover:border-brand/40 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-brand">Milestone Event</span>
                        <h4 className="text-sm font-bold text-white/90 italic">
                          {LATEST_RACE_EVENT.name}
                        </h4>
                      </div>
                      <div className="text-[10px] font-bold text-brand px-2 py-1 bg-brand/10 rounded-md">
                        {LATEST_RACE_EVENT.type}
                      </div>
                    </div>
                    <div className="mt-6 flex gap-8">
                      <div className="flex flex-col">
                        <span className="text-xl font-black italic tracking-tighter text-white">{LATEST_RACE_EVENT.pace}</span>
                        <span className="text-[8px] font-bold uppercase text-white/40 tracking-widest">AVG PACE</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black italic tracking-tighter text-white/70">{LATEST_RACE_EVENT.date}</span>
                        <span className="text-[8px] font-bold uppercase text-white/40 tracking-widest">DATE COMPLETED</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full max-w-7xl px-4 sm:px-6 mb-16 pointer-events-auto">
            <div className="rounded-[2.5rem] sm:rounded-[4rem] border border-white/5 bg-[#0a0a0a]/40 p-6 sm:p-20 backdrop-blur-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex flex-col gap-12 sm:gap-16">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-brand">Current Analytics</span>
                    <span className="text-6xl font-black italic text-white leading-none tracking-tighter">{year} Season</span>
                  </div>
                  <div className="h-px hidden sm:block flex-1 bg-gradient-to-r from-white/10 to-transparent mb-4 mx-12" />
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

          <section className="w-full max-w-7xl px-6 pb-24 space-y-16">
            {year !== 'Total' && (
              <div className="pointer-events-auto rounded-[4rem] border border-white/5 bg-[#0a0a0a]/40 p-6 sm:p-20 backdrop-blur-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
                <header className="mb-16 flex items-center gap-8 px-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black italic uppercase tracking-[0.3em] text-white/90">
                      {IS_CHINESE ? '详细记录' : 'Detailed Log'}
                    </h2>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] italic">Detailed Log</span>
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
              <div className="pointer-events-auto rounded-[4rem] bg-black/40 p-8 sm:p-24 backdrop-blur-[80px]">
                <SVGStat />
              </div>
            )}
          </section>
        </section>
      </div>
      
      {import.meta.env.VERCEL && <Analytics /> }
    </Layout>
  );
};

export default Index;
