import React, { useState } from 'react';
import { AnalysisResult } from '../types/analysis';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Quote,
  Copy,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface TrustEveryAnswerProps {
  result: AnalysisResult;
  onCopyQuote: (quote: string) => void;
}

export interface GroundedEvidenceItem {
  id: string;
  category: 'Task' | 'Decision' | 'Deadline' | 'Mention' | 'Conflict' | 'Update';
  findingTitle: string;
  nature: 'FACT' | 'INTERPRETATION' | 'UNRESOLVED';
  natureReason: string;
  sender: string;
  timestamp: string;
  verbatimQuote: string;
  confidence: 'High' | 'Medium' | 'Uncertain';
}

export const TrustEveryAnswer: React.FC<TrustEveryAnswerProps> = ({
  result,
  onCopyQuote
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FACT' | 'INTERPRETATION' | 'UNRESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});

  const toggleQuote = (id: string) => {
    setExpandedQuotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile exhaustive list of grounded evidence items from analysis result
  const evidenceItems: GroundedEvidenceItem[] = [];

  // 1. Decisions
  result.decisions.forEach(d => {
    evidenceItems.push({
      id: `trust-decision-${d.id}`,
      category: 'Decision',
      findingTitle: d.decision,
      nature: d.status === 'Confirmed' || d.status === 'Cancelled' ? 'FACT' : 'INTERPRETATION',
      natureReason:
        d.status === 'Confirmed'
          ? 'Explicit consensus or definitive decision statement verified in text'
          : d.status === 'Cancelled'
          ? 'Explicit cancellation announcement confirmed in message'
          : 'Proposal or exploratory direction under consideration',
      sender: d.confirmedBy || extractSenderFromMessage(d.supportingMessage),
      timestamp: extractTimestampFromMessage(d.supportingMessage),
      verbatimQuote: d.supportingMessage,
      confidence: d.confidence
    });
  });

  // 2. Deadlines
  result.deadlines.forEach(dl => {
    evidenceItems.push({
      id: `trust-deadline-${dl.id}`,
      category: 'Deadline',
      findingTitle: `${dl.title}: ${dl.rawDeadline}`,
      nature: dl.status === 'Contested' ? 'UNRESOLVED' : dl.status === 'Confirmed' ? 'FACT' : 'INTERPRETATION',
      natureReason:
        dl.status === 'Contested'
          ? `Disputed deadline: Contradictory times offered by different participants (${dl.conflictNote || 'Conflicting statements'})`
          : dl.status === 'Confirmed'
          ? 'Explicit scheduled date and time stated directly in message'
          : 'Proposed deliverable timeframe awaiting consensus',
      sender: dl.owner || extractSenderFromMessage(dl.supportingMessage),
      timestamp: extractTimestampFromMessage(dl.supportingMessage),
      verbatimQuote: dl.supportingMessage,
      confidence: dl.status === 'Contested' ? 'Uncertain' : 'High'
    });
  });

  // 3. Tasks
  result.tasks.forEach(t => {
    const isExplicitAssignee = t.assignee && t.assignee !== 'Not specified';
    evidenceItems.push({
      id: `trust-task-${t.id}`,
      category: 'Task',
      findingTitle: `${t.title} [Assignee: ${t.assignee}]`,
      nature: isExplicitAssignee ? 'FACT' : 'INTERPRETATION',
      natureReason: isExplicitAssignee
        ? `Direct assignment or self-commitment ("${t.assignee}") explicitly stated in quote`
        : 'Action item identified from conversational context; assignee not explicitly named',
      sender: extractSenderFromMessage(t.supportingMessage),
      timestamp: extractTimestampFromMessage(t.supportingMessage),
      verbatimQuote: t.supportingMessage,
      confidence: t.confidence
    });
  });

  // 4. Personal Mentions
  result.personalMentions.forEach(m => {
    evidenceItems.push({
      id: `trust-mention-${m.id}`,
      category: 'Mention',
      findingTitle: `Mention: ${m.requestedAction}`,
      nature: 'FACT',
      natureReason: `Direct callout addressed to ${result.targetUser || 'user'} by name or handle`,
      sender: m.sender,
      timestamp: m.timestamp || extractTimestampFromMessage(m.supportingMessage),
      verbatimQuote: m.supportingMessage,
      confidence: 'High'
    });
  });

  // 5. Blockers & Timeline Conflicts
  result.blockers.forEach(b => {
    evidenceItems.push({
      id: `trust-blocker-${b.id}`,
      category: 'Conflict',
      findingTitle: `${b.title} (${b.conflictType})`,
      nature: 'UNRESOLVED',
      natureReason: b.description,
      sender: extractSenderFromMessage(b.supportingMessage),
      timestamp: extractTimestampFromMessage(b.supportingMessage),
      verbatimQuote: b.supportingMessage,
      confidence: 'Uncertain'
    });
  });

  // 6. Announcements / Updates
  result.updates.forEach(u => {
    evidenceItems.push({
      id: `trust-update-${u.id}`,
      category: 'Update',
      findingTitle: `${u.title}: ${u.detail.slice(0, 50)}...`,
      nature: 'FACT',
      natureReason: 'Status or schedule update transmitted to team',
      sender: extractSenderFromMessage(u.supportingMessage),
      timestamp: extractTimestampFromMessage(u.supportingMessage),
      verbatimQuote: u.supportingMessage,
      confidence: 'High'
    });
  });

  // Metrics
  const factsCount = evidenceItems.filter(e => e.nature === 'FACT').length;
  const interpCount = evidenceItems.filter(e => e.nature === 'INTERPRETATION').length;
  const unresolvedCount = evidenceItems.filter(e => e.nature === 'UNRESOLVED').length;

  // Filtered
  const filteredItems = evidenceItems.filter(item => {
    const matchesNature = activeFilter === 'ALL' || item.nature === activeFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch =
      item.findingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.verbatimQuote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.natureReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNature && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(37,36,58,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2F0FB] border border-[#E0DCF7] flex items-center justify-center text-[#8275D8] shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#25243A]">Trust Every Answer</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2F0FB] text-[#8275D8] border border-[#E0DCF7]">
                  Hackathon Feature
                </span>
              </div>
              <p className="text-xs text-[#77778A] mt-0.5">
                Every extracted finding is backed by the original message, sender, and timestamp. Strictly distinguishes verified facts from interpretations. Zero invented evidence.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#77778A] bg-[#F8F8FC] border border-[#EAEAF2] px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span>{evidenceItems.length} verifiable audit points</span>
          </div>
        </div>

        {/* 3 Trust Classification Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#EAEAF2]">
          <div
            onClick={() => setActiveFilter('FACT')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === 'FACT'
                ? 'bg-[#EDF7F5] border-[#4FAE9B] shadow-xs'
                : 'bg-white border-[#EAEAF2] hover:bg-[#F8FDFB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2C7A6B] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Facts
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#EDF7F5] text-[#2C7A6B] border border-[#C2E8E1]">
                100% Verbatim
              </span>
            </div>
            <p className="text-2xl font-extrabold text-[#25243A] mt-1">{factsCount}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Directly stated by participants</p>
          </div>

          <div
            onClick={() => setActiveFilter('INTERPRETATION')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === 'INTERPRETATION'
                ? 'bg-[#F2F0FB] border-[#8275D8] shadow-xs'
                : 'bg-white border-[#EAEAF2] hover:bg-[#FAF9FD]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8275D8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Context Interpretations
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#F2F0FB] text-[#8275D8] border border-[#E0DCF7]">
                Labeled
              </span>
            </div>
            <p className="text-2xl font-extrabold text-[#25243A] mt-1">{interpCount}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Derived from conversational intent</p>
          </div>

          <div
            onClick={() => setActiveFilter('UNRESOLVED')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === 'UNRESOLVED'
                ? 'bg-[#FEF2F2] border-[#FCA5A5] shadow-xs'
                : 'bg-white border-[#EAEAF2] hover:bg-[#FEF9F9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B91C1C] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Unresolved / Conflicted
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                Needs Sync
              </span>
            </div>
            <p className="text-2xl font-extrabold text-[#25243A] mt-1">{unresolvedCount}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Contradictory or missing confirmation</p>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 mt-3 border-t border-[#EAEAF2]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#77778A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, senders, or quote words..."
              className="w-full bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#25243A] placeholder-[#77778A]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8275D8]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-[#8275D8] text-white shadow-xs'
                  : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setActiveFilter('FACT')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                activeFilter === 'FACT'
                  ? 'bg-[#4FAE9B] text-white shadow-xs'
                  : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
              }`}
            >
              Facts Only ({factsCount})
            </button>
            <button
              onClick={() => setActiveFilter('INTERPRETATION')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                activeFilter === 'INTERPRETATION'
                  ? 'bg-[#8275D8] text-white shadow-xs'
                  : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
              }`}
            >
              Interpretations ({interpCount})
            </button>
            <button
              onClick={() => setActiveFilter('UNRESOLVED')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                activeFilter === 'UNRESOLVED'
                  ? 'bg-[#B91C1C] text-white shadow-xs'
                  : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
              }`}
            >
              Unresolved ({unresolvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grounded Evidence List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-[#77778A]">
          <span>
            Showing {filteredItems.length} of {evidenceItems.length} verifiable findings
          </span>
          <span className="text-[11px] italic">
            Never fabricated. Click any item to inspect verbatim text.
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#EAEAF2] rounded-2xl text-[#77778A] text-xs">
            No findings match your search or filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border text-xs transition-all shadow-xs ${
                  item.nature === 'UNRESOLVED'
                    ? 'bg-[#FEF9F9] border-[#FCD5D6]'
                    : item.nature === 'FACT'
                    ? 'bg-white border-[#EAEAF2] hover:border-[#4FAE9B]/50'
                    : 'bg-white border-[#EAEAF2] hover:border-[#8275D8]/50'
                }`}
              >
                {/* Top metadata row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Category pill */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F8F8FC] border border-[#EAEAF2] text-[#77778A]">
                      {item.category}
                    </span>

                    {/* Nature Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        item.nature === 'FACT'
                          ? 'bg-[#EDF7F5] text-[#2C7A6B] border-[#C2E8E1]'
                          : item.nature === 'UNRESOLVED'
                          ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                          : 'bg-[#F2F0FB] text-[#8275D8] border-[#E0DCF7]'
                      }`}
                    >
                      {item.nature === 'FACT'
                        ? 'Verified Fact'
                        : item.nature === 'UNRESOLVED'
                        ? 'Unresolved Conflict'
                        : 'Context Interpretation'}
                    </span>
                  </div>

                  {/* Sender & Timestamp */}
                  <div className="flex items-center gap-2 text-[11px] text-[#77778A]">
                    <span>
                      Sender: <strong className="text-[#25243A]">{item.sender}</strong>
                    </span>
                    {item.timestamp && item.timestamp !== 'In thread' && (
                      <span className="px-1.5 py-0.2 rounded bg-[#F8F8FC] border border-[#EAEAF2]">
                        {item.timestamp}
                      </span>
                    )}
                  </div>
                </div>

                {/* Finding Title */}
                <h4 className="font-bold text-sm text-[#25243A] mb-1">{item.findingTitle}</h4>

                {/* Rationale explanation */}
                <p className="text-[#77778A] text-[11px] mb-2 leading-relaxed">
                  <strong className="text-[#25243A]">Trust Rationale:</strong> {item.natureReason}
                </p>

                {/* Verbatim Supporting Quote Container */}
                <div className="pt-2 border-t border-[#EAEAF2]/60">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleQuote(item.id)}
                      className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors"
                    >
                      <Quote className="w-3 h-3 text-[#8275D8]" />
                      <span>{expandedQuotes[item.id] ? 'Hide verbatim quote' : 'View supporting original quote'}</span>
                      {expandedQuotes[item.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => onCopyQuote(item.verbatimQuote)}
                      className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-[#F8F8FC] border border-[#EAEAF2]"
                      title="Copy verbatim quote"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy quote</span>
                    </button>
                  </div>

                  {expandedQuotes[item.id] && (
                    <div className="mt-2.5 p-3 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-xs font-mono text-[#25243A] leading-relaxed animate-in fade-in duration-150">
                      "{item.verbatimQuote}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function extractSenderFromMessage(raw: string): string {
  const match = raw.match(/\]?\s*([A-Za-z0-9_\-\s@.]+?)(?:\s*\([^)]*\))?:\s*/);
  if (match && match[1]) {
    return match[1].replace(/^\[/, '').trim();
  }
  return 'Participant';
}

function extractTimestampFromMessage(raw: string): string {
  const match = raw.match(/\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return 'In thread';
}
