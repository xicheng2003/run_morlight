import React, { useMemo } from 'react';
import Stat from '@/components/Stat';
import useActivities from '@/hooks/useActivities';
import { formatPace, ProcessedActivity } from '@/utils/utils';
import { SHOW_ELEVATION_GAIN } from "@/utils/const";
import YearlyMileageRing from '../Charts/YearlyMileageRing';
import YearlyPathMap from '../Charts/YearlyPathMap';

const YearStat = ({ year, onClick }: { year: string, onClick: (_year: string) => void }) => {
  let { activities: allRuns } = useActivities();
  
  const runs = useMemo(() => {
    if (year === 'Total') return allRuns as ProcessedActivity[];
    return (allRuns as ProcessedActivity[]).filter((run) => run.start_date_local.slice(0, 4) === year);
  }, [allRuns, year]);

  const metrics = useMemo(() => {
    let sumDistance = 0;
    let sumElevation = 0;
    let totalSeconds = 0;
    let maxDistance = 0;
    let streak = 0;
    let heartRateSum = 0;
    let heartRateCount = 0;
    let totalMetersForPace = 0;
    let totalSecondsForPace = 0;

    runs.forEach((run) => {
      sumDistance += run.distance || 0;
      sumElevation += run.elevation_gain || 0;
      const movingTimeParts = run.moving_time.split(':').map(Number);
      const seconds = movingTimeParts[0] * 3600 + movingTimeParts[1] * 60 + movingTimeParts[2];
      totalSeconds += seconds;
      if (run.distance > maxDistance) maxDistance = run.distance;
      if (run.streak) streak = Math.max(streak, run.streak);
      if (run.average_heartrate) {
        heartRateSum += run.average_heartrate;
        heartRateCount++;
      }
      if (run.average_speed > 0) {
        totalMetersForPace += run.distance || 0;
        totalSecondsForPace += (run.distance || 0) / run.average_speed;
      }
    });

    return {
      count: runs.length,
      distance: (sumDistance / 1000).toFixed(1),
      elevation: sumElevation.toFixed(0),
      time: Math.floor(totalSeconds / 3600),
      maxDist: (maxDistance / 1000).toFixed(1),
      avgPace: totalSecondsForPace > 0 ? formatPace(totalMetersForPace / totalSecondsForPace) : '0:00',
      streak,
      avgHR: heartRateCount > 0 ? (heartRateSum / heartRateCount).toFixed(0) : null
    };
  }, [runs]);

  return (
    <div className="flex flex-col gap-12 w-full group py-4" onClick={() => onClick(year)}>
      {/* Top: Year and Basic Metrics */}
      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
        <div className="flex-1 w-full space-y-10">
          <div className="flex items-end gap-4">
            <h2 className="text-7xl font-black italic text-white tracking-tighter leading-none">{year}</h2>
            <div className="flex-1 h-px bg-white/10 mb-2" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-1 italic">Annual Log</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 sm:gap-x-8 gap-y-4 sm:gap-y-10 px-1 sm:px-2 border-l-2 border-brand/20 pl-3 sm:pl-8 ml-0 sm:ml-2">
            <Stat value={metrics.count} description=" 次跑步" />
            <Stat value={metrics.distance} description=" 总里程 KM" />
            <Stat value={metrics.time} description=" 运动时长 HRS" />
            <Stat value={metrics.avgPace} description=" 平均配速" />
            <Stat value={metrics.maxDist} description=" 单次最长 KM" />
            <Stat value={metrics.streak} description=" 连续天数" />
            {SHOW_ELEVATION_GAIN && <Stat value={metrics.elevation} description=" 累计爬升 M" />}
            {metrics.avgHR && <Stat value={metrics.avgHR} description=" 平均心率 BPM" />}
          </div>
        </div>

        {/* Right: The Annual Flow Ring */}
        <div className="w-full lg:w-[400px] flex justify-center">
          <div className="relative p-4 rounded-full bg-white/[0.01] border border-white/5 backdrop-blur-sm shadow-inner">
            <YearlyMileageRing runs={runs} />
          </div>
        </div>
      </div>

      {/* Bottom: The Geometry Signature (All paths composite) */}
      <div className="space-y-4">
        <header className="flex items-center gap-4 px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Yearly Path Geometry</span>
          <div className="h-px flex-1 bg-white/5" />
        </header>
        <YearlyPathMap runs={runs} />
      </div>
    </div>
  );
};

export default YearStat;
