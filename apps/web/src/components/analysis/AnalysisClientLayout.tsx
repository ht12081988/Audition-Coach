'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, MoreHorizontal, Loader2, PlayCircle, AlertCircle, TrendingUp, Target, BookOpen, Film, Mic2, Eye, BarChart2, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AnalysisMetrics from '@/components/analysis/AnalysisMetrics';
import LineByLineAnalysis from '@/components/analysis/LineByLineAnalysis';
import WordAccountability from '@/components/analysis/WordAccountability';
import PerformanceRadarView from '@/components/analysis/PerformanceRadarView';
import EnergyTimelineView from '@/components/analysis/EnergyTimelineView';
import { calculatePerformanceStats } from '@/lib/utils/performance-analytics';
import { createClient } from '@/lib/supabase/client';
import { analyzePerformanceAction } from '@/app/actions/performance';
import { toast } from 'sonner';

type AnalysisClientLayoutProps = {
  performanceId?: string;
};

type TabId = 'lines' | 'energy' | 'radar' | 'notes';

export default function AnalysisClientLayout({ performanceId }: AnalysisClientLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('lines');
  const supabase = createClient();

  const fetchAnalysis = async () => {
    if (!performanceId) return;

    try {
      const { data: analysis, error } = await supabase
        .from('performance_analysis')
        .select(`
          *,
          analysis_lines (
            *,
            analysis_errors (*)
          )
        `)
        .eq('performance_id', performanceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (analysis) {
        setData(analysis);
        if (analysis.status === 'processing') {
          setTimeout(fetchAnalysis, 3000);
        }
      }
    } catch (err: any) {
      console.error('Error fetching analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [performanceId]);

  const handleStartAnalysis = async () => {
    if (!performanceId) return;
    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzePerformanceAction(performanceId);
      if (result.success) {
        toast.success('Analysis started', {
          description: 'Our AI coach is reviewing your performance now.'
        });
        fetchAnalysis();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      const isHighDemand = err.message?.includes('high demand') || err.message?.includes('503');
      
      toast.error(isHighDemand ? 'AI Director Busy' : 'Analysis failed', {
        description: err.message
      });
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-vh-[60vh] gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-headline font-black text-on-surface-variant/40 tracking-widest uppercase text-xs">Retrieving Analytics...</p>
      </div>
    );
  }

  if (!performanceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/20">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-headline font-black text-on-surface">No Performance Selected</h2>
          <p className="text-on-surface-variant leading-relaxed font-body text-lg">
            Please record or upload a performance first to see your detailed coaching analysis.
          </p>
        </div>
        <Link href="/practice" className="px-10 h-14 rounded-full bg-primary text-on-primary font-headline font-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/20">
          Start Practicing
        </Link>
      </div>
    );
  }

  if (!data || data.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-vh-[60vh] gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-headline font-black text-on-surface-variant/40 tracking-widest uppercase text-xs">Preparing Analysis...</p>
      </div>
    );
  }

  if (data.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-headline font-black text-on-surface">Analysis Failed</h2>
          <p className="text-on-surface-variant leading-relaxed font-body">
            {error || 'An unexpected error occurred during analysis.'}
          </p>
        </div>
        <button 
          onClick={handleStartAnalysis}
          className="px-10 h-14 rounded-full bg-primary text-on-primary font-headline font-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/20"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (data.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-0 max-w-lg mx-auto px-6">
        <ProcessingStepsView />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'lines', label: 'Line-by-line Breakdown', icon: BookOpen },
    { id: 'energy', label: 'Energy Timeline', icon: TrendingUp },
    { id: 'radar', label: 'Performance', icon: Target },
    { id: 'notes', label: 'Director\'s Notes', icon: MoreHorizontal },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-1000">

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-outline-variant/10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">

          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/practice"
              className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-colors border border-outline-variant/20 group shrink-0"
              title="Back to Practice"
            >
              <ArrowLeft size={24} strokeWidth={2} className="text-on-surface-variant group-hover:text-primary transition-colors" />
            </Link>
            <h2 className="text-5xl md:text-6xl font-headline font-black tracking-tight text-on-surface">Performance Analysis</h2>
          </div>

        </div>


      </div>

      {/* Global Performance Metrics */}
      <section className="space-y-8">
        <h2 className="text-[10px] font-headline font-black tracking-[0.3em] text-on-surface-variant/40 uppercase">Global Performance Metrics</h2>
        <AnalysisMetrics
          score={data.overall_score}
          averages={{
            emotion: data.emotion_avg,
            facial: data.facial_avg,
            diction: data.diction_avg,
            pacing: data.pacing_avg,
            eyes: data.eyes_avg,
            intent: data.intent_avg
          }}
        />
      </section>

      {/* Analytics Calculation */}
      {(() => {
        const stats = calculatePerformanceStats(data.analysis_lines || []);

        return (
          <section className="space-y-12">
            {/* Sticky Tabs Navigation */}
            <div className="sticky top-[88px] z-40 py-4 -mx-6 px-6 bg-[#f3f3f9]/40 backdrop-blur-md border-b border-transparent transition-all duration-300">
              <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-surface-container-high/50 border border-outline-variant/10 w-fit mx-auto shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-3 rounded-full text-sm font-headline font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                      ? 'bg-white text-on-surface shadow-soft scale-105'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50'
                      }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'lines' && (
                    <div className="space-y-16">
                      <LineByLineAnalysis lines={data.analysis_lines || []} />

                      {/* Word Accountability shown in the Breakdown tab */}
                      <div className="space-y-10 pt-16 border-t border-outline-variant/10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                          <h2 className="text-[10px] font-headline font-black tracking-[0.3em] text-on-surface-variant/40 uppercase">Vocabulary & Accountability Summary</h2>
                          <div className="h-px flex-1 bg-outline-variant/10 hidden md:block"></div>
                        </div>
                        <WordAccountability lines={data.analysis_lines || []} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'energy' && (
                    <EnergyTimelineView lines={data.analysis_lines || []} />
                  )}

                  {activeTab === 'radar' && (
                    <PerformanceRadarView stats={stats} />
                  )}

                   {activeTab === 'notes' && (
                    <div className="animate-in slide-in-from-bottom-8 duration-700">
                      <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-outline-variant/10 p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <MoreHorizontal size={24} />
                          </div>
                          <div className="space-y-4 flex-1">
                            <h3 className="text-[10px] font-headline font-black tracking-[0.4em] uppercase text-on-surface-variant/40">Director&apos;s Final Takeaways</h3>
                            <ul className="space-y-3">
                              {(data.directors_notes || 'Your performance shows great potential. Focus on consistent emotional pacing across all beats.')
                                .split(/[.!?]\s+/)
                                .filter((s: string) => s.trim().length > 0)
                                .map((sentence: string, idx: number) => (
                                  <li key={idx} className="flex gap-3 text-sm md:text-base font-body text-on-surface leading-snug">
                                    <span className="text-blue-500 font-black">•</span>
                                    <span>{sentence.trim()}{!sentence.trim().endsWith('.') && '.'}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Additional Context for Notes Tab */}
                      {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-outline-variant/10">
                          <h4 className="text-xs font-headline font-black tracking-widest text-primary uppercase mb-6">Actionable Advice</h4>
                          <p className="text-lg font-body text-on-surface-variant leading-relaxed">
                            {stats.wordIntegrityRate < 95 
                              ? "Re-read the script once without acting to focus purely on diction. Your word integrity rate is below professional grade."
                              : "Great job on the script accuracy. Now focus on deepening the subtext and emotional nuance of the transition beats."}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-outline-variant/10">
                          <h4 className="text-xs font-headline font-black tracking-widest text-primary uppercase mb-6">Growth Trajectory</h4>
                          <p className="text-lg font-body text-on-surface-variant leading-relaxed">
                            Your stability score is <span className={stats.stabilityScore > 80 ? "text-green-600 font-black" : "text-amber-600 font-black"}>
                              {Math.round(stats.stabilityScore)}%
                            </span>. {stats.stabilityScore > 80 ? "This indicates a professional-level command of your character." : "Work on maintaining focus through the longer silences."}
                          </p>
                        </div>
                      </div>*/}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        );
      })()}

    </main>
  );
}

// ─── Processing Steps for /analysis page ─────────────────────────────────────
const PROCESSING_STEPS = [
  {
    icon: Film,
    label: 'Uploading to AI Engine',
    detail: 'Securely streaming your rehearsal to the Gemini processing cluster.',
    duration: 18,
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-purple-500/30',
  },
  {
    icon: Mic2,
    label: 'Transcribing Dialogue',
    detail: 'Extracting every spoken word and mapping it to the script lines.',
    duration: 22,
    color: 'from-sky-500 to-blue-600',
    glow: 'shadow-blue-500/30',
  },
  {
    icon: Eye,
    label: 'Reading Micro-Expressions',
    detail: 'Scanning facial cues, eye contact, and body language frame-by-frame.',
    duration: 25,
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-teal-500/30',
  },
  {
    icon: BarChart2,
    label: 'Scoring Performance Metrics',
    detail: 'Calculating emotion, diction, pacing, and intent scores per line.',
    duration: 18,
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-orange-500/30',
  },
  {
    icon: Sparkles,
    label: "Compiling Director's Report",
    detail: 'Assembling insights and crafting your personalised coaching feedback.',
    duration: 7,
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/30',
  },
];

function ProcessingStepsView() {
  const [step, setStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    const totalSteps = PROCESSING_STEPS.length;
    if (step >= totalSteps) return;

    const stepDuration = PROCESSING_STEPS[step].duration * 1000;
    const tickInterval = 50;
    const ticks = stepDuration / tickInterval;
    let tick = 0;

    const timer = setInterval(() => {
      tick += 1;
      const pct = Math.min((tick / ticks) * 100, 100);
      setStepProgress(pct);

      if (tick >= ticks) {
        clearInterval(timer);
        if (step < totalSteps - 1) {
          setStep(s => s + 1);
          setStepProgress(0);
        }
      }
    }, tickInterval);

    return () => clearInterval(timer);
  }, [step]);

  const current = PROCESSING_STEPS[Math.min(step, PROCESSING_STEPS.length - 1)];
  const CurrentIcon = current.icon;
  const totalSeconds = PROCESSING_STEPS.reduce((a, s) => a + s.duration, 0);
  const elapsedSeconds =
    PROCESSING_STEPS.slice(0, step).reduce((a, s) => a + s.duration, 0) +
    (current.duration * stepProgress) / 100;
  const overallPct = Math.min((elapsedSeconds / totalSeconds) * 100, 99);

  return (
    <div className="w-full">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-[2.5rem] p-10 shadow-xl"
      >
        {/* Animated icon */}
        <div className="flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0, rotate: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center shadow-2xl ${current.glow}`}
            >
              <CurrentIcon size={38} className="text-white" strokeWidth={1.5} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Label & detail */}
        <div className="text-center mb-8 min-h-[4.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-headline font-black text-on-surface tracking-tight mb-1">
                {current.label}
              </h2>
              <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                {current.detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${current.color}`}
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-manrope font-bold text-on-surface-variant/40 tracking-widest uppercase">
            <span>Step {step + 1} of {PROCESSING_STEPS.length}</span>
            <span>{Math.round(stepProgress)}%</span>
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-3">
          {PROCESSING_STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isComplete = i < step;
            const isActive = i === step;
            return (
              <motion.div
                key={i}
                animate={{ opacity: isComplete || isActive ? 1 : 0.3 }}
                className="flex items-center gap-4"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  isComplete
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : isActive
                    ? `bg-gradient-to-br ${s.color} text-white shadow-md ${s.glow}`
                    : 'bg-surface-container text-on-surface-variant/30'
                }`}>
                  {isComplete ? (
                    <CheckCircle size={16} strokeWidth={2.5} />
                  ) : (
                    <StepIcon size={14} strokeWidth={isActive ? 2 : 1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-headline font-bold truncate transition-colors duration-300 ${
                    isActive ? 'text-on-surface' : isComplete ? 'text-emerald-600' : 'text-on-surface-variant/30'
                  }`}>
                    {s.label}
                  </p>
                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.4 }}
                      className={`h-0.5 mt-1 rounded-full bg-gradient-to-r ${s.color}`}
                    />
                  )}
                </div>
                {isComplete && (
                  <span className="text-[10px] font-manrope font-black text-emerald-500 tracking-widest uppercase">Done</span>
                )}
                {isActive && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(d => (
                      <motion.span
                        key={d}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.18 }}
                        className="w-1.5 h-1.5 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Overall progress */}
      <div className="mt-5 px-2">
        <div className="h-1 bg-outline-variant/20 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
            animate={{ width: `${overallPct}%` }}
            transition={{ ease: 'linear', duration: 0.1 }}
          />
        </div>
        <p className="text-center text-[10px] font-manrope font-bold text-on-surface-variant/40 tracking-widest uppercase">
          Overall · {Math.round(overallPct)}% complete
        </p>
      </div>
    </div>
  );
}
