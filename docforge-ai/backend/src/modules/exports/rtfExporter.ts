import { RenderedDocument, StyleConfig } from '../rendering/renderingEngine.js';
import { DocumentExporter } from './exportTypes.js';

export class RtfExporter implements DocumentExporter {
  public async export(doc: RenderedDocument, _style: StyleConfig): Promise<Buffer> {
    const lines = doc.html.split('\n');
    let rtf = '{\\rtf1\\ansi\\deff0\n';
    rtf += '{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fmodern\\fcharset0 Courier New;}}\n';
    rtf += '{\\colortbl ;\\red0\\green0\\blue0;\\red31\\green111\\blue95;\\red107\\green114\\blue128;}\n';
    rtf += '\\viewkind4\\uc1\\pard\\cf1\\f0\\fs22\n';

    // Title Header
    rtf += `\\pard\\fs32\\b ${doc.title}\\b0\\par\\par\n`;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('<h1')) {
        const text = this.stripTags(trimmed);
        rtf += `\\pard\\fs28\\b ${text}\\b0\\par\\par\n`;
      } else if (trimmed.startsWith('<h2')) {
        const text = this.stripTags(trimmed);
        rtf += `\\pard\\fs24\\b ${text}\\b0\\par\\par\n`;
      } else if (trimmed.startsWith('<h3')) {
        const text = this.stripTags(trimmed);
        rtf += `\\pard\\fs22\\b\\i ${text}\\i0\\b0\\par\\par\n`;
      } else if (trimmed.startsWith('<blockquote')) {
        const text = this.stripTags(trimmed);
        rtf += `\\pard\\li720\\cf3\\i ${text}\\i0\\cf1\\par\\par\n`;
      } else if (trimmed.startsWith('<li>')) {
        const text = this.stripTags(trimmed);
        rtf += `\\pard\\li360\\bullet  ${text}\\par\n`;
      } else if (trimmed.startsWith('<pre')) {
        const text = this.stripTags(trimmed);
        rtf += `\\pard\\f1\\fs20 ${text}\\f0\\fs22\\par\\par\n`;
      } else if (trimmed.startsWith('<p')) {
        const text = this.stripTags(trimmed);
        // Basic inline replacement for bold/italics in RTF
        let rtfPara = text
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
        rtf += `\\pard ${rtfPara}\\par\\par\n`;
      }
    }

    rtf += '}';
    return Buffer.from(rtf, 'utf-8');
  }

  private stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }
}
