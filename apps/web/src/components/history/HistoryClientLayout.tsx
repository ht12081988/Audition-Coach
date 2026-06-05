'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Film, LayoutGrid, Plus, History, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PerformanceRow from './PerformanceRow';

export type Performance = {
  id: string;
  created_date_time: string;
  video_url: string;
  script: {
    id: string;
    category: string;
    scene_context: string;
    script: string;
  };
  performance_analysis: {
    id: string;
    overall_score: number;
    emotion_avg: number;
    facial_avg: number;
    diction_avg: number;
    pacing_avg: number;
    eyes_avg: number;
    intent_avg: number;
    status: string;
    directors_notes: string | null;
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

export type HistoryClientLayoutProps = {
  initialPerformances: Performance[];
};

export default function HistoryClientLayout({ initialPerformances }: HistoryClientLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedScripts, setExpandedScripts] = useState<Set<string>>(new Set());

  const toggleScript = (scriptId: string) => {
    setExpandedScripts((prev) => {
      const next = new Set(prev);
      if (next.has(scriptId)) {
        next.delete(scriptId);
      } else {
        next.add(scriptId);
      }
      return next;
    });
  };

  const categories = useMemo(() => {
    const cats = new Set(initialPerformances.map((p) => p.script.category));
    return ['All', ...Array.from(cats)].sort();
  }, [initialPerformances]);

  const filteredPerformances = useMemo(() => {
    return initialPerformances.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.script.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();

      let matchesSearch = true;
      if (query.length >= 3) {
        matchesSearch =
          p.script.scene_context.toLowerCase().includes(query) ||
          p.script.script.toLowerCase().includes(query);
      }

      return matchesCategory && matchesSearch;
    });
  }, [initialPerformances, searchQuery, selectedCategory]);

  const groupedPerformances = useMemo(() => {
    const groups: { [key: string]: { script: Performance['script']; performances: Performance[] } } = {};

    filteredPerformances.forEach((p) => {
      if (!groups[p.script.id]) {
        groups[p.script.id] = {
          script: p.script,
          performances: [],
        };
      }
      groups[p.script.id].performances.push(p);
    });

    return Object.values(groups).sort((a, b) =>
      b.performances[0].created_date_time.localeCompare(a.performances[0].created_date_time)
    );
  }, [filteredPerformances]);

  return (
    <div className="relative min-h-screen pt-12">
      <div className="relative z-10 space-y-20 pb-32">
        {/* Editorial Header - Added padding-top to avoid header overlap */}
        <div className="max-w-4xl space-y-4 px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
            performance archive
          </span>
          <h1 className="text-6xl font-black tracking-tighter font-manrope text-[#003265] dark:text-white leading-[1.05]">
            Your Journey to Mastery
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
            Review your growth across every rehearsal. Every slight adjustment in diction and every shift in intention is recorded for your evolution.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center max-w-screen-xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search scripts... (min. 3 characters)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="relative group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-8 pr-14 py-4.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-slate-900 dark:text-white font-black appearance-none cursor-pointer text-xs tracking-wider"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Category' : cat.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Grouped Script Sections */}
        <div className="space-y-32">
          {groupedPerformances.length > 0 ? (
            groupedPerformances.map((group) => {
              // Extract a clean title from context and first part of script
              const shortScript = group.script.script.split('\n')[0].split('. ')[0].substring(0, 40);
              const cleanTitle = group.script.scene_context.split('\n')[0].substring(0, 60);

              return (
                <div key={group.script.id} className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.06)] group">
                  {/* Script Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-12">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-[#003265] dark:text-white font-manrope tracking-tight leading-[1.1]">
                        {cleanTitle}
                      </h2>
                      <p className="italic font-bold text-lg text-slate-500 dark:text-slate-400">
                        "{shortScript}..."
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 rounded-lg">
                          {group.script.category}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-2 text-left md:text-right">
                      <div className="inline-flex flex-col">
                        <span className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                          PROGRESSED OVER
                        </span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-manrope">
                          {group.performances.length} ATTEMPT{group.performances.length > 1 ? 'S' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Cards - Simplified nested cards */}
                  <div className="space-y-6">
                    {/* Show first (latest) performance always */}
                    <div key={group.performances[0].id} className="relative">
                      <PerformanceRow performance={group.performances[0]} />
                    </div>

                    {/* Expandable previous attempts */}
                    {group.performances.length > 1 && (
                      <div className="flex flex-col">
                        <AnimatePresence mode="wait">
                          {expandedScripts.has(group.script.id) && (
                            <motion.div
                              key="expanded-content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                              className="overflow-hidden space-y-6 pt-6"
                            >
                              {group.performances.slice(1).map((perf) => (
                                <div key={perf.id} className="relative">
                                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-px bg-slate-100 dark:bg-slate-800" />
                                  <PerformanceRow performance={perf} />
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={() => toggleScript(group.script.id)}
                          className="mt-8 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors self-center bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-full border border-slate-100 dark:border-slate-800 cursor-pointer group/toggle"
                        >
                          {expandedScripts.has(group.script.id) ? (
                            <>
                              <ChevronUp size={14} className="group-hover/toggle:-translate-y-0.5 transition-transform" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <History size={14} className="group-hover/toggle:rotate-[-45deg] transition-transform" />
                              <span>See {group.performances.length - 1} previous attempt{group.performances.length > 2 ? 's' : ''}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] mb-8">
                <LayoutGrid size={64} className="text-slate-200 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-500">Empty Archive</h3>
              <p className="text-slate-400 dark:text-slate-600 mt-2">No matching performances recorded yet.</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col items-center gap-12 pt-16 border-t border-slate-200/40 dark:border-slate-800">
          <div className="text-center">
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
              end of performance history
            </span>
          </div>

          <Link
            href="/practice"
            className="flex items-center gap-4 text-[#003265] dark:text-blue-400 font-black hover:gap-6 transition-all group py-1"
          >
            <Plus size={20} className="text-blue-600" />
            <span className="group-hover:translate-x-1 transition-transform tracking-tight">START NEW PERFORMANCE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
