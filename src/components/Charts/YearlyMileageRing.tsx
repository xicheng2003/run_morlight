import { useMemo } from 'react';
import { ProcessedActivity } from '@/utils/utils';

interface IProps {
  runs: ProcessedActivity[];
}

const YearlyMileageRing = ({ runs }: IProps) => {
  const monthlyData = useMemo(() => {
    const months = Array(12).fill(0);
    runs.forEach(run => {
      const month = parseInt(run.start_date_local.slice(5, 7)) - 1;
      months[month] += run.distance / 1000;
    });
    return months;
  }, [runs]);

  const maxMileage = Math.max(...monthlyData, 1);
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const barMaxWidth = 40;

  // SVG Helper: Calculate point on circle
  const getPoint = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad)
    };
  };

  return (
    <div className="relative flex justify-center items-center py-8 group w-full max-w-[300px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto transform transition-transform duration-700 group-hover:rotate-12">
        {/* Background Rings */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <circle cx={center} cy={center} r={radius + barMaxWidth} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

        {/* 12 Months Spooks */}
        {monthlyData.map((mileage, i) => {
          const angle = (i * 360) / 12;
          const endAngle = ((i + 1) * 360) / 12;
          const barHeight = (mileage / maxMileage) * barMaxWidth;
          const innerR = radius;
          const outerR = radius + barHeight;

          // Points for the arc segment
          const p1 = getPoint(angle, innerR);
          const p2 = getPoint(angle, outerR);
          const p3 = getPoint(endAngle, outerR);
          const p4 = getPoint(endAngle, innerR);

          const pathData = `
            M ${p1.x} ${p1.y}
            L ${p2.x} ${p2.y}
            A ${outerR} ${outerR} 0 0 1 ${p3.x} ${p3.y}
            L ${p4.x} ${p4.y}
            A ${innerR} ${innerR} 0 0 0 ${p1.x} ${p1.y}
          `;

          return (
            <g key={i} className="cursor-help group/month">
              <path
                d={pathData}
                fill={mileage === 0 ? 'transparent' : 'rgba(255, 166, 48, 0.3)'}
                stroke="rgba(255, 166, 48, 0.5)"
                strokeWidth="1"
                className="transition-all duration-500 hover:fill-brand hover:opacity-100"
                style={{ opacity: 0.4 + (mileage / maxMileage) * 0.6 }}
              />
              {/* Tooltip hint on hover */}
              <title>{`${i+1}月: ${mileage.toFixed(1)} KM`}</title>
            </g>
          );
        })}

        {/* Month Labels */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12 + 15;
          const p = getPoint(angle, radius - 20);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              fill="rgba(255,255,255,0.2)"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="select-none pointer-events-none"
            >
              {i + 1}
            </text>
          );
        })}
      </svg>

      {/* Center Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Annual Flow</span>
        <span className="text-2xl font-black italic text-brand drop-shadow-lg">
          {Math.round(monthlyData.reduce((a, b) => a + b, 0))}
        </span>
        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">KILOMETERS</span>
      </div>
    </div>
  );
};

export default YearlyMileageRing;
