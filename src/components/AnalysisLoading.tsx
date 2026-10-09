import React, { useEffect, useState } from 'react';
import { Sparkles, Lock, CheckCircle2, Clock } from 'lucide-react';

interface AnalysisLoadingProps {
  mode: 'gemini' | 'local';
}

const STAGES = [
  'Ingesting conversation chronology & detecting participants',
  'Extracting explicit decisions, plan changes & cancellations',
  'Detecting personal mentions, assignments & deliverables',
  'Cross-referencing conflicting timelines & open questions',
  'Verifying verbatim quotation evidence & ranking priorities'
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ mode }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center animate-in fade-in duration-300">
      <div className="p-8 bg-white border border-[#EAEAF2] rounded-3xl shadow-[0_16px_48px_-8px_rgba(37,36,58,0.06)] relative overflow-hidden">
        {/* Soft subtle ambient accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#8275D8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Spinner Icon */}
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-[#F2F0FB] border border-[#E0DCF7] flex items-center justify-center text-[#8275D8] shadow-sm">
              {mode === 'gemini' ? (
                <Sparkles className="w-8 h-8 animate-pulse text-[#8275D8]" />
              ) : (
                <Lock className="w-8 h-8 text-[#4FAE9B]" />
              )}
            </div>
            <div className="absolute -inset-2 border-2 border-[#8275D8]/20 border-t-[#8275D8] rounded-3xl animate-spin pointer-events-none" />
          </div>

          <h3 className="text-xl font-bold text-[#25243A] mb-1">
            Catching Up On Your Unread Messages
          </h3>
          <p className="text-xs text-[#77778A] mb-6">
            {mode === 'gemini'
              ? 'Analyzing semantics and extracting verbatim evidence with Gemini 3.8 Flash...'
              : 'Executing client-side heuristic rules locally in your browser...'}
          </p>

          {/* Stepper Progress */}
          <div className="w-full max-w-md space-y-2.5 text-left">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div
                  key={stage}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#F2F0FB] border border-[#E0DCF7] text-[#5B4DB8] font-semibold shadow-xs'
                      : isPast
                      ? 'text-[#25243A] bg-[#F8F8FC] border border-[#EAEAF2]'
                      : 'text-[#9E9EAF]'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-[#4FAE9B] shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-[#8275D8]/30 border-t-[#8275D8] rounded-full animate-spin shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#C4C4D4] shrink-0" />
                  )}
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
