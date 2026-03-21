import useActivities from '@/hooks/useActivities';

const PeriodStat = ({ onClick }: { onClick: (_period: string) => void }) => {
  const { runPeriod } = useActivities();

  const periodArr = Object.entries(runPeriod);
  periodArr.sort((a, b) => b[1] - a[1]);
  return (
    <div className="flex flex-wrap gap-2">
      {periodArr.map(([period, times]) => (
        <button
          key={period}
          onClick={() => onClick(period)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
        >
          {period} <span className="ml-1 opacity-50">{times}</span>
        </button>
      ))}
    </div>
  );
};

export default PeriodStat;
