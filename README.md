# MissedMate AI — Your Intelligent Conversation Catch-Up Assistant

> **Catch up on what matters.**  
> *"You were away. Here's what matters."*

---

## 🏆 Hackathon Challenge & Submission Overview

### The Challenge: “The Unread Problem — What Did I Miss?”
When knowledge workers, students, and remote teams step away from their desks—whether for a one-hour meeting, a sick day, or an extended holiday—they return to a wall of unread group chats across Slack, Discord, WhatsApp, Microsoft Teams, and email digests.

Scrolling through hundreds of back-and-forth messages to find out what actually happened is slow, exhausting, and error-prone. Critical decisions are buried under lunch banter, deadlines are misread, and personal tasks assigned with `@mentions` go unnoticed until it is too late.

### The Solution: MissedMate AI
**MissedMate AI** transforms raw, chaotic unread conversation logs into a structured, evidence-backed executive briefing in seconds.

Unlike generic chatbot summaries that hallucinate details or invent consensus, MissedMate AI adheres to strict grounding rules:
1. **Verbatim Evidence Linking:** Every action item, decision, and deadline links back to the original source quote in the conversation.
2. **Deterministic & Semantic Prioritization:** Classifies items into **URGENT**, **IMPORTANT**, **NORMAL**, and **LOW** priority, accompanied by an honest explanation for every rating.
3. **Conflict & Blocker Detection:** Explicitly surfaces conflicting timelines (e.g., DevOps proposing Friday 6 PM while Product announced Thursday 2 PM) instead of silently choosing one.
4. **Noise Filtering:** Safely isolates casual banter (coffee invites, greetings, memes) so you can focus only on deliverables.
5. **Dual Privacy Architecture:** Users can choose between **Private Local Mode** (100% in-browser, zero network requests) and **Gemini-Enhanced Mode** (deep semantic reasoning via Google Gemini 3.8 Flash).

---

## 🌐 Live URLs & Deployment

- **Shared Preview App URL:** [https://ais-pre-we76qwrjobtblq7oipckjh-787282522263.asia-southeast1.run.app](https://ais-pre-we76qwrjobtblq7oipckjh-787282522263.asia-southeast1.run.app)
- **Development App URL:** [https://ais-dev-we76qwrjobtblq7oipckjh-787282522263.asia-southeast1.run.app](https://ais-dev-we76qwrjobtblq7oipckjh-787282522263.asia-southeast1.run.app)

---

## 🤖 Google Gemini’s Role & AI Disclosure

### Runtime Application Role
MissedMate AI integrates **Google Gemini 3.8 Flash** via the modern `@google/genai` TypeScript SDK on the server side (`server.ts`).
- **Structured Schema Enforcement:** The server enforces a strict JSON schema (`responseSchema` with `Type.OBJECT`) to extract typed fields for summaries, action items, decisions, deadlines, mentions, questions, blockers, and casual messages.
- **Deep Semantic Understanding:** Identifies implicit commitments (e.g., "I'll handle the frontend") and relative deadlines ("tomorrow at 10 AM") without fabricating dates.
- **Anti-Hallucination & Grounding:** Gemini is strictly prompted to label missing information as `"Not specified"` and uncertain interpretations as `"Uncertain"`. Every task and decision must include a verbatim quotation from the conversation.
- **Untrusted Input Sandboxing:** The model treats the conversation text as raw, untrusted data. Embedded instructions attempting to override rules or extract system configuration are neutralized.

### Development Disclosure
Google AI Studio and Gemini models were used during the architecture, coding, and testing phases to build and verify this full-stack TypeScript application.

---

## 🔒 Two Distinct Privacy Modes

MissedMate AI provides two clearly separated privacy models:

| Feature | 🔒 Private Local Mode | ⚡ Gemini-Enhanced Mode |
|---|---|---|
| **Execution Environment** | 100% in-browser JavaScript engine | Server-side Gemini 3.8 Flash proxy |
| **Network Requests** | **Zero** (no external calls made) | Ephemeral call to Gemini API |
| **User Consent** | Instant execution | Explicit consent modal required |
| **Semantic Depth** | Heuristic pattern matching & regex | Deep semantic intent & nuance |
| **Data Storage** | No persistence (cleared on refresh) | No persistence (zero chat logs) |
| **Best For** | Air-gapped, strictly confidential data | Complex async team discussions |

---

## 🚀 The Core Workflow: PASTE → ANALYZE → ACT

1. **PASTE:**
   - Paste unread text directly into the dashboard.
   - Select the conversation context (Slack, Discord, WhatsApp, Email, or General).
   - Enter your name or handle (e.g. `You`, `Alex`, `Sarah`) to target personal `@mentions` and direct assignments.
   - Real-time character counter, word counter, and token estimation.
   - Built-in one-click demo loaders for immediate evaluation.

2. **ANALYZE:**
   - Multi-stage animated loading feedback showing progress through chronology parsing, decision extraction, deadline cross-referencing, and quotation validation.
   - Graceful fallback: If external network or Gemini quota fails, the app offers instant single-click fallback to Private Local Mode.

3. **ACT:**
   - **Executive Overview:** High-level narrative, tone indicator, and key takeaway bullets.
   - **Important Updates:** Dedicated section tracking team announcements, schedule changes, and event status.
   - **Action Items Dashboard:** Interactive completion checkboxes (session-only memory), priority badges, assignee tags, and expandable verbatim quotes with one-click copying.
   - **Decisions & Cancellations:** Clear badges for confirmed decisions, proposals, and cancellations (e.g. cancelled classes or scrapped features).
   - **Deadlines Timeline:** Chronological list preserving relative wording ("Friday at 3 PM", "tomorrow at 10 AM").
   - **Personal Mentions:** Dedicated tab highlighting tasks where you are specifically called out.
   - **Unanswered Questions:** Surfaces unresolved queries needing follow-up.
   - **Blockers & Conflicts:** Prominent alert banners for conflicting dates or missing dependencies.
   - **Export & Sharing:** One-click "Copy Summary" (Markdown), "Copy Action Items" (Markdown checklist), and "Export Full Briefing" (`.md` file download).

---

## 🧪 Automated Test Suite & Results

MissedMate AI includes a comprehensive automated test runner (`tests/analysis.test.ts`) covering all 10 required operational scenarios:

```bash
npm test
```

### Verified Test Results (10/10 Passed):
1. **Empty Input Handling:** Gracefully handles empty strings and whitespace without throwing exceptions.
2. **Valid Conversation Chronology:** Accurately parses message prefixes, timestamps, and participant rosters.
3. **Task & Decision Extraction:** Extracts decisions and tasks while ensuring exact supporting quotes are attached.
4. **Ambiguous Deadlines:** Correctly preserves relative deadline phrases (e.g. "tomorrow at 10 AM", "Friday at 3 PM") without hallucinating calendar dates.
5. **Personal Mentions:** Pinpoints direct callouts and assignments tailored to the entered username.
6. **Conflicting Information:** Identifies contradictory deadlines and flags timeline blockers.
7. **Malformed AI Output Resilience:** Gracefully falls back to safe defaults if an external schema returns unexpected or missing fields.
8. **API Error Handling & Local Fallback:** Validates that server errors seamlessly route users to Private Local Mode without loss of pasted text.
9. **Malicious Instruction Sandboxing:** Confirms prompt injection attempts embedded inside chat logs do not hijack priority classification.
10. **Data Clearing & Session Memory:** Verifies session-only task completion state and zero local storage leakage on reset.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js 20+
- npm 9+
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/) (optional if running in Private Local Mode)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/missedmate-ai.git
cd missedmate-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY
```

### Running the App
```bash
# Start full-stack development server on port 3000
npm run dev

# Run automated tests
npm test

# Build production assets
npm run build

# Start production server
npm start
```

---

## 🔐 Security & Privacy Safeguards

- **Server-Side API Proxy:** The Gemini API key is never bundled in frontend JavaScript, HTML, source maps, or client requests. Calls route through `POST /api/analyze-conversation` on the server.
- **Zero Data Retention:** No databases (MongoDB, PostgreSQL, Firestore) or persistent storage engines are connected. Once you close the tab or hit "Clear", the conversation vanishes.
- **Untrusted Input Protection:** Pasted conversation content is enclosed in strict prompt boundaries and sanitized against prompt injections.
- **Safe Rendering:** All messages are rendered as sanitized text without `dangerouslySetInnerHTML`.

---

## 📄 License
Apache-2.0 License. Built for the Google AI Studio Hackathon.
