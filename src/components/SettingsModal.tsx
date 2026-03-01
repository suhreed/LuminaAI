'use client';

import { useState } from 'react';
import { X, Key, Eye, EyeOff, Save } from 'lucide-react';
import type { AppSettings } from '@/types';
import { saveSettings } from '@/lib/storage';

interface Props {
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsModal({ settings, onClose, onSave }: Props) {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const updated: AppSettings = { geminiApiKey: apiKey.trim() };
    saveSettings(updated);
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Key size={18} className="text-violet-400" />
            API Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* API Key Input */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium text-neutral-300">
            Gemini API Key
          </label>
          <p className="text-xs text-neutral-500">
            Your key is stored only in your browser&apos;s local storage and never sent to any server.
          </p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Get Key Link */}
        <p className="text-xs text-neutral-500 mb-6">
          Don&apos;t have a key?{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Get one free at Google AI Studio →
          </a>
        </p>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors"
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
