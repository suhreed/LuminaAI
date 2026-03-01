'use client';

import { BookOpen, Plus, Trash2, ChevronRight, Sparkles, Settings } from 'lucide-react';
import type { Book } from '@/types';

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
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles size={22} className="text-violet-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Lumina AI</h1>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Tagline */}
        <div className="mb-6">
          <p className="text-neutral-400 text-sm">Your AI-powered writing studio</p>
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
            <BookOpen size={48} className="text-neutral-700 mb-4" />
            <p className="text-neutral-400 font-medium">No books yet</p>
            <p className="text-neutral-600 text-sm mt-1">
              Create your first book project to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Your Books ({books.length})
            </h2>
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => onOpenBook(book.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[book.status]}`}
                      >
                        {STATUS_LABELS[book.status]}
                      </span>
                      <span className="text-xs text-neutral-500">{book.genre}</span>
                    </div>
                    <p className="text-white font-medium truncate">{book.title}</p>
                    <p className="text-neutral-500 text-xs mt-0.5 truncate">{book.topic}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                      <span>{book.outline.length} chapters outlined</span>
                      <span>·</span>
                      <span>
                        {book.chapters.filter((c) => c.content).length} written
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-neutral-600 flex-shrink-0" />
                </button>

                {/* Delete */}
                <div className="border-t border-neutral-800 px-4 py-2 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-red-400 transition-colors py-1 px-2 rounded"
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
