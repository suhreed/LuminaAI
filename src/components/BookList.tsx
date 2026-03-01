'use client';

import { BookOpen, Plus, Trash2, ChevronRight, Sparkles, Settings, Sun, Moon } from 'lucide-react';
import type { Book, Theme } from '@/types';
import { useTheme } from './ThemeProvider';

interface Props {
  books: Book[];
  onCreateBook: () => void;
  onOpenBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onOpenSettings: () => void;
}

const STATUS_LABELS: Record<Book['status'], string> = {
  draft: 'Draft',
  outlining: 'Outlining',
  writing: 'Writing',
  complete: 'Complete',
};

const STATUS_COLORS: Record<Book['status'], string> = {
  draft: 'bg-neutral-700 text-neutral-300',
  outlining: 'bg-blue-900/60 text-blue-300',
  writing: 'bg-violet-900/60 text-violet-300',
  complete: 'bg-emerald-900/60 text-emerald-300',
};

export default function BookList({
  books,
  onCreateBook,
  onOpenBook,
  onDeleteBook,
  onOpenSettings,
}: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Sparkles size={22} className="text-violet-400" />
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Lumina AI</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Tagline */}
        <div className="mb-6">
          <p className="text-[var(--text-muted)] text-sm">Your AI-powered writing studio</p>
        </div>

        {/* Create Button */}
        <button
          onClick={onCreateBook}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium py-3.5 rounded-xl transition-colors mb-6"
        >
          <Plus size={18} />
          New Book Project
        </button>

        {/* Books */}
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={48} className="text-[var(--border-color)] mb-4" />
            <p className="text-[var(--text-secondary)] font-medium">No books yet</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Create your first book project to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Your Books ({books.length})
            </h2>
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => onOpenBook(book.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[book.status]}`}
                      >
                        {STATUS_LABELS[book.status]}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{book.genre}</span>
                    </div>
                    <p className="text-[var(--text-primary)] font-medium truncate">{book.title}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5 truncate">{book.topic}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                      <span>{book.outline.length} chapters outlined</span>
                      <span>·</span>
                      <span>
                        {book.chapters.filter((c) => c.content).length} written
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-muted)] flex-shrink-0" />
                </button>

                {/* Delete */}
                <div className="border-t border-[var(--border-color)] px-4 py-2 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors py-1 px-2 rounded"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
