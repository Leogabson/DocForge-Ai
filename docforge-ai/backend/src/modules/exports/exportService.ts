import { documentRepository } from '../../repositories/DocumentRepository.js';
import { renderDocument, StyleConfig } from '../rendering/renderingEngine.js';
import { LocalStorageProvider } from '../../providers/storage/LocalStorageProvider.js';
import { PdfExporter } from './pdfExporter.js';
import { DocxExporter } from './docxExporter.js';
import { HtmlExporter } from './htmlExporter.js';
import { EpubExporter } from './epubExporter.js';
import { RtfExporter } from './rtfExporter.js';
import { TxtExporter } from './txtExporter.js';
import { MarkdownExporter } from './markdownExporter.js';
import { OdtExporter } from './odtExporter.js';
import { DocumentExporter } from './exportTypes.js';
import { domainEvents, DomainEventType } from '../../events/domainEvents.js';
import { ExportError, NotFoundError } from '../../errors/customErrors.js';
import { logger } from '../../config/logger.js';

const storageProvider = new LocalStorageProvider();

export interface ExportJobPayload {
  documentId: string;
  userId: string;
  format: string;
  styleConfig: StyleConfig;
}

export interface ExportJobResult {
  fileKey: string;
  fileName: string;
  contentType: string;
  buffer: Buffer;
}

export class ExportService {
  private getExporter(format: string): DocumentExporter {
    switch (format.toLowerCase()) {
      case 'pdf':
        return new PdfExporter();
      case 'docx':
        return new DocxExporter();
      case 'html':
        return new HtmlExporter();
      case 'epub':
        return new EpubExporter();
      case 'rtf':
        return new RtfExporter();
      case 'txt':
        return new TxtExporter();
      case 'markdown':
      case 'md':
        return new MarkdownExporter();
      case 'odt':
        return new OdtExporter();
      default:
        throw new ExportError(`Unsupported export format: ${format}`);
    }
  }

  private getContentType(format: string): string {
    switch (format.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'html':
        return 'text/html';
      case 'epub':
        return 'application/epub+zip';
      case 'rtf':
        return 'application/rtf';
      case 'txt':
        return 'text/plain';
      case 'markdown':
      case 'md':
        return 'text/markdown';
      case 'odt':
        return 'application/vnd.oasis.opendocument.text';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Orchestrates the document rendering and formats compile.
   * Decoupled boundary method suitable for asynchronous worker processing.
   */
  public async executeExportJob(payload: ExportJobPayload): Promise<ExportJobResult> {
    const start = process.hrtime();
    const { documentId, userId, format, styleConfig } = payload;

    logger.info({
      message: `Export Service: Starting export job for document ${documentId} to format ${format}`,
      documentId,
      format,
    });

    const doc = await documentRepository.findById(documentId, userId);
    if (!doc) {
      throw new NotFoundError('Document not found or access denied.');
    }

    // 1. Shared Document Rendering Engine (converts Markdown -> Intermediate AST/HTML)
    const rendered = renderDocument(doc.title, doc.content, styleConfig);

    // 2. Select Exporter
    const exporter = this.getExporter(format);

    // 3. Execute Format Compilation
    const buffer = await exporter.export(rendered, styleConfig);

    // 4. Save to Storage Provider
    const safeTitle = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `${safeTitle}.${format.toLowerCase()}`;
    const fileKey = `exports/${userId}/${documentId}-${Date.now()}.${format.toLowerCase()}`;
    
    await storageProvider.put(fileKey, buffer);

    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    logger.info({
      message: `Export Service: Completed export job in ${durationMs.toFixed(2)}ms`,
      documentId,
      format,
      fileKey,
    });

    // 5. Emit Domain Event
    domainEvents.dispatch(DomainEventType.DOCUMENT_EXPORTED, {
      documentId,
      userId,
      format,
      durationMs: Number(durationMs.toFixed(0)),
    });

    return {
      fileKey,
      fileName,
      contentType: this.getContentType(format),
      buffer,
    };
  }
}
export const exportService = new ExportService();
