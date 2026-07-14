import { RenderedDocument, StyleConfig } from '../rendering/renderingEngine.js';
import { DocumentExporter } from './exportTypes.js';

export class HtmlExporter implements DocumentExporter {
  public async export(doc: RenderedDocument, _style: StyleConfig): Promise<Buffer> {
    return Buffer.from(doc.fullHtml, 'utf-8');
  }
}
