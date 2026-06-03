'use client';

import { Activity, Smile, Volume2, Target, Zap, Waves, Eye } from 'lucide-react';

export type Metric = {
  label: string;
  actorLabel: string;
  value: number;
  status: 'excellent' | 'developing' | 'strong' | 'good';
  icon: React.ElementType;
  isPrimary?: boolean;
};

type AnalysisMetricsProps = {
  score: number;
  averages: {
    emotion: number;
    facial: number;
    diction: number;
    pacing: number;
    eyes: number;
    intent: number;
  };
};

const getStatus = (val: number): Metric['status'] => {
  if (val >= 86) return 'excellent';
  if (val >= 61) return 'strong';
  if (val >= 31) return 'good';
  return 'developing';
};

const getActorMetricLabel = (label: string, value: number): string => {
  const normalizedLabel = label.toUpperCase();
  
  if (normalizedLabel.includes('OVERALL')) {
    if (value >= 86) return "Casting Quality";
    if (value >= 61) return "Performance Ready";
    if (value >= 31) return "Finding the Scene";
    return "First Read";
  }

  if (normalizedLabel.includes('EMOTION')) {
    if (value >= 76) return "Profound Resonance";
    if (value >= 51) return "Emotionally Truthful";
    if (value >= 26) return "Surface Level";
    return "Disconnected";
  }

  if (normalizedLabel.includes('FACIAL')) {
    if (value >= 76) return "Cinematic Nuance";
    if (value >= 51) return "Responsive";
    if (value >= 26) return "Indicating";
    return "Masked";
  }

  if (normalizedLabel.includes('DICTION')) {
    if (value >= 76) return "Theatrical Precision";
    if (value >= 51) return "Well-Articulated";
    if (value >= 26) return "Casual";
    return "Indistinct";
  }

  if (normalizedLabel.includes('PACING')) {
    if (value >= 76) return "Rhythmic Mastery";
    if (value >= 51) return "Dynamic Beats";
    if (value >= 26) return "Predictable";
    return "Monotonal";
  }

  if (normalizedLabel.includes('EYE')) {
    if (value >= 76) return "Magnetic Connection";
    if (value >= 51) return "Engaged Participant";
    if (value >= 26) return "Fleeting";
    return "Avoidant";
  }

  if (normalizedLabel.includes('INTENT')) {
    if (value >= 76) return "Richly Layered";
    if (value >= 51) return "Specific Objective";
    if (value >= 26) return "One-Dimensional";
    return "Vague";
  }

  return "Exploring";
};

export default function AnalysisMetrics({ score, averages }: AnalysisMetricsProps) {
  const metrics: Metric[] = [
    { label: 'EMOTION ALIGNMENT', actorLabel: getActorMetricLabel('EMOTION', averages.emotion), value: averages.emotion, status: getStatus(averages.emotion), icon: Activity },
    { label: 'FACIAL EXPRESSIVENESS', actorLabel: getActorMetricLabel('FACIAL', averages.facial), value: averages.facial, status: getStatus(averages.facial), icon: Smile },
    { label: 'DICTION & CLARITY', actorLabel: getActorMetricLabel('DICTION', averages.diction), value: averages.diction, status: getStatus(averages.diction), icon: Volume2 },
    { label: 'INTENT & SUBTEXT', actorLabel: getActorMetricLabel('INTENT', averages.intent), value: averages.intent, status: getStatus(averages.intent), icon: Zap },
    { label: 'PACING & RHYTHM', actorLabel: getActorMetricLabel('PACING', averages.pacing), value: averages.pacing, status: getStatus(averages.pacing), icon: Waves },
    { label: 'EYE CONTACT', actorLabel: getActorMetricLabel('EYE', averages.eyes), value: averages.eyes, status: getStatus(averages.eyes), icon: Eye },
    { label: 'OVERALL PERFORMANCE', actorLabel: getActorMetricLabel('OVERALL', score), value: score, status: getStatus(score), icon: Target, isPrimary: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div 
          key={metric.label}
          className={`relative group p-6 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-lg ${
            metric.isPrimary 
              ? 'bg-[#2b6fc2] text-white shadow-xl shadow-blue-900/10' 
              : 'bg-white dark:bg-slate-900/50 shadow-sm border border-outline-variant/10'
          }`}
        >
          {/* Abstract Background for Primary Card */}
          {metric.isPrimary && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent pointer-events-none"></div>
          )}
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                metric.isPrimary ? 'bg-white/10 text-white' : 'bg-primary/5 text-primary'
              }`}>
                <metric.icon size={20} strokeWidth={2} />
              </div>
              
              <span className={`text-[9px] font-headline font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                metric.isPrimary 
                  ? 'bg-blue-400/20 text-blue-100' 
                  : metric.status === 'developing' 
                    ? 'bg-red-50 text-red-600' 
                    : metric.status === 'excellent'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-blue-50 text-blue-600'
              }`}>
                {metric.status}
              </span>
            </div>

            <div>
              <span className={`text-[9px] font-headline font-black tracking-[0.2em] uppercase mb-1 block ${
                metric.isPrimary ? 'text-blue-100/60' : 'text-on-surface-variant/40'
              }`}>
                {metric.label}
              </span>
              
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-headline font-black tracking-tight">
                    {metric.value}
                  </span>
                  <span className="text-sm font-black opacity-40">%</span>
                </div>

                <div className={`text-[9px] font-headline font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg ${
                  metric.isPrimary ? 'bg-white/10 text-white' : 'bg-primary/5 text-primary'
                }`}>
                  {metric.actorLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
