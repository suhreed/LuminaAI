'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Wand2, Send, CheckCircle, Edit3, RefreshCw,
  ChevronDown, ChevronUp, Loader2, AlertCircle, Pencil, Check, X
} from 'lucide-react';
import type { Book, ChapterOutline, OutlineChatMessage } from '@/types';
import { generateOutline, chatOutline } from '@/lib/gemini';

interface Props {
  book: Book;
  apiKey: string;
  onBack: () => void;
  onUpdate: (book: Book) => void;
  onApprove: (book: Book) => void;
}

export default function OutlineEditor({ book, apiKey, onBack, onUpdate, onApprove }: Props) {
  const [outline, setOutline] = useState<ChapterOutline[]>(book.outline);
  const [chatHistory, setChatHistory] = useState<OutlineChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState('');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Auto-generate outline if empty
  useEffect(() => {
    if (outline.length === 0 && !isGenerating) {
      handleGenerateOutline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerateOutline() {
    if (!apiKey) {
      setError('Please add your Gemini API key in Settings first.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const newOutline = await generateOutline(
        apiKey, book.title, book.topic, book.genre, book.targetLanguage
      );
      setOutline(newOutline);
      const updated: Book = { ...book, outline: newOutline, status: 'outlining', updatedAt: new Date().toISOString() };
      onUpdate(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleChat() {
    if (!userInput.trim() || isChatting) return;
    if (!apiKey) {
      setError('Please add your Gemini API key in Settings first.');
      return;
    }

    const message = userInput.trim();
    setUserInput('');
    setIsChatting(true);
    setError('');

    const newHistory: OutlineChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: message },
    ];
    setChatHistory(newHistory);

    try {
      const { reply, updatedOutline } = await chatOutline(
        apiKey, book.title, book.topic, book.genre, book.targetLanguage,
        outline, chatHistory, message
      );
      setOutline(updatedOutline);
      setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
      const updated: Book = { ...book, outline: updatedOutline, updatedAt: new Date().toISOString() };
      onUpdate(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed');
      setChatHistory(newHistory.slice(0, -1));
    } finally {
      setIsChatting(false);
    }
  }

  function handleApprove() {
    const updated: Book = {
      ...book,
      outline,
      outlineApproved: true,
      status: 'writing',
      // Initialize chapters from outline
      chapters: outline.map((ch) => {
        const existing = book.chapters.find((c) => c.chapterNumber === ch.chapterNumber);
        return existing ?? {
          chapterNumber: ch.chapterNumber,
          title: ch.title,
          content: '',
          isGenerated: false,
        };
      }),
      updatedAt: new Date().toISOString(),
    };
    onApprove(updated);
  }

  function startEditChapter(ch: ChapterOutline) {
    setEditingChapter(ch.chapterNumber);
    setEditTitle(ch.title);
    setEditSummary(ch.summary);
  }

  function saveEditChapter() {
    const updated = outline.map((ch) =>
      ch.chapterNumber === editingChapter
        ? { ...ch, title: editTitle, summary: editSummary }
        : ch
    );
    setOutline(updated);
    const updatedBook: Book = { ...book, outline: updated, updatedAt: new Date().toISOString() };
    onUpdate(updatedBook);
    setEditingChapter(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{book.title}</h1>
          <p className="text-xs text-neutral-500">Outline Editor</p>
        </div>
        {outline.length > 0 && (
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors flex-shrink-0"
          >
            <CheckCircle size={15} />
            Approve
          </button>
        )}
      </header>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-red-900/30 border border-red-800 rounded-xl p-3 text-sm text-red-300">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Outline List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-violet-400 animate-spin" />
            <p className="text-neutral-400 text-sm">Generating your outline...</p>
          </div>
        ) : outline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-neutral-500 text-sm">No outline yet</p>
            <button
              onClick={handleGenerateOutline}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Wand2 size={16} />
              Generate Outline
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                {outline.length} Chapters
              </p>
              <button
                onClick={handleGenerateOutline}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <RefreshCw size={13} />
                Regenerate
              </button>
            </div>

            {outline.map((ch) => (
              <div key={ch.chapterNumber} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {editingChapter === ch.chapterNumber ? (
                  <div className="p-4 space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                      placeholder="Chapter title"
                    />
                    <textarea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                      placeholder="Chapter summary"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEditChapter} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                        <Check size={13} /> Save
                      </button>
                      <button onClick={() => setEditingChapter(null)} className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs px-3 py-1.5 rounded-lg transition-colors">
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setExpandedChapter(expandedChapter === ch.chapterNumber ? null : ch.chapterNumber)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800/50 transition-colors"
                    >
                      <span className="text-xs font-bold text-violet-400 w-6 flex-shrink-0">
                        {ch.chapterNumber}
                      </span>
                      <span className="flex-1 text-sm font-medium text-white truncate">{ch.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditChapter(ch); }}
                          className="p-1 text-neutral-600 hover:text-violet-400 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {expandedChapter === ch.chapterNumber
                          ? <ChevronUp size={15} className="text-neutral-500" />
                          : <ChevronDown size={15} className="text-neutral-500" />
                        }
                      </div>
                    </button>
                    {expandedChapter === ch.chapterNumber && (
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-sm text-neutral-400 leading-relaxed">{ch.summary}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Chat Section */}
      {outline.length > 0 && (
        <div className="border-t border-neutral-800 bg-neutral-950 flex-shrink-0">
          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="max-h-48 overflow-y-auto px-4 py-3 space-y-2">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-neutral-800 text-neutral-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800 rounded-xl px-3 py-2">
                    <Loader2 size={14} className="text-violet-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Chat Input */}
          <div className="px-4 py-3 flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2">
              <Edit3 size={14} className="text-neutral-500 flex-shrink-0" />
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
                placeholder='e.g. "Add a plot twist in chapter 5"'
                className="flex-1 bg-transparent text-white text-sm placeholder-neutral-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleChat}
              disabled={!userInput.trim() || isChatting}
              className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-xl transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
