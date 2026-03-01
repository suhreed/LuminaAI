import type { Book, AppSettings } from '@/types';

const BOOKS_KEY = 'lumina_books';
const SETTINGS_KEY = 'lumina_settings';

// ── Books ──────────────────────────────────────────────────────────────────

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKS_KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function getBook(id: string): Book | null {
  return getBooks().find((b) => b.id === id) ?? null;
}

export function upsertBook(book: Book): void {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === book.id);
  if (idx >= 0) {
    books[idx] = book;
  } else {
    books.unshift(book);
  }
  saveBooks(books);
}

export function deleteBook(id: string): void {
  saveBooks(getBooks().filter((b) => b.id !== id));
}

// ── Settings ───────────────────────────────────────────────────────────────

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return { geminiApiKey: '', theme: 'dark' };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as AppSettings) : { geminiApiKey: '', theme: 'dark' };
  } catch {
    return { geminiApiKey: '', theme: 'dark' };
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
