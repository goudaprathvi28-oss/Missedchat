/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ConversationInput } from './components/ConversationInput';
import { AnalysisLoading } from './components/AnalysisLoading';
import { Dashboard } from './components/Dashboard';
import { ConsentModal } from './components/ConsentModal';
import { PrivacyGuideModal } from './components/PrivacyGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { analyzeConversationLocally } from './services/localAnalyzer';
import { AnalysisResult } from './types/analysis';
import { DEMO_CONVERSATIONS, DemoConversation } from './data/demoConversations';

export default function App() {
  const [conversationText, setConversationText] = useState<string>('');
  const [userName, setUserName] = useState<string>('You');
  const [platform, setPlatform] = useState<'slack' | 'discord' | 'whatsapp' | 'email' | 'general'>('slack');
  const [mode, setMode] = useState<'gemini' | 'local'>('local');

  // Privacy & Consent state (never stored permanently, session only)
  const [hasGivenGeminiConsent, setHasGivenGeminiConsent] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [showPrivacyGuide, setShowPrivacyGuide] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to analyze
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (conversationText.trim().length >= 10 && !isAnalyzing) {
          e.preventDefault();
          handleStartAnalyze();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversationText, isAnalyzing, mode, hasGivenGeminiConsent]);

  const executeAnalysis = async (selectedMode: 'gemini' | 'local') => {
    setIsAnalyzing(true);
    setError(null);

    try {
      if (selectedMode === 'local') {
        // Pure in-browser deterministic heuristic analysis
        // Small delay to provide natural UI feedback and ensure DOM renders spinner
        await new Promise(res => setTimeout(res, 450));
        const localResult = analyzeConversationLocally(conversationText, userName || 'You');
        setAnalysisResult(localResult);
        addToast('success', 'Analysis Complete (Private Local Mode)', 'Zero network requests made. Fully computed in your browser.');
      } else {
        // Server-side Gemini 3.8 Flash analysis
        const response = await fetch('/api/analyze-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationText,
            targetUser: userName || 'You',
            contextPlatform: platform
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const data: AnalysisResult = await response.json();
        setAnalysisResult(data);
        addToast('success', 'Analysis Complete (Gemini 3.8 Flash)', 'Deep semantic catch-up briefing generated with verbatim evidence.');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      const msg = err.message || 'An unexpected error occurred during conversation analysis.';
      setError(msg);
      addToast('error', 'Analysis Failed', msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartAnalyze = () => {
    if (!conversationText || conversationText.trim().length < 10) {
      setError('Please provide at least 10 characters of conversation text.');
      return;
    }

    if (mode === 'gemini' && !hasGivenGeminiConsent) {
      setShowConsentModal(true);
      return;
    }

    executeAnalysis(mode);
  };

  const handleConsentConfirm = () => {
    setHasGivenGeminiConsent(true);
    setShowConsentModal(false);
    executeAnalysis('gemini');
  };

  const handleConsentSwitchToLocal = () => {
    setShowConsentModal(false);
    setMode('local');
    executeAnalysis('local');
  };

  const handleClear = () => {
    setConversationText('');
    setAnalysisResult(null);
    setError(null);
    addToast('info', 'Conversation Cleared', 'All conversation and session analysis data cleared.');
  };

  const handleLoadDemo = (demo: DemoConversation) => {
    setConversationText(demo.text);
    setUserName(demo.targetUser);
    setPlatform(demo.context);
    setAnalysisResult(null);
    setError(null);
    addToast('info', `Loaded ${demo.name}`, demo.badge);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    if (!analysisResult) return;
    setAnalysisResult(prev => {
      if (!prev) return null;
      const updatedTasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleCopyText = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('success', title);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      addToast('success', title);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] text-[#25243A] flex flex-col font-sans selection:bg-[#8275D8]/20 selection:text-[#5B4DB8]">
      {/* Navigation Bar */}
      <Navbar
        mode={mode}
        onToggleMode={(newMode) => {
          setMode(newMode);
          addToast(
            'info',
            newMode === 'local' ? 'Switched to Private Local Mode' : 'Switched to Gemini Enhanced Mode',
            newMode === 'local'
              ? 'Zero network calls. Runs 100% in-browser.'
              : 'Requires consent before transmitting text to Gemini 3.8 Flash.'
          );
        }}
        onOpenPrivacyGuide={() => setShowPrivacyGuide(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        isAnalyzing={isAnalyzing}
        hasResults={Boolean(analysisResult)}
        onReset={handleClear}
      />

      <main className="flex-1 flex flex-col">
        {/* If no analysis result yet, show Hero + Input */}
        {!analysisResult && !isAnalyzing && (
          <div className="space-y-4 sm:space-y-6 pb-16">
            <HeroSection
              userName={userName}
              onUserNameChange={setUserName}
              platform={platform}
              onPlatformChange={setPlatform}
              onTrySample={() => handleLoadDemo(DEMO_CONVERSATIONS[0])}
            />

            <ConversationInput
              text={conversationText}
              onChangeText={setConversationText}
              onAnalyze={handleStartAnalyze}
              onClear={handleClear}
              onLoadDemo={handleLoadDemo}
              isAnalyzing={isAnalyzing}
              mode={mode}
              onToggleMode={setMode}
              error={error}
            />
          </div>
        )}

        {/* Loading Animation Stepper */}
        {isAnalyzing && (
          <div className="py-12 sm:py-20 flex-1 flex items-center justify-center">
            <AnalysisLoading mode={mode} />
          </div>
        )}

        {/* Results Dashboard */}
        {analysisResult && !isAnalyzing && (
          <div className="pt-6">
            <Dashboard
              result={analysisResult}
              onClear={handleClear}
              onCopyText={handleCopyText}
              onToggleTaskComplete={handleToggleTaskComplete}
              targetUser={userName || 'You'}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAEAF2] bg-white py-6 text-center text-xs text-[#77778A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#25243A]">MissedMate AI</span>
            <span>—</span>
            <span>The Unread Problem: Solved with Verbatim Evidence.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#77778A]">
            <button
              onClick={() => setShowPrivacyGuide(true)}
              className="hover:text-[#8275D8] transition-colors underline"
            >
              Privacy & Architecture
            </button>
            <span>•</span>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-[#8275D8] transition-colors underline"
            >
              Settings
            </button>
            <span>•</span>
            <span>Zero Persistent Chat Logs</span>
            <span>•</span>
            <span>Google Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* Consent Modal for Gemini Mode */}
      <ConsentModal
        isOpen={showConsentModal}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowConsentModal(false)}
        onSwitchToLocal={handleConsentSwitchToLocal}
      />

      {/* Privacy and Architecture Explainer Modal */}
      <PrivacyGuideModal
        isOpen={showPrivacyGuide}
        onClose={() => setShowPrivacyGuide(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        mode={mode}
        onToggleMode={setMode}
        onCopyText={handleCopyText}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
