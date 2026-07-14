import { chromium } from 'playwright';
import { RenderedDocument, StyleConfig } from '../rendering/renderingEngine.js';
import { DocumentExporter } from './exportTypes.js';
import { ExportError } from '../../errors/customErrors.js';

export class PdfExporter implements DocumentExporter {
  public async export(doc: RenderedDocument, style: StyleConfig): Promise<Buffer> {
    let browser;
    try {
      // Launch headless browser
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Load styled HTML into page
      await page.setContent(doc.fullHtml, { waitUntil: 'load' });

      const marginSizeStr = style.marginSize !== undefined ? `${style.marginSize}px` : '24px';
      const pageSize = style.pageSize || 'A4';
      const isLandscape = style.orientation === 'landscape';

      // Build header & footer HTML templates for Playwright
      const displayHeaderFooter = !!(style.headerText || style.footerText);
      
      const headerTemplate = style.headerText
        ? `<div style="font-size: 8px; font-family: system-ui, -apple-system, sans-serif; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; border-bottom: 0.5px solid rgba(0,0,0,0.08); margin-bottom: 5px;"><span style="color: #6b7280;">${style.headerText}</span><span style="color: #9ca3af;">DocForge AI</span></div>`
        : '<div style="height: 0px;"></div>';

      const footerTemplate = style.footerText
        ? `<div style="font-size: 8px; font-family: system-ui, -apple-system, sans-serif; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; border-top: 0.5px solid rgba(0,0,0,0.08); margin-top: 5px;"><span style="color: #6b7280;">${style.footerText}</span><span style="color: #9ca3af;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`
        : '<div style="height: 0px;"></div>';

      // Print page to PDF buffer
      const pdfBuffer = await page.pdf({
        format: pageSize,
        landscape: isLandscape,
        margin: {
          top: displayHeaderFooter ? '60px' : marginSizeStr,
          bottom: displayHeaderFooter ? '60px' : marginSizeStr,
          left: marginSizeStr,
          right: marginSizeStr,
        },
        displayHeaderFooter,
        headerTemplate,
        footerTemplate,
        printBackground: true,
      });

      return pdfBuffer;
    } catch (error: any) {
      throw new ExportError(`Failed to render PDF using Playwright: ${error.message}`, error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
