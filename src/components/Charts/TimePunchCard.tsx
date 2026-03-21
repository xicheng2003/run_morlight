import React, { useMemo } from 'react';
import useActivities from '@/hooks/useActivities';

const TimePunchCard = () => {
  const { activities } = useActivities();

  const punchData = useMemo(() => {
    // 7 days x 24 hours
    const matrix = Array(7).fill(0).map(() => Array(24).fill(0));
    activities.forEach(run => {
      const date = new Date(run.start_date_local);
      const day = (date.getDay() + 6) % 7; // Mon-Sun: 0-6
      const hour = date.getHours();
      matrix[day][hour] += 1;
    });
    return matrix;
  }, [activities]);

  const maxPunches = Math.max(...punchData.flat(), 1);
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const hours = Array.from({length: 24}, (_, i) => `${i}h`);

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4">
      <div className="flex flex-col gap-2 min-w-[600px]">
        {punchData.map((row, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-4">
            <span className="w-10 text-[10px] font-bold text-white/20 uppercase">{days[dayIdx]}</span>
            <div className="flex-1 flex justify-between items-center gap-1">
              {row.map((punches, hourIdx) => (
                <div 
                  key={hourIdx}
                  className="group relative flex items-center justify-center h-6 flex-1"
                >
                  <div 
                    className="rounded-full bg-brand transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,166,48,0.8)] group-hover:scale-150"
                    style={{ 
                      width: `${(punches / maxPunches) * 100 + 10}%`,
                      aspectRatio: '1/1',
                      maxHeight: '100%',
                      opacity: punches === 0 ? 0.05 : 0.2 + (punches / maxPunches) * 0.8
                    }}
                  />
                  {punches > 0 && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[8px] font-bold text-white border border-white/10">
                      {hourIdx}:00 - {punches}次运动
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 mt-2">
          <span className="w-10" />
          <div className="flex-1 flex justify-between px-1">
            {hours.map((h, i) => (
              <span key={i} className="flex-1 text-center text-[8px] font-black text-white/10">{i % 4 === 0 ? h : ''}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePunchCard;
