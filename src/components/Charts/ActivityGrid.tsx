import { useMemo } from 'react';
import useActivities from '@/hooks/useActivities';

const GRID_SIZE = 100;
const GRID_PADDING = 10;

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
  const innerSize = GRID_SIZE - GRID_PADDING * 2;

  return points
    .map(([lon, lat]) => {
      const x = ((lon - minLon + offsetX) / scale) * innerSize + GRID_PADDING;
      const y = ((lat - minLat + offsetY) / scale) * innerSize + GRID_PADDING;
      return [x, GRID_SIZE - y];
    })
    .map(
      ([x, y], index) =>
        `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    )
    .join(' ');
};

const buildThumbnailUrl = (pathData: string, strokeColor: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}" preserveAspectRatio="xMidYMid meet">
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

const ActivityGrid = () => {
  const { activities } = useActivities();

  const sortedActivities = useMemo(() => {
    return [...activities]
      .filter((activity) => activity.path && activity.path.length > 1)
      .sort(
        (a, b) =>
          new Date(b.start_date_local).getTime() -
          new Date(a.start_date_local).getTime()
      )
      .slice(0, 100)
      .map((activity) => {
        const pathData = buildNormalizedPath(activity.path as Array<[number, number]>);

        if (!pathData) {
          return null;
        }

        return {
          ...activity,
          thumbnailUrl: buildThumbnailUrl(pathData, activity.color || '#ffa630'),
        };
      })
      .filter(Boolean);
  }, [activities]);

  return (
    <div className="grid grid-cols-4 gap-2 py-8 sm:grid-cols-6 md:grid-cols-10 md:gap-4">
      {sortedActivities.map((activity) => (
        <div
          key={activity!.run_id}
          className="group relative aspect-square rounded-xl bg-white/[0.03] p-2 shadow-lg transition-all duration-500 hover:scale-110 hover:bg-white/[0.08]"
          title={`${activity!.name} - ${(activity!.distance / 1000).toFixed(2)}km`}
        >
          <img
            src={activity!.thumbnailUrl}
            alt={activity!.name}
            className="h-full w-full opacity-60 transition-opacity group-hover:opacity-100"
            loading="lazy"
            decoding="async"
            draggable={false}
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-sm bg-black/60 px-1 text-[8px] font-black text-white">
              {(activity!.distance / 1000).toFixed(1)} km
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityGrid;
