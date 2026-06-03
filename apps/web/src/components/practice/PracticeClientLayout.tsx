'use client';

import { useState } from 'react';
import ScriptViewer from '@/components/practice/ScriptViewer';
import PerformanceUploader from '@/components/practice/PerformanceUploader';

type Script = {
  id: string;
  category: string;
  scene_context: string;
  script: string;
};

type User = {
  id: string;
  email?: string;
};

export default function PracticeClientLayout({ scripts, user }: { scripts: Script[]; user: User }) {
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      {/* Left Column: Editorial Script View */}
      <section className="lg:col-span-7 space-y-12 h-full">
        <ScriptViewer 
          scripts={scripts} 
          onScriptChange={(script) => setSelectedScript(script)} 
        />
      </section>

      {/* Right Column: Video Upload Zone */}
      <section className="lg:col-span-5 sticky top-32">
        <PerformanceUploader 
          scriptId={selectedScript?.id || null} 
          userId={user.id} 
        />
      </section>
    </div>
  );
}
