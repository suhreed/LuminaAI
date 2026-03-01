import type { Book } from '@/types';

export function exportMarkdown(book: Book): void {
  const lines: string[] = [];

  lines.push(`# ${book.title}`);
  lines.push('');
  lines.push(`**Genre:** ${book.genre}`);
  lines.push(`**Language:** ${book.targetLanguage}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  const sortedChapters = [...book.chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  for (const chapter of sortedChapters) {
    lines.push(`## Chapter ${chapter.chapterNumber}: ${chapter.title}`);
    lines.push('');
    lines.push(chapter.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPDF(book: Book): Promise<void> {
  // Dynamically import html2pdf to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;

  const sortedChapters = [...book.chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; color: #1a1a1a;">
      <div style="text-align: center; padding: 80px 20px; page-break-after: always;">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: #111;">${escapeHtml(book.title)}</h1>
        <p style="font-size: 1.1rem; color: #555;">${escapeHtml(book.genre)}</p>
        <p style="font-size: 1rem; color: #777; margin-top: 0.5rem;">Language: ${escapeHtml(book.targetLanguage)}</p>
      </div>
      ${sortedChapters
        .map(
          (ch, i) => `
        <div style="${i < sortedChapters.length - 1 ? 'page-break-after: always;' : ''} padding: 40px 20px;">
          <h2 style="font-size: 1.6rem; margin-bottom: 0.5rem; color: #111;">Chapter ${ch.chapterNumber}: ${escapeHtml(ch.title)}</h2>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 1rem 0 2rem;" />
          <div style="font-size: 1rem; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(ch.content)}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  document.body.appendChild(element);

  await html2pdf()
    .set({
      margin: [15, 15, 15, 15],
      filename: `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(element)
    .save();

  document.body.removeChild(element);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
