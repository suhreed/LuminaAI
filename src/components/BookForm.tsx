'use client';

import { useState } from 'react';
import { ArrowLeft, BookOpen, Wand2 } from 'lucide-react';
import type { Book } from '@/types';

const GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
  'Historical Fiction', 'Horror', 'Literary Fiction', 'Adventure',
  'Young Adult', 'Non-Fiction', 'Self-Help', 'Biography', 'Other',
];

const LANGUAGES = [
  'Arabic', 'Bangla', 'Chinese (Simplified)', 'Dutch', 'English',
  'French', 'German', 'Hindi', 'Italian', 'Japanese', 'Korean',
  'Polish', 'Portuguese', 'Russian', 'Spanish', 'Turkish',
];

interface Props {
  book?: Book;
  onBack: () => void;
  onSave: (data: Pick<Book, 'title' | 'topic' | 'genre' | 'targetLanguage'>) => void;
  isNew?: boolean;
}

export default function BookForm({ book, onBack, onSave, isNew = false }: Props) {
  const [title, setTitle] = useState(book?.title ?? '');
  const [topic, setTopic] = useState(book?.topic ?? '');
  const [genre, setGenre] = useState(book?.genre ?? 'Fantasy');
  const [targetLanguage, setTargetLanguage] = useState(book?.targetLanguage ?? 'English');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) return;
    onSave({ title: title.trim(), topic: topic.trim(), genre, targetLanguage });
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-violet-400" />
          <h1 className="text-lg font-semibold text-white">
            {isNew ? 'New Book' : 'Edit Book Details'}
          </h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Book Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Last Starkeeper"
            required
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 text-sm"
          />
        </div>

        {/* Topic / Premise */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Topic / Premise *</label>
          <p className="text-xs text-neutral-500">
            Describe your book&apos;s core idea, plot, or premise. The more detail, the better the AI output.
          </p>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. A young astronomer discovers an ancient map hidden in a dying star's light, leading her on a journey across galaxies to prevent the universe's collapse..."
            required
            rows={5}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 text-sm resize-none"
          />
        </div>

        {/* Genre */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 text-sm appearance-none"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Target Language */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Target Language</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 text-sm appearance-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim() || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-medium py-3.5 rounded-xl transition-colors mt-4"
        >
          <Wand2 size={18} />
          {isNew ? 'Create Book & Generate Outline' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
