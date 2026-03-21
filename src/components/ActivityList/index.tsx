import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import activities from '@/static/activities.json';
import { ACTIVITY_TOTAL, IS_CHINESE } from "@/utils/const";
import MonthOfLife from '../Charts/MonthOfLife';

// Define interfaces for our data structures
interface Activity {
  start_date_local: string;
  distance: number;
  moving_time: string;
  type: string;
  location_country?: string;
}

interface ActivitySummary {
  totalDistance: number;
  totalTime: number;
  count: number;
  dailyDistances: number[];
  maxDistance: number;
  maxSpeed: number;
  location: string;
}

interface DisplaySummary {
  totalDistance: number;
  averageSpeed: number;
  totalTime: number;
  count: number;
  maxDistance: number;
  maxSpeed: number;
  location: string;
}

interface ChartData {
  day: number;
  distance: string;
}

interface ActivityCardProps {
  period: string;
  summary: DisplaySummary;
  dailyDistances: number[];
  interval: string;
}

interface ActivityGroups {
  [key: string]: ActivitySummary;
}

type IntervalType = 'year' | 'month' | 'week' | 'day' | 'life';

const ActivityCard: React.FC<ActivityCardProps> = ({ period, summary, dailyDistances, interval }) => {
    const generateLabels = (): number[] => {
        if (interval === 'month') {
            const [year, month] = period.split('-').map(Number);
            const daysInMonth = new Date(year, month, 0).getDate();
            return Array.from({ length: daysInMonth }, (_, i) => i + 1);
        } else if (interval === 'week') {
            return Array.from({ length: 7 }, (_, i) => i + 1);
        } else if (interval === 'year') {
            return Array.from({ length: 12 }, (_, i) => i + 1);
        }
        return [];
    };

    const data: ChartData[] = generateLabels().map((day) => ({
        day,
        distance: (dailyDistances[day - 1] || 0).toFixed(2),
    }));

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const formatPaceStr = (speed: number): string => {
        if (speed === 0) return '0:00 /km';
        const pace = 60 / speed;
        const totalSeconds = Math.round(pace * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}'${seconds < 10 ? '0' : ''}${seconds}"`;
    };

    const yAxisMax = Math.ceil(Math.max(...data.map(d => parseFloat(d.distance))) + 5);
    const yAxisTicks = Array.from({ length: Math.ceil(yAxisMax / 5) + 1 }, (_, i) => i * 5);

    return (
        <div className="group rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
            <header className="mb-8 flex items-end justify-between">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-brand">{period}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-brand/20 to-transparent mx-6 mb-2 hidden sm:block" />
            </header>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{ACTIVITY_TOTAL.TOTAL_DISTANCE_TITLE}</span>
                    <span className="text-2xl font-black italic text-white/90">{summary.totalDistance.toFixed(1)} <span className="text-xs font-bold text-white/40 not-italic">KM</span></span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{ACTIVITY_TOTAL.AVERAGE_SPEED_TITLE}</span>
                    <span className="text-2xl font-black italic text-white/90">{formatPaceStr(summary.averageSpeed)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{ACTIVITY_TOTAL.TOTAL_TIME_TITLE}</span>
                    <span className="text-xl font-bold italic text-white/70">{formatTime(summary.totalTime)}</span>
                </div>
                
                {interval !== 'day' ? (
                    <>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{ACTIVITY_TOTAL.ACTIVITY_COUNT_TITLE}</span>
                            <span className="text-xl font-bold italic text-white/70">{summary.count} <span className="text-[10px] font-bold text-white/30 not-italic uppercase">Runs</span></span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{ACTIVITY_TOTAL.MAX_DISTANCE_TITLE}</span>
                            <span className="text-xl font-bold italic text-white/70">{summary.maxDistance.toFixed(1)} <span className="text-[10px] font-bold text-white/30 not-italic uppercase">KM</span></span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{ACTIVITY_TOTAL.MAX_SPEED_TITLE}</span>
                            <span className="text-xl font-bold italic text-white/70">{formatPaceStr(summary.maxSpeed)}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-1 col-span-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{ACTIVITY_TOTAL.LOCATION_TITLE}</span>
                        <span className="text-lg font-bold text-white/70">{summary.location || '--'}</span>
                    </div>
                )}
            </div>

            {['month', 'week', 'year'].includes(interval) && (
                <div className="h-[200px] w-full mt-6 pt-6 border-t border-white/5">
                    <ResponsiveContainer>
                        <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255, 255, 255, 0.2)', fontSize: 10 }} 
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                domain={[0, yAxisMax]}
                                ticks={yAxisTicks}
                                tick={{ fill: 'rgba(255, 255, 255, 0.2)', fontSize: 10 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                formatter={(value: any) => [`${value} KM`, '里程']}
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#ffa630', fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic' }}
                                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}
                            />
                            <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={parseFloat(entry.distance) > 0 ? '#ffa630' : 'rgba(255,255,255,0.05)'} opacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

const ActivityList: React.FC = () => {
    const [interval, setInterval] = useState<IntervalType>('month');

    const toggleInterval = (newInterval: IntervalType): void => {
        setInterval(newInterval);
    };

    const filterActivities = (activity: Activity): boolean => {
        return activity.type.toLowerCase() === 'run';
    };

    const convertTimeToSeconds = (time: string): number => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const activitiesByInterval = React.useMemo(() => {
        return (activities as Activity[]).filter(filterActivities).reduce((acc: ActivityGroups, activity) => {
            const date = new Date(activity.start_date_local);
            let key: string;
            let index: number;
            switch (interval) {
                case 'year':
                    key = date.getFullYear().toString();
                    index = date.getMonth();
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    index = date.getDate() - 1;
                    break;
                case 'week': {
                    const currentDate = new Date(date.valueOf());
                    currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7));
                    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
                    const weekNum = Math.ceil((((currentDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                    key = `${currentDate.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
                    index = (date.getDay() + 6) % 7;
                    break;
                }
                case 'day':
                    key = date.toLocaleDateString("zh").replaceAll('/', '-');
                    index = 0;
                    break;
                default:
                    key = date.getFullYear().toString();
                    index = 0;
            }

            if (!acc[key]) acc[key] = {
                totalDistance: 0,
                totalTime: 0,
                count: 0,
                dailyDistances: [],
                maxDistance: 0,
                maxSpeed: 0,
                location: ''
            };

            const distanceKm = activity.distance / 1000;
            const timeInSeconds = convertTimeToSeconds(activity.moving_time);
            const speedKmh = timeInSeconds > 0 ? distanceKm / (timeInSeconds / 3600) : 0;

            acc[key].totalDistance += distanceKm;
            acc[key].totalTime += timeInSeconds;
            acc[key].count += 1;
            acc[key].dailyDistances[index] = (acc[key].dailyDistances[index] || 0) + distanceKm;

            if (distanceKm > acc[key].maxDistance) acc[key].maxDistance = distanceKm;
            if (speedKmh > acc[key].maxSpeed) acc[key].maxSpeed = speedKmh;

            if (interval === 'day') acc[key].location = activity.location_country || '';

            return acc;
        }, {});
    }, [interval]);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 text-white min-h-screen">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
                <div className="space-y-2">
                    <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter drop-shadow-xl">
                        {IS_CHINESE ? '活动概览' : 'Activity Summary'}
                    </h1>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hidden sm:block italic">Activity Summary</span>
                    <div className="h-1 w-16 bg-brand rounded-full mt-2" />
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 hidden sm:block">View By</span>
                    <div className="relative inline-flex items-center bg-[#0a0a0a]/80 border border-white/10 rounded-xl p-1 backdrop-blur-xl">
                        {(['year', 'month', 'week', 'day', 'life'] as const).map((opt) => (
                            <button
                                key={opt}
                                onClick={() => toggleInterval(opt)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                                    interval === opt 
                                    ? 'bg-white/10 text-brand shadow-sm' 
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                            >
                                {opt === 'life' ? 'Life' : ACTIVITY_TOTAL[`${opt.toUpperCase()}LY_TITLE` as keyof typeof ACTIVITY_TOTAL] || opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Life SVG View */}
            {interval === 'life' && (
                <div className="w-full rounded-[3rem] bg-white/[0.02] border border-white/5 p-4 sm:p-8 backdrop-blur-xl flex justify-center shadow-2xl">
                    <MonthOfLife />
                </div>
            )}

            {/* Data Cards Grid */}
            {interval !== 'life' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
                    {Object.entries(activitiesByInterval)
                        .sort(([a], [b]) => {
                            if (interval === 'day') {
                                return new Date(b).getTime() - new Date(a).getTime();
                            } else if (interval === 'week') {
                                const [yearA, weekA] = a.split('-W').map(Number);
                                const [yearB, weekB] = b.split('-W').map(Number);
                                return yearB - yearA || weekB - weekA;
                            } else {
                                const [yearA, monthA = 0] = a.split('-').map(Number);
                                const [yearB, monthB = 0] = b.split('-').map(Number);
                                return yearB - yearA || monthB - monthA;
                            }
                        })
                        .map(([period, summary]) => (
                            <ActivityCard
                                key={period}
                                period={period}
                                summary={{
                                    totalDistance: summary.totalDistance,
                                    averageSpeed: summary.totalTime ? (summary.totalDistance / (summary.totalTime / 3600)) : 0,
                                    totalTime: summary.totalTime,
                                    count: summary.count,
                                    maxDistance: summary.maxDistance,
                                    maxSpeed: summary.maxSpeed,
                                    location: summary.location,
                                }}
                                dailyDistances={summary.dailyDistances}
                                interval={interval}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default ActivityList;
