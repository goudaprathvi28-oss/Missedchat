import React, { useState } from 'react';
import { TimeMachineThread } from '../types/analysis';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Quote,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle,
  Compass
} from 'lucide-react';

interface ConversationTimeMachineProps {
  threads: TimeMachineThread[];
  onCopyQuote: (quote: string) => void;
}

export const ConversationTimeMachine: React.FC<ConversationTimeMachineProps> = ({
  threads,
  onCopyQuote
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});

  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0];

  const toggleQuote = (id: string) => {
    setExpandedQuotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!threads || threads.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAF2] rounded-2xl p-8 text-center text-[#77778A]">
        <Clock className="w-8 h-8 text-[#8275D8] mx-auto mb-2 opacity-60" />
        <p className="font-medium text-[#25243A]">No conversation evolution milestones found</p>
        <p className="text-xs text-[#77778A] mt-1">Timeline tracks original proposals through resolution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(37,36,58,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2F0FB] border border-[#E0DCF7] flex items-center justify-center text-[#8275D8] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#25243A]">Conversation Time Machine</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2F0FB] text-[#8275D8] border border-[#E0DCF7]">
                  Signature Feature
                </span>
              </div>
              <p className="text-xs text-[#77778A] mt-0.5">
                Track how agreements, dates, and requirements shifted from original message to current status.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#77778A] bg-[#F8F8FC] border border-[#EAEAF2] px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span>{threads.length} key story threads tracked</span>
          </div>
        </div>

        {/* Story Thread Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-4 mt-3 border-t border-[#EAEAF2]">
          {threads.map(thread => {
            const isSelected = thread.id === (activeThread?.id || '');
            const isContested = thread.currentStatus.badgeType === 'contested';
            const isCancelled = thread.currentStatus.badgeType === 'cancelled';
            const isUnconfirmed = thread.currentStatus.badgeType === 'unconfirmed';

            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#8275D8] text-white border-[#8275D8] shadow-sm'
                    : isContested
                    ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]/60 hover:bg-[#FEE2E2]'
                    : isCancelled
                    ? 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    : isUnconfirmed
                    ? 'bg-[#FFFDF5] text-[#B45309] border-[#FDE68A] hover:bg-[#FEF3C7]'
                    : 'bg-[#F8F8FC] text-[#25243A] border-[#EAEAF2] hover:bg-[#F2F0FB] hover:text-[#8275D8]'
                }`}
              >
                {isContested && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                {isCancelled && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                {isUnconfirmed && <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[#B45309]" />}
                {!isContested && !isCancelled && !isUnconfirmed && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
                <span>{thread.topic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Thread Vertical Timeline */}
      {activeThread && (
        <div className="bg-white border border-[#EAEAF2] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(37,36,58,0.04)] relative">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#EAEAF2]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8275D8]">
                Thread Evolution
              </span>
              <h4 className="text-lg font-bold text-[#25243A] mt-0.5">{activeThread.topic}</h4>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                activeThread.currentStatus.badgeType === 'contested'
                  ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                  : activeThread.currentStatus.badgeType === 'cancelled'
                  ? 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                  : activeThread.currentStatus.badgeType === 'unconfirmed'
                  ? 'bg-[#FFFDF5] text-[#B45309] border-[#FDE68A]'
                  : 'bg-[#EDF7F5] text-[#2C7A6B] border-[#C2E8E1]'
              }`}
            >
              {activeThread.currentStatus.badgeType === 'contested'
                ? 'Contested Conflict'
                : activeThread.currentStatus.badgeType === 'cancelled'
                ? 'Cancelled Plan'
                : activeThread.currentStatus.badgeType === 'unconfirmed'
                ? 'Unconfirmed / Open'
                : 'Confirmed Plan'}
            </span>
          </div>

          {/* Vertical Stepper Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EAEAF2]">
            {/* Step 1: Original Message */}
            <div className="relative">
              {/* Lavender marker */}
              <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#8275D8] flex items-center justify-center text-[#8275D8] shadow-sm">
                <span className="text-[11px] font-bold">1</span>
              </div>

              <div className="bg-[#FAF9FD] border border-[#EAEAF2] rounded-xl p-4 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#8275D8] uppercase tracking-wider">
                    Stage 1: Original Proposal
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#77778A]">
                    <span className="font-semibold text-[#25243A]">{activeThread.originalMessage.sender}</span>
                    {activeThread.originalMessage.timestamp && (
                      <span>({activeThread.originalMessage.timestamp})</span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#25243A] font-medium leading-relaxed">
                  "{activeThread.originalMessage.text}"
                </p>
              </div>
            </div>

            {/* Step 2: Later Update */}
            <div className="relative">
              <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#4FAE9B] flex items-center justify-center text-[#4FAE9B] shadow-sm">
                <span className="text-[11px] font-bold">2</span>
              </div>

              <div className="bg-[#F8FDFB] border border-[#D5EFEA] rounded-xl p-4 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2C7A6B] uppercase tracking-wider">
                      Stage 2: Later Update / Modification
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E6F6F2] text-[#2C7A6B]">
                      {activeThread.laterUpdate.changeType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#77778A]">
                    <span className="font-semibold text-[#25243A]">{activeThread.laterUpdate.sender}</span>
                    {activeThread.laterUpdate.timestamp && (
                      <span>({activeThread.laterUpdate.timestamp})</span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#25243A] font-medium leading-relaxed">
                  "{activeThread.laterUpdate.text}"
                </p>
              </div>
            </div>

            {/* Step 3: Current Status */}
            <div className="relative">
              <div
                className={`absolute -left-[27px] sm:-left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow-sm ${
                  activeThread.currentStatus.badgeType === 'contested'
                    ? 'border-[#F47174] text-[#B91C1C]'
                    : activeThread.currentStatus.badgeType === 'cancelled'
                    ? 'border-[#94A3B8] text-[#64748B]'
                    : activeThread.currentStatus.badgeType === 'unconfirmed'
                    ? 'border-[#F59E0B] text-[#B45309]'
                    : 'border-[#4FAE9B] text-[#2C7A6B]'
                }`}
              >
                <span className="text-[11px] font-bold">3</span>
              </div>

              <div
                className={`border rounded-xl p-4 transition-all ${
                  activeThread.currentStatus.badgeType === 'contested'
                    ? 'bg-[#FEF9F9] border-[#FCD5D6]'
                    : activeThread.currentStatus.badgeType === 'cancelled'
                    ? 'bg-[#F8FAFC] border-[#E2E8F0]'
                    : activeThread.currentStatus.badgeType === 'unconfirmed'
                    ? 'bg-[#FFFDF5] border-[#FDE68A]'
                    : 'bg-[#F2FBF9] border-[#D5EFEA]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      activeThread.currentStatus.badgeType === 'contested'
                        ? 'text-[#B91C1C]'
                        : activeThread.currentStatus.badgeType === 'cancelled'
                        ? 'text-[#64748B]'
                        : activeThread.currentStatus.badgeType === 'unconfirmed'
                        ? 'text-[#B45309]'
                        : 'text-[#2C7A6B]'
                    }`}
                  >
                    Stage 3: Current Verified Status
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#25243A] leading-relaxed">
                  {activeThread.currentStatus.statusText}
                </p>
              </div>
            </div>

            {/* Step 4: Recommended Next Step */}
            <div className="relative">
              <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-6 h-6 rounded-full bg-[#8275D8] border-2 border-[#8275D8] flex items-center justify-center text-white shadow-sm">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              <div className="bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#8275D8] uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Stage 4: Recommended Next Step
                  </span>
                </div>

                <p className="text-sm text-[#25243A] leading-relaxed">
                  {activeThread.recommendedNextStep}
                </p>
              </div>
            </div>
          </div>

          {/* Verbatim Source Evidence Drawer */}
          <div className="mt-8 pt-4 border-t border-[#EAEAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <button
              onClick={() => toggleQuote(activeThread.id)}
              className="text-xs font-medium text-[#8275D8] hover:text-[#6757BF] flex items-center gap-1.5 transition-colors self-start"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>
                {expandedQuotes[activeThread.id]
                  ? 'Hide Source Conversation Quotations'
                  : 'View Verbatim Supporting Quotations'}
              </span>
              {expandedQuotes[activeThread.id] ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedQuotes[activeThread.id] && (
              <button
                onClick={() => onCopyQuote(activeThread.supportingMessage)}
                className="text-xs text-[#77778A] hover:text-[#25243A] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F8FC] border border-[#EAEAF2] transition-colors self-start sm:self-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Evidence Quote</span>
              </button>
            )}
          </div>

          {expandedQuotes[activeThread.id] && (
            <div className="mt-3 p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl text-xs text-[#25243A] font-mono leading-relaxed animate-in fade-in duration-150">
              "{activeThread.supportingMessage}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
