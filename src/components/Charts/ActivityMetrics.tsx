import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import useActivities from '@/hooks/useActivities';
import { formatPace } from '@/utils/utils';

const ActivityMetrics = () => {
  const { activities } = useActivities();

  // 1. 月度趋势数据
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    activities.forEach(run => {
      const month = run.start_date_local.slice(0, 7);
      months[month] = (months[month] || 0) + (run.distance / 1000);
    });
    return Object.entries(months)
      .sort()
      .slice(-12)
      .map(([name, distance]) => ({ 
        name: name.replace('-', '年') + '月', 
        里程: Math.round(distance) 
      }));
  }, [activities]);

  // 2. 运动类型分布
  const typeData = useMemo(() => {
    const types: Record<string, number> = {};
    activities.forEach(run => {
      const type = run.type === 'Run' ? '跑步' : run.type === 'Walking' ? '徒步' : run.type === 'Cycling' ? '骑行' : '其他';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([subject, A]) => ({ subject, A, fullMark: 100 }));
  }, [activities]);

  // 3. 核心指标统计
  const stats = useMemo(() => {
    const totalKm = activities.reduce((acc, run) => acc + run.distance, 0) / 1000;
    const maxRun = Math.max(...activities.map(r => r.distance)) / 1000;
    const avgSpeed = activities.reduce((acc, run) => acc + run.average_speed, 0) / activities.length;
    return {
      总里程: totalKm.toFixed(0),
      单次最长: maxRun.toFixed(1),
      平均配速: formatPace(avgSpeed)
    };
  }, [activities]);

  return (
    <div className="flex flex-col gap-10">
      {/* 核心指标栏 */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
            <div className="mt-1 text-2xl font-black italic text-brand tracking-tighter">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full min-h-[350px]">
        {/* 趋势图 */}
        <div className="rounded-3xl bg-white/[0.02] p-6 border border-white/5">
          <header className="mb-6 flex items-center gap-3">
            <div className="h-4 w-1 bg-brand rounded-full" />
            <h4 className="text-xs font-black text-white/70 tracking-widest">近12个月里程趋势</h4>
          </header>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffa630" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffa630" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffa630', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="里程" stroke="#ffa630" strokeWidth={2} fill="url(#colorDist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 雷达图 */}
        <div className="rounded-3xl bg-white/[0.02] p-6 border border-white/5">
          <header className="mb-6 flex items-center gap-3">
            <div className="h-4 w-1 bg-blue-500 rounded-full" />
            <h4 className="text-xs font-black text-white/70 tracking-widest">运动类型分布</h4>
          </header>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={typeData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} />
                <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMetrics;
