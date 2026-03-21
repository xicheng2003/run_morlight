import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useActivities from '@/hooks/useActivities';
import { IS_CHINESE } from '@/utils/const';

const MonthOfLife = () => {
  const { activities } = useActivities();

  // Process data for Grid and Charts
  const { monthlyStats, yearlyStats, minYear, maxYear, maxMileage, lifetimeDistance, lifetimeRuns, lifetimeHours, activeMonths } = useMemo(() => {
    const mStats: Record<string, number> = {};
    const yStats: Record<string, number> = {};
    let minYr = new Date().getFullYear();
    let maxYr = new Date().getFullYear();
    let maxDist = 0;
    let actMonths = 0;
    let totalDist = 0;
    let totalSecs = 0;

    activities.forEach(run => {
      const dateStr = run.start_date_local;
      if (!dateStr) return;
      
      const year = parseInt(dateStr.slice(0, 4));
      const month = dateStr.slice(0, 7);
      
      if (year < minYr) minYr = year;
      if (year > maxYr) maxYr = year;

      const dist = run.distance / 1000;
      mStats[month] = (mStats[month] || 0) + dist;
      yStats[year] = (yStats[year] || 0) + dist;
      
      totalDist += dist;
      
      // Calculate time
      const timeParts = run.moving_time.split(':').map(Number);
      if (timeParts.length === 3) {
        totalSecs += timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      }
    });

    Object.values(mStats).forEach(dist => {
      if (dist > maxDist) maxDist = dist;
      if (dist > 0) actMonths++;
    });

    // Ensure at least 5 years grid for visual balance
    if (maxYr - minYr < 4) {
        minYr = maxYr - 4;
    }

    return { 
      monthlyStats: mStats, 
      yearlyStats: Object.entries(yStats).map(([year, dist]) => ({ year, dist })),
      minYear: minYr, 
      maxYear: maxYr, 
      maxMileage: Math.max(maxDist, 1),
      lifetimeDistance: totalDist,
      lifetimeRuns: activities.length,
      lifetimeHours: totalSecs / 3600,
      activeMonths: actMonths
    };
  }, [activities]);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).reverse();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getColor = (value: number) => {
    if (!value || value === 0) return 'rgba(255, 255, 255, 0.02)';
    const intensity = Math.min(value / maxMileage, 1);
    const opacity = 0.15 + (intensity * 0.85);
    return `rgba(255, 166, 48, ${opacity})`;
  };

  return (
    <div className="flex flex-col gap-16 w-full max-w-6xl mx-auto py-8">
      
      {/* 1. Lifetime Hero Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">
            {IS_CHINESE ? '运动生涯' : 'Month of Life'}
          </h2>
          <p className="text-xs font-bold tracking-widest text-brand uppercase">
            {IS_CHINESE ? '用脚步丈量时间的跨度' : 'The macro perspective of your journey'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 text-right">
          <div className="flex flex-col">
            <span className="text-3xl font-black italic text-white">{lifetimeDistance.toFixed(0)}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Total KM</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black italic text-white">{lifetimeRuns}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Total Runs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black italic text-white">{lifetimeHours.toFixed(0)}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Total HRS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black italic text-brand">{activeMonths}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand/60">Active MTHS</span>
          </div>
        </div>
      </div>

      {/* 2. Visualizations Container */}
      <div className="flex flex-col xl:flex-row gap-16 xl:gap-12">
        
        {/* Left: The Month Grid */}
        <div className="flex-1 w-full overflow-x-auto no-scrollbar pb-8">
          <div className="space-y-6 min-w-[600px]">
            <header className="flex items-center gap-3">
              <div className="h-4 w-1 bg-brand rounded-full" />
              <h4 className="text-xs font-black text-white/70 tracking-widest uppercase">
                {IS_CHINESE ? '生命矩阵 (按月)' : 'Life Matrix (Monthly)'}
              </h4>
            </header>
            
            <div className="flex flex-col gap-3">
              {/* Month Header */}
              <div className="flex pl-16">
                {months.map(m => (
                  <div key={m} className="flex-1 text-center text-[10px] font-black text-white/20 uppercase tracking-widest">
                    {new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'short' })}
                  </div>
                ))}
              </div>

              {/* Years Rows */}
              {years.map(year => (
                <div key={year} className="flex items-center group/row">
                  <div className="w-16 text-sm font-black italic text-white/30 group-hover/row:text-white transition-colors">
                    {year}
                  </div>
                  <div className="flex-1 flex gap-2">
                    {months.map(month => {
                      const key = `${year}-${month.toString().padStart(2, '0')}`;
                      const distance = monthlyStats[key] || 0;
                      
                      return (
                        <div 
                          key={month} 
                          className="flex-1 aspect-square relative group/cell"
                        >
                          <div 
                            className="w-full h-full rounded-md border border-white/5 transition-all duration-300 group-hover/cell:scale-125 group-hover/cell:z-10 group-hover/cell:border-brand/80"
                            style={{ 
                              backgroundColor: getColor(distance),
                              boxShadow: distance > 0 ? `0 0 ${distance / maxMileage * 15}px rgba(255, 166, 48, ${distance / maxMileage * 0.6})` : 'none'
                            }}
                          />
                          
                          {/* Hover Tooltip */}
                          {distance > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/cell:flex flex-col items-center z-50 whitespace-nowrap rounded-xl bg-black/90 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md border border-white/10">
                              <span className="text-brand mb-0.5 tracking-widest">{year} . {month.toString().padStart(2, '0')}</span>
                              <span className="text-lg italic">{distance.toFixed(1)} <span className="text-[10px] text-white/40 not-italic">KM</span></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Yearly Progress Bar Chart */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <header className="flex items-center gap-3">
            <div className="h-4 w-1 bg-blue-500 rounded-full" />
            <h4 className="text-xs font-black text-white/70 tracking-widest uppercase">
              {IS_CHINESE ? '年度进阶 (跑量)' : 'Yearly Progress'}
            </h4>
          </header>
          
          <div className="h-[300px] xl:h-full w-full bg-white/[0.01] rounded-3xl border border-white/5 p-6 pt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyStats.sort((a, b) => Number(a.year) - Number(b.year))} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255, 255, 255, 0.3)', fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255, 255, 255, 0.2)', fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '16px', fontWeight: 'bold', fontStyle: 'italic' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Bar dataKey="dist" name="跑量 KM" radius={[6, 6, 0, 0]}>
                  {yearlyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MonthOfLife;
