import { RenderedDocument, StyleConfig } from '../rendering/renderingEngine.js';

export interface DocumentExporter {
  /**
   * Export the rendered intermediate document representation to a specific binary or text format.
   * Returns a Buffer representing the file contents.
   */
  export(doc: RenderedDocument, style: StyleConfig): Promise<Buffer>;
}
