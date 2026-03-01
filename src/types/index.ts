export type BookStatus = 'draft' | 'outlining' | 'writing' | 'complete';

export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  summary: string;
}

export interface Chapter {
  chapterNumber: number;
  title: string;
  content: string;
  isGenerated: boolean;
  lastEdited?: string;
}

export interface Book {
  id: string;
  title: string;
  topic: string;
  genre: string;
  targetLanguage: string;
  status: BookStatus;
  outline: ChapterOutline[];
  outlineApproved: boolean;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export interface OutlineChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppSettings {
  geminiApiKey: string;
}

export type AppView =
  | { type: 'home' }
  | { type: 'create-book' }
  | { type: 'edit-book-meta'; bookId: string }
  | { type: 'outline'; bookId: string }
  | { type: 'manuscript'; bookId: string; chapterNumber?: number }
  | { type: 'settings' };
