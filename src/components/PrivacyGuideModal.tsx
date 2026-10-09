import React from 'react';
import { X, Shield, Lock, Sparkles, CheckCircle2, AlertTriangle, EyeOff, Server, Terminal } from 'lucide-react';

interface PrivacyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyGuideModal: React.FC<PrivacyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white border border-[#EAEAF2] rounded-3xl shadow-[0_20px_50px_-10px_rgba(37,36,58,0.12)] p-6 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#77778A] hover:text-[#25243A] p-1.5 rounded-xl hover:bg-[#F8F8FC] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F2F0FB] border border-[#E0DCF7] flex items-center justify-center text-[#8275D8] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#25243A]">Privacy & Architectural Transparency</h2>
            <p className="text-xs text-[#77778A]">Dual-Mode Execution & The Unread Problem Architecture</p>
          </div>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-[#77778A]">
          {/* Section 1: The Challenge */}
          <div className="p-4 bg-[#FAF9FD] border border-[#EAEAF2] rounded-2xl">
            <h3 className="font-bold text-[#25243A] text-xs sm:text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8275D8]" />
              The Challenge: "The Unread Problem — What Did I Miss?"
            </h3>
            <p className="text-xs text-[#77778A] mt-1.5 leading-relaxed">
              When returning from meetings, vacations, or deep focus, professionals face hundreds of unread messages across Slack, Teams, and WhatsApp. Traditional catch-up means scrolling through banter and context switches. MissedMate AI parses the chronology to deliver actionable deliverables, explicit decisions, personal mentions, and conflicting timelines with verbatim source evidence.
            </p>
          </div>

          {/* Section 2: Mode Comparison Table */}
          <div>
            <h3 className="font-bold text-[#25243A] text-xs sm:text-sm mb-2.5">Two Distinct Privacy Modes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-[#F8FDFB] border border-[#D5EFEA] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#2C7A6B] font-bold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-[#4FAE9B]" />
                  Private Local Mode
                </div>
                <h4 className="text-[#25243A] font-semibold text-xs sm:text-sm">100% In-Browser Execution</h4>
                <ul className="text-xs text-[#77778A] space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4FAE9B] shrink-0 mt-0.5" />
                    <span>Zero network requests. Conversation never leaves your device.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4FAE9B] shrink-0 mt-0.5" />
                    <span>Rule-based JavaScript regex & chronology pattern engine.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4FAE9B] shrink-0 mt-0.5" />
                    <span>Ideal for strictly confidential, classified, or air-gapped data.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-[#FAF9FD] border border-[#E0DCF7] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#8275D8] font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#8275D8]" />
                  Gemini Enhanced Mode
                </div>
                <h4 className="text-[#25243A] font-semibold text-xs sm:text-sm">Google Gemini 3.8 Flash</h4>
                <ul className="text-xs text-[#77778A] space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8275D8] shrink-0 mt-0.5" />
                    <span>Deep semantic intelligence for nuanced implicit commitments.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8275D8] shrink-0 mt-0.5" />
                    <span>Strict JSON schema enforcement with type validation.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8275D8] shrink-0 mt-0.5" />
                    <span>Explicit user consent required before sending text to API.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Data Safety */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-[#25243A] text-xs sm:text-sm">Security & Data Safeguards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl">
                <EyeOff className="w-4 h-4 text-[#4FAE9B] mb-1.5" />
                <p className="font-bold text-[#25243A]">Zero Storage</p>
                <p className="text-[#77778A] mt-0.5">No database, no analytics, no local storage persistence of your chat text.</p>
              </div>
              <div className="p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl">
                <Server className="w-4 h-4 text-[#8275D8] mb-1.5" />
                <p className="font-bold text-[#25243A]">Server-Side Proxy</p>
                <p className="text-[#77778A] mt-0.5">Gemini API keys stay protected on the server; client never touches credentials.</p>
              </div>
              <div className="p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl">
                <Terminal className="w-4 h-4 text-[#EAB308] mb-1.5" />
                <p className="font-bold text-[#25243A]">Injection Shield</p>
                <p className="text-[#77778A] mt-0.5">Conversations are sandboxed as untrusted data. Embedded instructions are ignored.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Grounding & Anti-Hallucination */}
          <div className="p-4 bg-[#FAF9FD] border border-[#E0DCF7] rounded-2xl text-xs space-y-1.5">
            <p className="font-bold text-[#8275D8]">Grounding & Verbatim Evidence Guarantee</p>
            <p className="text-[#25243A] leading-relaxed">
              Every action item, decision, and deadline returned includes an exact supporting quote. If an assignee or deadline was not explicitly stated in the conversation, MissedMate AI labels it as <code className="text-[#8275D8] bg-[#F2F0FB] border border-[#E0DCF7] px-1.5 py-0.5 rounded font-mono text-[11px]">"Not specified"</code> rather than guessing or hallucinating details.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-3 border-t border-[#EAEAF2]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#8275D8] hover:bg-[#7364CE] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
