import useActivities from '@/hooks/useActivities';

// only support China for now
const CitiesStat = ({ onClick }: { onClick: (_city: string) => void }) => {
  const { cities } = useActivities();

  const citiesArr = Object.entries(cities);
  citiesArr.sort((a, b) => b[1] - a[1]);
  return (
    <div className="flex flex-wrap gap-2">
      {citiesArr.map(([city, distance]) => (
        <button
          key={city}
          onClick={() => onClick(city)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
        >
          {city} <span className="ml-1 opacity-50">{(distance / 1000).toFixed(0)} KM</span>
        </button>
      ))}
    </div>
  );
};

export default CitiesStat;
