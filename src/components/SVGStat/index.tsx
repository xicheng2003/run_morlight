import ActivityHeatmap from '../Charts/ActivityHeatmap';
import ActivityGrid from '../Charts/ActivityGrid';
import ActivityMetrics from '../Charts/ActivityMetrics';
import TimePunchCard from '../Charts/TimePunchCard';

const SVGStat = () => (
  <div id="svgStat" className="flex flex-col gap-8 md:gap-16 py-6">

    {/* 1. 核心看板 */}
    <div className="rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] p-6 md:p-10 backdrop-blur-2xl border border-white/5 shadow-2xl">
      <header className="mb-6 md:mb-10 flex items-center gap-4">
        <div className="h-6 md:h-8 w-1.5 bg-brand rounded-full shadow-[0_0_15px_rgba(255,166,48,0.4)]" />
        <h3 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
          赛季深度分析 
          <span className="block md:inline text-[8px] md:text-[10px] font-normal text-white/20 not-italic md:ml-3 tracking-[0.3em]">SEASON ANALYTICS</span>
        </h3>
      </header>
      <ActivityMetrics />
    </div>

    {/* 2. 时空节律图 (NEW) */}
    <div className="rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] p-6 md:p-10 backdrop-blur-2xl border border-white/5 shadow-2xl">
      <header className="mb-6 md:mb-8 flex items-center gap-4">
        <div className="h-6 md:h-8 w-1.5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
        <h3 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
          运动时空节律 
          <span className="block md:inline text-[8px] md:text-[10px] font-normal text-white/20 not-italic md:ml-3 tracking-[0.3em]">CIRCADIAN RHYTHM</span>
        </h3>
      </header>
      <div className="space-y-6">
        <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">活跃时间段分布 (24H x 7D)</p>
        <TimePunchCard />
      </div>
    </div>

    {/* 3. 贡献墙 */}
    <div className="rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] p-6 md:p-10 backdrop-blur-2xl border border-white/5 shadow-2xl">
      <header className="mb-6 md:mb-8 flex items-center gap-4">
        <div className="h-6 md:h-8 w-1.5 bg-brand rounded-full" />
        <h3 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
          训练轨迹记录 
          <span className="block md:inline text-[8px] md:text-[10px] font-normal text-white/20 not-italic md:ml-3 tracking-[0.3em]">ACTIVITY HEATMAP</span>
        </h3>
      </header>
      <ActivityHeatmap />
    </div>

    {/* 4. 几何足迹 */}
    <div className="rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] p-6 md:p-10 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden">
      <header className="mb-6 md:mb-8 flex items-center gap-4">
        <div className="h-6 md:h-8 w-1.5 bg-brand rounded-full" />
        <h3 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
          运动几何足迹 
          <span className="block md:inline text-[8px] md:text-[10px] font-normal text-white/20 not-italic md:ml-3 tracking-[0.3em]">JOURNEY GEOMETRY</span>
        </h3>
      </header>
      <ActivityGrid />
    </div>

  </div>
);
export default SVGStat;
