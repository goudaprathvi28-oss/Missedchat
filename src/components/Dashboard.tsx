import React, { useState, useMemo } from 'react';
import {
  AnalysisResult,
  PriorityLevel,
  TaskItem,
  DecisionItem,
  DeadlineItem,
  MentionItem,
  QuestionItem,
  UpdateItem,
  BlockerItem
} from '../types/analysis';
import { generateTimeMachineThreads } from '../services/timeMachineGenerator';
import { ConversationTimeMachine } from './ConversationTimeMachine';
import { MyResponsibilityRadar } from './MyResponsibilityRadar';
import { TrustEveryAnswer } from './TrustEveryAnswer';
import {
  CheckCircle2,
  CheckSquare,
  Circle,
  Copy,
  Clock,
  AlertTriangle,
  HelpCircle,
  AtSign,
  FileText,
  Filter,
  Search,
  Download,
  Trash2,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Quote,
  Calendar,
  Layers,
  Flame,
  CheckCheck,
  Coffee,
  BellRing,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface DashboardProps {
  result: AnalysisResult;
  onClear: () => void;
  onCopyText: (text: string, title: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  targetUser: string;
}

type TabType =
  | 'overview'
  | 'timemachine'
  | 'radar'
  | 'trust'
  | 'tasks'
  | 'decisions'
  | 'updates'
  | 'deadlines'
  | 'mentions'
  | 'questions'
  | 'blockers'
  | 'casual';

export const Dashboard: React.FC<DashboardProps> = ({
  result,
  onClear,
  onCopyText,
  onToggleTaskComplete,
  targetUser
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | PriorityLevel>('ALL');
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});

  const timeMachineThreads = useMemo(() => {
    return result.timeMachineThreads || generateTimeMachineThreads(result);
  }, [result]);

  const toggleQuote = (id: string) => {
    setExpandedQuotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuote = (quoteText: string) => {
    onCopyText(quoteText, 'Supporting quote copied to clipboard');
  };

  // Task Completion Calculations
  const totalTasks = result.tasks.length;
  const completedTasks = result.tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return result.tasks.filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.supportingMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [result.tasks, searchQuery, priorityFilter]);

  // Filtered Updates
  const filteredUpdates = useMemo(() => {
    return result.updates.filter(u => {
      const matchesSearch =
        u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.supportingMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || u.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [result.updates, searchQuery, priorityFilter]);

  // Filtered Decisions
  const filteredDecisions = useMemo(() => {
    return result.decisions.filter(d => {
      return (
        d.decision.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.confirmedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.supportingMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [result.decisions, searchQuery]);

  // Filtered Deadlines
  const filteredDeadlines = useMemo(() => {
    return result.deadlines.filter(dl => {
      const matchesSearch =
        dl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dl.rawDeadline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dl.supportingMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || dl.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [result.deadlines, searchQuery, priorityFilter]);

  // Filtered Mentions
  const filteredMentions = useMemo(() => {
    return result.personalMentions.filter(m => {
      const matchesSearch =
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.requestedAction.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || m.urgency === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [result.personalMentions, searchQuery, priorityFilter]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return result.unansweredQuestions.filter(q => {
      return (
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.askedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.supportingMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [result.unansweredQuestions, searchQuery]);

  // Filtered Blockers
  const filteredBlockers = useMemo(() => {
    return result.blockers.filter(b => {
      return (
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.supportingMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [result.blockers, searchQuery]);

  // Filtered Casual Messages
  const filteredCasual = useMemo(() => {
    return result.casualMessages.filter(c => {
      return (
        c.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [result.casualMessages, searchQuery]);

  // Priority count aggregations
  const urgentCount =
    result.tasks.filter(t => t.priority === 'URGENT').length +
    result.deadlines.filter(d => d.priority === 'URGENT').length;
  const importantCount =
    result.tasks.filter(t => t.priority === 'IMPORTANT').length +
    result.deadlines.filter(d => d.priority === 'IMPORTANT').length;
  const normalCount = result.tasks.filter(t => t.priority === 'NORMAL').length;
  const lowCount = result.casualMessages.length;

  // Copy Executive Summary Handler
  const handleCopySummary = () => {
    const summaryMd = `# MissedMate AI — Executive Catch-Up Briefing
Generated: ${new Date(result.timestamp).toLocaleString()}
Engine: ${result.analysisMode === 'gemini' ? 'Google Gemini 3.8 Flash' : 'Private Local Engine'}

## Executive Summary
${result.summary.headline}

${result.summary.overview}

## Key Takeaways
${result.summary.keyTakeaways.map(t => `- ${t}`).join('\n')}

## Metrics
- Action Items: ${result.stats.actionItemsCount}
- Decisions: ${result.stats.decisionsCount}
- Deadlines: ${result.stats.deadlinesCount}
- Mentions for ${targetUser}: ${result.stats.personalMentionsCount}
- Important Updates: ${result.updates.length}
`;
    onCopyText(summaryMd, 'Executive summary copied to clipboard');
  };

  // Copy Action Items Checklist Handler
  const handleCopyActionItems = () => {
    const checklist = `# MissedMate AI — Action Items Checklist
Target User: ${targetUser}

${result.tasks
  .map(
    t =>
      `- [${t.completed ? 'x' : ' '}] **${t.title}**
  - Assignee: ${t.assignee}
  - Deadline: ${t.deadline}
  - Priority: ${t.priority} (${t.priorityReason})
  - Source Quote: "${t.supportingMessage}"`
  )
  .join('\n\n')}
`;
    onCopyText(checklist, 'Action items checklist copied to clipboard');
  };

  // Export Full Markdown Briefing
  const handleExportBriefing = () => {
    const fullDoc = `# MissedMate AI Catch-Up Briefing
Date: ${new Date(result.timestamp).toLocaleString()}
Mode: ${result.analysisMode === 'gemini' ? 'Google Gemini 3.8 Flash' : 'Private Local Heuristics'}
Target User: ${targetUser}

---

## 1. Executive Summary
**${result.summary.headline}**
${result.summary.overview}

### Key Takeaways:
${result.summary.keyTakeaways.map(t => `- ${t}`).join('\n')}

---

## 2. Action Items
${result.tasks.map(t => `### [${t.priority}] ${t.title}
- Assignee: ${t.assignee}
- Deadline: ${t.deadline}
- Reason: ${t.priorityReason}
- Verbatim Quote: "${t.supportingMessage}"
- Confidence: ${t.confidence}
`).join('\n')}

---

## 3. Explicit Decisions & Consensus
${result.decisions.map(d => `### [${d.status}] ${d.decision}
- Confirmed By: ${d.confirmedBy}
- Supporting Message: "${d.supportingMessage}"
`).join('\n')}

---

## 4. Deadlines & Milestones
${result.deadlines.map(dl => `- **${dl.title}**: ${dl.rawDeadline} (Owner: ${dl.owner})
  Quote: "${dl.supportingMessage}"`).join('\n')}

---

## 5. Direct Mentions for ${targetUser}
${result.personalMentions.map(m => `- [${m.urgency}] ${m.sender}: "${m.text}"
  Action Requested: ${m.requestedAction}`).join('\n')}

---

## 6. Unanswered Questions
${result.unansweredQuestions.map(q => `- **${q.question}** (Asked by: ${q.askedBy}, Addressed to: ${q.addressedTo}, Status: ${q.status})`).join('\n')}

---

## 7. Blockers & Conflicting Timelines
${result.blockers.map(b => `- [${b.conflictType}] **${b.title}**: ${b.description}
  Evidence: "${b.supportingMessage}"`).join('\n')}
`;

    const blob = new Blob([fullDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MissedMate-Briefing-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onCopyText(fullDoc, 'Full briefing exported as Markdown file');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 w-full animate-in fade-in duration-200">
      {/* Top Executive Summary Card */}
      <section
        aria-labelledby="executive-summary-heading"
        className="bg-white border border-[#EAEAF2] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_-6px_rgba(37,36,58,0.04)] mb-6 relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  result.analysisMode === 'gemini'
                    ? 'bg-[#F2F0FB] text-[#8275D8] border border-[#E0DCF7]'
                    : 'bg-[#EDF7F5] text-[#2C7A6B] border-[#C2E8E1]'
                }`}
              >
                {result.analysisMode === 'gemini' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#8275D8]" />
                    <span>Gemini 3.8 Flash Semantic Brief</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-[#4FAE9B]" />
                    <span>Private Local In-Browser Engine</span>
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8F8FC] text-[#77778A] border border-[#EAEAF2]">
                <Clock className="w-3.5 h-3.5 text-[#8275D8]" />
                <span>Est. thread length: ~{result.summary.timeSavedMinutes} min reading</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#F8F8FC] text-[#77778A] border border-[#EAEAF2]">
                <span>Atmosphere: {result.summary.sentimentMood}</span>
              </span>
            </div>

            <h2 id="executive-summary-heading" className="text-xl sm:text-2xl font-extrabold text-[#25243A] leading-tight">
              {result.summary.headline}
            </h2>

            <p className="text-sm text-[#77778A] leading-relaxed max-w-3xl">
              {result.summary.overview}
            </p>

            {/* Key takeaways chips */}
            {result.summary.keyTakeaways && result.summary.keyTakeaways.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#77778A] mb-2">
                  Key Takeaways
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.summary.keyTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 rounded-xl bg-[#FAF9FD] border border-[#EAEAF2] text-xs text-[#25243A]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#8275D8] shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#8275D8] hover:bg-[#7364CE] text-white shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Summary</span>
            </button>

            <button
              onClick={handleCopyActionItems}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F8F8FC] hover:bg-[#F2F0FB] text-[#25243A] border border-[#EAEAF2] transition-all focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#4FAE9B]" />
              <span>Copy Action Items</span>
            </button>

            <button
              onClick={handleExportBriefing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F8F8FC] hover:bg-[#F2F0FB] text-[#25243A] border border-[#EAEAF2] transition-all focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none"
            >
              <Download className="w-3.5 h-3.5 text-[#8275D8]" />
              <span>Export Briefing</span>
            </button>

            <button
              onClick={onClear}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-[#77778A] hover:text-[#B91C1C] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-all focus-visible:ring-2 focus-visible:ring-[#F47174] focus-visible:outline-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear & Start Over</span>
            </button>
          </div>
        </div>

        {/* Priority Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#EAEAF2]">
          <div
            onClick={() => {
              setActiveTab('tasks');
              setPriorityFilter('URGENT');
            }}
            className="p-3.5 rounded-2xl bg-[#FEF9F9] border border-[#FCD5D6] cursor-pointer hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#B91C1C] uppercase tracking-wider">Urgent</span>
              <Flame className="w-3.5 h-3.5 text-[#F47174]" />
            </div>
            <p className="text-2xl font-extrabold text-[#B91C1C] mt-1">{urgentCount}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Critical & due today</p>
          </div>

          <div
            onClick={() => {
              setActiveTab('tasks');
              setPriorityFilter('IMPORTANT');
            }}
            className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#FDE68A] cursor-pointer hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">Important</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#EAB308]" />
            </div>
            <p className="text-2xl font-extrabold text-[#B45309] mt-1">{importantCount}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Key decisions & tasks</p>
          </div>

          <div
            onClick={() => {
              setActiveTab('tasks');
              setPriorityFilter('NORMAL');
            }}
            className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-[#BFDBFE] cursor-pointer hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider">Normal</span>
              <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
            </div>
            <p className="text-2xl font-extrabold text-[#1D4ED8] mt-1">{normalCount}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Standard updates</p>
          </div>

          <div
            onClick={() => {
              setActiveTab('casual');
            }}
            className="p-3.5 rounded-2xl bg-[#F8F8FC] border border-[#EAEAF2] cursor-pointer hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Low Priority</span>
              <Coffee className="w-3.5 h-3.5 text-[#94A3B8]" />
            </div>
            <p className="text-2xl font-extrabold text-[#64748B] mt-1">{lowCount}</p>
            <p className="text-[11px] text-[#77778A] mt-0.5">Filtered banter</p>
          </div>
        </div>
      </section>

      {/* Task Completion Progress Bar */}
      {totalTasks > 0 && (
        <div className="bg-white border border-[#EAEAF2] rounded-2xl p-4 mb-6 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#25243A] flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-[#8275D8]" />
              Session Catch-Up Progress
            </span>
            <span className="text-[#77778A]">
              <strong className="text-[#8275D8]">{completedTasks}</strong> of {totalTasks} items completed ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#F1F1F7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8275D8] transition-all duration-300 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar & Filters */}
      <div className="bg-white border border-[#EAEAF2] rounded-2xl p-3 shadow-xs mb-6 space-y-3">
        {/* Main Section Tabs */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
        >
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            label="Overview"
            icon={<Layers className="w-3.5 h-3.5" />}
          />
          <TabButton
            active={activeTab === 'timemachine'}
            onClick={() => setActiveTab('timemachine')}
            label="Time Machine"
            count={timeMachineThreads.length}
            icon={<Clock className="w-3.5 h-3.5 text-[#8275D8]" />}
            highlight
          />
          <TabButton
            active={activeTab === 'radar'}
            onClick={() => setActiveTab('radar')}
            label="Responsibility Radar"
            count={result.tasks.length}
            icon={<Shield className="w-3.5 h-3.5 text-[#4FAE9B]" />}
            highlight
          />
          <TabButton
            active={activeTab === 'trust'}
            onClick={() => setActiveTab('trust')}
            label="Trust Every Answer"
            count={result.tasks.length + result.decisions.length + result.deadlines.length}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#8275D8]" />}
            highlight
          />
          <TabButton
            active={activeTab === 'tasks'}
            onClick={() => setActiveTab('tasks')}
            label="Action Items"
            count={result.tasks.length}
            icon={<CheckSquare className="w-3.5 h-3.5" />}
          />
          <TabButton
            active={activeTab === 'decisions'}
            onClick={() => setActiveTab('decisions')}
            label="Decisions"
            count={result.decisions.length}
            icon={<FileText className="w-3.5 h-3.5" />}
          />
          <TabButton
            active={activeTab === 'updates'}
            onClick={() => setActiveTab('updates')}
            label="Announcements"
            count={result.updates.length}
            icon={<BellRing className="w-3.5 h-3.5" />}
          />
          <TabButton
            active={activeTab === 'deadlines'}
            onClick={() => setActiveTab('deadlines')}
            label="Deadlines"
            count={result.deadlines.length}
            icon={<Calendar className="w-3.5 h-3.5" />}
          />
          <TabButton
            active={activeTab === 'mentions'}
            onClick={() => setActiveTab('mentions')}
            label={`Mentions (${targetUser})`}
            count={result.personalMentions.length}
            icon={<AtSign className="w-3.5 h-3.5" />}
          />
          <TabButton
            active={activeTab === 'questions'}
            onClick={() => setActiveTab('questions')}
            label="Questions"
            count={result.unansweredQuestions.length}
            icon={<HelpCircle className="w-3.5 h-3.5" />}
          />
          {result.blockers.length > 0 && (
            <TabButton
              active={activeTab === 'blockers'}
              onClick={() => setActiveTab('blockers')}
              label="Conflicts"
              count={result.blockers.length}
              icon={<AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C]" />}
              danger
            />
          )}
          {result.casualMessages.length > 0 && (
            <TabButton
              active={activeTab === 'casual'}
              onClick={() => setActiveTab('casual')}
              label="Low Priority"
              count={result.casualMessages.length}
              icon={<Coffee className="w-3.5 h-3.5" />}
            />
          )}
        </div>

        {/* Search & Priority Filter row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-[#EAEAF2]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#77778A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, assignees, or quote text..."
              aria-label="Filter items by search query"
              className="w-full bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#25243A] placeholder-[#77778A]/60 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8275D8]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] text-[#77778A] flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Priority:</span>
            </span>
            {(['ALL', 'URGENT', 'IMPORTANT', 'NORMAL', 'LOW'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none ${
                  priorityFilter === p
                    ? 'bg-[#8275D8] text-white'
                    : 'text-[#77778A] hover:text-[#25243A] hover:bg-[#F8F8FC]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div role="tabpanel" className="space-y-6">
            {/* Blocker alert banner if conflicts detected */}
            {result.blockers.length > 0 && (
              <div className="p-4 bg-[#FEF9F9] border border-[#FCD5D6] rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#B91C1C] font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-[#F47174]" />
                    <span>Conflicting Information & Blockers Detected ({result.blockers.length})</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('timemachine')}
                    className="text-xs font-bold text-[#8275D8] hover:underline flex items-center gap-1"
                  >
                    <span>View in Time Machine</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {result.blockers.map(b => (
                    <div key={b.id} className="p-3 bg-white border border-[#FCD5D6] rounded-xl text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[#25243A]">{b.title}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FEF2F2] text-[#B91C1C]">
                          {b.conflictType}
                        </span>
                      </div>
                      <p className="text-[#77778A] mt-1">{b.description}</p>
                      <div className="mt-2 text-[11px] text-[#25243A] italic bg-[#FAF9FD] p-2.5 rounded-lg border border-[#EAEAF2] flex items-start justify-between gap-2">
                        <span>Evidence: "{b.supportingMessage}"</span>
                        <button
                          onClick={() => handleCopyQuote(b.supportingMessage)}
                          className="text-[#77778A] hover:text-[#8275D8] p-1 shrink-0"
                          title="Copy quote"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Time Machine Teaser Card */}
            <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EAEAF2]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8275D8]" />
                  <h3 className="text-sm font-bold text-[#25243A]">Conversation Time Machine</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F2F0FB] text-[#8275D8]">
                    Signature Feature
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('timemachine')}
                  className="text-xs font-bold text-[#8275D8] hover:text-[#5B4DB8] flex items-center gap-1"
                >
                  <span>Open Full Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {timeMachineThreads[0] && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-[#FAF9FD] border border-[#EAEAF2] rounded-xl">
                    <span className="text-[10px] font-bold text-[#8275D8] uppercase">1. Original Proposal</span>
                    <p className="font-semibold text-[#25243A] mt-1 truncate">{timeMachineThreads[0].originalMessage.sender}</p>
                    <p className="text-[11px] text-[#77778A] line-clamp-2 mt-0.5">"{timeMachineThreads[0].originalMessage.text}"</p>
                  </div>
                  <div className="p-3 bg-[#F8FDFB] border border-[#D5EFEA] rounded-xl">
                    <span className="text-[10px] font-bold text-[#2C7A6B] uppercase">2. Later Update</span>
                    <p className="font-semibold text-[#25243A] mt-1 truncate">{timeMachineThreads[0].laterUpdate.sender}</p>
                    <p className="text-[11px] text-[#77778A] line-clamp-2 mt-0.5">"{timeMachineThreads[0].laterUpdate.text}"</p>
                  </div>
                  <div className="p-3 bg-white border border-[#EAEAF2] rounded-xl">
                    <span className="text-[10px] font-bold text-[#25243A] uppercase">3. Current Status</span>
                    <p className="font-semibold text-[#25243A] mt-1 line-clamp-2">{timeMachineThreads[0].currentStatus.statusText}</p>
                  </div>
                  <div className="p-3 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl">
                    <span className="text-[10px] font-bold text-[#8275D8] uppercase">4. Next Step</span>
                    <p className="text-[#25243A] font-medium mt-1 line-clamp-2">{timeMachineThreads[0].recommendedNextStep}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hackathon Twin Feature Cards: Responsibility Radar & Trust Every Answer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Responsibility Radar Teaser */}
              <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#EDF7F5] border border-[#C2E8E1] flex items-center justify-center text-[#2C7A6B]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#25243A]">My Responsibility Radar</h4>
                      <p className="text-[11px] text-[#77778A]">Zero guessing. Direct vs. teammate vs. open tasks.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('radar')}
                    className="text-xs font-bold text-[#2C7A6B] hover:underline flex items-center gap-1"
                  >
                    <span>View Radar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#EAEAF2] text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#F2F0FB]">
                    <span className="text-[10px] font-bold text-[#8275D8]">Assigned to You</span>
                    <p className="text-lg font-extrabold text-[#25243A] mt-0.5">
                      {result.tasks.filter(t => t.assignee?.toLowerCase().includes((targetUser || 'you').toLowerCase())).length}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#EDF7F5]">
                    <span className="text-[10px] font-bold text-[#2C7A6B]">Teammates</span>
                    <p className="text-lg font-extrabold text-[#25243A] mt-0.5">
                      {result.tasks.filter(t => t.assignee && !t.assignee.toLowerCase().includes((targetUser || 'you').toLowerCase()) && t.assignee !== 'Not specified').length}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FFFDF5]">
                    <span className="text-[10px] font-bold text-[#B45309]">Unassigned</span>
                    <p className="text-lg font-extrabold text-[#25243A] mt-0.5">
                      {result.tasks.filter(t => !t.assignee || t.assignee === 'Not specified').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Every Answer Teaser */}
              <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F2F0FB] border border-[#E0DCF7] flex items-center justify-center text-[#8275D8]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#25243A]">Trust Every Answer</h4>
                      <p className="text-[11px] text-[#77778A]">Facts vs. interpretations backed by verbatim quotes.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('trust')}
                    className="text-xs font-bold text-[#8275D8] hover:underline flex items-center gap-1"
                  >
                    <span>Audit Quotes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#EAEAF2] text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#EDF7F5]">
                    <span className="text-[10px] font-bold text-[#2C7A6B]">Verified Facts</span>
                    <p className="text-lg font-extrabold text-[#25243A] mt-0.5">
                      {result.decisions.filter(d => d.status === 'Confirmed' || d.status === 'Cancelled').length + result.personalMentions.length}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F2F0FB]">
                    <span className="text-[10px] font-bold text-[#8275D8]">Interpretations</span>
                    <p className="text-lg font-extrabold text-[#25243A] mt-0.5">
                      {result.tasks.length}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FEF2F2]">
                    <span className="text-[10px] font-bold text-[#B91C1C]">Conflicts/Open</span>
                    <p className="text-lg font-extrabold text-[#25243A] mt-0.5">
                      {result.blockers.length + result.unansweredQuestions.filter(q => q.status === 'Unanswered').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Mentions Spotlight for target user */}
            {result.personalMentions.length > 0 && (
              <div className="p-4 bg-[#EDF7F5] border border-[#C2E8E1] rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#2C7A6B] flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-[#4FAE9B]" />
                    Direct Callouts & Assignments for {targetUser}
                  </span>
                  <button
                    onClick={() => setActiveTab('mentions')}
                    className="text-xs text-[#2C7A6B] font-bold underline"
                  >
                    View All Mentions ({result.personalMentions.length})
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {result.personalMentions.slice(0, 2).map(m => (
                    <div key={m.id} className="p-3 bg-white border border-[#C2E8E1] rounded-xl text-xs">
                      <div className="flex items-center justify-between text-[#77778A] mb-1">
                        <span className="font-bold text-[#25243A]">{m.sender}</span>
                        <PriorityBadge priority={m.urgency} />
                      </div>
                      <p className="text-[#2C7A6B] font-semibold mb-1">Action: {m.requestedAction}</p>
                      <p className="text-[#77778A] text-[11px] italic">"{m.supportingMessage}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights: Top Tasks & Top Decisions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Tasks */}
              <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#25243A] text-sm flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#8275D8]" />
                    Action Items ({result.tasks.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs text-[#8275D8] font-bold underline"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-2">
                  {result.tasks.slice(0, 4).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={onToggleTaskComplete}
                      isExpanded={Boolean(expandedQuotes[task.id])}
                      onToggleQuote={() => toggleQuote(task.id)}
                      onCopyQuote={handleCopyQuote}
                    />
                  ))}
                </div>
              </div>

              {/* Top Decisions */}
              <div className="bg-white border border-[#EAEAF2] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#25243A] text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4FAE9B]" />
                    Decisions & Plans ({result.decisions.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('decisions')}
                    className="text-xs text-[#4FAE9B] font-bold underline"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-2">
                  {result.decisions.slice(0, 4).map(decision => (
                    <DecisionCard
                      key={decision.id}
                      decision={decision}
                      isExpanded={Boolean(expandedQuotes[decision.id])}
                      onToggleQuote={() => toggleQuote(decision.id)}
                      onCopyQuote={handleCopyQuote}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONVERSATION TIME MACHINE */}
        {activeTab === 'timemachine' && (
          <div role="tabpanel">
            <ConversationTimeMachine
              threads={timeMachineThreads}
              onCopyQuote={handleCopyQuote}
            />
          </div>
        )}

        {/* TAB: MY RESPONSIBILITY RADAR (Hackathon Feature) */}
        {activeTab === 'radar' && (
          <div role="tabpanel">
            <MyResponsibilityRadar
              tasks={result.tasks}
              targetUser={targetUser}
              onToggleTaskComplete={onToggleTaskComplete}
              onCopyQuote={handleCopyQuote}
            />
          </div>
        )}

        {/* TAB: TRUST EVERY ANSWER (Hackathon Feature) */}
        {activeTab === 'trust' && (
          <div role="tabpanel">
            <TrustEveryAnswer
              result={result}
              onCopyQuote={handleCopyQuote}
            />
          </div>
        )}

        {/* TAB 3: ACTION ITEMS */}
        {activeTab === 'tasks' && (
          <div role="tabpanel" className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#77778A] px-1">
              <span>Showing {filteredTasks.length} of {result.tasks.length} action items</span>
              <button
                onClick={handleCopyActionItems}
                className="text-[#8275D8] hover:text-[#5B4DB8] font-semibold underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Checklist</span>
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <EmptyState message="No action items match the selected filter." />
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggleTaskComplete}
                    isExpanded={Boolean(expandedQuotes[task.id])}
                    onToggleQuote={() => toggleQuote(task.id)}
                    onCopyQuote={handleCopyQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DECISIONS */}
        {activeTab === 'decisions' && (
          <div role="tabpanel" className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#77778A] px-1">
              <span>Showing {filteredDecisions.length} explicit decisions and confirmed plan changes</span>
            </div>

            {filteredDecisions.length === 0 ? (
              <EmptyState message="No decisions match the selected filter." />
            ) : (
              <div className="space-y-2.5">
                {filteredDecisions.map(decision => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    isExpanded={Boolean(expandedQuotes[decision.id])}
                    onToggleQuote={() => toggleQuote(decision.id)}
                    onCopyQuote={handleCopyQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: IMPORTANT UPDATES / ANNOUNCEMENTS */}
        {activeTab === 'updates' && (
          <div role="tabpanel" className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#77778A] px-1">
              <span>Showing {filteredUpdates.length} of {result.updates.length} announcements & schedule updates</span>
            </div>

            {filteredUpdates.length === 0 ? (
              <EmptyState message="No announcements match the selected filter." />
            ) : (
              <div className="space-y-2.5">
                {filteredUpdates.map(update => (
                  <UpdateCard
                    key={update.id}
                    update={update}
                    isExpanded={Boolean(expandedQuotes[update.id])}
                    onToggleQuote={() => toggleQuote(update.id)}
                    onCopyQuote={handleCopyQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DEADLINES */}
        {activeTab === 'deadlines' && (
          <div role="tabpanel" className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#77778A] px-1">
              <span>Showing {filteredDeadlines.length} scheduled dates and deadlines</span>
            </div>

            {filteredDeadlines.length === 0 ? (
              <EmptyState message="No deadlines match the selected filter." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDeadlines.map(dl => (
                  <DeadlineCard
                    key={dl.id}
                    deadline={dl}
                    isExpanded={Boolean(expandedQuotes[dl.id])}
                    onToggleQuote={() => toggleQuote(dl.id)}
                    onCopyQuote={handleCopyQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PERSONAL MENTIONS */}
        {activeTab === 'mentions' && (
          <div role="tabpanel" className="space-y-3">
            <div className="p-3 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-xs text-[#8275D8] font-medium">
              Showing callouts, direct mentions, or assignments for <strong>{targetUser}</strong>.
            </div>

            {filteredMentions.length === 0 ? (
              <EmptyState message={`No direct mentions found for ${targetUser}.`} />
            ) : (
              <div className="space-y-2.5">
                {filteredMentions.map(mention => (
                  <MentionCard
                    key={mention.id}
                    mention={mention}
                    isExpanded={Boolean(expandedQuotes[mention.id])}
                    onToggleQuote={() => toggleQuote(mention.id)}
                    onCopyQuote={handleCopyQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: UNANSWERED QUESTIONS */}
        {activeTab === 'questions' && (
          <div role="tabpanel" className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#77778A] px-1">
              <span>Showing questions that received no clear recorded answer in this thread</span>
            </div>

            {filteredQuestions.length === 0 ? (
              <EmptyState message="No unanswered questions detected." />
            ) : (
              <div className="space-y-2.5">
                {filteredQuestions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isExpanded={Boolean(expandedQuotes[q.id])}
                    onToggleQuote={() => toggleQuote(q.id)}
                    onCopyQuote={handleCopyQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: CONFLICTS & BLOCKERS */}
        {activeTab === 'blockers' && (
          <div role="tabpanel" className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#77778A] px-1">
              <span>Showing conflicting timelines, dependency blockers, and contradictory statements</span>
            </div>

            {filteredBlockers.length === 0 ? (
              <EmptyState message="No conflicting information or blockers detected." />
            ) : (
              filteredBlockers.map(b => (
                <div key={b.id} className="p-4 bg-white border border-[#FCD5D6] rounded-2xl text-xs shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#F47174]" />
                      <span className="font-bold text-sm text-[#25243A]">{b.title}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FEF2F2] text-[#B91C1C]">
                      {b.conflictType}
                    </span>
                  </div>
                  <p className="text-[#77778A] leading-relaxed mb-3">{b.description}</p>
                  <div className="p-3 bg-[#FAF9FD] border border-[#EAEAF2] rounded-xl text-[#25243A] italic text-[11px] flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#77778A] not-italic mb-1 flex items-center gap-1.5">
                        <Quote className="w-3 h-3 text-[#F47174]" />
                        <span>Contradictory Verbatim Evidence:</span>
                      </p>
                      "{b.supportingMessage}"
                    </div>
                    <button
                      onClick={() => handleCopyQuote(b.supportingMessage)}
                      className="text-[#77778A] hover:text-[#8275D8] p-1 shrink-0"
                      title="Copy quote"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 10: LOW PRIORITY MESSAGES */}
        {activeTab === 'casual' && (
          <div role="tabpanel" className="space-y-3">
            <div className="p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl text-xs text-[#77778A]">
              ☕ <strong>Low Priority Filter:</strong> These {result.casualMessages.length} messages were classified as social banter, coffee invites, or greetings. They require no action.
            </div>

            {filteredCasual.length === 0 ? (
              <EmptyState message="No low-priority messages match the filter." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCasual.map(c => (
                  <div key={c.id} className="p-3 bg-white border border-[#EAEAF2] rounded-xl text-xs">
                    <div className="flex items-center justify-between text-[#77778A] mb-1">
                      <span className="font-bold text-[#25243A]">{c.sender}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#F1F1F7] text-[#77778A] rounded">Low Priority</span>
                    </div>
                    <p className="text-[#25243A] italic">"{c.snippet}"</p>
                    <p className="text-[11px] text-[#77778A] mt-1">{c.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon: React.ReactNode;
  highlight?: boolean;
  danger?: boolean;
}> = ({ active, onClick, label, count, icon, highlight, danger }) => {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
        active
          ? 'bg-[#8275D8] text-white border-[#8275D8] shadow-xs'
          : danger
          ? 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA] hover:bg-[#FEE2E2]'
          : highlight
          ? 'text-[#8275D8] bg-[#F2F0FB] border-[#E0DCF7] hover:bg-[#EAE6F9]'
          : 'text-[#77778A] bg-[#F8F8FC] border-[#EAEAF2] hover:bg-white hover:text-[#25243A]'
      } focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            active
              ? 'bg-white/20 text-white'
              : danger
              ? 'bg-[#FECACA] text-[#B91C1C]'
              : 'bg-white text-[#77778A] border border-[#EAEAF2]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
          <Flame className="w-3 h-3 fill-current text-[#F47174]" />
          Urgent
        </span>
      );
    case 'IMPORTANT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFFDF5] text-[#B45309] border border-[#FDE68A]">
          Important
        </span>
      );
    case 'NORMAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F8FAFF] text-[#1D4ED8] border border-[#BFDBFE]">
          Normal
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F8F8FC] text-[#64748B] border border-[#EAEAF2]">
          Low
        </span>
      );
  }
};

const TaskCard: React.FC<{
  task: TaskItem;
  onToggle: (id: string) => void;
  isExpanded: boolean;
  onToggleQuote: () => void;
  onCopyQuote: (quote: string) => void;
}> = ({ task, onToggle, isExpanded, onToggleQuote, onCopyQuote }) => {
  const hasSpecificAssignee = task.assignee && task.assignee !== 'Not specified';
  const hasSpecificDeadline = task.deadline && task.deadline !== 'Not specified';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all text-xs ${
        task.completed
          ? 'bg-[#FAF9FD]/50 border-[#EAEAF2] opacity-60'
          : 'bg-white border-[#EAEAF2] hover:border-[#8275D8]/40 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox button */}
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 text-[#77778A] hover:text-[#8275D8] transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none rounded"
          title={task.completed ? 'Mark incomplete' : 'Mark completed'}
          aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" completed`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-[#8275D8]" />
          ) : (
            <Circle className="w-4 h-4 text-[#9E9EAF]" />
          )}
        </button>

        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h4
              className={`font-bold text-sm ${
                task.completed ? 'line-through text-[#77778A]' : 'text-[#25243A]'
              }`}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-1.5">
              <PriorityBadge priority={task.priority} />
              {task.confidence && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#F8F8FC] text-[#77778A] border border-[#EAEAF2]">
                  {task.confidence}
                </span>
              )}
            </div>
          </div>

          {/* Details row: Assignee, Deadline, Category */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#77778A]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-[#77778A]" />
              <span>
                Assignee:{' '}
                <strong className={hasSpecificAssignee ? 'text-[#25243A]' : 'text-[#77778A] font-normal'}>
                  {task.assignee || 'Not specified'}
                </strong>
              </span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8275D8]" />
              <span>
                Deadline:{' '}
                <strong className={hasSpecificDeadline ? 'text-[#8275D8]' : 'text-[#77778A] font-normal'}>
                  {task.deadline || 'Not specified'}
                </strong>
              </span>
            </span>

            {task.category && (
              <span className="px-2 py-0.5 rounded bg-[#F8F8FC] border border-[#EAEAF2] text-[#77778A]">
                {task.category}
              </span>
            )}
          </div>

          {/* Priority Reason */}
          {task.priorityReason && (
            <p className="text-[11px] text-[#77778A] italic">
              Reason: {task.priorityReason}
            </p>
          )}

          {/* Expandable Supporting Quote */}
          <div className="pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleQuote}
                className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
              >
                <Quote className="w-3 h-3 text-[#8275D8]" />
                <span>{isExpanded ? 'Hide source quote' : 'View verbatim quote'}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {isExpanded && (
                <button
                  onClick={() => onCopyQuote(task.supportingMessage)}
                  className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
                  title="Copy quote to clipboard"
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

const UpdateCard: React.FC<{
  update: UpdateItem;
  isExpanded: boolean;
  onToggleQuote: () => void;
  onCopyQuote: (quote: string) => void;
}> = ({ update, isExpanded, onToggleQuote, onCopyQuote }) => {
  return (
    <div className="p-4 rounded-2xl border bg-white border-[#EAEAF2] hover:border-[#8275D8]/40 shadow-xs text-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold text-[#25243A] text-sm">{update.title}</h4>
        <PriorityBadge priority={update.priority} />
      </div>

      <p className="text-[#77778A]">{update.detail}</p>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onToggleQuote}
          className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
        >
          <Quote className="w-3 h-3 text-[#8275D8]" />
          <span>{isExpanded ? 'Hide quote' : 'View source quote'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isExpanded && (
          <button
            onClick={() => onCopyQuote(update.supportingMessage)}
            className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
          >
            <Copy className="w-3 h-3" />
            <span>Copy quote</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 p-2.5 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-[11px] text-[#25243A] font-mono">
          "{update.supportingMessage}"
        </div>
      )}
    </div>
  );
};

const DecisionCard: React.FC<{
  decision: DecisionItem;
  isExpanded: boolean;
  onToggleQuote: () => void;
  onCopyQuote: (quote: string) => void;
}> = ({ decision, isExpanded, onToggleQuote, onCopyQuote }) => {
  const isCancelled = decision.status === 'Cancelled';
  return (
    <div
      className={`p-4 rounded-2xl border text-xs shadow-xs ${
        isCancelled
          ? 'bg-[#FEF9F9] border-[#FCD5D6]'
          : 'bg-white border-[#EAEAF2] hover:border-[#4FAE9B]/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
            isCancelled
              ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
              : decision.status === 'Confirmed'
              ? 'bg-[#EDF7F5] text-[#2C7A6B] border-[#C2E8E1]'
              : 'bg-[#F2F0FB] text-[#8275D8] border-[#E0DCF7]'
          }`}
        >
          {decision.status}
        </span>

        <span className="text-[11px] text-[#77778A]">
          Confirmed by: <strong className="text-[#25243A]">{decision.confirmedBy || 'Not specified'}</strong>
        </span>
      </div>

      <p className="font-bold text-[#25243A] text-sm mb-2">{decision.decision}</p>

      {/* Expandable Quote */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleQuote}
          className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
        >
          <Quote className="w-3 h-3 text-[#8275D8]" />
          <span>{isExpanded ? 'Hide verbatim quote' : 'View original quote'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isExpanded && (
          <button
            onClick={() => onCopyQuote(decision.supportingMessage)}
            className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
          >
            <Copy className="w-3 h-3" />
            <span>Copy quote</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 p-2.5 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-[11px] text-[#25243A] font-mono leading-relaxed animate-in fade-in duration-150">
          "{decision.supportingMessage}"
        </div>
      )}
    </div>
  );
};

const DeadlineCard: React.FC<{
  deadline: DeadlineItem;
  isExpanded: boolean;
  onToggleQuote: () => void;
  onCopyQuote: (quote: string) => void;
}> = ({ deadline, isExpanded, onToggleQuote, onCopyQuote }) => {
  const isContested = deadline.status === 'Contested';
  const isConfirmed = deadline.status === 'Confirmed';

  return (
    <div
      className={`p-4 rounded-2xl text-xs space-y-2 transition-all border shadow-xs ${
        isContested
          ? 'bg-[#FEF9F9] border-[#FCD5D6]'
          : 'bg-white border-[#EAEAF2] hover:border-[#8275D8]/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={deadline.priority} />
          {deadline.status && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                isContested
                  ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                  : isConfirmed
                  ? 'bg-[#EDF7F5] text-[#2C7A6B] border-[#C2E8E1]'
                  : 'bg-[#FFFDF5] text-[#B45309] border-[#FDE68A]'
              }`}
            >
              {deadline.status}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#77778A]">
          Owner: <strong className="text-[#25243A]">{deadline.owner || 'Not specified'}</strong>
        </span>
      </div>

      <h4 className="font-bold text-[#25243A] text-sm">{deadline.title}</h4>

      <div className="flex items-center gap-1.5 text-[#8275D8] font-bold">
        <Calendar className="w-3.5 h-3.5 text-[#8275D8]" />
        <span>{deadline.rawDeadline}</span>
      </div>

      {deadline.conflictNote && (
        <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] text-[#B91C1C] flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F47174] shrink-0 mt-0.5" />
          <span>{deadline.conflictNote}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onToggleQuote}
          className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
        >
          <Quote className="w-3 h-3 text-[#8275D8]" />
          <span>{isExpanded ? 'Hide quote' : 'View quote'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isExpanded && (
          <button
            onClick={() => onCopyQuote(deadline.supportingMessage)}
            className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
          >
            <Copy className="w-3 h-3" />
            <span>Copy quote</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-2.5 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-[11px] text-[#25243A] font-mono">
          "{deadline.supportingMessage}"
        </div>
      )}
    </div>
  );
};

const MentionCard: React.FC<{
  mention: MentionItem;
  isExpanded: boolean;
  onToggleQuote: () => void;
  onCopyQuote: (quote: string) => void;
}> = ({ mention, isExpanded, onToggleQuote, onCopyQuote }) => {
  return (
    <div className="p-4 bg-white border border-[#EAEAF2] rounded-2xl text-xs space-y-2 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-[#25243A]">
          <User className="w-3.5 h-3.5 text-[#8275D8]" />
          <span>{mention.sender}</span>
          {mention.timestamp && mention.timestamp !== 'Not specified' && (
            <span className="text-[#77778A] font-normal text-[11px]">({mention.timestamp})</span>
          )}
        </div>
        <PriorityBadge priority={mention.urgency} />
      </div>

      <div className="p-2.5 bg-[#F2F0FB] border border-[#E0DCF7] rounded-xl text-[#8275D8] font-bold">
        Action for you: {mention.requestedAction}
      </div>

      <p className="text-[#25243A]">{mention.text}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleQuote}
          className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
        >
          <Quote className="w-3 h-3 text-[#8275D8]" />
          <span>{isExpanded ? 'Hide verbatim quote' : 'View original source quote'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isExpanded && (
          <button
            onClick={() => onCopyQuote(mention.supportingMessage)}
            className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
          >
            <Copy className="w-3 h-3" />
            <span>Copy quote</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-2.5 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-[11px] text-[#25243A] font-mono">
          "{mention.supportingMessage}"
        </div>
      )}
    </div>
  );
};

const QuestionCard: React.FC<{
  question: QuestionItem;
  isExpanded: boolean;
  onToggleQuote: () => void;
  onCopyQuote: (quote: string) => void;
}> = ({ question, isExpanded, onToggleQuote, onCopyQuote }) => {
  return (
    <div className="p-4 bg-white border border-[#EAEAF2] rounded-2xl text-xs space-y-2 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FFFDF5] text-[#B45309] border border-[#FDE68A]">
          {question.status}
        </span>
        <span className="text-[#77778A] text-[11px]">
          Asked by <strong className="text-[#25243A]">{question.askedBy}</strong> to{' '}
          <strong className="text-[#25243A]">{question.addressedTo}</strong>
        </span>
      </div>

      <p className="font-bold text-[#25243A] text-sm">{question.question}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleQuote}
          className="text-[11px] text-[#8275D8] hover:text-[#5B4DB8] font-medium flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
        >
          <Quote className="w-3 h-3 text-[#8275D8]" />
          <span>{isExpanded ? 'Hide quote' : 'View original quote'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isExpanded && (
          <button
            onClick={() => onCopyQuote(question.supportingMessage)}
            className="text-[11px] text-[#77778A] hover:text-[#25243A] flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] rounded"
          >
            <Copy className="w-3 h-3" />
            <span>Copy quote</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-2.5 bg-[#FAF9FD] border border-[#E0DCF7] rounded-xl text-[11px] text-[#25243A] font-mono">
          "{question.supportingMessage}"
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="p-8 text-center bg-white border border-[#EAEAF2] rounded-2xl text-[#77778A] text-xs">
      <FolderOpen className="w-8 h-8 text-[#9E9EAF] mx-auto mb-2 opacity-60" />
      <p>{message}</p>
    </div>
  );
};
