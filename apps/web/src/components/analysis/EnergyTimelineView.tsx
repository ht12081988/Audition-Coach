'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Brush
} from 'recharts';
import { AnalysisLine } from '@/lib/utils/performance-analytics';
import { TrendingUp, Volume2, Activity } from 'lucide-react';

interface EnergyTimelineViewProps {
  lines: AnalysisLine[];
}

export default function EnergyTimelineView({ lines }: EnergyTimelineViewProps) {
  const chartData = lines.map((line, index) => ({
    line: `Line ${index + 1}`,
    intensity: (line.score_emotion + line.score_intent) / 2,
    emotion: line.score_emotion,
    diction: line.score_diction,
    stamina: (line.score_facial + line.score_eyes) / 2,
    rawLine: index + 1,
    originalLineNumber: line.line_number
  }));

  // If there are many lines, we want the brush to show the full scene overview
  const showBrush = lines.length > 8;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Emotional Arc Chart */}
      <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <TrendingUp size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-headline font-black tracking-[0.2em] uppercase">Emotional Arc Mapping</h3>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-1">Intensity vs Sequence</p>
            </div>
          </div>
          <div className="px-6 py-3 rounded-2xl bg-surface-container-high border border-outline-variant/10">
            <p className="text-[10px] font-headline font-black text-on-surface-variant/60 uppercase tracking-widest">
              Peak Intensity Found at <span className="text-primary">Line {chartData.reduce((prev, current) => (prev.intensity > current.intensity) ? prev : current).rawLine}</span>
            </p>
          </div>
        </div>

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00488D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00488D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="rawLine" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                tickFormatter={(val) => `Line ${val}`}
                axisLine={false}
                tickLine={false}
                interval={0}
                padding={{ left: 30, right: 30 }}
              />
              <YAxis 
                hide 
                domain={[0, 100]} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontSize: '12px' }}
                itemStyle={{ color: '#00488D', fontWeight: 800 }}
              />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                stroke="#00488D" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorIntensity)" 
                animationDuration={2000}
              />
              {showBrush && (
                <Brush 
                  dataKey="rawLine" 
                  height={40} 
                  stroke="#00488D" 
                  fill="#f8fafc"
                  travellerWidth={10}
                  gap={1}
                >
                  <AreaChart>
                    <Area dataKey="intensity" fill="#00488D" stroke="none" fillOpacity={0.2} />
                  </AreaChart>
                </Brush>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant/40 font-headline font-black uppercase tracking-widest leading-loose">
          <Activity size={14} />
          <span>{showBrush ? 'Slide the navigation bar above to focus on specific beats.' : 'The Slope indicates your emotional build-up. Aim for a graduated incline to the climax.'}</span>
        </div>
      </div>

      {/* Diction vs Emotion Sync Chart */}
      <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Volume2 size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-headline font-black tracking-[0.2em] uppercase">Articulated Passion</h3>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-1">Diction vs Emotion Trade-off</p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="rawLine" 
                type="number"
                domain={['dataMin', 'dataMax']}
                hide
              />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                name="Emotion" 
                type="monotone" 
                dataKey="emotion" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={false}
                strokeDasharray="5 5"
              />
              <Line 
                name="Diction" 
                type="monotone" 
                dataKey="diction" 
                stroke="#00488D" 
                strokeWidth={3} 
                dot={{ fill: '#00488D', r: 4 }} 
                activeDot={{ r: 8 }}
              />
              {showBrush && (
                <Brush 
                  dataKey="rawLine" 
                  height={30} 
                  stroke="#00488D" 
                  fill="#f8fafc"
                  travellerWidth={10}
                >
                  <LineChart>
                    <Line dataKey="diction" stroke="#00488D" strokeWidth={1} dot={false} />
                  </LineChart>
                </Brush>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-on-surface-variant/60 font-body mt-6 text-center italic">
          Watch for points where the **Red Emotion** line spikes above the **Blue Diction** line. 
          Those are moments where you may be "mumbling" into your emotion.
        </p>
      </div>

      {/* Performance Stamina Chart */}
      <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-outline-variant/10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Activity size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-headline font-black tracking-[0.2em] uppercase">Performance Stamina</h3>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-1">Visual Engagement & Endurance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/20">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-headline font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Third-Act Warning Zone</span>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorStamina" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="rawLine" 
                type="number"
                domain={['dataMin', 'dataMax']}
                hide
              />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontSize: '12px' }}
                itemStyle={{ color: '#d97706', fontWeight: 800 }}
              />
              {/* Highlight the last 20% of the lines as the Third Act */}
              <Area 
                type="monotone" 
                dataKey="stamina" 
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorStamina)" 
                animationDuration={2500}
              />
              {showBrush && (
                <Brush 
                  dataKey="rawLine" 
                  height={30} 
                  stroke="#f59e0b" 
                  fill="#fffbeb"
                  travellerWidth={10}
                >
                  <AreaChart>
                    <Area dataKey="stamina" fill="#f59e0b" stroke="none" fillOpacity={0.2} />
                  </AreaChart>
                </Brush>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50">
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            <span className="font-black text-amber-600 uppercase tracking-tighter mr-2">Coach Insight:</span>
            Your **Stamina** tracks visual focus (Eye Contact & Facial Expressions). 
            If the line drops significantly in the final 20% of your scene, you are losing early-round engagement. 
            **Actors win roles in the final beats—finish with the same intensity you started with.**
          </p>
        </div>
      </div>
    </div>
  );
}
