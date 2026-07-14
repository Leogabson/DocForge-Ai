import { Router } from 'express';
import {
  createTemplate,
  getActiveDocument,
  listTemplates,
  runAssistantAction,
  updateActiveDocument,
  listDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  listFolders,
  createFolder,
  deleteFolder,
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

export function createDocumentRouter() {
  const router = Router();

  // Active document (sandbox/backward compatible support)
  router.get('/documents/active', getActiveDocument);
  router.post('/documents/active', updateActiveDocument);

  // Authenticated workspace routes
  router.get('/documents', listDocuments);
  router.post('/documents', createDocument);
  router.get('/documents/:id', getDocumentById);
  router.put('/documents/:id', updateDocument);
  router.delete('/documents/:id', deleteDocument);

  router.get('/folders', listFolders);
  router.post('/folders', createFolder);
  router.delete('/folders/:id', deleteFolder);

  router.get('/templates', listTemplates);
  router.post('/templates', createTemplate);
  router.post('/assistant', runAssistantAction);

  return router;
}
