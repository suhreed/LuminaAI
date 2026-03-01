import type { ChapterOutline, OutlineChatMessage } from '@/types';

const MODEL = 'gemini-2.5-flash';

function getClient(apiKey: string) {
  // We call the REST API directly to avoid bundling issues with the SDK in Next.js edge/client
  return apiKey;
}

async function callGemini(
  apiKey: string,
  contents: { role: string; parts: { text: string }[] }[],
  systemInstruction?: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = { contents };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}

// ── Outline Generation ─────────────────────────────────────────────────────

export async function generateOutline(
  apiKey: string,
  title: string,
  topic: string,
  genre: string,
  targetLanguage: string
): Promise<ChapterOutline[]> {
  getClient(apiKey);

  const system = `You are an expert book architect. When asked to create a book outline, you ALWAYS respond with ONLY a valid JSON array and nothing else. No markdown fences, no explanation.`;

  const prompt = `Create a detailed chapter-by-chapter outline for a ${genre} book.

Title: "${title}"
Premise/Topic: ${topic}
Target Language: ${targetLanguage}

Return a JSON array of chapter objects. Each object must have:
- chapterNumber (integer, starting at 1)
- title (string, the chapter title)
- summary (string, 2-3 sentences describing what happens in this chapter)

Aim for 10-15 chapters. Return ONLY the JSON array.`;

  const raw = await callGemini(
    apiKey,
    [{ role: 'user', parts: [{ text: prompt }] }],
    system
  );

  // Strip possible markdown fences
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as ChapterOutline[];
}

// ── Outline Chat ───────────────────────────────────────────────────────────

export async function chatOutline(
  apiKey: string,
  title: string,
  topic: string,
  genre: string,
  targetLanguage: string,
  currentOutline: ChapterOutline[],
  history: OutlineChatMessage[],
  userMessage: string
): Promise<{ reply: string; updatedOutline: ChapterOutline[] }> {
  const system = `You are an expert book architect helping refine a book outline. 
When the user asks for changes, you MUST respond with:
1. A brief friendly explanation of what you changed (1-2 sentences).
2. Then the string "OUTLINE_JSON:" followed by the complete updated JSON array on a new line.

The JSON array must contain all chapters with fields: chapterNumber, title, summary.
Always include the full outline even if only one chapter changed.`;

  const contextMsg = `Book: "${title}" | Genre: ${genre} | Language: ${targetLanguage}
Premise: ${topic}

Current outline:
${JSON.stringify(currentOutline, null, 2)}`;

  const contents = [
    { role: 'user', parts: [{ text: contextMsg }] },
    { role: 'model', parts: [{ text: 'Understood. I have the current outline. How can I help you refine it?' }] },
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const raw = await callGemini(apiKey, contents, system);

  const markerIdx = raw.indexOf('OUTLINE_JSON:');
  if (markerIdx === -1) {
    // No JSON returned – just a conversational reply
    return { reply: raw.trim(), updatedOutline: currentOutline };
  }

  const reply = raw.slice(0, markerIdx).trim();
  const jsonPart = raw
    .slice(markerIdx + 'OUTLINE_JSON:'.length)
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const updatedOutline = JSON.parse(jsonPart) as ChapterOutline[];
  return { reply, updatedOutline };
}

// ── Chapter Writing ────────────────────────────────────────────────────────

export async function generateChapter(
  apiKey: string,
  title: string,
  topic: string,
  genre: string,
  targetLanguage: string,
  outline: ChapterOutline[],
  chapterNumber: number
): Promise<string> {
  const chapter = outline.find((c) => c.chapterNumber === chapterNumber);
  if (!chapter) throw new Error('Chapter not found in outline');

  const prevChapters = outline
    .filter((c) => c.chapterNumber < chapterNumber)
    .map((c) => `Chapter ${c.chapterNumber}: ${c.title} — ${c.summary}`)
    .join('\n');

  const upcomingChapters = outline
    .filter((c) => c.chapterNumber > chapterNumber)
    .slice(0, 3)
    .map((c) => `Chapter ${c.chapterNumber}: ${c.title} — ${c.summary}`)
    .join('\n');

  const system = `You are a masterful ghostwriter. Write deeply engaging, vivid, and immersive prose. 
Write in ${targetLanguage}. Match the tone and style of the ${genre} genre.
Do NOT include a chapter heading — just the prose content.`;

  const prompt = `Write Chapter ${chapterNumber}: "${chapter.title}" for the book "${title}".

Book premise: ${topic}

${prevChapters ? `Previous chapters (for context):\n${prevChapters}\n` : ''}
THIS CHAPTER to write:
Chapter ${chapterNumber}: ${chapter.title}
Summary: ${chapter.summary}

${upcomingChapters ? `Upcoming chapters (for narrative consistency):\n${upcomingChapters}\n` : ''}

Write a full, rich chapter of at least 1500 words. Use vivid descriptions, compelling dialogue, and strong character development. Write ONLY the chapter prose.`;

  return callGemini(
    apiKey,
    [{ role: 'user', parts: [{ text: prompt }] }],
    system
  );
}
