import React, { useState } from 'react';
import { TaskItem, PriorityLevel } from '../types/analysis';
import {
  ShieldCheck,
  User,
  Users,
  HelpCircle,
  Clock,
  CheckCircle2,
  Circle,
  Copy,
  Quote,
  ChevronDown,
  ChevronUp,
  Flame,
  AlertCircle,
  Filter
} from 'lucide-react';

interface MyResponsibilityRadarProps {
  tasks: TaskItem[];
  targetUser: string;
  onToggleTaskComplete: (taskId: string) => void;
  onCopyQuote: (quote: string) => void;
}

export const MyResponsibilityRadar: React.FC<MyResponsibilityRadarProps> = ({
  tasks,
  targetUser,
  onToggleTaskComplete,
  onCopyQuote
}) => {
  const [filterSection, setFilterSection] = useState<'ALL' | 'MINE' | 'OTHERS' | 'UNASSIGNED'>('ALL');
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});

  const toggleQuote = (id: string) => {
    setExpandedQuotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const normalizedTarget = (targetUser || 'You').trim().toLowerCase();

  // Partition tasks strictly without guessing
  const myTasks: TaskItem[] = [];
  const otherTasks: TaskItem[] = [];
  const unassignedTasks: TaskItem[] = [];

  for (const t of tasks) {
    const assigneeLower = (t.assignee || '').trim().toLowerCase();
    const isUnassigned =
      !t.assignee ||
      assigneeLower === 'not specified' ||
      assigneeLower === 'unassigned' ||
      assigneeLower === 'everyone' ||
      assigneeLower === 'all participants';

    if (isUnassigned) {
      unassignedTasks.push(t);
    } else if (
      assigneeLower === normalizedTarget ||
      assigneeLower === 'you' ||
      assigneeLower.includes(normalizedTarget)
    ) {
      myTasks.push(t);
    } else {
      otherTasks.push(t);
    }
  }

  // Count my urgent/pending
  const myPendingTasks = myTasks.filter(t => !t.completed);
  const myUrgentTasks = myTasks.filter(t => t.priority === 'URGENT' && !t.completed);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(37,36,58,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDF7F5] border border-[#C2E8E1] flex items-center justify-center text-[#2C7A6B] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#25243A]">My Responsibility Radar</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF7F5] text-[#2C7A6B] border border-[#C2E8E1]">
                  Hackathon Feature
                </span>
              </div>
              <p className="text-xs text-[#77778A] mt-0.5">
                Strict separation of your direct duties vs. tasks assigned to teammates vs. unassigned action items. Zero guesswork.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-[#F8F8FC] border border-[#EAEAF2] text-[#77778A]">
              Target: <strong className="text-[#25243A]">{targetUser}</strong>
            </span>
          </div>
        </div>

        {/* 3 Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#EAEAF2]">
          <div
            onClick={() => setFilterSection('MINE')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterSection === 'MINE'
                ? 'bg-[#F2F0FB] border-[#8275D8] shadow-xs'
                : 'bg-white border-[#EAEAF2] hover:bg-[#FAF9FD]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8275D8] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Assigned to Me
              </span>
              {myUrgentTasks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                  {myUrgentTasks.length} Urgent
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-[#25243A] mt-1">{myTasks.length}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">
              {myPendingTasks.length} remaining / {myTasks.length - myPendingTasks.length} done
            </p>
          </div>

          <div
            onClick={() => setFilterSection('OTHERS')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterSection === 'OTHERS'
                ? 'bg-[#EDF7F5] border-[#4FAE9B] shadow-xs'
                : 'bg-white border-[#EAEAF2] hover:bg-[#F8FDFB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2C7A6B] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Teammate Tasks
              </span>
            </div>
            <p className="text-2xl font-extrabold text-[#25243A] mt-1">{otherTasks.length}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Assigned to named colleagues</p>
          </div>

          <div
            onClick={() => setFilterSection('UNASSIGNED')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterSection === 'UNASSIGNED'
                ? 'bg-[#FFFDF5] border-[#FDE68A] shadow-xs'
                : 'bg-white border-[#EAEAF2] hover:bg-[#FFFDF5]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Unassigned / Open
              </span>
            </div>
            <p className="text-2xl font-extrabold text-[#25243A] mt-1">{unassignedTasks.length}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Needs owner assignment</p>
          </div>
        </div>

        {/* Filter Pill Selector */}
        <div className="flex items-center gap-1.5 pt-4 mt-3 border-t border-[#EAEAF2] text-xs">
          <span className="text-[11px] text-[#77778A] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>View:</span>
          </span>
          <button
            onClick={() => setFilterSection('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterSection === 'ALL'
                ? 'bg-[#8275D8] text-white shadow-xs'
                : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterSection('MINE')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterSection === 'MINE'
                ? 'bg-[#8275D8] text-white shadow-xs'
                : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
            }`}
          >
            My Direct Duties ({myTasks.length})
          </button>
          <button
            onClick={() => setFilterSection('OTHERS')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterSection === 'OTHERS'
                ? 'bg-[#8275D8] text-white shadow-xs'
                : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
            }`}
          >
            Others ({otherTasks.length})
          </button>
          <button
            onClick={() => setFilterSection('UNASSIGNED')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterSection === 'UNASSIGNED'
                ? 'bg-[#8275D8] text-white shadow-xs'
                : 'bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A]'
            }`}
          >
            Unassigned ({unassignedTasks.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: Tasks Assigned to Me */}
      {(filterSection === 'ALL' || filterSection === 'MINE') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-[#25243A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#8275D8]" />
              <span>Explicitly Assigned to {targetUser}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F0FB] text-[#8275D8]">
                {myTasks.length}
              </span>
            </h4>
            <span className="text-xs text-[#77778A]">
              Verifiable assignments from original messages
            </span>
          </div>

          {myTasks.length === 0 ? (
            <div className="p-6 bg-white border border-[#EAEAF2] rounded-2xl text-center text-xs text-[#77778A]">
              No tasks explicitly assigned to {targetUser} in this conversation.
            </div>
          ) : (
            <div className="space-y-2.5">
              {myTasks.map(task => (
                <RadarTaskCard
                  key={task.id}
                  task={task}
                  isMine
                  onToggle={onToggleTaskComplete}
                  isExpanded={Boolean(expandedQuotes[task.id])}
                  onToggleQuote={() => toggleQuote(task.id)}
                  onCopyQuote={onCopyQuote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Tasks Assigned to Others */}
      {(filterSection === 'ALL' || filterSection === 'OTHERS') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-[#25243A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2C7A6B]" />
              <span>Tasks Assigned to Teammates</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F5] text-[#2C7A6B]">
                {otherTasks.length}
              </span>
            </h4>
            <span className="text-xs text-[#77778A]">
              Confirmed team commitments
            </span>
          </div>

          {otherTasks.length === 0 ? (
            <div className="p-6 bg-white border border-[#EAEAF2] rounded-2xl text-center text-xs text-[#77778A]">
              No tasks assigned to other participants.
            </div>
          ) : (
            <div className="space-y-2.5">
              {otherTasks.map(task => (
                <RadarTaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTaskComplete}
                  isExpanded={Boolean(expandedQuotes[task.id])}
                  onToggleQuote={() => toggleQuote(task.id)}
                  onCopyQuote={onCopyQuote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Unassigned Tasks */}
      {(filterSection === 'ALL' || filterSection === 'UNASSIGNED') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-[#25243A] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#B45309]" />
              <span>Unassigned / Collective Action Items</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFDF5] text-[#B45309]">
                {unassignedTasks.length}
              </span>
            </h4>
            <span className="text-xs text-[#77778A]">
              No owner guessed — requires team claim
            </span>
          </div>

          {unassignedTasks.length === 0 ? (
            <div className="p-6 bg-white border border-[#EAEAF2] rounded-2xl text-center text-xs text-[#77778A]">
              All identified action items have an explicit owner.
            </div>
          ) : (
            <div className="space-y-2.5">
              {unassignedTasks.map(task => (
                <RadarTaskCard
                  key={task.id}
                  task={task}
                  isUnassigned
                  onToggle={onToggleTaskComplete}
                  isExpanded={Boolean(expandedQuotes[task.id])}
                  onToggleQuote={() => toggleQuote(task.id)}
                  onCopyQuote={onCopyQuote}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Radar Task Card Component
const RadarTaskCard: React.FC<{
  task: TaskItem;
  isMine?: boolean;
  isUnassigned?: boolean;
  onToggle: (id: string) => void;
  isExpanded: boolean;
  onToggleQuote: () => void;
  onCopyQuote: (quote: string) => void;
}> = ({ task, isMine, isUnassigned, onToggle, isExpanded, onToggleQuote, onCopyQuote }) => {
  return (
    <div
      className={`p-4 rounded-2xl border text-xs transition-all shadow-xs ${
        task.completed
          ? 'bg-[#FAF9FD]/50 border-[#EAEAF2] opacity-60'
          : isMine
          ? 'bg-white border-[#8275D8]/40 hover:border-[#8275D8]'
          : isUnassigned
          ? 'bg-white border-[#FDE68A] hover:border-[#F59E0B]'
          : 'bg-white border-[#EAEAF2] hover:border-[#4FAE9B]/50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 text-[#77778A] hover:text-[#8275D8] transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none rounded"
          title={task.completed ? 'Mark incomplete' : 'Mark completed'}
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-[#8275D8]" />
          ) : (
            <Circle className="w-4 h-4 text-[#9E9EAF]" />
          )}
        </button>

        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h5
              className={`font-bold text-sm ${
                task.completed ? 'line-through text-[#77778A]' : 'text-[#25243A]'
              }`}
            >
              {task.title}
            </h5>

            <div className="flex items-center gap-1.5">
              {/* Priority badge */}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  task.priority === 'URGENT'
                    ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                    : task.priority === 'IMPORTANT'
                    ? 'bg-[#FFFDF5] text-[#B45309] border-[#FDE68A]'
                    : 'bg-[#F8FAFF] text-[#1D4ED8] border-[#BFDBFE]'
                }`}
              >
                {task.priority === 'URGENT' && <Flame className="w-2.5 h-2.5 inline mr-1 fill-current" />}
                {task.priority}
              </span>

              {/* Ownership pill */}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  isMine
                    ? 'bg-[#F2F0FB] text-[#8275D8] border-[#E0DCF7]'
                    : isUnassigned
                    ? 'bg-[#FFFDF5] text-[#B45309] border-[#FDE68A]'
                    : 'bg-[#EDF7F5] text-[#2C7A6B] border-[#C2E8E1]'
                }`}
              >
                {isMine ? 'Assigned to You' : isUnassigned ? 'Unassigned' : `Assignee: ${task.assignee}`}
              </span>
            </div>
          </div>

          {/* Details row: Assignee, Deadline, Reason */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#77778A]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-[#77778A]" />
              <span>
                Assignee:{' '}
                <strong className={isUnassigned ? 'text-[#B45309] italic' : 'text-[#25243A]'}>
                  {task.assignee || 'Not specified'}
                </strong>
              </span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8275D8]" />
              <span>
                Deadline:{' '}
                <strong className={task.deadline && task.deadline !== 'Not specified' ? 'text-[#8275D8]' : 'text-[#77778A]'}>
                  {task.deadline || 'Not specified'}
                </strong>
              </span>
            </span>

            {task.confidence && (
              <span className="px-2 py-0.2 rounded bg-[#F8F8FC] border border-[#EAEAF2] text-[#77778A]">
                Confidence: {task.confidence}
              </span>
            )}
          </div>

          {task.priorityReason && (
            <p className="text-[11px] text-[#77778A] italic">
              Priority rationale: {task.priorityReason}
            </p>
          )}

          {/* Supporting Evidence Drawer */}
          <div className="pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleQuote}
                className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors"
              >
                <Quote className="w-3 h-3 text-[#8275D8]" />
                <span>{isExpanded ? 'Hide verbatim quote' : 'View verbatim quote'}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {isExpanded && (
                <button
                  onClick={() => onCopyQuote(task.supportingMessage)}
                  className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy quote</span>
                </button>
              )}
            </div>

            {isExpanded && (
              <div className="mt-2 p-2.5 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-[11px] text-[#25243A] font-mono leading-relaxed animate-in fade-in duration-150">
                "{task.supportingMessage}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
