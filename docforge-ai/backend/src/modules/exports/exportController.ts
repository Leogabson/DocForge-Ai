import type { Response } from 'express';
import { z } from 'zod';
import { exportService } from './exportService.js';
import { AuthenticatedRequest } from '../../app/middleware/authMiddleware.js';
import { sendResponse } from '../../errors/apiResponse.js';

export const exportSchema = z.object({
  format: z.enum(['pdf', 'docx', 'html', 'epub', 'rtf', 'txt', 'markdown', 'md', 'odt']),
  styleConfig: z.object({
    fontFamily: z.string().optional(),
    theme: z.string().optional(),
    marginSize: z.number().optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
    headerText: z.string().optional(),
    footerText: z.string().optional(),
    pageSize: z.enum(['A4', 'Letter', 'Legal']).optional(),
    watermark: z.object({
      enabled: z.boolean(),
      text: z.string(),
      opacity: z.number(),
      rotation: z.number(),
      fontSize: z.number(),
      color: z.string(),
    }).optional(),
  }).default({}),
});

export async function exportDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const documentId = req.params.id as string;
  const userId = req.user?.userId || 'sandbox'; // Fallback to sandbox if no auth
  
  // Zod validation parsed body
  const { format, styleConfig } = exportSchema.parse(req.body);

  const result = await exportService.executeExportJob({
    documentId,
    userId,
    format,
    styleConfig,
  });

  // Return download metadata response
  sendResponse({
    res,
    statusCode: 200,
    message: 'Document formatted and exported successfully.',
    data: {
      fileKey: result.fileKey,
      fileName: result.fileName,
      contentType: result.contentType,
    },
  });
}
