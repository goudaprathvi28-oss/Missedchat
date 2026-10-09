import React from 'react';
import { ShieldCheck, Sparkles, Lock, ArrowRight, ExternalLink } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onSwitchToLocal: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  onSwitchToLocal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-[#EAEAF2] rounded-3xl shadow-[0_20px_50px_-10px_rgba(37,36,58,0.12)] p-6 overflow-hidden">
        {/* Subtle ambient accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#8275D8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#F2F0FB] border border-[#E0DCF7] rounded-2xl text-[#8275D8] shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F2F0FB] text-[#8275D8] rounded-full border border-[#E0DCF7]">
                Privacy Disclosure
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#25243A] mt-1">
              Enable Gemini-Enhanced Analysis?
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#77778A] leading-relaxed">
          <p>
            You are about to analyze your conversation using <strong className="text-[#8275D8]">Google Gemini 3.8 Flash</strong> for superior semantic understanding, nuanced intent detection, and context-aware conflict resolution.
          </p>

          <div className="p-3.5 bg-[#FAF9FD] border border-[#EAEAF2] rounded-2xl space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-[#25243A]">
              <ShieldCheck className="w-4 h-4 text-[#4FAE9B] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Storage:</strong> MissedMate AI does not persist, save, or store your messages in any database, log file, or cookies.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#25243A]">
              <Lock className="w-4 h-4 text-[#8275D8] shrink-0 mt-0.5" />
              <span>
                <strong>Ephemeral Processing:</strong> Text is sent to the secure server-side API proxy to query Google Gemini, returning structured findings immediately.
              </span>
            </div>
          </div>

          <p className="text-xs text-[#77778A]">
            Prefer total offline privacy? You can use <strong className="text-[#25243A]">Private Local Mode</strong> anytime, which executes 100% in your browser without sending a single byte over the network.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:justify-end pt-3 border-t border-[#EAEAF2]">
          <button
            onClick={onSwitchToLocal}
            className="px-4 py-2.5 rounded-xl border border-[#EAEAF2] bg-[#F8F8FC] hover:bg-[#F2F0FB] text-[#25243A] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#4FAE9B]" />
            Switch to Local Mode
          </button>

          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-transparent hover:bg-[#F8F8FC] text-[#77778A] hover:text-[#25243A] text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-[#8275D8] hover:bg-[#7364CE] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Consent & Analyze</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
