'use client';

import {
  ArrowLeft, Map, PenLine, CheckCircle, Edit3,
  ChevronRight, BookOpen, Sparkles
} from 'lucide-react';
import type { Book } from '@/types';

interface Props {
  book: Book;
  onBack: () => void;
  onEditMeta: () => void;
  onGoOutline: () => void;
  onGoManuscript: (chapterNumber?: number) => void;
}

const STATUS_LABELS: Record<Book['status'], string> = {
  draft: 'Draft',
  outlining: 'Outlining',
  writing: 'Writing',
  complete: 'Complete ✓',
};

const STATUS_COLORS: Record<Book['status'], string> = {
  draft: 'text-neutral-400',
  outlining: 'text-blue-400',
  writing: 'text-violet-400',
  complete: 'text-emerald-400',
};

export default function BookDashboard({ book, onBack, onEditMeta, onGoOutline, onGoManuscript }: Props) {
  const writtenChapters = book.chapters.filter((c) => c.content.trim());
  const totalChapters = book.chapters.length;
  const progress = totalChapters > 0 ? Math.round((writtenChapters.length / totalChapters) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800">
        <button onClick={onBack} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{book.title}</h1>
          <p className={`text-xs font-medium ${STATUS_COLORS[book.status]}`}>
            {STATUS_LABELS[book.status]}
          </p>
        </div>
        <button
          onClick={onEditMeta}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Edit book details"
        >
          <Edit3 size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* Book Info Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-16 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-base leading-tight">{book.title}</h2>
              <p className="text-xs text-neutral-500 mt-0.5">{book.genre} · {book.targetLanguage}</p>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed line-clamp-3">{book.topic}</p>
            </div>
          </div>

          {/* Progress */}
          {totalChapters > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Writing Progress</span>
                <span className="text-neutral-400 font-medium">{writtenChapters.length}/{totalChapters} chapters</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-600">{progress}% complete</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</h3>

          {/* Outline */}
          <button
            onClick={onGoOutline}
            className="w-full flex items-center gap-4 bg-neutral-900 border border-neutral-800 hover:border-violet-700/50 hover:bg-neutral-800/50 rounded-xl px-4 py-4 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <Map size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">
                {book.outlineApproved ? 'View Outline' : 'Create / Edit Outline'}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {book.outline.length > 0
                  ? `${book.outline.length} chapters · ${book.outlineApproved ? 'Approved ✓' : 'Not approved yet'}`
                  : 'Generate your chapter outline with AI'}
              </p>
            </div>
            <ChevronRight size={16} className="text-neutral-600 flex-shrink-0" />
          </button>

          {/* Manuscript */}
          <button
            onClick={() => onGoManuscript()}
            disabled={!book.outlineApproved}
            className="w-full flex items-center gap-4 bg-neutral-900 border border-neutral-800 hover:border-violet-700/50 hover:bg-neutral-800/50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-4 py-4 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-violet-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <PenLine size={18} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">Write Manuscript</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {!book.outlineApproved
                  ? 'Approve your outline first'
                  : `${writtenChapters.length}/${totalChapters} chapters written`}
              </p>
            </div>
            <ChevronRight size={16} className="text-neutral-600 flex-shrink-0" />
          </button>
        </div>

        {/* Chapter Quick Access */}
        {book.outlineApproved && book.chapters.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Chapters</h3>
            <div className="space-y-2">
              {[...book.chapters]
                .sort((a, b) => a.chapterNumber - b.chapterNumber)
                .map((ch) => (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => onGoManuscript(ch.chapterNumber)}
                    className="w-full flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800/50 rounded-xl px-4 py-3 transition-colors text-left"
                  >
                    <span className="text-xs font-bold text-violet-400 w-5 flex-shrink-0">
                      {ch.chapterNumber}
                    </span>
                    <span className="flex-1 text-sm text-neutral-300 truncate">{ch.title}</span>
                    {ch.content.trim() ? (
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Sparkles size={14} className="text-neutral-700 flex-shrink-0" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
