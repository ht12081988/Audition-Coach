import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import HistoryClientLayout, { Performance } from '@/components/history/HistoryClientLayout';

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch only performances that have a completed analysis
  const { data: rawPerformances, error } = await supabase
    .from('performance')
    .select(`
      id,
      created_date_time,
      video_url,
      script!inner (
        id,
        category,
        scene_context,
        script
      ),
      performance_analysis!inner (
        id,
        overall_score,
        emotion_avg,
        facial_avg,
        diction_avg,
        pacing_avg,
        eyes_avg,
        intent_avg,
        status,
        directors_notes
      )
    `)
    .eq('user_id', user.id)
    .eq('performance_analysis.status', 'completed')
    .order('created_date_time', { ascending: false });

  if (error) {
    console.error('Error fetching history:', error);
  }

  // Format data to ensure script and analysis are objects, not arrays
  const performances: Performance[] = (rawPerformances || []).map((p: any) => {
    const script = Array.isArray(p.script) ? p.script[0] : p.script;
    const analysis = Array.isArray(p.performance_analysis) ? p.performance_analysis[0] : p.performance_analysis;

    return {
      id: p.id,
      created_date_time: p.created_date_time,
      video_url: p.video_url,
      script: {
        id: script?.id || '',
        category: script?.category || '',
        scene_context: script?.scene_context || '',
        script: script?.script || '',
      },
      performance_analysis: {
        id: analysis?.id || '',
        overall_score: Number(analysis?.overall_score || 0),
        emotion_avg: Number(analysis?.emotion_avg || 0),
        facial_avg: Number(analysis?.facial_avg || 0),
        diction_avg: Number(analysis?.diction_avg || 0),
        pacing_avg: Number(analysis?.pacing_avg || 0),
        eyes_avg: Number(analysis?.eyes_avg || 0),
        intent_avg: Number(analysis?.intent_avg || 0),
        status: analysis?.status || '',
        directors_notes: analysis?.directors_notes || null,
      },
    };
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header userEmail={user.email || undefined} />
      
      <main className="max-w-screen-2xl mx-auto px-8 py-12 lg:py-20">
        <HistoryClientLayout initialPerformances={performances} />
      </main>
    </div>
  );
}
