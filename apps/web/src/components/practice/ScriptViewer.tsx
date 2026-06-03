'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type Script = {
  id: string;
  category: string;
  scene_context: string;
  script: string;
};

export default function ScriptViewer({ scripts, onScriptChange }: { scripts: Script[]; onScriptChange?: (script: Script) => void }) {
  const categories = useMemo(() => {
    const cats = new Set(scripts.map((s) => s.category));
    return Array.from(cats).sort();
  }, [scripts]);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories.length > 0 ? categories[0] : ''
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredScripts = useMemo(() => {
    return scripts.filter((s) => s.category === selectedCategory);
  }, [scripts, selectedCategory]);

  const currentScript = filteredScripts[currentIndex] || null;

  const handleNextScene = () => {
    if (filteredScripts.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredScripts.length);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentIndex(0);
  };

  // Notify parent on script change
  useEffect(() => {
    if (currentScript && onScriptChange) {
      onScriptChange(currentScript);
    }
  }, [currentScript, onScriptChange]);

  if (!currentScript) {
    return (
      <div className="bg-surface-container-low p-10 lg:p-14 rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden group">
        <p className="text-on-surface-variant text-center">No scripts available.</p>
      </div>
    );
  }

  // Split script into paragraphs and infer speaker if possible
  const scriptLines = currentScript.script.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="bg-surface-container-low p-10 lg:p-14 rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden group flex flex-col h-full">
      
      {/* Controls */}
      <div className="flex justify-between items-center mb-10 relative z-10 bg-white/40 backdrop-blur-sm p-4 rounded-[2rem] border border-outline-variant/10">
        <div className="flex items-center gap-6 pl-4">
          <label htmlFor="category-select" className="font-manrope uppercase tracking-[0.2em] text-[10px] font-bold text-slate-500">Category</label>
          <div className="relative group/select">
            <select 
              id="category-select"
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="bg-transparent text-[#003265] text-sm font-manrope uppercase tracking-widest font-black pr-10 pl-2 py-1 focus:outline-none appearance-none cursor-pointer relative z-10"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown 
              size={18} 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#003265] pointer-events-none group-hover/select:translate-y-[-40%] transition-transform" 
            />
          </div>
        </div>
        <button 
          onClick={handleNextScene}
          className="bg-[#003265] text-white px-8 py-3 rounded-full font-manrope uppercase tracking-[0.15em] text-[10px] font-bold hover:bg-[#00488D] transition-all active:scale-[0.98] shadow-md"
        >
          Next
        </button>
      </div>

      {/* Script Metadata */}
      <div className="space-y-6 mb-12 relative z-10 flex-grow-0">
        <div>
          <p className="font-manrope uppercase tracking-[0.2em] text-[10px] text-slate-400 font-bold mb-3">Scene Context</p>
          <p className="text-xl text-slate-600 font-body leading-relaxed max-w-2xl italic text-balance">
            "{currentScript.scene_context}"
          </p>
        </div>
      </div>

      {/* Script Content */}
      <div className="space-y-6 font-body text-xl text-on-surface leading-[1.8] border-l-2 border-primary-fixed pl-8 relative z-10 flex-grow overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
        {scriptLines.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </div>
  );
}
