'use client';

import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  RadialBarChart, RadialBar, PolarRadiusAxis
} from 'recharts';
import { PerformanceStats } from '@/lib/utils/performance-analytics';
import { Target, Zap, Activity, Info, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceRadarViewProps {
  stats: PerformanceStats;
}

export default function PerformanceRadarView({ stats }: PerformanceRadarViewProps) {
  const radarData = [
    { subject: `Intent ${Math.round(stats.beatBalance.intent)}%`, value: stats.beatBalance.intent, fullMark: 100 },
    { subject: `Emotion ${Math.round(stats.beatBalance.emotion)}%`, value: stats.beatBalance.emotion, fullMark: 100 },
    { subject: `Visual ${Math.round(stats.beatBalance.visual)}%`, value: stats.beatBalance.visual, fullMark: 100 },
  ];


  const wirData = [
    { name: 'Word Integrity', value: stats.wordIntegrityRate, fill: '#00488D' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Beat Accuracy Radar */}
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] border border-outline-variant/10 shadow-sm relative overflow-hidden group">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-xs font-headline font-black tracking-widest uppercase">Beat Accuracy</h3>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Subtext Alignment</p>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#00488D"
                fill="#00488D"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-on-surface-variant/60 font-body mt-4">
          Compares your objectives (Intent) against your delivery (Emotion).
        </p>
      </div>

      {/* Stability Score Gauge */}
      <div className="bg-[#00488D] text-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity size={120} strokeWidth={1} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h3 className="text-xs font-headline font-black tracking-widest uppercase">Stability Score</h3>
            </div>
            <div className="group relative">
              <Info size={16} className="text-white/40 cursor-help hover:text-white transition-colors" />
              <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-slate-900 border border-white/10 text-[10px] leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                <span className="block font-black mb-1 uppercase tracking-tighter text-blue-400">Consistency Guide</span>
                Measures your emotional consistency. High stability means you held the character's energy without unintended focus drops.
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-4">
            <span className="text-7xl font-headline font-black mb-2 leading-none">
              {Math.round(stats.stabilityScore)}<span className="text-3xl opacity-40">%</span>
            </span>
            <span className="text-xs font-headline font-black uppercase tracking-[0.3em] text-blue-200/60">
              {stats.stabilityScore > 80 ? 'Elite Consistency' : 'Erratic Energy'}
            </span>
          </div>

          <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm font-body text-blue-100/80 leading-relaxed text-center italic">
              "Your performance was {stats.stabilityScore > 80 ? 'masterfully steady.' : 'highly volatile. Look for a solid character arc.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Performance Stamina Retention */}
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] border border-outline-variant/10 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-8 w-full justify-start">
          <div className="w-10 h-10 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-600">
            <TrendingUp size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-headline font-black tracking-widest uppercase">Stamina Retention</h3>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">The "Endurance" Factor</p>
          </div>
        </div>

        <div className="relative h-48 w-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="70%" 
              outerRadius="100%" 
              barSize={12} 
              data={[{ name: 'Stamina', value: Math.max(0, 100 - stats.focusFatigue) }]}
              startAngle={180}
              endAngle={-180}
            >
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={5}
                fill="#f59e0b"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-headline font-black">
              {Math.round(Math.max(0, 100 - stats.focusFatigue))}%
            </span>
            <span className="text-[10px] font-headline font-black uppercase text-on-surface-variant/40 tracking-wider">Reserved Energy</span>
          </div>
        </div>
        
        <p className="text-xs font-body text-on-surface-variant italic mt-6 px-4">
          {stats.focusFatigue > 10 
            ? "Your energy sagged towards the end. Finish through the exit."
            : "Impressive! You maintained your presence into the final act."}
        </p>
      </div>

      {/* Word Integrity Rate */}
      <div className="bg-surface-container-high/20 p-8 rounded-[3rem] border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center">
        <h3 className="text-xs font-headline font-black tracking-widest uppercase mb-8">Word Integrity Rate</h3>
        
        <div className="relative h-48 w-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="70%" 
              outerRadius="100%" 
              barSize={10} 
              data={wirData}
              startAngle={180}
              endAngle={-180}
            >
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={5}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-headline font-black">{Math.round(stats.wordIntegrityRate)}%</span>
            <span className="text-[10px] font-headline font-black uppercase text-on-surface-variant/40 tracking-wider">Professional Grade</span>
          </div>
        </div>
        
        <p className="text-xs font-headline font-black uppercase tracking-[0.2em] mt-6 text-primary">
          {stats.wordIntegrityRate > 95 ? 'Off-Book Master' : 'Needs More Table Work'}
        </p>
      </div>

    </div>
  );
}
