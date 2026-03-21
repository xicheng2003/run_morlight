import YearStat from '@/components/YearStat';
import {
  CHINESE_LOCATION_INFO_MESSAGE_FIRST,
  CHINESE_LOCATION_INFO_MESSAGE_SECOND,
} from '@/utils/const';
import CitiesStat from './CitiesStat';
import LocationSummary from './LocationSummary';
import PeriodStat from './PeriodStat';

interface ILocationStatProps {
  changeYear: (_year: string) => void;
  changeCity: (_city: string) => void;
  changeTitle: (_title: string) => void;
}

const LocationStat = ({
  changeYear,
  changeCity,
  changeTitle,
}: ILocationStatProps) => (
  <div className="w-full flex flex-col gap-6">
    <section className="pb-0 hidden sm:block">
      <p className="text-white/40 text-sm font-medium leading-relaxed">
        {CHINESE_LOCATION_INFO_MESSAGE_FIRST}
        <br />
        {CHINESE_LOCATION_INFO_MESSAGE_SECOND}
      </p>
    </section>
    <div className="flex flex-col gap-8">
      <LocationSummary />
      <div className="flex flex-wrap gap-4">
        <CitiesStat onClick={changeCity} />
        <PeriodStat onClick={changeTitle} />
      </div>
      <YearStat year="Total" onClick={changeYear} />
    </div>
  </div>
);

export default LocationStat;
