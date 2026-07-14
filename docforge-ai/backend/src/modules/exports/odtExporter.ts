import JSZip from 'jszip';
import { RenderedDocument, StyleConfig } from '../rendering/renderingEngine.js';
import { DocumentExporter } from './exportTypes.js';
import { ExportError } from '../../errors/customErrors.js';

export class OdtExporter implements DocumentExporter {
  public async export(doc: RenderedDocument, _style: StyleConfig): Promise<Buffer> {
    try {
      const zip = new JSZip();
      const title = doc.title;

      // 1. mimetype (stored uncompressed)
      zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });

      // 2. META-INF/manifest.xml
      const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
      zip.folder('META-INF')?.file('manifest.xml', manifestXml);

      // 3. meta.xml
      const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" office:version="1.2">
  <office:meta>
    <dc:title>${title}</dc:title>
    <dc:creator>DocForge AI</dc:creator>
  </office:meta>
</office:document-meta>`;
      zip.file('meta.xml', metaXml);

      // 4. styles.xml
      const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.2">
  <office:styles>
    <style:default-style style:family="paragraph">
      <style:text-properties fo:font-family="Arial" fo:font-size="11pt"/>
    </style:default-style>
  </office:styles>
</office:document-styles>`;
      zip.file('styles.xml', stylesXml);

      // 5. content.xml (Compile nodes into ODT XML structure)
      const lines = doc.html.split('\n');
      let bodyXml = `<text:p text:style-name="Title">${title}</text:p>\n`;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('<h1')) {
          bodyXml += `<text:h text:outline-level="1">${this.stripTags(trimmed)}</text:h>\n`;
        } else if (trimmed.startsWith('<h2')) {
          bodyXml += `<text:h text:outline-level="2">${this.stripTags(trimmed)}</text:h>\n`;
        } else if (trimmed.startsWith('<h3')) {
          bodyXml += `<text:h text:outline-level="3">${this.stripTags(trimmed)}</text:h>\n`;
        } else if (trimmed.startsWith('<blockquote')) {
          bodyXml += `<text:p text:style-name="Blockquote">${this.stripTags(trimmed)}</text:p>\n`;
        } else if (trimmed.startsWith('<li>')) {
          bodyXml += `<text:list><text:list-item><text:p>${this.stripTags(trimmed)}</text:p></text:list-item></text:list>\n`;
        } else if (trimmed.startsWith('<pre')) {
          bodyXml += `<text:p text:style-name="Pre">${this.stripTags(trimmed)}</text:p>\n`;
        } else if (trimmed.startsWith('<p')) {
          bodyXml += `<text:p>${this.stripTags(trimmed)}</text:p>\n`;
        }
      }

      const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content 
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" 
  office:version="1.2">
  <office:body>
    <office:text>
      ${bodyXml}
    </office:text>
  </office:body>
</office:document-content>`;
      zip.file('content.xml', contentXml);

      const odtBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      return odtBuffer;
    } catch (error: any) {
      throw new ExportError(`Failed to generate ODT package: ${error.message}`, error);
    }
  }

  private stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }
}
