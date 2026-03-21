import React, { useMemo } from 'react';
import useActivities from '@/hooks/useActivities';
import { format } from 'date-fns'; // 假设项目有 date-fns，如果没有我用原生

const ActivityHeatmap = () => {
  const { activities } = useActivities();

  const data = useMemo(() => {
    const stats: Record<string, number> = {};
    activities.forEach(run => {
      const date = run.start_date_local.slice(0, 10);
      stats[date] = (stats[date] || 0) + run.distance;
    });
    return stats;
  }, [activities]);

  // Generate last 12 months of dates
  const weeks = useMemo(() => {
    const weeksList = [];
    let currentWeek: { date: string; value: number }[] = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    // Adjust to previous Monday
    const startDay = startDate.getDay();
    const diff = startDate.getDate() - startDay + (startDay === 0 ? -6 : 1);
    const start = new Date(startDate.setDate(diff));

    for (let i = 0; i < 371; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      currentWeek.push({
        date: dateStr,
        value: data[dateStr] || 0
      });

      if (currentWeek.length === 7) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }
    }
    return weeksList;
  }, [data]);

  const getColor = (value: number) => {
    if (value === 0) return 'rgba(255, 255, 255, 0.03)';
    if (value < 5000) return 'rgba(255, 166, 48, 0.2)';
    if (value < 10000) return 'rgba(255, 166, 48, 0.4)';
    if (value < 21000) return 'rgba(255, 166, 48, 0.7)';
    return 'rgba(255, 166, 48, 1)';
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4">
      <div className="flex gap-1.5 min-w-max">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${(day.value / 1000).toFixed(2)} km`}
                className="group relative h-3 w-3 sm:h-4 sm:w-4 rounded-[3px] transition-all duration-300 hover:scale-125 hover:z-10"
                style={{ backgroundColor: getColor(day.value) }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap rounded-lg bg-black/90 px-3 py-1.5 text-[10px] font-bold text-white shadow-2xl backdrop-blur-md border border-white/10">
                  <span className="text-brand">{day.date}</span>
                  <span className="mx-2 opacity-30">|</span>
                  <span>{(day.value / 1000).toFixed(1)} KM</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
        <span>Past 12 Months Activity</span>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 5000, 10000, 21000, 42000].map(v => (
              <div key={v} className="h-2 w-2 rounded-[1px]" style={{ backgroundColor: getColor(v) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
