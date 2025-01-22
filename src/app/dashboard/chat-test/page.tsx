// src/app/dashboard/chat-test/page.tsx
'use client';
import { useState } from 'react';
import DAROChat from '@/app/core/ai/components/DAROChat';
import BriefPanel from '@/app/core/ai/analysis/components/BriefPanel';
import { type BriefData } from '@/app/types/brief';

export default function ChatTestPage() {
  const [showBrief, setShowBrief] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);

  const handleBriefComplete = (data: BriefData) => {
    setBriefData(data);
    setShowBrief(true);
  };

  return (
    <div className="flex h-screen">
      <div className={`transition-all duration-300 ${
        showBrief ? 'w-1/2' : 'w-full'
      }`}>
        <DAROChat onBriefComplete={handleBriefComplete} />
      </div>

      {showBrief && briefData && (
        <div className="w-1/2 animate-slide-in">
          <BriefPanel
            data={briefData}
            onEdit={() => {}}
          />
        </div>
      )}
    </div>
  );
}