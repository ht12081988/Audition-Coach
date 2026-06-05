import { useState } from 'react';
import { ArrowRight, Clock, Activity, Smile, Volume2, Target, Zap, Waves, Eye, Star, TrendingUp, UserCheck, Brain, Mic2, Award } from 'lucide-react';
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
    character_fit_analysis?: {
      casting_fit_score: number;
      archetype_score: number;
      emotional_arc_score: number;
      status_score: number;
      energy_score: number;
      psych_core_score: number;
      phys_vocal_score: number;
    } | null;
  };
};

export default function PerformanceRow({ performance }: PerformanceRowProps) {
  const analysis = performance.performance_analysis;
  const charFit = performance.character_fit_analysis;
  
  const [activeTab, setActiveTab] = useState<'performance' | 'character_fit'>('performance');
  
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

  const charFitMetrics = charFit ? [
    { label: 'Casting Fit', value: charFit.casting_fit_score, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', icon: Award },
    { label: 'Archetype Embodiment', value: charFit.archetype_score, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400', icon: Star },
    { label: 'Emotional Arc Fidelity', value: charFit.emotional_arc_score, color: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400', icon: TrendingUp },
    { label: 'Status Portrayal', value: charFit.status_score, color: 'bg-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400', icon: UserCheck },
    { label: 'Energy Match', value: charFit.energy_score, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', icon: Zap },
    { label: 'Psych Core', value: charFit.psych_core_score, color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400', icon: Brain },
    { label: 'Phys & Vocal', value: charFit.phys_vocal_score, color: 'bg-cyan-500', textColor: 'text-cyan-600 dark:text-cyan-400', icon: Mic2 },
  ] : [];

  const getScoreColor = (score: number) => {
    if (score >= 86) return 'stroke-emerald-600 dark:stroke-emerald-500';
    if (score >= 61) return 'stroke-blue-700 dark:stroke-blue-500';
    if (score >= 31) return 'stroke-amber-600 dark:stroke-amber-500';
    return 'stroke-rose-600 dark:stroke-rose-500';
  };

  const scorePercentage = activeTab === 'performance' ? analysis.overall_score : (charFit?.casting_fit_score || 0);
  const strokeDasharray = `${scorePercentage} 100`;

  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center xl:flex-row xl:items-center gap-10 hover:bg-white dark:hover:bg-slate-800 transition-all group/row">
      {/* Session Date & Overall Score */}
      <div className="flex flex-col items-center md:items-start lg:flex-row lg:items-center xl:flex-col xl:items-center gap-6 min-w-[200px] w-[200px]">
        <div className="space-y-1 w-full text-center xl:text-left">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            session date
          </span>
          <div className="flex flex-col xl:flex-row xl:items-baseline gap-1 xl:gap-2">
            <div className="text-lg font-black text-slate-800 dark:text-white font-manrope">
              {date}
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
              <Clock size={11} />
              {time}
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="w-full rounded-2xl overflow-hidden shadow-md bg-black aspect-video relative border-[3px] border-black z-10">
          <video 
            src={`${performance.video_url}#t=0.001`} 
            controls 
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-cover relative z-20"
          />
        </div>

        <div className="flex flex-col items-center mt-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-2">Overall Score</span>
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle
                cx="18" cy="18" r="15.915"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="18" cy="18" r="15.915"
                fill="transparent"
                strokeWidth="3.5"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${getScoreColor(scorePercentage)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black font-manrope text-slate-900 dark:text-white">
                {scorePercentage}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Area */}
      <div className="flex-1 flex flex-col gap-6 w-full py-2">
        {/* Tabs */}
        {charFit && (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-fit mx-auto mb-2">
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'performance'
                  ? 'bg-[#003265] dark:bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('character_fit')}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'character_fit'
                  ? 'bg-[#003265] dark:bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Character Fit
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {(activeTab === 'performance' ? metrics : charFitMetrics).map((metric) => (
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
