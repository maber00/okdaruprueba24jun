// src/app/dashboard/chat-test/page.tsx
'use client';
import { useState } from 'react';
import DAROChat from '@/app/components/chat/DAROChat';
import BriefPanel from '@/app/components/analysis/BriefPanel';
import WireframeDemo from '../../components/analysis/WireframeDemo';
import { type BriefData } from '@/app/types/brief';

export default function ChatTestPage() {
  const [showBrief, setShowBrief] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [showWireframe, setShowWireframe] = useState(false);

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
            onConfirm={() => setShowWireframe(true)}
          />
          {showWireframe && <WireframeDemo />}
        </div>
      )}
    </div>
  );
}