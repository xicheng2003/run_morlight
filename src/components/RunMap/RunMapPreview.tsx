import { IS_CHINESE } from '@/utils/const';

interface RunMapPreviewProps {
  runCount: number;
  year: string;
  onActivate: () => void;
}

const RunMapPreview = ({ runCount, year, onActivate }: RunMapPreviewProps) => (
  <button
    type="button"
    onClick={onActivate}
    className="relative h-full w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
    aria-label="Activate interactive map"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,166,48,0.18),transparent_28%),radial-gradient(circle_at_82%_30%,rgba(71,184,224,0.18),transparent_22%),linear-gradient(180deg,#050505_0%,#080808_45%,#020202_100%)]" />
    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px]" />
    <div className="absolute inset-x-[10%] top-[18%] h-px rotate-[8deg] bg-gradient-to-r from-transparent via-[rgba(255,166,48,0.7)] to-transparent blur-[1px]" />
    <div className="absolute inset-x-[18%] top-[52%] h-px -rotate-[12deg] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.45)] to-transparent blur-[1px]" />
    <div className="absolute inset-x-[28%] top-[68%] h-px rotate-[14deg] bg-gradient-to-r from-transparent via-[rgba(71,184,224,0.7)] to-transparent blur-[1px]" />

    <div className="absolute left-5 top-24 z-20 flex flex-wrap gap-2">
      <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/60 backdrop-blur-md">
        {year || 'Season'}
      </span>
      <span className="rounded-full border border-[rgba(255,166,48,0.24)] bg-[rgba(255,166,48,0.12)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--accent-strong)] backdrop-blur-md">
        {runCount} routes ready
      </span>
    </div>

    <div className="absolute bottom-6 left-6 right-6 z-20 max-w-xl rounded-[1.5rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
        Interactive map standby
      </p>
      <h3 className="mt-2 text-2xl font-black italic tracking-tight text-white">
        {IS_CHINESE ? '地图已准备，点击进入实时交互视图' : 'Map is ready. Tap to enter the live interactive view.'}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/58">
        {IS_CHINESE
          ? '首屏先展示轻量预览，等你开始探索时再加载完整地图能力。'
          : 'The page starts with a lightweight preview and loads the full map only when you start exploring.'}
      </p>
      <span className="mt-4 inline-flex rounded-full border border-[rgba(255,166,48,0.24)] bg-[rgba(255,166,48,0.12)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-strong)]">
        {IS_CHINESE ? '点击激活交互地图' : 'Activate interactive map'}
      </span>
    </div>
  </button>
);

export default RunMapPreview;
