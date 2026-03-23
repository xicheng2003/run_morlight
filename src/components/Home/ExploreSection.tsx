import RunTable from '@/components/RunTable';
import SVGStat from '@/components/SVGStat';
import { IS_CHINESE } from '@/utils/const';
import type { Activity, RunIds } from '@/utils/utils';
import SectionShell from './SectionShell';

interface ExploreSectionProps {
  year: string;
  runs: Activity[];
  runIndex: number;
  activeFilterLabel: string;
  onResetFilter: () => void;
  onLocateActivity: (_runIds: RunIds) => void;
  onSetRunIndex: (_index: number) => void;
}

const ExploreSection = ({
  year,
  runs,
  runIndex,
  activeFilterLabel,
  onResetFilter,
  onLocateActivity,
  onSetRunIndex,
}: ExploreSectionProps) => {
  if (year === 'Total') {
    return (
      <SectionShell
        eyebrow="Training Patterns"
        title={IS_CHINESE ? '长期训练图谱' : 'Training Pattern Atlas'}
        subtitle={
          IS_CHINESE
            ? '把全年和长期数据放在一张产品化看板里，强调节律、贡献和几何轨迹，而不只是把图表堆在一起。'
            : 'A long-horizon analytical canvas that emphasizes rhythm, consistency, and shape.'
        }
        className="pointer-events-auto"
      >
        <SVGStat />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      eyebrow="Detailed Log"
      title={IS_CHINESE ? '单次活动明细' : 'Activity Details'}
      subtitle={
        IS_CHINESE
          ? '这里展示当前筛选条件下的全部活动记录，点选后可以在地图中定位对应路线。'
          : 'Drill into filtered activities and surface meaningful sessions by pace, distance, or duration.'
      }
      className="pointer-events-auto"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="tag-chip">{activeFilterLabel}</span>
        <span className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">
          {runs.length} {IS_CHINESE ? '条活动记录' : 'activities'}
        </span>
        <button
          type="button"
          onClick={onResetFilter}
          className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/55 transition hover:border-[var(--accent-border)] hover:text-[var(--accent-strong)]"
        >
          {IS_CHINESE ? '回到本年视图' : 'Reset to current season'}
        </button>
      </div>
      <RunTable
        runs={runs}
        locateActivity={onLocateActivity}
        runIndex={runIndex}
        setRunIndex={onSetRunIndex}
      />
    </SectionShell>
  );
};

export default ExploreSection;
