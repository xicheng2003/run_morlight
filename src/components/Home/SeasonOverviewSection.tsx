import LocationStat from '@/components/LocationStat';
import YearsStat from '@/components/YearsStat';
import { IS_CHINESE } from '@/utils/const';
import SectionShell from './SectionShell';

interface SeasonOverviewSectionProps {
  year: string;
  zoom?: number;
  onChangeYear: (_year: string) => void;
  onChangeCity: (_city: string) => void;
  onChangeTitle: (_title: string) => void;
}

const SeasonOverviewSection = ({
  year,
  zoom,
  onChangeYear,
  onChangeCity,
  onChangeTitle,
}: SeasonOverviewSectionProps) => (
  <SectionShell
    eyebrow="Current Analytics"
    title={
      <>
        <span className="text-white">{year}</span> Season
      </>
    }
    subtitle={
      IS_CHINESE
        ? '从这里切换年份、地点和训练主题，快速查看这一阶段的跑步分布与训练重点。'
        : 'Connect spatial exploration with stable analytical entry points across season, city, and activity theme.'
    }
    align="between"
    className="pointer-events-auto"
  >
    {(zoom ?? 0) <= 3 && IS_CHINESE ? (
      <LocationStat
        changeYear={onChangeYear}
        changeCity={onChangeCity}
        changeTitle={onChangeTitle}
      />
    ) : (
      <YearsStat year={year} onClick={onChangeYear} />
    )}
  </SectionShell>
);

export default SeasonOverviewSection;
