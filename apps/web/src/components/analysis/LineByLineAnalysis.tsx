'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, BarChart3, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AnalysisLine = {
  id: string;
  line_number: number;
  start_time: number;
  end_time: number;
  original_text: string;
  transcript_text: string;
  score_emotion: number;
  score_facial: number;
  score_diction: number;
  score_pacing: number;
  score_eyes: number;
  score_intent: number;
  strength: string;
  improvement: string;
  analysis_errors: {
    id: string;
    error_type: 'mispronounced' | 'missing' | 'extra';
    word: string;
    suggestion?: string;
  }[];
};

type LineByLineAnalysisProps = {
  lines: AnalysisLine[];
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const renderHighlightedText = (text: string) => {
  if (!text) return '';
  const parts = text.split(/(\[MIS:.*?\]|\[MISS:.*?\]|\[EXTRA:.*?\])/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('[MIS:')) {
      const word = part.slice(5, -1);
      return <span key={i} className="text-amber-500 bg-amber-500/10 px-1 rounded mx-0.5 border-b border-amber-500/30 font-bold" title="Mispronounced">{word}</span>;
    }
    if (part.startsWith('[MISS:')) {
      const word = part.slice(6, -1);
      return <span key={i} className="text-red-500 bg-red-500/10 px-1 rounded mx-0.5 border-b border-red-500/30 font-bold" title="Missing">{word}</span>;
    }
    if (part.startsWith('[EXTRA:')) {
      const word = part.slice(7, -1);
      return <span key={i} className="text-blue-500 bg-blue-500/10 px-1 rounded mx-0.5 border-b border-blue-500/30 font-bold" title="Extra Word">{word}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

function LineAnalysisItem({ line }: { line: AnalysisLine }) {
  const [activeTab, setActiveTab] = useState<'criteria' | 'strength' | 'improvement'>('criteria');

  const tabs = [
    { id: 'criteria' as const, label: 'Analysis', icon: BarChart3 },
    { id: 'strength' as const, label: 'Strength', icon: Star },
    { id: 'improvement' as const, label: 'Growth', icon: TrendingUp },
  ];

  const metrics = [
    { label: 'Emotion', value: line.score_emotion },
    { label: 'Facial', value: line.score_facial },
    { label: 'Diction', value: line.score_diction },
    { label: 'Pacing', value: line.score_pacing },
    { label: 'Eyes', value: line.score_eyes },
    { label: 'Intent', value: line.score_intent },
  ];

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.06)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Left Column: Script Context */}
        <div className="space-y-8 lg:border-r lg:border-slate-50 lg:dark:border-slate-800/50 lg:pr-16">
          <div className="flex items-center gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-manrope shrink-0">{line.line_number}</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-lowest border border-outline-variant/10 rounded-full">
              <Clock size={12} className="text-primary" />
              <span className="text-[10px] font-manrope font-black tracking-[0.1em] text-slate-500 uppercase">
                [{formatTime(line.start_time || 0)} — {formatTime(line.end_time || 0)}]
              </span>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[9px] font-manrope font-black tracking-[0.1em] text-primary/40 uppercase">Original Text</span>
              <p className="text-xl font-manrope font-bold text-slate-800 italic leading-relaxed">
                “{renderHighlightedText(line.original_text)}”
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-[9px] font-manrope font-black tracking-[0.1em] text-slate-400 uppercase">Your Delivery</span>
              <p className="text-xl font-manrope font-bold text-slate-600 leading-relaxed">
                “{renderHighlightedText(line.transcript_text)}”
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback Console */}
        <div className="flex flex-col h-full">
          {/* 3-Tab Selector */}
          <div className="flex items-center p-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800 w-fit mb-8 self-center lg:self-start">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#003265] text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={12} strokeWidth={activeTab === tab.id ? 3 : 2} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col justify-center"
              >
                {activeTab === 'criteria' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-10">
                    {metrics.map((m) => (
                      <div key={m.label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-manrope font-black tracking-[0.1em] text-slate-400 uppercase">{m.label}</span>
                          <span className={`text-[11px] font-manrope font-black ${m.value > 80 ? 'text-green-600' : m.value > 60 ? 'text-amber-600' : 'text-red-600'}`}>{m.value}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${m.value > 80 ? 'bg-green-500' : m.value > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${m.value}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'strength' && (
                  <div className="flex items-start gap-4 bg-green-50/50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100/50 dark:border-green-900/20">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-manrope font-black tracking-[0.2em] text-green-800/60 uppercase mb-2">Director's Positive Note</h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-body italic">
                        {line.strength || "Excellent emotional consistency in this beat."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'improvement' && (
                  <div className="flex items-start gap-4 bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-manrope font-black tracking-[0.2em] text-amber-800/60 uppercase mb-2">Growth Opportunity</h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-body italic">
                        {line.improvement || "Consider deepening the subtext here to increase the impact of the following line."}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LineByLineAnalysis({ lines }: LineByLineAnalysisProps) {
  if (!lines || lines.length === 0) {
    return (
      <div className="p-12 text-center bg-surface-container-low rounded-[2rem] border border-outline-variant/10 text-on-surface-variant font-headline font-bold">
        No line analysis data available.
      </div>
    );
  }

  const sortedLines = [...lines].sort((a, b) => a.line_number - b.line_number);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 group">
        <h2 className="text-[10px] font-manrope font-black tracking-[0.3em] text-slate-400/60 uppercase">Line-by-Line Scene Breakdown</h2>
        <div className="h-px flex-1 bg-slate-100 hidden md:block group-hover:bg-primary/20 transition-colors duration-500"></div>
      </div>
      
      <div className="space-y-8">
        {sortedLines.map((line) => (
          <LineAnalysisItem key={line.id} line={line} />
        ))}
      </div>
    </div>
  );
}
