import { AnalysisResult, TimeMachineThread } from '../types/analysis';

/**
 * Builds Conversation Time Machine timeline threads from the parsed analysis result.
 * Represents: Original Message → Later Update → Current Status → Recommended Next Step
 */
export function generateTimeMachineThreads(result: AnalysisResult): TimeMachineThread[] {
  const threads: TimeMachineThread[] = [];

  // 1. Conflict & Blocker Threads (Highest relevance for Time Machine)
  for (let i = 0; i < result.blockers.length; i++) {
    const b = result.blockers[i];
    const quotes = b.supportingMessage.split(/\svs\s/);
    const origQuote = quotes[0] || b.supportingMessage;
    const updateQuote = quotes[1] || 'Subsequent team discussion revealed blocking disagreement.';

    threads.push({
      id: `tm-blocker-${i}`,
      topic: b.title.replace(/^Conflicting Dates on\s+/i, 'Timeline: '),
      originalMessage: {
        sender: extractSenderFromQuote(origQuote),
        text: cleanQuoteText(origQuote),
        timestamp: extractTimestampFromQuote(origQuote)
      },
      laterUpdate: {
        sender: extractSenderFromQuote(updateQuote),
        text: cleanQuoteText(updateQuote),
        timestamp: extractTimestampFromQuote(updateQuote),
        changeType: 'disputed'
      },
      currentStatus: {
        statusText: `Unresolved Conflict: ${b.description}`,
        badgeType: 'contested'
      },
      recommendedNextStep: `Hold a 5-minute alignment sync between ${extractSenderFromQuote(origQuote)} and ${extractSenderFromQuote(updateQuote)} to establish a single confirmed plan.`,
      supportingMessage: b.supportingMessage
    });
  }

  // 2. Cancellation Threads
  const cancelledDecisions = result.decisions.filter(d => d.status === 'Cancelled');
  for (let i = 0; i < cancelledDecisions.length; i++) {
    const cd = cancelledDecisions[i];
    threads.push({
      id: `tm-cancel-${i}`,
      topic: `Plan Change: ${cd.decision.slice(0, 45)}`,
      originalMessage: {
        sender: 'Team Planning',
        text: 'Previous agenda item or activity originally scheduled on calendar.',
        timestamp: 'Prior discussion'
      },
      laterUpdate: {
        sender: cd.confirmedBy || 'Team Member',
        text: cd.decision,
        timestamp: extractTimestampFromQuote(cd.supportingMessage),
        changeType: 'cancelled'
      },
      currentStatus: {
        statusText: `Confirmed Cancellation: Plan was explicitly scrapped or called off.`,
        badgeType: 'cancelled'
      },
      recommendedNextStep: 'Remove from active task list and adjust calendar allocations accordingly.',
      supportingMessage: cd.supportingMessage
    });
  }

  // 3. Key Deadlines and Evolution
  for (let i = 0; i < result.deadlines.length; i++) {
    const dl = result.deadlines[i];
    // Skip if already captured in blocker
    if (threads.some(t => t.supportingMessage.includes(dl.rawDeadline))) continue;

    threads.push({
      id: `tm-deadline-${i}`,
      topic: `Milestone: ${dl.title}`,
      originalMessage: {
        sender: dl.owner || 'Discussion',
        text: dl.supportingMessage,
        timestamp: extractTimestampFromQuote(dl.supportingMessage)
      },
      laterUpdate: {
        sender: dl.owner || 'Team',
        text: `Target deliverable established: ${dl.rawDeadline}`,
        timestamp: 'Active thread',
        changeType: dl.status === 'Contested' ? 'disputed' : 'updated'
      },
      currentStatus: {
        statusText: dl.conflictNote || `${dl.status || 'Confirmed'}: Scheduled for ${dl.rawDeadline}`,
        badgeType: dl.status === 'Contested' ? 'contested' : 'confirmed'
      },
      recommendedNextStep: `Block calendar focus time before ${dl.rawDeadline} to guarantee timely delivery.`,
      supportingMessage: dl.supportingMessage
    });
  }

  // 4. Confirmed Architecture / Prototype Decisions
  const confirmedDecisions = result.decisions.filter(d => d.status === 'Confirmed');
  for (let i = 0; i < confirmedDecisions.length; i++) {
    const dec = confirmedDecisions[i];
    if (threads.some(t => t.topic.includes(dec.decision.slice(0, 25)))) continue;

    threads.push({
      id: `tm-decision-${i}`,
      topic: `Decision: ${dec.decision.slice(0, 40)}`,
      originalMessage: {
        sender: 'Group Discussion',
        text: 'Proposal and technical trade-off evaluation considered by the team.',
        timestamp: 'Exploration stage'
      },
      laterUpdate: {
        sender: dec.confirmedBy || 'Team Lead',
        text: dec.decision,
        timestamp: extractTimestampFromQuote(dec.supportingMessage),
        changeType: 'decided'
      },
      currentStatus: {
        statusText: `Confirmed Consensus: Direction settled by ${dec.confirmedBy || 'team'}.`,
        badgeType: 'confirmed'
      },
      recommendedNextStep: 'Implement codebase setup aligned with this agreed architecture direction.',
      supportingMessage: dec.supportingMessage
    });
  }

  // 5. Unanswered Questions Thread
  const unresolvedQuestions = result.unansweredQuestions.filter(q => q.status === 'Unanswered');
  for (let i = 0; i < unresolvedQuestions.length; i++) {
    const q = unresolvedQuestions[i];
    threads.push({
      id: `tm-question-${i}`,
      topic: `Open Question: ${q.question.slice(0, 38)}...`,
      originalMessage: {
        sender: q.askedBy,
        text: q.question,
        timestamp: extractTimestampFromQuote(q.supportingMessage)
      },
      laterUpdate: {
        sender: q.addressedTo || 'Team',
        text: 'No confirmed answer or resolution recorded in conversation.',
        timestamp: 'Thread end',
        changeType: 'disputed'
      },
      currentStatus: {
        statusText: `Unanswered: ${q.askedBy} asked "${q.question}" without resolution.`,
        badgeType: 'unconfirmed'
      },
      recommendedNextStep: `Follow up with ${q.addressedTo || 'relevant owner'} to resolve this blocking inquiry.`,
      supportingMessage: q.supportingMessage
    });
  }

  // 6. Direct User Mentions & Assignments
  if (result.personalMentions.length > 0) {
    const m = result.personalMentions[0];
    threads.push({
      id: `tm-mention-personal`,
      topic: `Direct Assignment for ${result.targetUser || 'You'}`,
      originalMessage: {
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp || 'Message thread'
      },
      laterUpdate: {
        sender: m.sender,
        text: `Required action: ${m.requestedAction}`,
        timestamp: m.timestamp || 'Today',
        changeType: 'assigned'
      },
      currentStatus: {
        statusText: `${m.urgency} Action: Assigned directly to ${result.targetUser || 'you'}.`,
        badgeType: m.urgency === 'URGENT' ? 'contested' : 'confirmed'
      },
      recommendedNextStep: `Execute requested action: "${m.requestedAction}" and post status update to thread.`,
      supportingMessage: m.supportingMessage
    });
  }

  return threads;
}

function extractSenderFromQuote(quote: string): string {
  const match = quote.match(/\]?\s*([A-Za-z0-9_\-\s@.]+?)(?:\s*\([^)]*\))?:\s*/);
  if (match && match[1]) {
    return match[1].replace(/^\[/, '').trim();
  }
  return 'Participant';
}

function extractTimestampFromQuote(quote: string): string {
  const match = quote.match(/\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return 'In thread';
}

function cleanQuoteText(quote: string): string {
  return quote.replace(/^\[.*?\]\s*/, '').replace(/^[^:]+:\s*/, '').trim();
}
