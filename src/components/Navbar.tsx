import React from 'react';
import { Sparkles, Lock, Shield, Settings, RefreshCw, MessageSquare } from 'lucide-react';

interface NavbarProps {
  mode: 'gemini' | 'local';
  onToggleMode: (newMode: 'gemini' | 'local') => void;
  onOpenPrivacyGuide: () => void;
  onOpenSettings: () => void;
  isAnalyzing: boolean;
  hasResults: boolean;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onToggleMode,
  onOpenPrivacyGuide,
  onOpenSettings,
  isAnalyzing,
  hasResults,
  onReset
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EAEAF2] bg-white/95 backdrop-blur-md shadow-[0_2px_12px_-2px_rgba(37,36,58,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#F2F0FB] border border-[#E0DCF7] text-[#8275D8] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#8275D8]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#25243A]">
                MissedMate<span className="text-[#8275D8]">.ai</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-[#F2F0FB] text-[#8275D8] border border-[#E0DCF7] rounded-full">
                Productivity Briefs
              </span>
            </div>
            <p className="text-[11px] text-[#77778A] hidden md:block">
              Intelligent Conversation Catch-Up Assistant
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Privacy Mode Switcher */}
          <div className="flex items-center bg-[#F8F8FC] border border-[#EAEAF2] p-1 rounded-xl">
            <button
              onClick={() => onToggleMode('local')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'local'
                  ? 'bg-white text-[#25243A] border border-[#EAEAF2] shadow-xs font-semibold'
                  : 'text-[#77778A] hover:text-[#25243A]'
              }`}
              title="100% In-Browser Execution. No external network requests."
            >
              <Lock className="w-3.5 h-3.5 text-[#4FAE9B]" />
              <span className="hidden xs:inline">Local Mode</span>
            </button>

            <button
              onClick={() => onToggleMode('gemini')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'gemini'
                  ? 'bg-white text-[#25243A] border border-[#EAEAF2] shadow-xs font-semibold'
                  : 'text-[#77778A] hover:text-[#25243A]'
              }`}
              title="Deep semantic analysis via Gemini 3.8 Flash."
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8275D8]" />
              <span className="hidden xs:inline">Gemini AI</span>
            </button>
          </div>

          {/* Privacy Guide Trigger */}
          <button
            onClick={onOpenPrivacyGuide}
            className="p-2 text-[#77778A] hover:text-[#25243A] hover:bg-[#F8F8FC] rounded-xl border border-transparent hover:border-[#EAEAF2] transition-colors"
            title="Privacy and Architecture Guide"
            aria-label="Privacy and Architecture Guide"
          >
            <Shield className="w-4 h-4 text-[#8275D8]" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#77778A] hover:text-[#25243A] hover:bg-[#F8F8FC] rounded-xl border border-transparent hover:border-[#EAEAF2] transition-colors"
            title="Settings & Integrations"
            aria-label="Settings & Integrations"
          >
            <Settings className="w-4 h-4 text-[#77778A]" />
          </button>

          {/* Reset / New Analysis button if results are active */}
          {hasResults && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAEAF2] bg-white hover:bg-[#F8F8FC] text-xs font-medium text-[#25243A] shadow-xs transition-colors"
              title="Start a new analysis"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8275D8]" />
              <span className="hidden sm:inline">New Catch-Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
