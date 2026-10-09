import React, { useState } from 'react';
import {
  Play,
  Trash2,
  Sparkles,
  Lock,
  FileText,
  AlertCircle,
  ClipboardPaste,
  ChevronDown,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DEMO_CONVERSATIONS, DemoConversation } from '../data/demoConversations';

interface ConversationInputProps {
  text: string;
  onChangeText: (text: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onLoadDemo: (demo: DemoConversation) => void;
  isAnalyzing: boolean;
  mode: 'gemini' | 'local';
  onToggleMode: (mode: 'gemini' | 'local') => void;
  error?: string | null;
}

export const ConversationInput: React.FC<ConversationInputProps> = ({
  text,
  onChangeText,
  onAnalyze,
  onClear,
  onLoadDemo,
  isAnalyzing,
  mode,
  onToggleMode,
  error
}) => {
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [showDemoMenu, setShowDemoMenu] = useState<boolean>(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text.trim() ? text.split(/\r?\n/).length : 0;

  const isTooShort = charCount > 0 && charCount < 10;
  const isTooLong = charCount > 65000;
  const canAnalyze = charCount >= 10 && !isTooLong && !isAnalyzing;

  const handleSelectDemo = (demo: DemoConversation) => {
    setSelectedDemoId(demo.id);
    onLoadDemo(demo);
    setShowDemoMenu(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.trim()) {
        onChangeText(clipboardText);
        setPasteNotice('Pasted from clipboard');
        setTimeout(() => setPasteNotice(null), 2500);
      }
    } catch {
      setPasteNotice('Please press Ctrl+V / ⌘+V to paste');
      setTimeout(() => setPasteNotice(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 w-full">
      <div className="bg-white border border-[#EAEAF2] rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_-6px_rgba(37,36,58,0.05)] relative transition-all">
        {/* Header row: Action buttons and Demo selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#EAEAF2] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#25243A] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#8275D8]" />
              <span>Paste Conversation</span>
            </span>
            <span className="text-[11px] text-[#77778A]">
              ({lineCount} {lineCount === 1 ? 'line' : 'lines'}, {wordCount} words)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Paste Button */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F8F8FC] hover:bg-[#F2F0FB] text-[#25243A] border border-[#EAEAF2] transition-colors focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none"
              title="Paste conversation text from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-[#8275D8]" />
              <span>{pasteNotice || 'Paste'}</span>
            </button>

            {/* Quick Demo 1 Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo(DEMO_CONVERSATIONS[0])}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                selectedDemoId === DEMO_CONVERSATIONS[0].id
                  ? 'bg-[#F2F0FB] text-[#8275D8] border-[#8275D8] font-semibold'
                  : 'bg-[#F8F8FC] hover:bg-[#F2F0FB] text-[#25243A] border-[#EAEAF2]'
              } focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none`}
              title="Load Demo 1: Sprint Review & Crunch"
            >
              <Sparkles className="w-3 h-3 text-[#8275D8]" />
              <span>Sample 1: Review</span>
            </button>

            {/* Quick Demo 2 Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo(DEMO_CONVERSATIONS[1])}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                selectedDemoId === DEMO_CONVERSATIONS[1].id
                  ? 'bg-[#EDF7F5] text-[#2C7A6B] border-[#4FAE9B] font-semibold'
                  : 'bg-[#F8F8FC] hover:bg-[#EDF7F5] text-[#25243A] border-[#EAEAF2]'
              } focus-visible:ring-2 focus-visible:ring-[#4FAE9B] focus-visible:outline-none`}
              title="Load Demo 2: Conflicting Deadlines & Blocker"
            >
              <Sparkles className="w-3 h-3 text-[#4FAE9B]" />
              <span>Sample 2: Conflicts</span>
            </button>

            {/* Clear button */}
            {charCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDemoId('');
                  onClear();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl text-[#77778A] hover:text-[#B91C1C] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FECACA] transition-colors focus-visible:ring-2 focus-visible:ring-[#F47174] focus-visible:outline-none"
                title="Clear input text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Large Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={`Paste raw messages here...\n\nExample formats supported:\n[10:30 AM] Ananya: The project review is on Friday at 3 PM.\n[10:32 AM] Rahul: We decided to use Python for the prototype.\n[10:35 AM] Priya: Everyone must submit the report by tomorrow at 10 AM.\n[10:40 AM] Priya: @You, please prepare the presentation slides today.\n[10:42 AM] Rahul: The extra class has been cancelled.\n[10:45 AM] Ananya: Coffee after class?`}
            rows={10}
            className="w-full bg-[#FAF9FD]/50 border border-[#EAEAF2] rounded-2xl p-4 text-xs sm:text-sm text-[#25243A] placeholder-[#77778A]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8275D8]/40 focus:border-[#8275D8] transition-all font-mono leading-relaxed resize-y"
          />

          {/* Quick inline helper if empty */}
          {charCount === 0 && (
            <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#77778A]">Need realistic demo text?</span>
              <button
                type="button"
                onClick={() => handleSelectDemo(DEMO_CONVERSATIONS[0])}
                className="text-xs text-[#8275D8] hover:text-[#5B4DB8] font-semibold underline"
              >
                Click to load Sample 1
              </button>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {isTooShort && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#B45309]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Please enter at least 10 characters to analyze.</span>
          </div>
        )}

        {isTooLong && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#B91C1C]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Conversation exceeds maximum limit of 65,000 characters.</span>
          </div>
        )}

        {error && (
          <div className="mt-2.5 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2 text-xs text-[#B91C1C]">
            <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Analysis Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
            {mode === 'gemini' && (
              <button
                type="button"
                onClick={() => onToggleMode('local')}
                className="shrink-0 px-2.5 py-1 bg-white hover:bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs font-semibold text-[#B91C1C]"
              >
                Use Local Mode
              </button>
            )}
          </div>
        )}

        {/* Footer Row: Privacy Indicator + Character count + Lavender Button */}
        <div className="mt-4 pt-3.5 border-t border-[#EAEAF2] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Honest Privacy Mode Indicator */}
          <div className="flex items-center gap-2 text-xs text-[#77778A]">
            <div className="w-2 h-2 rounded-full bg-[#4FAE9B] animate-pulse" />
            <span>
              {mode === 'local' ? (
                <>
                  <strong className="text-[#25243A]">Private Local Mode:</strong> 100% in-browser rules. Zero network requests.
                </>
              ) : (
                <>
                  <strong className="text-[#25243A]">Gemini AI Mode:</strong> Deep semantic reasoning via Gemini 3.8 Flash.
                </>
              )}
            </span>
          </div>

          {/* Action Button: Catch Me Up */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-[#77778A] hidden xs:inline">
              {charCount.toLocaleString()} chars
            </span>

            <button
              type="button"
              disabled={!canAnalyze}
              onClick={onAnalyze}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs ${
                canAnalyze
                  ? 'bg-[#8275D8] hover:bg-[#7364CE] active:bg-[#6354BD] text-white shadow-[0_4px_16px_rgba(130,117,216,0.3)] active:scale-[0.98]'
                  : 'bg-[#F1F1F7] text-[#9E9EAF] cursor-not-allowed border border-[#EAEAF2]'
              } focus-visible:ring-2 focus-visible:ring-[#8275D8] focus-visible:outline-none`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Catching You Up...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Catch Me Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
