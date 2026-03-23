import { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Layout from '@/components/Layout';
import ExploreSection from '@/components/Home/ExploreSection';
import HeroSection from '@/components/Home/HeroSection';
import SeasonOverviewSection from '@/components/Home/SeasonOverviewSection';
import RunMapPreview from '@/components/RunMap/RunMapPreview';
import useActivities from '@/hooks/useActivities';
import useSiteMetadata from '@/hooks/useSiteMetadata';
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

const RunMap = lazy(() => import('@/components/RunMap'));

const parseDateOnly = (dateTime?: string) => {
  if (!dateTime) {
    return null;
  }

  const [datePart] = dateTime.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const Index = () => {
  const { siteTitle } = useSiteMetadata();
  const { activities, cities, thisYear, isLoading, error } = useActivities();
  const [year, setYear] = useState(thisYear);
  const [runIndex, setRunIndex] = useState(-1);
  const [runs, setActivity] = useState(
    filterAndSortRuns(activities, year, filterYearRuns, sortDateFunc)
  );
  const [title, setTitle] = useState('');
  const [activeFilterLabel, setActiveFilterLabel] = useState(`${thisYear} Season`);
  const [geoData, setGeoData] = useState(geoJsonForRuns(runs));
  const [shouldMountMap, setShouldMountMap] = useState(false);

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

  const mapStyle = {
    transform: `scale(${1 - progress * 0.05})`,
    filter: `blur(${progress * 15}px)`,
    opacity: 1 - progress * 0.5,
    pointerEvents: progress > 0.1 ? 'none' : ('auto' as any),
  };

  const lastRun = [...activities].sort(sortDateFunc)[0];
  const today = new Date();
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const lastRunDateOnly = parseDateOnly(lastRun?.start_date_local);
  const daysAgo = lastRunDateOnly
    ? Math.max(
        0,
        Math.floor(
          (todayDateOnly.getTime() - lastRunDateOnly.getTime()) /
            (1000 * 3600 * 24)
        )
      )
    : 0;

  useEffect(() => {
    if (shouldMountMap) {
      return;
    }

    const idleCallback = window.requestIdleCallback?.(() => {
      setShouldMountMap(true);
    });
    const timeoutId = window.setTimeout(() => {
      setShouldMountMap(true);
    }, 1800);

    return () => {
      if (idleCallback) {
        window.cancelIdleCallback?.(idleCallback);
      }
      window.clearTimeout(timeoutId);
    };
  }, [shouldMountMap]);

  useEffect(() => {
    if (!thisYear) {
      return;
    }

    const nextRuns = filterAndSortRuns(activities, thisYear, filterYearRuns, sortDateFunc);
    setYear(thisYear);
    setActivity(nextRuns);
    setGeoData(geoJsonForRuns(nextRuns));
    setActiveFilterLabel(`${thisYear} Season`);
    setViewState({ ...getLatestBounds(nextRuns) });
  }, [thisYear, activities]);

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
    setActiveFilterLabel(name === 'Year' ? `${item} Season` : `${name}: ${item}`);
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
          {shouldMountMap ? (
            <Suspense
              fallback={
                <RunMapPreview
                  runCount={runs.length}
                  year={year}
                  onActivate={() => setShouldMountMap(true)}
                />
              }
            >
              <RunMap
                title={title}
                viewState={viewState}
                geoData={geoData}
                setViewState={setViewState}
                changeYear={changeYear}
                thisYear={year}
              />
            </Suspense>
          ) : (
            <RunMapPreview
              runCount={runs.length}
              year={year}
              onActivate={() => setShouldMountMap(true)}
            />
          )}
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
        <HeroSection
          siteTitle={siteTitle}
          isMobile={isMobile}
          progress={progress}
          bioRef={bioRef}
          lastRun={lastRun}
          daysAgo={daysAgo}
          totalRuns={activities.length}
          cityCount={Object.keys(cities).length}
          yearCount={new Set(activities.map((run) => run.start_date_local.slice(0, 4))).size}
          onScrollToBio={scrollToBio}
        />

        <section className="mx-auto flex w-full justify-center">
          <div className="page-stack space-y-12 sm:space-y-16">
            {error ? (
              <div className="section-shell pointer-events-auto">
                <div className="section-shell__header">
                  <span className="section-shell__eyebrow">Load Error</span>
                  <h2 className="section-shell__title">Activity archive unavailable</h2>
                </div>
                <p className="text-base leading-7 text-white/58">
                  活动数据暂时没有成功加载，地图与统计区会在数据恢复后自动显示。
                </p>
              </div>
            ) : null}

            {isLoading ? (
              <div className="section-shell pointer-events-auto">
                <div className="section-shell__header">
                  <span className="section-shell__eyebrow">Loading</span>
                  <h2 className="section-shell__title">Preparing activity archive</h2>
                </div>
                <p className="text-base leading-7 text-white/58">
                  正在加载活动数据与统计视图，首次打开会稍慢一些，之后会明显更快。
                </p>
              </div>
            ) : null}
            {!isLoading && !error ? (
              <>
                <SeasonOverviewSection
                  year={year}
                  zoom={viewState.zoom}
                  onChangeYear={changeYear}
                  onChangeCity={changeCity}
                  onChangeTitle={changeTitle}
                />

                <ExploreSection
                  year={year}
                  runs={runs}
                  runIndex={runIndex}
                  activeFilterLabel={activeFilterLabel}
                  onResetFilter={() => changeYear(thisYear)}
                  onLocateActivity={locateActivity}
                  onSetRunIndex={setRunIndex}
                />
              </>
            ) : null}
          </div>
        </section>
      </div>

      {import.meta.env.VERCEL && <Analytics />}
    </Layout>
  );
};

export default Index;
