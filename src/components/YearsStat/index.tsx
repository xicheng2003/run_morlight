import YearStat from '@/components/YearStat';

const YearsStat = ({ year, onClick }: { year: string, onClick: (_year: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-6 items-start">
      <YearStat key={year} year={year} onClick={onClick} />
    </div>
  );
};

export default YearsStat;
