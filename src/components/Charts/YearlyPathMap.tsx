import React, { useMemo } from 'react';
import { ProcessedActivity } from '@/utils/utils';

interface IProps {
  runs: ProcessedActivity[];
}

const YearlyPathMap = ({ runs }: IProps) => {
  const paths = useMemo(() => {
    return runs
      .filter(r => r.path && r.path.length > 0)
      .sort((a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime())
      .slice(0, 24); // Show latest 24 as miniature art pieces
  }, [runs]);

  if (paths.length === 0) return null;

  return (
    <div className="w-full space-y-6 mt-8">
      <header className="flex items-center gap-4 px-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Annual Trajectory Gallery</span>
        <div className="h-px flex-1 bg-white/5" />
      </header>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {paths.map((run) => {
          // Individual bounds for each path to make it a centered art piece
          const points = run.path;
          const lons = points.map(p => p[0]);
          const lats = points.map(p => p[1]);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          
          const pad = 0.15 * Math.max(maxLon - minLon, maxLat - minLat);
          const viewBox = `${minLon - pad} ${minLat - pad} ${(maxLon - minLon) + pad * 2} ${(maxLat - minLat) + pad * 2}`;

          return (
            <div 
              key={run.run_id}
              className="group relative aspect-square rounded-2xl bg-white/[0.02] border border-white/5 p-3 transition-all duration-500 hover:bg-white/[0.08] hover:border-brand/30 hover:-translate-y-1"
            >
              <svg 
                viewBox={viewBox} 
                className="h-full w-full transform -scale-y-100 opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(255,166,48,0.4)] transition-all duration-700"
              >
                <path
                  d={`M ${points.map(p => p.join(',')).join(' L ')}`}
                  fill="none"
                  stroke={run.color || '#ffa630'}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Date label on hover */}
              <div className="absolute inset-x-0 bottom-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[7px] font-black text-brand uppercase tracking-tighter bg-black/60 px-1 rounded-sm">
                  {run.start_date_local.slice(5, 10)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearlyPathMap;
