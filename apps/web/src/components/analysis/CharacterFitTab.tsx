'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, TrendingUp, UserCheck, Zap, Brain, Mic2,
  Camera, ChevronDown, ChevronUp, Award, AlertCircle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DimensionScore = {
  score: number | null;
  comment: string;
};

type ScreenPresenceScore = DimensionScore & {
  sub_scores: {
    camera_expressiveness: number | null;
    presentation_register: number | null;
    physical_precision: number | null;
    visual_world_coherence: number | null;
  };
};

export type CharacterFitData = {
  casting_fit_score: number;
  casting_label: string;
  archetype_score: number;
  archetype_comment: string;
  emotional_arc_score: number;
  emotional_arc_comment: string;
  status_score: number;
  status_comment: string;
  energy_score: number;
  energy_comment: string;
  psych_core_score: number;
  psych_core_comment: string;
  phys_vocal_score: number;
  phys_vocal_comment: string;
  screen_presence_score: number | null;
  screen_presence_comment: string | null;
  camera_expressiveness: number | null;
  presentation_register: number | null;
  physical_precision: number | null;
  visual_world_coherence: number | null;
  fit_vs_performance_gap: string | null;
  director_recommendation: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLabelStyle = (label: string) => {
  switch (label) {
    case 'Call them back':
      return { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-400/30' };
    case 'Strong consideration':
      return { bg: 'bg-blue-500', text: 'text-white', ring: 'ring-blue-400/30' };
    case 'Interesting but misaligned':
      return { bg: 'bg-amber-500', text: 'text-white', ring: 'ring-amber-400/30' };
    default: // Not the right fit
      return { bg: 'bg-rose-500', text: 'text-white', ring: 'ring-rose-400/30' };
  }
};

const getScoreColor = (score: number | null) => {
  if (score == null) return 'text-on-surface-variant/40';
  if (score >= 81) return 'text-emerald-600';
  if (score >= 61) return 'text-blue-600';
  if (score >= 41) return 'text-amber-600';
  return 'text-rose-600';
};

const getScoreBg = (score: number | null) => {
  if (score == null) return 'bg-surface-container';
  if (score >= 81) return 'bg-emerald-50';
  if (score >= 61) return 'bg-blue-50';
  if (score >= 41) return 'bg-amber-50';
  return 'bg-rose-50';
};

const getBarColor = (score: number | null) => {
  if (score == null) return 'bg-outline-variant/20';
  if (score >= 81) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
  if (score >= 61) return 'bg-gradient-to-r from-blue-400 to-blue-500';
  if (score >= 41) return 'bg-gradient-to-r from-amber-400 to-amber-500';
  return 'bg-gradient-to-r from-rose-400 to-rose-500';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number | null }) {
  return (
    <div className="h-1.5 w-full bg-outline-variant/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score ?? 0}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className={`h-full rounded-full ${getBarColor(score)}`}
      />
    </div>
  );
}

function DimensionCard({
  icon: Icon,
  label,
  score,
  comment,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  score: number | null;
  comment: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-[1.5rem] border border-outline-variant/10 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${getScoreBg(score)}`}>
            <Icon size={17} className={getScoreColor(score)} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-headline font-black tracking-[0.2em] uppercase text-on-surface-variant/50">
            {label}
          </span>
        </div>
        <div className={`text-2xl font-headline font-black ${getScoreColor(score)} flex-shrink-0`}>
          {score != null ? score : '–'}
        </div>
      </div>

      <ScoreBar score={score} />

      <p className="text-sm font-body text-on-surface-variant leading-relaxed">
        {comment}
      </p>
    </motion.div>
  );
}

function SubScoreRow({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-headline font-black tracking-[0.15em] uppercase text-on-surface-variant/50">
          {label}
        </span>
        <span className={`text-sm font-headline font-black ${getScoreColor(score)}`}>
          {score != null ? `${score}` : '–'}
        </span>
      </div>
      <ScoreBar score={score} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CharacterFitTab({ data }: { data: CharacterFitData }) {
  const labelStyle = getLabelStyle(data.casting_label);

  const dimensions = [
    {
      icon: Star,
      label: 'Archetype Embodiment',
      score: data.archetype_score,
      comment: data.archetype_comment,
    },
    {
      icon: TrendingUp,
      label: 'Emotional Arc Fidelity',
      score: data.emotional_arc_score,
      comment: data.emotional_arc_comment,
    },
    {
      icon: UserCheck,
      label: 'Status Portrayal',
      score: data.status_score,
      comment: data.status_comment,
    },
    {
      icon: Zap,
      label: 'Energy Signature Match',
      score: data.energy_score,
      comment: data.energy_comment,
    },
    {
      icon: Brain,
      label: 'Psychological Core Visibility',
      score: data.psych_core_score,
      comment: data.psych_core_comment,
    },
    {
      icon: Mic2,
      label: 'Physical & Vocal Alignment',
      score: data.phys_vocal_score,
      comment: data.phys_vocal_comment,
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* ── Hero: Casting Fit Score ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#112260] to-[#1a3a7c] rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/20"
      >
        {/* Glow accent */}
        <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[150%] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">

          {/* Score ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#fitGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - data.casting_fit_score / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="fitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-headline font-black text-white">{data.casting_fit_score}</span>
              <span className="text-xs font-black text-white/40 tracking-widest uppercase">Fit</span>
            </div>
          </div>

          {/* Label + details */}
          <div className="flex-1 space-y-5 text-center md:text-left">
            <div>
              <p className="text-[10px] font-headline font-black tracking-[0.3em] uppercase text-white/30 mb-2">
                Character Fit Assessment
              </p>
              <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-headline font-black ring-4 ${labelStyle.bg} ${labelStyle.text} ${labelStyle.ring}`}>
                <Award size={15} />
                {data.casting_label}
              </span>
            </div>

            {data.fit_vs_performance_gap && (
              <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10">
                <p className="text-[9px] font-headline font-black tracking-[0.25em] uppercase text-white/30 mb-1.5">
                  Performance vs. Character Fit
                </p>
                <p className="text-sm font-body text-white/70 leading-relaxed">
                  {data.fit_vs_performance_gap}
                </p>
              </div>
            )}

            {data.director_recommendation && (
              <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10">
                <p className="text-[9px] font-headline font-black tracking-[0.25em] uppercase text-white/30 mb-1.5">
                  Director's Recommendation
                </p>
                <p className="text-sm font-body text-white/80 leading-relaxed font-medium">
                  {data.director_recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Six Core Dimensions ─────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-headline font-black tracking-[0.3em] text-on-surface-variant/40 uppercase">
          Dimension Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dimensions.map((dim, i) => (
            <DimensionCard
              key={dim.label}
              icon={dim.icon}
              label={dim.label}
              score={dim.score}
              comment={dim.comment}
              delay={i * 0.07}
            />
          ))}
        </div>
      </section>

      {/* ── Screen Presence ─────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-headline font-black tracking-[0.3em] text-on-surface-variant/40 uppercase">
          Screen Presence & Visual Fit
        </h2>

        {data.screen_presence_score == null && data.screen_presence_comment ? (
          <div className="flex items-start gap-4 bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-body text-amber-800 leading-relaxed">
              {data.screen_presence_comment}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[1.5rem] border border-outline-variant/10 p-8 shadow-sm space-y-8"
          >
            {/* Overall screen presence score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getScoreBg(data.screen_presence_score)}`}>
                  <Camera size={18} className={getScoreColor(data.screen_presence_score)} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-headline font-black tracking-[0.2em] uppercase text-on-surface-variant/40">
                    Overall Screen Presence
                  </p>
                  {data.screen_presence_comment && (
                    <p className="text-sm font-body text-on-surface-variant mt-0.5 leading-snug">
                      {data.screen_presence_comment}
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-3xl font-headline font-black ${getScoreColor(data.screen_presence_score)}`}>
                {data.screen_presence_score ?? '–'}
              </span>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-outline-variant/10">
              <SubScoreRow label="Camera Expressiveness" score={data.camera_expressiveness} />
              <SubScoreRow label="Presentation Register" score={data.presentation_register} />
              <SubScoreRow label="Physical Precision Match" score={data.physical_precision} />
              <SubScoreRow label="Visual World Coherence" score={data.visual_world_coherence} />
            </div>
          </motion.div>
        )}
      </section>

    </div>
  );
}
