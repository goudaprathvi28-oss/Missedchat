import React from 'react';
import {
  Sparkles,
  MessageSquare,
  AtSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface HeroSectionProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  platform: 'slack' | 'discord' | 'whatsapp' | 'email' | 'general';
  onPlatformChange: (platform: 'slack' | 'discord' | 'whatsapp' | 'email' | 'general') => void;
  onTrySample: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  userName,
  onUserNameChange,
  platform,
  onPlatformChange,
  onTrySample
}) => {
  return (
    <div className="relative pt-6 pb-2 sm:pt-10 sm:pb-4 text-center max-w-4xl mx-auto px-4">
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAEAF2] text-[#8275D8] text-xs font-semibold mb-4 shadow-[0_2px_8px_-2px_rgba(130,117,216,0.12)]">
        <Sparkles className="w-3.5 h-3.5 text-[#8275D8]" />
        <span>Intelligent Conversation Catch-Up</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#25243A] mb-3 leading-tight">
        You were away. <span className="text-[#8275D8]">We caught you up.</span>
      </h1>

      <p className="text-sm sm:text-base text-[#77778A] max-w-2xl mx-auto mb-6 leading-relaxed">
        Turn overwhelming conversations into clear priorities and next steps.
      </p>

      {/* Context & Personal Mention Targeting Bar */}
      <div className="bg-white border border-[#EAEAF2] rounded-2xl p-4 shadow-[0_4px_24px_-4px_rgba(37,36,58,0.04)] max-w-2xl mx-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {/* Platform Context Selector */}
          <div>
            <label htmlFor="platform-select" className="block text-xs font-semibold text-[#25243A] mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#8275D8]" />
              <span>Conversation Platform</span>
            </label>
            <select
              id="platform-select"
              value={platform}
              onChange={(e) => onPlatformChange(e.target.value as any)}
              className="w-full bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl px-3 py-2 text-xs text-[#25243A] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8275D8] transition-colors"
            >
              <option value="slack">Slack / Team Thread</option>
              <option value="discord">Discord Community / Dev Channel</option>
              <option value="whatsapp">WhatsApp / Telegram Group</option>
              <option value="email">Email Thread / Digest</option>
              <option value="general">General / Multi-speaker Chat</option>
            </select>
          </div>

          {/* Personal Mention Name Input */}
          <div>
            <label htmlFor="username-input" className="block text-xs font-semibold text-[#25243A] mb-1.5 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#4FAE9B]" />
              <span>Your Name / Handle (for @Mentions)</span>
            </label>
            <div className="relative">
              <input
                id="username-input"
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                placeholder="e.g. Alex, Sarah, or You"
                maxLength={40}
                className="w-full bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl px-3 py-2 text-xs text-[#25243A] font-medium placeholder-[#77778A]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8275D8] transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#77778A] pointer-events-none">
                Matches @{userName || 'You'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Sample Preview Teaser Card */}
      <div className="max-w-2xl mx-auto mb-6 text-left">
        <div className="bg-[#FAF9FD] border border-[#E0DCF7]/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#EAEAF2]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8275D8]">
              <Layers className="w-3.5 h-3.5" />
              <span>Sample Catch-Up Output Preview</span>
            </div>
            <button
              type="button"
              onClick={onTrySample}
              className="text-xs font-semibold text-[#8275D8] hover:text-[#5B4DB8] flex items-center gap-1 transition-colors"
            >
              <span>Load sample conversation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-white border border-[#EAEAF2] rounded-xl">
              <p className="font-semibold text-[#25243A] text-[11px] mb-1 flex items-center gap-1 text-[#8275D8]">
                <Sparkles className="w-3 h-3" />
                Executive Summary
              </p>
              <p className="text-[11px] text-[#77778A] line-clamp-2">
                Prototype review confirmed; team decided on Python; presentation slides due today.
              </p>
            </div>

            <div className="p-2.5 bg-white border border-[#EAEAF2] rounded-xl">
              <p className="font-semibold text-[#25243A] text-[11px] mb-1 flex items-center gap-1 text-[#4FAE9B]">
                <CheckCircle2 className="w-3 h-3" />
                Action Items
              </p>
              <p className="text-[11px] text-[#77778A] line-clamp-2">
                Prepare presentation slides today; submit project report by tomorrow at 10 AM.
              </p>
            </div>

            <div className="p-2.5 bg-white border border-[#EAEAF2] rounded-xl">
              <p className="font-semibold text-[#25243A] text-[11px] mb-1 flex items-center gap-1 text-[#F47174]">
                <AlertTriangle className="w-3 h-3" />
                Disputed Timeline
              </p>
              <p className="text-[11px] text-[#77778A] line-clamp-2">
                Production deployment contested: Thursday 2 PM vs Friday 6 PM pending staging tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
