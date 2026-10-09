export type PriorityLevel = 'URGENT' | 'IMPORTANT' | 'NORMAL' | 'LOW';

export type ConfidenceLevel = 'High' | 'Medium' | 'Uncertain';

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: PriorityLevel;
  priorityReason: string;
  supportingMessage: string;
  confidence: ConfidenceLevel;
  completed: boolean;
  category?: string;
}

export interface DecisionItem {
  id: string;
  decision: string;
  status: 'Confirmed' | 'Proposal' | 'Cancelled' | 'Uncertain';
  confirmedBy: string;
  supportingMessage: string;
  confidence: ConfidenceLevel;
}

export interface DeadlineItem {
  id: string;
  title: string;
  rawDeadline: string;
  owner: string;
  priority: PriorityLevel;
  supportingMessage: string;
  isPassedOrNear?: boolean;
  status?: 'Confirmed' | 'Unconfirmed' | 'Contested';
  conflictNote?: string;
}

export interface MentionItem {
  id: string;
  sender: string;
  timestamp?: string;
  text: string;
  urgency: PriorityLevel;
  requestedAction: string;
  supportingMessage: string;
}

export interface QuestionItem {
  id: string;
  question: string;
  askedBy: string;
  addressedTo: string;
  status: 'Unanswered' | 'Resolved' | 'Uncertain';
  supportingMessage: string;
}

export interface UpdateItem {
  id: string;
  title: string;
  detail: string;
  priority: PriorityLevel;
  supportingMessage: string;
}

export interface BlockerItem {
  id: string;
  title: string;
  description: string;
  conflictType: 'Timeline Conflict' | 'Requirement Conflict' | 'Resource Blocker' | 'Uncertain';
  severity: 'High' | 'Medium' | 'Low';
  supportingMessage: string;
}

export interface CasualItem {
  id: string;
  sender: string;
  snippet: string;
  reason: string;
}

export interface ExecutiveSummary {
  headline: string;
  overview: string;
  keyTakeaways: string[];
  sentimentMood: string;
  timeSavedMinutes: number;
}

export interface TimeMachineThread {
  id: string;
  topic: string;
  originalMessage: {
    sender: string;
    text: string;
    timestamp?: string;
  };
  laterUpdate: {
    sender: string;
    text: string;
    timestamp?: string;
    changeType: 'rescheduled' | 'assigned' | 'decided' | 'cancelled' | 'disputed' | 'updated';
  };
  currentStatus: {
    statusText: string;
    badgeType: 'confirmed' | 'contested' | 'unconfirmed' | 'cancelled';
  };
  recommendedNextStep: string;
  supportingMessage: string;
}

export interface AnalysisResult {
  summary: ExecutiveSummary;
  stats: {
    totalMessagesCount: number;
    actionItemsCount: number;
    decisionsCount: number;
    deadlinesCount: number;
    personalMentionsCount: number;
    unansweredQuestionsCount: number;
    urgentCount: number;
  };
  tasks: TaskItem[];
  decisions: DecisionItem[];
  deadlines: DeadlineItem[];
  personalMentions: MentionItem[];
  unansweredQuestions: QuestionItem[];
  updates: UpdateItem[];
  blockers: BlockerItem[];
  casualMessages: CasualItem[];
  timeMachineThreads?: TimeMachineThread[];
  analysisMode: 'gemini' | 'local';
  timestamp: string;
  detectedParticipants: string[];
  targetUser?: string;
}

export interface ConversationContext {
  platform: 'slack' | 'discord' | 'whatsapp' | 'email' | 'general';
  channelName?: string;
  userName?: string;
}
