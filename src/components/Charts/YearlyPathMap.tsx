import { useMemo } from 'react';
import { ProcessedActivity } from '@/utils/utils';

interface IProps {
  runs: ProcessedActivity[];
}

const CANVAS_SIZE = 100;
const CANVAS_PADDING = 10;

const buildNormalizedPath = (points: Array<[number, number]>) => {
  if (!points.length) {
    return null;
  }

  const lons = points.map((point) => point[0]);
  const lats = points.map((point) => point[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const width = Math.max(maxLon - minLon, 0.000001);
  const height = Math.max(maxLat - minLat, 0.000001);
  const scale = Math.max(width, height);
  const offsetX = (scale - width) / 2;
  const offsetY = (scale - height) / 2;
  const innerSize = CANVAS_SIZE - CANVAS_PADDING * 2;

  return points
    .map(([lon, lat]) => {
      const x = ((lon - minLon + offsetX) / scale) * innerSize + CANVAS_PADDING;
      const y = ((lat - minLat + offsetY) / scale) * innerSize + CANVAS_PADDING;
      return [x, CANVAS_SIZE - y];
    })
    .map(
      ([x, y], index) =>
        `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    )
    .join(' ');
};

const buildThumbnailUrl = (pathData: string, strokeColor: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" preserveAspectRatio="xMidYMid meet">
      <path
        d="${pathData}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const YearlyPathMap = ({ runs }: IProps) => {
  const paths = useMemo(() => {
    return runs
      .filter((run) => run.path && run.path.length > 1)
      .sort(
        (a, b) =>
          new Date(b.start_date_local).getTime() -
          new Date(a.start_date_local).getTime()
      )
      .slice(0, 24)
      .map((run) => {
        const pathData = buildNormalizedPath(run.path as Array<[number, number]>);

        if (!pathData) {
          return null;
        }

        return {
          ...run,
          thumbnailUrl: buildThumbnailUrl(pathData, run.color || '#ffa630'),
        };
      })
      .filter(Boolean);
  }, [runs]);

  if (paths.length === 0) return null;

  return (
    <div className="mt-8 w-full space-y-6">
      <header className="flex items-center gap-4 px-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">
          Annual Trajectory Gallery
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </header>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {paths.map((run) => (
          <div
            key={run!.run_id}
            className="group relative aspect-square rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-all duration-500 hover:-translate-y-1 hover:border-brand/30 hover:bg-white/[0.08]"
          >
            <img
              src={run!.thumbnailUrl}
              alt={run!.name}
              className="h-full w-full opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              loading="eager"
              decoding="async"
              draggable={false}
            />

            <div className="absolute inset-x-0 bottom-2 text-center opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <span className="rounded-sm bg-black/60 px-1 text-[7px] font-black uppercase tracking-tighter text-brand">
                {run!.start_date_local.slice(5, 10)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YearlyPathMap;
