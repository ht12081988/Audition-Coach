import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import ProfileCard from '@/components/ProfileCard';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch performance analysis stats
  const { data: analyses, error } = await supabase
    .from('performance_analysis')
    .select('overall_score, status')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching profile stats:', error);
  }

  const completedAnalyses = analyses?.filter(a => a.status === 'completed') || [];
  const totalAttempts = analyses?.length || 0;
  
  const averageScore = completedAnalyses.length > 0
    ? completedAnalyses.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / completedAnalyses.length
    : null;

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Actor';

  const profileData = {
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00488D&color=fff&size=200`,
    name: fullName,
    email: user.email || 'Anonymous',
    averageScore: averageScore,
    totalAttempts: totalAttempts,
  };

  return (
    <div className="min-h-screen bg-[#f3f3f9] text-on-surface">
      <Header userEmail={user.email || undefined} />
      
      <main className="max-w-[1440px] mx-auto px-12 py-8 lg:py-12 flex flex-col items-center">
        <ProfileCard data={profileData} />
      </main>
    </div>
  );
}
