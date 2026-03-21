import { intComma } from '@/utils/utils';

interface IStatProperties {
  value: string | number;
  description: string;
  className?: string;
  citySize?: number;
  onClick?: () => void;
}

const Stat = ({
  value,
  description,
  className = 'pb-2 w-full',
  citySize,
  onClick,
}: IStatProperties) => (
  <div className={`${className} flex flex-col`} onClick={onClick}>
    <span className={`text-${citySize ? citySize + 'xl' : 'xl sm:text-4xl'} font-black italic tracking-tighter text-brand break-words`}>
      {intComma(value.toString())}
    </span>
    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-white/40 mt-1 leading-tight">{description}</span>
  </div>
);

export default Stat;
