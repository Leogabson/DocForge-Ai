import { RenderedDocument, StyleConfig } from '../rendering/renderingEngine.js';
import { DocumentExporter } from './exportTypes.js';

export class TxtExporter implements DocumentExporter {
  public async export(doc: RenderedDocument, _style: StyleConfig): Promise<Buffer> {
    const text = doc.html
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    return Buffer.from(text, 'utf-8');
  }
}
