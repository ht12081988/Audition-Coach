'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type HeaderProps = {
  userEmail?: string;
};

export default function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-[#f3f3f9]/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/10 docked full-width top-0 sticky z-50">
      <div className="flex justify-between items-center px-12 py-6 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/practice" className="text-2xl font-black text-[#00488D] dark:text-blue-500 font-manrope">Audition Coach</Link>

          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
            <Link 
              className={`font-manrope tracking-tight font-semibold pb-1 transition-all cursor-pointer ${
                pathname === '/practice' 
                  ? 'text-[#00488D] border-b-2 border-[#00488D] dark:text-blue-400 dark:border-blue-400' 
                  : 'text-slate-500 hover:text-[#00488D] dark:text-slate-400'
              }`} 
              href="/practice"
            >
              Practice
            </Link>
            <Link 
              className={`font-manrope tracking-tight font-semibold pb-1 transition-all cursor-pointer ${
                pathname === '/history' 
                  ? 'text-[#00488D] border-b-2 border-[#00488D] dark:text-blue-400 dark:border-blue-400' 
                  : 'text-slate-500 hover:text-[#00488D] dark:text-slate-400'
              }`} 
              href="/history"
            >
              History
            </Link>
            <Link 
              className={`font-manrope tracking-tight font-semibold pb-1 transition-all cursor-pointer ${
                pathname === '/profile' 
                  ? 'text-[#00488D] border-b-2 border-[#00488D] dark:text-blue-400 dark:border-blue-400' 
                  : 'text-slate-500 hover:text-[#00488D] dark:text-slate-400'
              }`} 
              href="/profile"
            >
              Profile
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {userEmail && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{userEmail}</span>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 text-xs" title="Sign Out">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
