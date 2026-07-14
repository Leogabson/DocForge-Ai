import { Router, Response } from 'express';
import { exportDocument } from './exportController.js';
import { authenticateToken, AuthenticatedRequest } from '../../app/middleware/authMiddleware.js';
import { LocalStorageProvider } from '../../providers/storage/LocalStorageProvider.js';
import { NotFoundError } from '../../errors/customErrors.js';
import path from 'path';

const storage = new LocalStorageProvider();

export function createExportRouter(): Router {
  const router = Router();

  // Export document route
  router.post('/documents/:id/export', authenticateToken, exportDocument);

  // Serve stored exported files
  router.get('/storage/files/*', async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      // Extract file key path from wildcard
      const fileKey = req.params[0];
      if (!fileKey) {
        throw new NotFoundError('File key is missing.');
      }

      const exists = await storage.exists(fileKey);
      if (!exists) {
        throw new NotFoundError('File not found in storage.');
      }

      const buffer = await storage.get(fileKey);
      const filename = path.basename(fileKey);
      
      // Determine format from file extension
      const ext = path.extname(fileKey).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.html') contentType = 'text/html';
      else if (ext === '.epub') contentType = 'application/epub+zip';
      else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === '.rtf') contentType = 'application/rtf';
      else if (ext === '.txt') contentType = 'text/plain';
      else if (ext === '.md' || ext === '.markdown') contentType = 'text/markdown';
      else if (ext === '.odt') contentType = 'application/vnd.oasis.opendocument.text';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
export const exportRouter = createExportRouter();
