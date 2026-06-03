// apps/web/src/components/ProfileCard.tsx

import React from 'react';
import Image from 'next/image';
import { Clapperboard, Sparkles } from 'lucide-react';

interface ProfileData {
  imageUrl: string;
  name: string;
  email: string;
  averageScore: number | null;
  totalAttempts: number;
}

/**
 * Overhauled Profile Component matching the Stitch design.
 */
const ProfileCard: React.FC<{ data: ProfileData }> = ({ data }) => {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-8">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Image - Rounded Square */}
        <div className="relative w-10 h-10   lg:w-16 lg:h-16 shadow-lg">
          <Image
            src={data.imageUrl}
            alt={data.name}
            fill
            className="rounded-[9px] object-cover bg-slate-100"
          />
        </div>

        {/* User Info */}
        <div className="flex flex-col justify-center pt-2">
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-2xl lg:text-3xl font-manrope font-bold text-[#003265] tracking-tight">
              {data.name}
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium font-manrope">
            {data.email}
          </p>
        </div>
      </div>

      {/* 2. Metrics Section (Two separate cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Card 1: Total Sessions */}
        <div className="bg-[#f9f9ff] border border-slate-100 p-8 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-[220px]">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Total Sessions</p>
            <h2 className="text-6xl font-manrope font-black text-[#003265] leading-none mb-2">
              {data.totalAttempts}
            </h2>
          </div>

          <div className="w-full">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#003265] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((data.totalAttempts / 100) * 100, 100)}%` }}
              />
            </div>
            <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[8px] text-white">✓</span>
              Keep up the momentum
            </p>
          </div>

          {/* Floating Icon */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#d6e3ff] flex items-center justify-center text-[#003265] shadow-sm">
            <Clapperboard size={28} />
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-[#f9f9ff] border border-slate-100 p-8 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-[220px]">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Average Score</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl font-manrope font-black text-[#003265] leading-none">
                {data.averageScore !== null ? Math.round(data.averageScore) : 'N/A'}
              </h2>
              {data.averageScore !== null && (
                <span className="text-3xl font-manrope font-bold text-[#003265]">%</span>
              )}
            </div>
          </div>

          <div className="px-1">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#acf0dd] text-[11px] font-bold text-[#2c6f60] uppercase tracking-wide">
              Steady Performance
            </span>
          </div>

          {/* Floating Icon */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#acf0dd] flex items-center justify-center text-[#2c6f60] shadow-sm">
            <Sparkles size={28} />
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfileCard;