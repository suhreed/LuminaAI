# Active Context: Lumina AI – AI Architect & Ghostwriter

## Current State

**App Status**: ✅ Fully built and deployed

Lumina AI is a complete AI-powered mobile web application for writing books. It uses the Gemini 2.5 Flash model via REST API to help users brainstorm, outline, and write full manuscripts chapter by chapter.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **Lumina AI full application build**
  - [x] Data types (Book, Chapter, ChapterOutline, AppSettings, AppView)
  - [x] localStorage utilities (CRUD for books and settings)
  - [x] Gemini REST API service (outline generation, outline chat, chapter writing)
  - [x] Export utilities (Markdown .md and PDF via html2pdf.js)
  - [x] SettingsModal (API key management with show/hide)
  - [x] BookForm (create/edit book metadata: title, topic, genre, language)
  - [x] BookList (home screen with status badges, delete)
  - [x] OutlineEditor (AI generation, chat refinement, manual editing, approve flow)
  - [x] ManuscriptWriter (chapter nav, AI ghostwriting, manual editing, export)
  - [x] BookDashboard (progress tracking, chapter quick-access)
  - [x] Main page routing (view-based SPA navigation)
  - [x] Mobile-first dark theme CSS

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Main SPA router | ✅ Ready |
| `src/app/layout.tsx` | Root layout with Inter font | ✅ Ready |
| `src/app/globals.css` | Mobile-first dark theme | ✅ Ready |
| `src/types/index.ts` | TypeScript interfaces | ✅ Ready |
| `src/lib/storage.ts` | localStorage CRUD | ✅ Ready |
| `src/lib/gemini.ts` | Gemini REST API calls | ✅ Ready |
| `src/lib/export.ts` | Markdown + PDF export | ✅ Ready |
| `src/components/SettingsModal.tsx` | API key settings | ✅ Ready |
| `src/components/BookForm.tsx` | Create/edit book metadata | ✅ Ready |
| `src/components/BookList.tsx` | Home screen book list | ✅ Ready |
| `src/components/OutlineEditor.tsx` | AI outline editor with chat | ✅ Ready |
| `src/components/ManuscriptWriter.tsx` | Chapter-by-chapter writer | ✅ Ready |
| `src/components/BookDashboard.tsx` | Book overview & progress | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## App Features

### 📚 Project Management
- Multiple book projects with localStorage persistence
- Custom metadata: Title, Topic/Premise, Genre, Target Language
- Status tracking: draft → outlining → writing → complete

### 🗺️ AI-Powered Outlining
- Auto-generate chapter outlines via Gemini 2.5 Flash
- Interactive chat to refine outlines ("Add a plot twist in Chapter 3")
- Manual chapter editing (title + summary)
- Approve outline to unlock writing phase

### ✍️ Smart Manuscript Writing
- Chapter-by-chapter interface with visual progress
- AI ghostwriting with full narrative context
- Manual editing with save/cancel
- Progress bar and chapter status indicators

### 📤 Export Options
- Markdown (.md) export
- PDF export via html2pdf.js with title page and chapter breaks

### 🔐 API Key Management
- Bring-your-own Gemini API key
- Stored in localStorage only, never sent to any server

## Tech Stack Additions

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | 0.575.0 | Icons |
| `html2pdf.js` | 0.14.0 | PDF generation |
| `@google/generative-ai` | 0.24.1 | Gemini SDK (not used directly, REST API used instead) |

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-01 | Built complete Lumina AI application |
