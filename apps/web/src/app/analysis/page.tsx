import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import AnalysisClientLayout from '@/components/analysis/AnalysisClientLayout';

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const supabase = await createClient();
  const { id } = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header userEmail={user.email} />

      <AnalysisClientLayout performanceId={id} />
    </div>
  );
}
