import { AnalysisResult, TaskItem, DecisionItem, DeadlineItem, MentionItem, QuestionItem, UpdateItem, BlockerItem, CasualItem, PriorityLevel } from '../types/analysis';

export interface ParsedMessage {
  raw: string;
  sender: string;
  timestamp: string;
  text: string;
  index: number;
}

/**
 * Parses raw chat input into individual structured messages
 * Supports formats:
 * - [10:30 AM] Rahul: Message
 * - Rahul [10:30]: Message
 * - [2026-10-09 10:30] Rahul: Message
 * - Rahul: Message
 * - 10:30 Rahul: Message
 * - Plain lines
 */
export function parseConversationMessages(rawText: string): ParsedMessage[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const messages: ParsedMessage[] = [];

  // Regex patterns for message prefixes
  const pattern1 = /^\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*([A-Za-z0-9_\-\s@.()]+?):\s*(.*)$/; // [10:30 AM] Rahul (DevOps): text
  const pattern2 = /^([A-Za-z0-9_\-\s@.()]+?)\s*\[(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]:\s*(.*)$/; // Rahul (DevOps) [10:30]: text
  const pattern3 = /^([A-Za-z0-9_\-\s@.()]+?):\s*(.*)$/; // Rahul: text
  const pattern4 = /^\[?(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?,?\s*\d{1,2}:\d{2}(?:\s*[APap][Mm])?)\]?\s*([A-Za-z0-9_\-\s@.()]+?):\s*(.*)$/; // [12/04/2026, 10:30 AM] Rahul: text

  let msgIndex = 0;

  for (const line of lines) {
    let match = line.match(pattern4);
    if (match) {
      messages.push({
        raw: line,
        timestamp: match[1].trim(),
        sender: match[2].trim(),
        text: match[3].trim(),
        index: msgIndex++
      });
      continue;
    }

    match = line.match(pattern1);
    if (match) {
      messages.push({
        raw: line,
        timestamp: match[1].trim(),
        sender: match[2].trim(),
        text: match[3].trim(),
        index: msgIndex++
      });
      continue;
    }

    match = line.match(pattern2);
    if (match) {
      messages.push({
        raw: line,
        timestamp: match[2].trim(),
        sender: match[1].trim(),
        text: match[3].trim(),
        index: msgIndex++
      });
      continue;
    }

    match = line.match(pattern3);
    if (match) {
      messages.push({
        raw: line,
        timestamp: 'Not specified',
        sender: match[1].trim(),
        text: match[2].trim(),
        index: msgIndex++
      });
      continue;
    }

    // Fallback: if previous message exists, append line; else create generic line message
    if (messages.length > 0 && !line.includes(':')) {
      messages[messages.length - 1].text += ' ' + line;
      messages[messages.length - 1].raw += '\n' + line;
    } else {
      messages.push({
        raw: line,
        timestamp: 'Not specified',
        sender: 'Participant',
        text: line,
        index: msgIndex++
      });
    }
  }

  return messages;
}

/**
 * Extracts distinct participants from messages
 */
export function extractParticipants(messages: ParsedMessage[]): string[] {
  const set = new Set<string>();
  for (const msg of messages) {
    if (msg.sender && msg.sender !== 'Participant') {
      set.add(msg.sender);
    }
  }
  return Array.from(set);
}

/**
 * Deterministic rule-based local analyzer.
 * Guaranteed 100% in-browser, zero external network calls.
 */
export function analyzeConversationLocally(rawText: string, targetUserName: string = 'You'): AnalysisResult {
  const messages = parseConversationMessages(rawText);
  const participants = extractParticipants(messages);
  const normalizedTarget = (targetUserName || 'You').trim().toLowerCase();

  const tasks: TaskItem[] = [];
  const decisions: DecisionItem[] = [];
  const deadlines: DeadlineItem[] = [];
  const personalMentions: MentionItem[] = [];
  const unansweredQuestions: QuestionItem[] = [];
  const updates: UpdateItem[] = [];
  const blockers: BlockerItem[] = [];
  const casualMessages: CasualItem[] = [];

  // Keyword matchers
  const taskKeywords = [
    /\b(please|must|need to|have to|should|will finish|will do|i will|let'?s|action item|todo|assign|assigned|prepare|submit|review|implement|write|deploy|send)\b/i,
    /\b(i'?ll handle|i'?ll finish|i'?ll work on|take care of)\b/i
  ];

  const decisionKeywords = [
    /\b(decided to|decided that|agreed to|agreed on|we will go with|settled on|confirmed that|consensus is|final call)\b/i
  ];

  const cancellationKeywords = [
    /\b(cancelled|canceled|postponed|rescheduled|scrapped|called off|no longer happening|dropping)\b/i
  ];

  const deadlineKeywords = [
    /\b(?:by|on|at|before|due|is|scheduled for|moved to)\s+((?:tomorrow|today|tonight|friday|monday|tuesday|wednesday|thursday|saturday|sunday|next week|eod|end of day|\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?)/i,
    /\b((?:friday|monday|tuesday|wednesday|thursday|saturday|sunday|tomorrow|today)\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i
  ];

  const casualKeywords = [
    /\b(coffee|lunch|dinner|drinks|tea|pizza|haha|lol|rofl|lmao|cool|nice|awesome|good morning|gm|gn|bye|see ya|random)\b/i
  ];

  // Map to track questions and check if they got answered later
  const questionMap: { msg: ParsedMessage; text: string }[] = [];

  // Collect potential conflicting deadlines
  const deadlineTracking: { topic: string; deadline: string; msg: ParsedMessage }[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const textLower = msg.text.toLowerCase();

    // 1. Check for Casual / Low-Priority banter
    const isCasual = casualKeywords.some(rx => rx.test(textLower)) && !taskKeywords[0].test(textLower);
    if (isCasual) {
      casualMessages.push({
        id: `local-casual-${i}`,
        sender: msg.sender,
        snippet: msg.text,
        reason: 'Casual conversation or social greeting without actionable commitments.'
      });
      // Casual messages don't generate tasks, continue to next checks
    }

    // 2. Personal Mentions
    const isDirectlyMentioned =
      normalizedTarget === 'you'
        ? (textLower.includes('@you') || textLower.startsWith('you,') || textLower.startsWith('you:'))
        : (textLower.includes(`@${normalizedTarget}`) ||
           textLower.includes(`to ${normalizedTarget}`) ||
           textLower.startsWith(`${normalizedTarget},`) ||
           textLower.startsWith(`${normalizedTarget}:`));

    if (isDirectlyMentioned) {
      let urgency: PriorityLevel = 'IMPORTANT';
      if (isCasual) {
        urgency = 'LOW';
      } else if (/\b(urgent|asap|critical|immediately)\b/i.test(textLower)) {
        urgency = 'URGENT';
      } else if (/\btoday\b/i.test(textLower) && /\b(please|must|slides|report|presentation|task|pr|pull request|deploy|review|prepare|finish|submit)\b/i.test(textLower)) {
        urgency = 'URGENT';
      }

      personalMentions.push({
        id: `local-mention-${i}`,
        sender: msg.sender,
        timestamp: msg.timestamp,
        text: msg.text,
        urgency,
        requestedAction: extractRequestedAction(msg.text),
        supportingMessage: msg.raw
      });
    }

    // 3. Cancellations & Plan Changes
    const isCancellation = cancellationKeywords.some(rx => rx.test(textLower));
    if (isCancellation) {
      decisions.push({
        id: `local-decision-cancel-${i}`,
        decision: `Plan change or cancellation: ${msg.text}`,
        status: 'Cancelled',
        confirmedBy: msg.sender,
        supportingMessage: msg.raw,
        confidence: 'High'
      });
      updates.push({
        id: `local-update-cancel-${i}`,
        title: 'Event or Task Cancelled',
        detail: msg.text,
        priority: 'IMPORTANT',
        supportingMessage: msg.raw
      });
    }

    // Important Announcements and Status Updates
    const isAnnouncement = /\b(sign-off|scheduled|review is on|update:|heads up|fyi|notice:|progress:|deploy|release|green yet|ready|launched|submission deadline)\b/i.test(textLower) && !isCancellation && !isCasual;
    if (isAnnouncement) {
      updates.push({
        id: `local-update-${i}`,
        title: summarizeDeadlineTitle(msg.text),
        detail: msg.text,
        priority: /urgent|critical|blocker|not green|must|alert/i.test(textLower) ? 'URGENT' : 'IMPORTANT',
        supportingMessage: msg.raw
      });
    }

    // 4. Decisions
    const isDecision = decisionKeywords.some(rx => rx.test(textLower));
    if (isDecision && !isCancellation) {
      decisions.push({
        id: `local-decision-${i}`,
        decision: cleanDecisionText(msg.text),
        status: 'Confirmed',
        confirmedBy: msg.sender,
        supportingMessage: msg.raw,
        confidence: 'High'
      });
    }

    // 5. Deadlines
    const deadlineMatch = msg.text.match(deadlineKeywords[0]) || msg.text.match(deadlineKeywords[1]);
    if (deadlineMatch) {
      const extractedDeadline = deadlineMatch[1] || deadlineMatch[0];
      const isUrgent = /today|asap|tonight|immediately|urgent/i.test(extractedDeadline) || /urgent/i.test(msg.text);
      const isConfirmed = /confirmed|scheduled for|review is on|done|sharp/i.test(msg.text) && !/wait|moved to|postponed|aren't green/i.test(msg.text);

      deadlines.push({
        id: `local-deadline-${i}`,
        title: summarizeDeadlineTitle(msg.text),
        rawDeadline: extractedDeadline,
        owner: msg.sender,
        priority: isUrgent ? 'URGENT' : 'IMPORTANT',
        supportingMessage: msg.raw,
        status: isConfirmed ? 'Confirmed' : 'Unconfirmed'
      });

      deadlineTracking.push({
        topic: summarizeDeadlineTitle(msg.text).toLowerCase(),
        deadline: extractedDeadline,
        msg
      });
    }

    // 6. Tasks & Action Items
    const isTaskMatch = taskKeywords.some(rx => rx.test(textLower));
    if (isTaskMatch && !isCasual) {
      let assignee = 'Not specified';
      if (textLower.includes(`@${normalizedTarget}`) || textLower.includes('@you') || textLower.startsWith(`${normalizedTarget},`)) {
        assignee = targetUserName;
      } else if (/\bi will|\bi'?ll finish|\bi'?ll handle|\bi'?ll do\b/i.test(textLower)) {
        assignee = msg.sender;
      } else if (/\beveryone\b/i.test(textLower)) {
        assignee = 'All Participants';
      }

      let priority: PriorityLevel = 'NORMAL';
      let priorityReason = 'Standard team assignment or commitment.';

      if (isDirectlyMentioned || /\burgent|asap|today|immediately\b/i.test(textLower)) {
        priority = 'URGENT';
        priorityReason = isDirectlyMentioned
          ? `Directly assigned to ${targetUserName} with near-term expectations.`
          : 'Explicitly marked urgent or due today/immediately.';
      } else if (/\bmust|everyone|deadline|submit|report\b/i.test(textLower)) {
        priority = 'IMPORTANT';
        priorityReason = 'Mandatory deliverable or collective requirement.';
      }

      const taskDeadline = deadlineMatch ? deadlineMatch[1] : 'Not specified';

      tasks.push({
        id: `local-task-${i}`,
        title: cleanTaskTitle(msg.text),
        assignee,
        deadline: taskDeadline,
        priority,
        priorityReason,
        supportingMessage: msg.raw,
        confidence: assignee !== 'Not specified' ? 'High' : 'Medium',
        completed: false,
        category: categorizeTask(msg.text)
      });
    }

    // 7. Questions
    if (msg.text.includes('?') || /\b(can someone|does anyone|who will|could you)\b/i.test(textLower)) {
      questionMap.push({ msg, text: msg.text });
    }
  }

  // Cross-reference questions to see if answered in subsequent messages
  for (const q of questionMap) {
    let answered = false;
    for (let k = q.msg.index + 1; k < messages.length; k++) {
      const nextMsg = messages[k];
      if (
        nextMsg.text.toLowerCase().includes('yes') ||
        nextMsg.text.toLowerCase().includes('i will') ||
        nextMsg.text.toLowerCase().includes('done') ||
        nextMsg.text.toLowerCase().includes('confirmed')
      ) {
        answered = true;
        break;
      }
    }

    unansweredQuestions.push({
      id: `local-q-${q.msg.index}`,
      question: q.text,
      askedBy: q.msg.sender,
      addressedTo: q.text.includes('@') ? (q.text.match(/@(\w+)/)?.[1] || 'Group') : 'Group',
      status: answered ? 'Resolved' : 'Unanswered',
      supportingMessage: q.msg.raw
    });
  }

  // 8. Detect Conflicts (e.g. conflicting deadlines or room booking confusion)
  if (deadlineTracking.length > 1) {
    for (let m = 0; m < deadlineTracking.length; m++) {
      for (let n = m + 1; n < deadlineTracking.length; n++) {
        const itemA = deadlineTracking[m];
        const itemB = deadlineTracking[n];
        // If topics share words or messages discuss same core subject (e.g. deployment, release, prototype, report, meeting)
        const wordsA = itemA.topic.split(/\s+/).filter(w => w.length > 3);
        const wordsB = itemB.topic.split(/\s+/).filter(w => w.length > 3);
        const overlap = wordsA.some(w => wordsB.includes(w)) ||
          (/\b(deploy|deployment|release|launch|review|report|submission|meeting|presentation)\b/i.test(itemA.msg.text) &&
           /\b(deploy|deployment|release|launch|review|report|submission|meeting|presentation)\b/i.test(itemB.msg.text));

        if (overlap && itemA.deadline.toLowerCase() !== itemB.deadline.toLowerCase()) {
          // Explicitly mark both deadlines as Contested and preserve conflict note
          const dlA = deadlines.find(d => d.supportingMessage === itemA.msg.raw);
          const dlB = deadlines.find(d => d.supportingMessage === itemB.msg.raw);
          if (dlA) {
            dlA.status = 'Contested';
            dlA.conflictNote = `Disputed: ${itemB.msg.sender} noted "${itemB.deadline}"`;
          }
          if (dlB) {
            dlB.status = 'Contested';
            dlB.conflictNote = `Disputed: ${itemA.msg.sender} noted "${itemA.deadline}"`;
          }

          blockers.push({
            id: `local-conflict-${m}-${n}`,
            title: `Conflicting Dates on ${itemA.topic}`,
            description: `${itemA.msg.sender} noted "${itemA.deadline}" while ${itemB.msg.sender} noted "${itemB.deadline}".`,
            conflictType: 'Timeline Conflict',
            severity: 'High',
            supportingMessage: `${itemA.msg.raw} vs ${itemB.msg.raw}`
          });
        }
      }
    }
  }

  // Also check if any question mentions confirm booking or unresolved issue
  for (const q of unansweredQuestions) {
    if (q.status === 'Unanswered' && /confirm|room|blocker|waiting|stuck|delay/i.test(q.question)) {
      blockers.push({
        id: `local-blocker-q-${q.id}`,
        title: `Unresolved Dependency: ${q.question.slice(0, 45)}...`,
        description: `Asked by ${q.askedBy} without explicit confirmation recorded.`,
        conflictType: 'Resource Blocker',
        severity: 'Medium',
        supportingMessage: q.supportingMessage
      });
    }
  }

  // Compile Executive Summary
  const totalMessagesCount = messages.length;
  const urgentCount = tasks.filter(t => t.priority === 'URGENT').length + deadlines.filter(d => d.priority === 'URGENT').length;
  const headline = urgentCount > 0
    ? `${urgentCount} urgent deliverable${urgentCount > 1 ? 's' : ''} require immediate attention.`
    : tasks.length > 0
    ? `${tasks.length} action items and ${decisions.length} decisions detected in discussion.`
    : `Conversation reviewed with ${totalMessagesCount} messages.`;

  const keyTakeaways: string[] = [];
  if (decisions.length > 0) {
    keyTakeaways.push(`Key decision: ${decisions[0].decision}`);
  }
  if (deadlines.length > 0) {
    keyTakeaways.push(`Upcoming deadline: ${deadlines[0].title} (${deadlines[0].rawDeadline})`);
  }
  if (personalMentions.length > 0) {
    keyTakeaways.push(`Direct mention for ${targetUserName}: ${personalMentions[0].requestedAction}`);
  }
  if (blockers.length > 0) {
    keyTakeaways.push(`Potential blocker/conflict: ${blockers[0].title}`);
  }
  if (keyTakeaways.length === 0) {
    keyTakeaways.push('Discussion parsed locally using heuristic pattern matching.');
  }

  const overview = `Reviewed ${totalMessagesCount} messages among ${participants.length || 'multiple'} participants (${participants.slice(0, 4).join(', ')}${participants.length > 4 ? ' and others' : ''}). Extracted ${tasks.length} action items, ${decisions.length} key decisions, and ${deadlines.length} scheduled dates.`;

  // Estimate time saved: average person reads ~180 wpm, digesting thread takes ~15s per msg
  const timeSavedMinutes = Math.max(2, Math.round((totalMessagesCount * 12) / 60));

  return {
    summary: {
      headline,
      overview,
      keyTakeaways,
      sentimentMood: urgentCount > 0 ? 'Urgent / Focused' : 'Productive / Collaborative',
      timeSavedMinutes
    },
    stats: {
      totalMessagesCount,
      actionItemsCount: tasks.length,
      decisionsCount: decisions.length,
      deadlinesCount: deadlines.length,
      personalMentionsCount: personalMentions.length,
      unansweredQuestionsCount: unansweredQuestions.filter(q => q.status === 'Unanswered').length,
      urgentCount
    },
    tasks,
    decisions,
    deadlines,
    personalMentions,
    unansweredQuestions,
    updates,
    blockers,
    casualMessages,
    analysisMode: 'local',
    timestamp: new Date().toISOString(),
    detectedParticipants: participants,
    targetUser: targetUserName
  };
}

function cleanTaskTitle(text: string): string {
  let cleaned = text
    .replace(/^\[.*?\]\s*/, '')
    .replace(/^[^:]+:\s*/, '')
    .replace(/@\w+\s*/g, '')
    .replace(/^(please|can someone|everyone must|i will|i'll)\s+/i, '');
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return cleaned.length > 80 ? cleaned.slice(0, 77) + '...' : cleaned;
}

function cleanDecisionText(text: string): string {
  let cleaned = text
    .replace(/^\[.*?\]\s*/, '')
    .replace(/^[^:]+:\s*/, '');
  return cleaned;
}

function extractRequestedAction(text: string): string {
  const match = text.match(/(?:please|must|can you|could you|prepare|review|send|finish|submit)\s+(.+)/i);
  if (match) {
    return match[0].slice(0, 60);
  }
  return text.slice(0, 60);
}

function summarizeDeadlineTitle(text: string): string {
  const cleaned = text.replace(/^\[.*?\]\s*/, '').replace(/^[^:]+:\s*/, '');
  return cleaned.slice(0, 45);
}

function categorizeTask(text: string): string {
  if (/frontend|backend|python|code|deploy|bug|prototype|api/i.test(text)) return 'Engineering';
  if (/report|slides|presentation|document|deck/i.test(text)) return 'Deliverables';
  if (/room|booking|calendar|meeting|call/i.test(text)) return 'Coordination';
  return 'General';
}
