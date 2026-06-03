'use client';

import { ArrowRight, Clock, Activity, Smile, Volume2, Target, Zap, Waves, Eye } from 'lucide-react';
import Link from 'next/link';

export type PerformanceRowProps = {
  performance: {
    id: string;
    created_date_time: string;
    video_url: string;
    performance_analysis: {
      overall_score: number;
      emotion_avg: number;
      facial_avg: number;
      diction_avg: number;
      pacing_avg: number;
      eyes_avg: number;
      intent_avg: number;
      status: string;
    };
  };
};

export default function PerformanceRow({ performance }: PerformanceRowProps) {
  const analysis = performance.performance_analysis;
  
  if (!analysis || analysis.status === 'pending' || analysis.status === 'processing') return null;

  const date = new Date(performance.created_date_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const time = new Date(performance.created_date_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const metrics = [
    { 
      label: 'Emotion Alignment', 
      value: analysis.emotion_avg, 
      color: 'bg-rose-500', 
      textColor: 'text-rose-600 dark:text-rose-400',
      icon: Activity 
    },
    { 
      label: 'Facial Expression', 
      value: analysis.facial_avg, 
      color: 'bg-violet-500', 
      textColor: 'text-violet-600 dark:text-violet-400',
      icon: Smile 
    },
    { 
      label: 'Diction & Clarity', 
      value: analysis.diction_avg, 
      color: 'bg-[#00488D]', 
      textColor: 'text-blue-700 dark:text-blue-400',
      icon: Volume2 
    },
    { 
      label: 'Pacing & Rhythm', 
      value: analysis.pacing_avg, 
      color: 'bg-amber-500', 
      textColor: 'text-amber-600 dark:text-amber-400',
      icon: Waves 
    },
    { 
      label: 'Eye Contact', 
      value: analysis.eyes_avg, 
      color: 'bg-cyan-500', 
      textColor: 'text-cyan-600 dark:text-cyan-400',
      icon: Eye 
    },
    { 
      label: 'Intention & Subtext', 
      value: analysis.intent_avg, 
      color: 'bg-indigo-500', 
      textColor: 'text-indigo-600 dark:text-indigo-400',
      icon: Zap 
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 86) return 'stroke-emerald-600 dark:stroke-emerald-500';
    if (score >= 61) return 'stroke-blue-700 dark:stroke-blue-500';
    if (score >= 31) return 'stroke-amber-600 dark:stroke-amber-500';
    return 'stroke-rose-600 dark:stroke-rose-500';
  };

  const scorePercentage = analysis.overall_score;
  const strokeDasharray = `${scorePercentage} 100`;

  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center xl:flex-row xl:items-center gap-10 hover:bg-white dark:hover:bg-slate-800 transition-all group/row">
      {/* Session Date & Overall Score */}
      <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center xl:flex-col xl:items-start gap-8 min-w-[200px]">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            session date
          </span>
          <div className="text-lg font-black text-slate-800 dark:text-white font-manrope">
            {date}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Clock size={12} />
            {time}
          </div>
        </div>

        <div className="">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Overall Score</span>
          <div className="relative w-24 h-24 mt-2">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle
                cx="18" cy="18" r="15.915"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="18" cy="18" r="15.915"
                fill="transparent"
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${getScoreColor(scorePercentage)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black font-manrope text-slate-900 dark:text-white">
                {scorePercentage}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 py-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${metric.color}/10 flex items-center justify-center ${metric.textColor}`}>
                  <metric.icon size={11} strokeWidth={3} />
                </div>
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {metric.label}
                </span>
              </div>
              <span className={`text-[11px] font-black tabular-nums transition-colors ${metric.textColor}`}>
                {metric.value}%
              </span>
            </div>
            <div className="h-[4px] w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${metric.color}`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Button - Icon Only */}
      <div className="flex items-center justify-end shrink-0 xl:pl-4">
        <Link 
          href={`/analysis?id=${performance.id}`}
          className="w-12 h-12 flex items-center justify-center bg-[#001b3c] dark:bg-blue-600 text-white rounded-full transition-all hover:scale-110 active:scale-90 shadow-lg shadow-blue-500/20 group/btn"
          title="View Analysis"
        >
          <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
