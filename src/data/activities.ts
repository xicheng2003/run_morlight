import activitiesUrl from '@/static/activities.json?url';
import {
  colorForRun,
  locationForRun,
  pathForRun,
  titleForRun,
  type Activity,
  type ProcessedActivity,
} from '@/utils/utils';

let processedActivitiesCache: ProcessedActivity[] | null = null;
let loadingPromise: Promise<ProcessedActivity[]> | null = null;

const toProcessedActivities = (runs: Activity[]): ProcessedActivity[] =>
  runs.map((run) => {
    const path = pathForRun(run);
    const color = colorForRun(run);

    return {
      ...run,
      path,
      color,
    } as ProcessedActivity;
  });

const loadProcessedActivities = async () => {
  if (processedActivitiesCache) {
    return processedActivitiesCache;
  }

  if (!loadingPromise) {
    loadingPromise = fetch(activitiesUrl)
      .then((response) => response.json())
      .then((runs) => {
        processedActivitiesCache = toProcessedActivities(runs as Activity[]);
        return processedActivitiesCache;
      });
  }

  return loadingPromise;
};

const getCachedProcessedActivities = () => processedActivitiesCache;

const buildActivityMeta = (activities: ProcessedActivity[]) => {
  const cities: Record<string, number> = {};
  const runPeriod: Record<string, number> = {};
  const provinces: Set<string> = new Set();
  const countries: Set<string> = new Set();
  const years: Set<string> = new Set();
  let thisYear = '';

  activities.forEach((run) => {
    const location = locationForRun(run);
    const periodName = titleForRun(run);

    if (periodName) {
      runPeriod[periodName] = runPeriod[periodName]
        ? runPeriod[periodName] + 1
        : 1;
    }

    const { city, province, country } = location;
    if (city.length > 1) {
      cities[city] = cities[city] ? cities[city] + run.distance : run.distance;
    }
    if (province) provinces.add(province);
    if (country) countries.add(country);

    years.add(run.start_date_local.slice(0, 4));
  });

  const yearsArray = [...years].sort().reverse();
  if (yearsArray.length > 0) {
    [thisYear] = yearsArray;
  }

  return {
    activities,
    years: yearsArray,
    countries: [...countries],
    provinces: [...provinces],
    cities,
    runPeriod,
    thisYear,
  };
};

export { buildActivityMeta, getCachedProcessedActivities, loadProcessedActivities };
