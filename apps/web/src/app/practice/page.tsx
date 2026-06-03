import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogOut, Video } from 'lucide-react';
import Link from 'next/link';
import ScriptViewer from '@/components/practice/ScriptViewer';
import PracticeClientLayout from '@/components/practice/PracticeClientLayout';
import Header from '@/components/layout/Header';

export default async function PracticePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: scripts, error } = await supabase
    .from('script')
    .select('*')
    .order('created_date_time', { ascending: false });

  if (error) {
    console.error('Error fetching scripts:', error);
  }


  return (
    <>
      <Header userEmail={user.email} />

      <main className="max-w-screen-2xl mx-auto px-8 py-12 lg:py-20 selection:bg-primary-fixed selection:text-on-primary-fixed">


        {/* Two Column Layout Integrated into a client component for state management */}
        <PracticeClientLayout 
          scripts={scripts as any || []} 
          user={user} 
        />
      </main>
    </>
  );
}
