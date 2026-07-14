import { config } from '../../config/index.js';

export interface StyleConfig {
  fontFamily?: string;
  theme?: string;
  marginSize?: number;
  orientation?: 'portrait' | 'landscape';
  headerText?: string;
  footerText?: string;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  watermark?: {
    enabled: boolean;
    text: string;
    opacity: number;
    rotation: number;
    fontSize: number;
    color: string;
  };
}

export interface RenderedDocument {
  html: string;
  styles: string;
  fullHtml: string;
  title: string;
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split(/\r?\n/);
  let html = '';
  let inList = false;
  let inCodeBlock = false;
  let codeContent: string[] = [];

  const flushList = () => {
    if (inList) {
      html += '</ul>\n';
      inList = false;
    }
  };

  for (let line of lines) {
    const trimmed = line.trim();

    // Code Block Toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        html += `<pre class="code-block"><code>${codeContent.join('\n')}</code></pre>\n`;
        codeContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      // Escape HTML chars
      const escapedLine = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      codeContent.push(escapedLine);
      continue;
    }

    // Horizontal Rule / Page Break
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      html += '<div class="page-break"></div>\n';
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushList();
      html += `<h1 class="doc-h1">${trimmed.slice(2)}</h1>\n`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      html += `<h2 class="doc-h2">${trimmed.slice(3)}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      html += `<h3 class="doc-h3">${trimmed.slice(4)}</h3>\n`;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      html += `<blockquote class="doc-blockquote">${trimmed.slice(2)}</blockquote>\n`;
      continue;
    }

    // Unordered List Items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        html += '<ul class="doc-list">\n';
        inList = true;
      }
      const itemContent = trimmed.slice(2);
      html += `  <li>${parseInlineMarkdown(itemContent)}</li>\n`;
      continue;
    }

    // Blank line
    if (trimmed === '') {
      flushList();
      continue;
    }

    // Default Paragraph
    flushList();
    html += `<p class="doc-paragraph">${parseInlineMarkdown(trimmed)}</p>\n`;
  }

  flushList();
  return html;
}

function parseInlineMarkdown(text: string): string {
  let result = text;
  // Bold **text**
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code `code`
  result = result.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
  // Links [text](url)
  result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="doc-link" target="_blank">$1</a>');
  return result;
}

export function compileStyles(style: StyleConfig): string {
  const fontFamily = style.fontFamily === 'Playfair Display' 
    ? "'Playfair Display', Georgia, serif" 
    : style.fontFamily === 'Manrope' 
      ? "'Manrope', sans-serif" 
      : "'Inter', sans-serif";

  const margin = style.marginSize !== undefined ? `${style.marginSize}px` : '24px';
  const size = style.pageSize || 'A4';
  const orientation = style.orientation || 'portrait';

  // Base typography styles
  let themeCss = '';
  switch (style.theme) {
    case 'Research Paper':
      themeCss = `
        body { font-family: 'Times New Roman', Times, serif; line-height: 1.6; color: #111; background-color: #fff; }
        .doc-h1 { font-size: 24pt; font-weight: bold; text-align: center; margin-top: 24pt; margin-bottom: 12pt; border: none; }
        .doc-h2 { font-size: 16pt; font-weight: bold; margin-top: 18pt; margin-bottom: 8pt; }
        .doc-h3 { font-size: 13pt; font-style: italic; margin-top: 14pt; margin-bottom: 6pt; }
        .doc-paragraph { text-align: justify; text-indent: 0.5in; margin-bottom: 12pt; font-size: 12pt; }
        .doc-list { margin-left: 0.5in; margin-bottom: 12pt; font-size: 12pt; }
      `;
      break;
    case 'Academic':
      themeCss = `
        body { font-family: Georgia, serif; line-height: 1.8; color: #222; background-color: #fff; }
        .doc-h1 { font-size: 26pt; font-weight: normal; margin-top: 30pt; margin-bottom: 15pt; color: #1a1a1a; }
        .doc-h2 { font-size: 18pt; font-weight: normal; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24pt; margin-bottom: 10pt; }
        .doc-h3 { font-size: 14pt; font-weight: normal; margin-top: 18pt; margin-bottom: 8pt; }
        .doc-paragraph { margin-bottom: 15pt; font-size: 11pt; text-align: justify; }
        .doc-list { margin-left: 20px; margin-bottom: 15pt; font-size: 11pt; }
      `;
      break;
    case 'Corporate':
      themeCss = `
        body { font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #333; background-color: #fff; }
        .doc-h1 { font-size: 22pt; font-weight: 700; color: #0f172a; margin-top: 24pt; margin-bottom: 12pt; border-bottom: 2px solid #0f172a; padding-bottom: 6px; }
        .doc-h2 { font-size: 16pt; font-weight: 600; color: #1e293b; margin-top: 20pt; margin-bottom: 8pt; }
        .doc-h3 { font-size: 12pt; font-weight: 600; color: #475569; margin-top: 16pt; margin-bottom: 6pt; }
        .doc-paragraph { margin-bottom: 10pt; font-size: 10.5pt; }
        .doc-list { margin-left: 24px; margin-bottom: 10pt; font-size: 10.5pt; }
      `;
      break;
    case 'Modern Clean':
    default:
      themeCss = `
        body { font-family: ${fontFamily}; line-height: 1.625; color: #1f2937; background-color: #ffffff; }
        .doc-h1 { font-size: 28px; font-weight: 800; color: #111827; margin-top: 32px; margin-bottom: 16px; letter-spacing: -0.025em; }
        .doc-h2 { font-size: 20px; font-weight: 700; color: #1f2937; margin-top: 24px; margin-bottom: 12px; }
        .doc-h3 { font-size: 16px; font-weight: 600; color: #374151; margin-top: 20px; margin-bottom: 8px; }
        .doc-paragraph { margin-bottom: 14px; font-size: 14px; color: #4b5563; }
        .doc-list { margin-left: 20px; margin-bottom: 14px; font-size: 14px; color: #4b5563; }
      `;
      break;
  }

  // Watermark styles
  let watermarkCss = '';
  if (style.watermark?.enabled) {
    const wm = style.watermark;
    const rotation = wm.rotation !== undefined ? wm.rotation : -45;
    const opacity = wm.opacity !== undefined ? wm.opacity : 0.1;
    const fontSize = wm.fontSize !== undefined ? wm.fontSize : 60;
    const color = wm.color || '#6b7280';
    
    watermarkCss = `
      .watermark-overlay {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(${rotation}deg);
        transform-origin: center center;
        opacity: ${opacity};
        font-size: ${fontSize}pt;
        color: ${color};
        font-family: sans-serif;
        font-weight: bold;
        text-transform: uppercase;
        pointer-events: none;
        z-index: 9999;
        white-space: nowrap;
        user-select: none;
      }
    `;
  }

  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Manrope:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

    @page {
      size: ${size} ${orientation};
      margin: ${margin};
    }

    html, body {
      margin: 0;
      padding: 0;
    }

    body {
      padding: 10px;
    }

    ${themeCss}

    .doc-blockquote {
      border-left: 4px solid #1f6f5f;
      background-color: rgba(31, 111, 95, 0.05);
      padding: 12px 16px;
      margin: 16px 0;
      font-style: italic;
      color: #4b5563;
      border-radius: 0 8px 8px 0;
    }

    .code-block {
      background-color: #fafaf8;
      border: 1px solid rgba(231, 229, 228, 0.5);
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      margin: 16px 0;
    }

    .inline-code {
      background-color: #fafaf8;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: SFMono-Regular, Consolas, monospace;
      font-size: 0.9em;
    }

    .doc-link {
      color: #1f6f5f;
      text-decoration: underline;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
      height: 0;
      margin: 0;
      border: none;
    }

    ${watermarkCss}
  `;
}

export function renderDocument(title: string, markdown: string, style: StyleConfig): RenderedDocument {
  const htmlContent = parseMarkdownToHtml(markdown);
  const styles = compileStyles(style);

  const watermarkHtml = style.watermark?.enabled
    ? `<div class="watermark-overlay">${style.watermark.text}</div>`
    : '';

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        ${styles}
      </style>
    </head>
    <body>
      ${watermarkHtml}
      <div class="content-wrapper">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;

  return {
    html: htmlContent,
    styles,
    fullHtml,
    title,
  };
}
