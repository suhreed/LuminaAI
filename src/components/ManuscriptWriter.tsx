'use client';

import { useState } from 'react';
import {
  ArrowLeft, Wand2, Save, ChevronLeft, ChevronRight,
  FileDown, Loader2, AlertCircle, CheckCircle2, Edit3,
  BookOpen, FileText
} from 'lucide-react';
import type { Book, Chapter } from '@/types';
import { generateChapter } from '@/lib/gemini';
import { exportMarkdown, exportPDF } from '@/lib/export';

interface Props {
  book: Book;
  apiKey: string;
  initialChapter?: number;
  onBack: () => void;
  onUpdate: (book: Book) => void;
}

export default function ManuscriptWriter({ book, apiKey, initialChapter, onBack, onUpdate }: Props) {
  const [currentChapterNum, setCurrentChapterNum] = useState(
    initialChapter ?? (book.chapters[0]?.chapterNumber ?? 1)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  const sortedChapters = [...book.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentChapter = sortedChapters.find((c) => c.chapterNumber === currentChapterNum);
  const currentIndex = sortedChapters.findIndex((c) => c.chapterNumber === currentChapterNum);
  const totalChapters = sortedChapters.length;
  const writtenCount = sortedChapters.filter((c) => c.content.trim()).length;

  function updateChapter(updated: Chapter) {
    const updatedChapters = book.chapters.map((c) =>
      c.chapterNumber === updated.chapterNumber ? updated : c
    );
    const updatedBook: Book = {
      ...book,
      chapters: updatedChapters,
      status: updatedChapters.every((c) => c.content.trim()) ? 'complete' : 'writing',
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedBook);
  }

  async function handleGenerate() {
    if (!apiKey) {
      setError('Please add your Gemini API key in Settings first.');
      return;
    }
    if (!currentChapter) return;
    setIsGenerating(true);
    setError('');
    try {
      const content = await generateChapter(
        apiKey, book.title, book.topic, book.genre, book.targetLanguage,
        book.outline, currentChapterNum
      );
      const updated: Chapter = {
        ...currentChapter,
        content,
        isGenerated: true,
        lastEdited: new Date().toISOString(),
      };
      updateChapter(updated);
      setEditMode(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate chapter');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleStartEdit() {
    setEditContent(currentChapter?.content ?? '');
    setEditMode(true);
  }

  function handleSaveEdit() {
    if (!currentChapter) return;
    const updated: Chapter = {
      ...currentChapter,
      content: editContent,
      isGenerated: false,
      lastEdited: new Date().toISOString(),
    };
    updateChapter(updated);
    setEditMode(false);
  }

  async function handleExportPDF() {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      await exportPDF(book);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF export failed');
    } finally {
      setIsExporting(false);
    }
  }

  function handleExportMarkdown() {
    setShowExportMenu(false);
    exportMarkdown(book);
  }

  const outlineChapter = book.outline.find((o) => o.chapterNumber === currentChapterNum);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate">{book.title}</h1>
          <p className="text-xs text-neutral-500">{writtenCount}/{totalChapters} chapters written</p>
        </div>
        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu((v) => !v)}
            disabled={isExporting || writtenCount === 0}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white disabled:text-neutral-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-neutral-800"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            Export
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden shadow-xl z-10 min-w-[140px]">
              <button
                onClick={handleExportMarkdown}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                <FileText size={14} />
                Markdown (.md)
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                <BookOpen size={14} />
                PDF Document
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-red-900/30 border border-red-800 rounded-xl p-3 text-sm text-red-300">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {/* Chapter Navigation */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800 flex-shrink-0 overflow-x-auto">
        {sortedChapters.map((ch) => (
          <button
            key={ch.chapterNumber}
            onClick={() => { setCurrentChapterNum(ch.chapterNumber); setEditMode(false); }}
            className={`flex-shrink-0 w-9 h-9 rounded-lg text-xs font-bold transition-colors relative ${
              ch.chapterNumber === currentChapterNum
                ? 'bg-violet-600 text-white'
                : ch.content.trim()
                ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
            }`}
          >
            {ch.chapterNumber}
            {ch.content.trim() && ch.chapterNumber !== currentChapterNum && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Chapter Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {currentChapter ? (
          <div className="space-y-4">
            {/* Chapter Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-violet-400">Chapter {currentChapterNum}</span>
                {currentChapter.content.trim() && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={11} /> Written
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">{currentChapter.title}</h2>
              {outlineChapter && (
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{outlineChapter.summary}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                {isGenerating ? (
                  <><Loader2 size={15} className="animate-spin" /> Writing...</>
                ) : (
                  <><Wand2 size={15} /> {currentChapter.content ? 'Rewrite with AI' : 'Write with AI'}</>
                )}
              </button>
              {!editMode && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors"
                >
                  <Edit3 size={15} />
                  {currentChapter.content ? 'Edit' : 'Write'}
                </button>
              )}
            </div>

            {/* Content Area */}
            {editMode ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Start writing your chapter here..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm leading-relaxed focus:outline-none focus:border-violet-500 resize-none min-h-[400px]"
                  style={{ minHeight: '400px' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Save size={15} /> Save
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : currentChapter.content ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {currentChapter.content}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900 border border-neutral-800 rounded-xl">
                <Edit3 size={32} className="text-neutral-700 mb-3" />
                <p className="text-neutral-500 text-sm">This chapter hasn&apos;t been written yet</p>
                <p className="text-neutral-600 text-xs mt-1">Use AI to generate it or write it manually</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-neutral-500">No chapter selected</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800 flex-shrink-0">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentChapterNum(sortedChapters[currentIndex - 1].chapterNumber);
              setEditMode(false);
            }
          }}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white disabled:text-neutral-700 transition-colors px-3 py-2 rounded-lg hover:bg-neutral-800 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="text-xs text-neutral-500">
          {currentIndex + 1} / {totalChapters}
        </span>
        <button
          onClick={() => {
            if (currentIndex < totalChapters - 1) {
              setCurrentChapterNum(sortedChapters[currentIndex + 1].chapterNumber);
              setEditMode(false);
            }
          }}
          disabled={currentIndex === totalChapters - 1}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white disabled:text-neutral-700 transition-colors px-3 py-2 rounded-lg hover:bg-neutral-800 disabled:hover:bg-transparent"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
