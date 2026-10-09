import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Lock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Database,
  Terminal,
  Copy
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'gemini' | 'local';
  onToggleMode: (mode: 'gemini' | 'local') => void;
  onCopyText: (text: string, title: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  mode,
  onToggleMode,
  onCopyText
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'telegram' | 'shortcuts'>('privacy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25243A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-[#EAEAF2] rounded-3xl shadow-[0_16px_48px_-8px_rgba(37,36,58,0.12)] p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#77778A] hover:text-[#25243A] p-1.5 rounded-xl hover:bg-[#F8F8FC] transition-colors"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#F2F0FB] border border-[#E0DCF7] flex items-center justify-center text-[#8275D8]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#25243A]">Settings & Preferences</h3>
            <p className="text-xs text-[#77778A]">Privacy controls, integrations, and keyboard shortcuts</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 border-b border-[#EAEAF2] pb-3 mb-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#8275D8] text-white shadow-sm'
                : 'text-[#77778A] hover:text-[#25243A] hover:bg-[#F8F8FC]'
            }`}
          >
            Privacy & Mode
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'telegram'
                ? 'bg-[#8275D8] text-white shadow-sm'
                : 'text-[#77778A] hover:text-[#25243A] hover:bg-[#F8F8FC]'
            }`}
          >
            Telegram Integration
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'shortcuts'
                ? 'bg-[#8275D8] text-white shadow-sm'
                : 'text-[#77778A] hover:text-[#25243A] hover:bg-[#F8F8FC]'
            }`}
          >
            Keyboard Shortcuts
          </button>
        </div>

        {/* Tab 1: Privacy & Analysis Mode */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs text-[#77778A]">
            <div className="p-4 rounded-2xl bg-[#FAF9FD] border border-[#EAEAF2] space-y-3">
              <span className="text-xs font-bold text-[#25243A] uppercase tracking-wider">
                Active Analysis Engine
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onToggleMode('local')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === 'local'
                      ? 'bg-white border-[#8275D8] text-[#25243A] shadow-sm ring-1 ring-[#8275D8]'
                      : 'bg-white border-[#EAEAF2] text-[#77778A] hover:border-[#8275D8]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#25243A] mb-1">
                    <Lock className="w-3.5 h-3.5 text-[#4FAE9B]" />
                    <span>Private Local Mode</span>
                  </div>
                  <p className="text-[11px] text-[#77778A] leading-relaxed">
                    100% in-browser rules. Zero external network calls. Best for strict offline privacy.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleMode('gemini')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === 'gemini'
                      ? 'bg-white border-[#8275D8] text-[#25243A] shadow-sm ring-1 ring-[#8275D8]'
                      : 'bg-white border-[#EAEAF2] text-[#77778A] hover:border-[#8275D8]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#25243A] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#8275D8]" />
                    <span>Gemini AI Mode</span>
                  </div>
                  <p className="text-[11px] text-[#77778A] leading-relaxed">
                    Deep semantic reasoning via Gemini 3.8 Flash. Server-side proxy with consent.
                  </p>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FDFB] border border-[#D5EFEA] space-y-1.5">
              <p className="font-bold text-[#2C7A6B] text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero Data Retention Policy</span>
              </p>
              <p className="text-[11px] text-[#4F776F] leading-relaxed">
                MissedMate AI does not persist user conversations in any databases, log files, or cookies. All message analysis is ephemeral and completely cleared when you reset or close the browser tab.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Telegram Integration */}
        {activeTab === 'telegram' && (
          <div className="space-y-4 text-xs text-[#77778A]">
            <div className="p-4 rounded-2xl bg-[#F8F8FC] border border-[#EAEAF2] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0088CC]/10 text-[#0088CC] flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#25243A]">Telegram Bot & Channel Forwarding</p>
                    <p className="text-[11px] text-[#77778A]">Catch up on unread group chats directly via bot webhook</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                  Not Connected
                </span>
              </div>

              <p className="text-[11px] text-[#77778A] leading-relaxed pt-2">
                The Telegram Bot Webhook endpoint is supported in the MissedMate architecture. Connect your Telegram Bot Token in your deployment environment to receive automated daily or on-demand thread catch-up briefings.
              </p>

              <div className="p-2.5 bg-white border border-[#EAEAF2] rounded-xl flex items-center justify-between font-mono text-[11px] text-[#25243A]">
                <span>Endpoint: /api/integrations/telegram-webhook</span>
                <button
                  type="button"
                  onClick={() => onCopyText('/api/integrations/telegram-webhook', 'Endpoint URL copied')}
                  className="text-[#8275D8] hover:text-[#5B4DB8] p-1"
                  title="Copy Endpoint"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#77778A] italic">
              Note: No mock connection is simulated. When configured with live bot credentials, threads forwarded to your bot appear in MissedMate automatically.
            </p>
          </div>
        )}

        {/* Tab 3: Keyboard Shortcuts */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-3 text-xs text-[#77778A]">
            <div className="p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl flex items-center justify-between">
              <span className="text-[#25243A] font-medium">Catch Me Up (Analyze Conversation)</span>
              <kbd className="px-2 py-1 rounded-lg bg-white border border-[#EAEAF2] text-[11px] font-mono font-bold text-[#8275D8] shadow-xs">
                ⌘ + Enter / Ctrl + Enter
              </kbd>
            </div>

            <div className="p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl flex items-center justify-between">
              <span className="text-[#25243A] font-medium">Clear active conversation</span>
              <span className="text-[11px] text-[#77778A]">"Clear" button on dashboard</span>
            </div>

            <div className="p-3 bg-[#F8F8FC] border border-[#EAEAF2] rounded-xl flex items-center justify-between">
              <span className="text-[#25243A] font-medium">Copy quote from card</span>
              <span className="text-[11px] text-[#77778A]">Click "Copy quote" inside evidence drawer</span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#EAEAF2] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#8275D8] hover:bg-[#7364CE] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
