import { useMemo } from 'react';
import useActivities from '@/hooks/useActivities';
import { normalizeActivityType } from '@/utils/utils';

type SportBucket =
  | 'run'
  | 'ride'
  | 'walk'
  | 'hike'
  | 'swim'
  | 'ski'
  | 'other';

type SportSummary = {
  key: SportBucket;
  label: string;
  shortLabel: string;
  color: string;
  totalDistance: number;
  count: number;
};

const SPORT_META: Record<
  SportBucket,
  { label: string; shortLabel: string; color: string }
> = {
  run: { label: '跑步', shortLabel: 'Run', color: '#ffa630' },
  ride: { label: '骑行', shortLabel: 'Ride', color: '#4f8cff' },
  walk: { label: '步行', shortLabel: 'Walk', color: '#62d394' },
  hike: { label: '徒步', shortLabel: 'Hike', color: '#b794f6' },
  swim: { label: '游泳', shortLabel: 'Swim', color: '#2dd4bf' },
  ski: { label: '滑雪', shortLabel: 'Ski', color: '#f472b6' },
  other: { label: '其他', shortLabel: 'Other', color: '#94a3b8' },
};

const getSportBucket = (type: string, subtype = ''): SportBucket => {
  const normalizedType = normalizeActivityType(type, subtype);

  if (
    normalizedType === 'run' ||
    normalizedType === 'trail' ||
    normalizedType === 'treadmill' ||
    normalizedType === 'virtual-run'
  ) {
    return 'run';
  }
  if (normalizedType === 'ride') return 'ride';
  if (normalizedType === 'walk') return 'walk';
  if (normalizedType === 'hike') return 'hike';
  if (normalizedType === 'swim') return 'swim';
  if (normalizedType === 'ski') return 'ski';
  return 'other';
};

const formatKilometers = (distance: number) => `${distance.toFixed(0)} km`;

const ActivityMetrics = () => {
  const { activities } = useActivities();

  const sportSummaries = useMemo(() => {
    const summaryMap = new Map<SportBucket, SportSummary>();

    activities.forEach((activity) => {
      const key = getSportBucket(activity.type, activity.subtype);
      const current = summaryMap.get(key) ?? {
        key,
        ...SPORT_META[key],
        totalDistance: 0,
        count: 0,
      };

      current.totalDistance += activity.distance / 1000;
      current.count += 1;
      summaryMap.set(key, current);
    });

    return Array.from(summaryMap.values()).sort(
      (a, b) => b.totalDistance - a.totalDistance
    );
  }, [activities]);

  const highlightedSports = useMemo(
    () => sportSummaries.slice(0, 4),
    [sportSummaries]
  );

  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, Record<string, number | string>>();

    activities.forEach((activity) => {
      const monthKey = activity.start_date_local.slice(0, 7);
      const sportKey = getSportBucket(activity.type, activity.subtype);
      const current = monthlyMap.get(monthKey) ?? { month: monthKey };
      current[sportKey] = Number(current[sportKey] || 0) + activity.distance / 1000;
      monthlyMap.set(monthKey, current);
    });

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, values]) => {
        const total = sportSummaries.reduce(
          (sum, sport) => sum + Number(values[sport.key] || 0),
          0
        );
        return {
          ...values,
          month,
          monthLabel: month.replace('-', '/'),
          total,
        };
      });
  }, [activities, sportSummaries]);

  const contributionMax = useMemo(
    () => Math.max(...sportSummaries.map((sport) => sport.totalDistance), 1),
    [sportSummaries]
  );

  const totalDistance = useMemo(
    () =>
      sportSummaries.reduce((sum, sport) => sum + sport.totalDistance, 0).toFixed(0),
    [sportSummaries]
  );

  if (!sportSummaries.length) {
    return (
      <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-10 text-center text-sm font-semibold tracking-[0.14em] text-white/40 uppercase">
        Loading activity metrics
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {highlightedSports.map((sport) => (
          <div
            key={sport.key}
            className="rounded-xl md:rounded-2xl bg-white/[0.03] p-4 md:p-5 border border-white/5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.22em]">
                {sport.shortLabel}
              </span>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: sport.color }}
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-white/92">
                {formatKilometers(sport.totalDistance)}
              </div>
              <div className="text-sm font-semibold text-white/62">
                {sport.label} {sport.count} 次
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl md:rounded-3xl bg-white/[0.02] p-4 md:p-6 border border-white/5">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1 bg-brand rounded-full" />
            <h4 className="text-[10px] md:text-xs font-black text-white/70 tracking-widest uppercase">
              近 12 个月分类型里程
            </h4>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
            Total {totalDistance} km
          </span>
        </header>

        <div className="space-y-4">
          {monthlyData.map((month) => (
            <div key={month.month} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold tracking-[0.16em] text-white/48 uppercase">
                  {month.monthLabel}
                </span>
                <span className="text-xs font-semibold text-white/38">
                  {month.total.toFixed(1)} km
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
                {sportSummaries.map((sport) => {
                  const value = Number(month[sport.key] || 0);
                  if (!value) return null;
                  const width = month.total > 0 ? (value / month.total) * 100 : 0;
                  return (
                    <div
                      key={`${month.month}-${sport.key}`}
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: sport.color,
                      }}
                      title={`${sport.label} ${value.toFixed(1)} km`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-2">
            {sportSummaries.map((sport) => (
              <div
                key={sport.key}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: sport.color }}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                  {sport.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl md:rounded-3xl bg-white/[0.02] p-4 md:p-6 border border-white/5">
        <header className="mb-6 flex items-center gap-3">
          <div className="h-4 w-1 bg-blue-500 rounded-full" />
          <h4 className="text-[10px] md:text-xs font-black text-white/70 tracking-widest uppercase">
            运动类型累计贡献
          </h4>
        </header>

        <div className="space-y-4">
          {sportSummaries.map((sport) => (
            <div key={sport.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: sport.color }}
                  />
                  <span className="text-sm font-semibold text-white/76">
                    {sport.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white/40">
                  {sport.totalDistance.toFixed(1)} km · {sport.count} 次
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(sport.totalDistance / contributionMax) * 100}%`,
                    backgroundColor: sport.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityMetrics;
