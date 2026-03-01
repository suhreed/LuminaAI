'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Book, AppSettings, AppView } from '@/types';
import { getBooks, getSettings, upsertBook, deleteBook } from '@/lib/storage';
import BookList from '@/components/BookList';
import BookForm from '@/components/BookForm';
import BookDashboard from '@/components/BookDashboard';
import OutlineEditor from '@/components/OutlineEditor';
import ManuscriptWriter from '@/components/ManuscriptWriter';
import SettingsModal from '@/components/SettingsModal';

function generateId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface AppState {
  books: Book[];
  settings: AppSettings;
  hydrated: boolean;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    books: [],
    settings: { geminiApiKey: '', theme: 'dark' },
    hydrated: false,
  });
  const [view, setView] = useState<AppView>({ type: 'home' });
  const [showSettings, setShowSettings] = useState(false);

  const { books, settings, hydrated } = appState;

  // Load from localStorage on mount (localStorage is not available during SSR)
  useEffect(() => {
    setAppState({ books: getBooks(), settings: getSettings(), hydrated: true });
  }, []);

  const refreshBooks = useCallback(() => {
    setAppState((prev) => ({ ...prev, books: getBooks() }));
  }, []);

  function handleCreateBook(data: Pick<Book, 'title' | 'topic' | 'genre' | 'targetLanguage'>) {
    const newBook: Book = {
      id: generateId(),
      ...data,
      status: 'draft',
      outline: [],
      outlineApproved: false,
      chapters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertBook(newBook);
    refreshBooks();
    setView({ type: 'outline', bookId: newBook.id });
  }

  function handleUpdateBook(updated: Book) {
    upsertBook(updated);
    refreshBooks();
  }

  function handleDeleteBook(id: string) {
    deleteBook(id);
    refreshBooks();
    setView({ type: 'home' });
  }

  function handleEditBookMeta(bookId: string, data: Pick<Book, 'title' | 'topic' | 'genre' | 'targetLanguage'>) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const updated: Book = { ...book, ...data, updatedAt: new Date().toISOString() };
    upsertBook(updated);
    refreshBooks();
    // Navigate to outline after edit
    setView({ type: 'outline', bookId });
  }

  function getBook(id: string): Book | undefined {
    return books.find((b) => b.id === id);
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] max-w-lg mx-auto relative">
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            setAppState((prev) => ({ ...prev, settings: s }));
            setShowSettings(false);
          }}
        />
      )}

      {/* Views */}
      {view.type === 'home' && (
        <BookList
          books={books}
          onCreateBook={() => setView({ type: 'create-book' })}
          onOpenBook={(id) => setView({ type: 'outline', bookId: id })}
          onDeleteBook={handleDeleteBook}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {view.type === 'create-book' && (
        <BookForm
          isNew
          onBack={() => setView({ type: 'home' })}
          onSave={handleCreateBook}
        />
      )}

      {view.type === 'edit-book-meta' && (() => {
        const book = getBook(view.bookId);
        if (!book) return null;
        return (
          <BookForm
            book={book}
            onBack={() => setView({ type: 'outline', bookId: view.bookId })}
            onSave={(data) => handleEditBookMeta(view.bookId, data)}
          />
        );
      })()}

      {view.type === 'outline' && (() => {
        const book = getBook(view.bookId);
        if (!book) return null;

        // If outline is approved, show dashboard instead
        if (book.outlineApproved && book.outline.length > 0) {
          return (
            <BookDashboard
              book={book}
              onBack={() => setView({ type: 'home' })}
              onEditMeta={() => setView({ type: 'edit-book-meta', bookId: view.bookId })}
              onGoOutline={() => setView({ type: 'outline', bookId: view.bookId + '_force' })}
              onGoManuscript={(ch) => setView({ type: 'manuscript', bookId: view.bookId, chapterNumber: ch })}
            />
          );
        }

        return (
          <OutlineEditor
            book={book}
            apiKey={settings.geminiApiKey}
            onBack={() => setView({ type: 'home' })}
            onUpdate={handleUpdateBook}
            onApprove={(updated) => {
              handleUpdateBook(updated);
              setView({ type: 'outline', bookId: updated.id });
            }}
          />
        );
      })()}

      {/* Force outline view even when approved */}
      {view.type === 'outline' && view.bookId.endsWith('_force') && (() => {
        const realId = view.bookId.replace('_force', '');
        const book = getBook(realId);
        if (!book) return null;
        return (
          <OutlineEditor
            book={book}
            apiKey={settings.geminiApiKey}
            onBack={() => setView({ type: 'outline', bookId: realId })}
            onUpdate={handleUpdateBook}
            onApprove={(updated) => {
              handleUpdateBook(updated);
              setView({ type: 'outline', bookId: realId });
            }}
          />
        );
      })()}

      {view.type === 'manuscript' && (() => {
        const book = getBook(view.bookId);
        if (!book) return null;
        return (
          <ManuscriptWriter
            book={book}
            apiKey={settings.geminiApiKey}
            initialChapter={view.chapterNumber}
            onBack={() => setView({ type: 'outline', bookId: view.bookId })}
            onUpdate={handleUpdateBook}
          />
        );
      })()}
    </main>
  );
}
