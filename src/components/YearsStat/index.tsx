import YearStat from '@/components/YearStat';
import useActivities from '@/hooks/useActivities';

const YearsStat = ({ year, onClick }: { year: string, onClick: (_year: string) => void }) => {
  const { years } = useActivities();
  
  return (
    <div className="flex flex-wrap gap-6 items-start">
      <YearStat key={year} year={year} onClick={onClick} />
    </div>
  );
};

export default YearsStat;
