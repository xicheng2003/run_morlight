import { useMemo } from 'react';
import useActivities from '@/hooks/useActivities';

const ActivityGrid = () => {
  const { activities } = useActivities();

  // Sort by date and take latest or all
  const sortedActivities = useMemo(() => {
    return [...activities]
      .filter(a => a.path && a.path.length > 0)
      .sort((a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime())
      .slice(0, 100); // Show latest 100 for grid view
  }, [activities]);

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 md:gap-4 py-8">
      {sortedActivities.map((run) => {
        // Calculate bounds for mini SVG
        const points = run.path;
        const lons = points.map(p => p[0]);
        const lats = points.map(p => p[1]);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        
        const padding = 0.1 * Math.max(maxLon - minLon, maxLat - minLat);
        const viewBox = `${minLon - padding} ${minLat - padding} ${(maxLon - minLon) + padding * 2} ${(maxLat - minLat) + padding * 2}`;

        return (
          <div 
            key={run.run_id} 
            className="group relative aspect-square rounded-xl bg-white/[0.03] p-2 transition-all duration-500 hover:bg-white/[0.08] hover:scale-110 shadow-lg"
            title={`${run.name} - ${(run.distance / 1000).toFixed(2)}km`}
          >
            <svg 
              viewBox={viewBox} 
              className="h-full w-full transform -scale-y-100 opacity-60 group-hover:opacity-100 transition-opacity"
            >
              <path
                d={`M ${points.map(p => p.join(',')).join(' L ')}`}
                fill="none"
                stroke={run.color || '#ffa630'}
                strokeWidth={(maxLon - minLon) / 20}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Hover details */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
               <span className="text-[8px] font-black text-white bg-black/60 px-1 rounded-sm">
                 {(run.distance/1000).toFixed(1)}
               </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityGrid;
