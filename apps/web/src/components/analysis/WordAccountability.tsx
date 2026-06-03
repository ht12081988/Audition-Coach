'use client';

import { XCircle, VolumeX, PlusCircle } from 'lucide-react';

type AnalysisError = {
  id: string;
  error_type: 'mispronounced' | 'missing' | 'extra';
  word: string;
  suggestion?: string;
};

type AnalysisLine = {
  id: string;
  line_number: number;
  analysis_errors: AnalysisError[];
};

type WordAccountabilityProps = {
  lines: AnalysisLine[];
};

export default function WordAccountability({ lines }: WordAccountabilityProps) {
  // Aggregate errors from all lines
  const mispronounced = lines.flatMap(line => 
    line.analysis_errors
      .filter(e => e.error_type === 'mispronounced')
      .map(e => ({ ...e, line: line.line_number }))
  );
  
  const missing = lines.flatMap(line => 
    line.analysis_errors
      .filter(e => e.error_type === 'missing')
      .map(e => ({ ...e, line: line.line_number }))
  );
  
  const extra = lines.flatMap(line => 
    line.analysis_errors
      .filter(e => e.error_type === 'extra')
      .map(e => ({ ...e, line: line.line_number }))
  );

  const categories = [
    {
      title: 'MISPRONOUNCED',
      icon: VolumeX,
      color: 'amber',
      items: mispronounced,
    },
    {
      title: 'MISSING',
      icon: XCircle,
      color: 'red',
      items: missing,
    },
    {
      title: 'EXTRA',
      icon: PlusCircle,
      color: 'blue',
      items: extra,
    },
  ];

  const totalErrors = mispronounced.length + missing.length + extra.length;

  if (totalErrors === 0) {
    return (
      <div className="p-12 text-center bg-green-500/5 rounded-[2.5rem] border border-green-500/20">
        <h3 className="text-2xl font-headline font-black text-green-600 mb-2">Word Perfect!</h3>
        <p className="text-on-surface-variant font-body">No word-level discrepancies detected in this session.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div key={category.title} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.06)] border border-outline-variant/10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${
              category.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              category.color === 'red' ? 'bg-red-50 text-red-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              <category.icon size={18} strokeWidth={2} />
            </div>
            <h4 className="text-[10px] font-headline font-black tracking-[0.2em] text-on-surface-variant/60 uppercase">
              {category.title}
            </h4>
            <span className="ml-auto text-xs font-black opacity-20">{category.items.length}</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {category.items.length === 0 ? (
              <p className="text-xs font-headline font-bold text-on-surface-variant/20 uppercase tracking-widest text-center py-8">None detected</p>
            ) : (
              category.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/5 hover:border-outline-variant/20 transition-all">
                  <div>
                    <span className="text-base font-headline font-bold text-on-surface">{item.word}</span>
                    <p className="text-[10px] font-headline font-black tracking-widest text-on-surface-variant/40 mt-1 uppercase">
                      Line {item.line} {item.suggestion ? `• Suggestion: ${item.suggestion}` : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
