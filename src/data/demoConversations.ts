export interface DemoConversation {
  id: string;
  name: string;
  badge: string;
  targetUser: string;
  context: 'slack' | 'discord' | 'whatsapp' | 'email' | 'general';
  channelName: string;
  description: string;
  text: string;
}

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: 'demo-sprint-crunch',
    name: 'Demo 1: Project Review & Crunch',
    badge: 'Standard Team Thread',
    targetUser: 'You',
    context: 'slack',
    channelName: '#project-prototype',
    description: 'Realistic team sync featuring decisions (Python prototype), hard deadlines (report tomorrow at 10 AM), direct personal assignments (@You slides today), cancellation (extra class), open room booking question, and social coffee chatter.',
    text: `[10:30 AM] Ananya: The project review is on Friday at 3 PM.
[10:32 AM] Rahul: We decided to use Python for the prototype.
[10:35 AM] Priya: Everyone must submit the report by tomorrow at 10 AM.
[10:36 AM] Rahul: I will finish the frontend.
[10:38 AM] Ananya: Can someone confirm the room booking?
[10:40 AM] Priya: @You, please prepare the presentation slides today.
[10:42 AM] Rahul: The extra class has been cancelled.
[10:45 AM] Ananya: Coffee after class?`
  },
  {
    id: 'demo-conflict-blocker',
    name: 'Demo 2: Launch Conflicts & Blockers',
    badge: 'Conflicting Timelines & Blockers',
    targetUser: 'Alex',
    context: 'slack',
    channelName: '#release-war-room',
    description: 'High-stakes release thread with conflicting release times between DevOps and Product, an unresolved database credential blocker, cancelled vendor demo, and an urgent personal task for Alex.',
    text: `[09:15 AM] David (Product): Team, the client sign-off is done. The v2.4 production deployment is scheduled for Thursday at 2 PM sharp.
[09:20 AM] Marcus (DevOps): Wait, staging rollback tests aren't green yet. The production deployment is moved to Friday at 6 PM, not Thursday.
[09:22 AM] Elena (QA): Can someone clarify which environment has the sanitized migration dataset? We cannot proceed with regression testing without it.
[09:25 AM] Marcus: The external vendor live audit demo has been cancelled due to NDA renewals.
[09:30 AM] David: @Alex, you must approve the database replication pull request before 1 PM today or everything stalls.
[09:35 AM] Elena: We decided to skip the legacy IE11 polyfills to save 240kb bundle size.
[09:42 AM] Marcus: I will configure the Redis failover cluster once Alex merges the PR.
[09:48 AM] David: Anyone grabbing burritos for lunch?`
  },
  {
    id: 'demo-remote-async',
    name: 'Demo 3: Cross-Timezone Product Handover',
    badge: 'Async Cross-Functional',
    targetUser: 'Sarah',
    context: 'discord',
    channelName: '#mobile-app-sync',
    description: 'Multi-timezone async handover with design token decisions, iOS App Store submission deadline, Figma feedback assignment, and audio sync questions.',
    text: `[08:00 AM] Kenji: Morning all! We agreed on adopting the Dark Emerald palette as our primary brand theme.
[08:15 AM] Maria: iOS build v1.8 submission deadline is Monday at 9 AM PST. Apple review window is tight.
[08:30 AM] Kenji: The deprecated onboarding video walkthrough has been scrapped in favor of interactive tooltips.
[08:45 AM] Maria: @Sarah, please review the push notification permission copy by EOD today.
[09:00 AM] Kenji: Who has access to the APNs production certificate? Need confirmation.
[09:10 AM] Sarah: I will test the offline sync database schema on Android 14.
[09:25 AM] Maria: Anyone listened to the new tech podcast episode? Pretty cool breakdown of LLM agents!`
  }
];
