import { RenderedDocument, StyleConfig } from '../rendering/renderingEngine.js';
import { DocumentExporter } from './exportTypes.js';

export class MarkdownExporter implements DocumentExporter {
  public async export(doc: RenderedDocument, _style: StyleConfig): Promise<Buffer> {
    // Standard markdown export. Returns a clean markdown format header + content wrapper.
    let md = `# ${doc.title}\n\n`;
    const htmlLines = doc.html.split('\n');

    for (const line of htmlLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('<h1')) {
        md += `# ${this.stripTags(trimmed)}\n\n`;
      } else if (trimmed.startsWith('<h2')) {
        md += `## ${this.stripTags(trimmed)}\n\n`;
      } else if (trimmed.startsWith('<h3')) {
        md += `### ${this.stripTags(trimmed)}\n\n`;
      } else if (trimmed.startsWith('<blockquote')) {
        md += `> ${this.stripTags(trimmed)}\n\n`;
      } else if (trimmed.startsWith('<li>')) {
        md += `- ${this.stripTags(trimmed)}\n`;
      } else if (trimmed.startsWith('<pre')) {
        md += `\`\`\`\n${this.stripTags(trimmed)}\n\`\`\`\n\n`;
      } else if (trimmed.startsWith('<p')) {
        md += `${this.stripTags(trimmed)}\n\n`;
      }
    }

    return Buffer.from(md, 'utf-8');
  }

  private stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }
}
