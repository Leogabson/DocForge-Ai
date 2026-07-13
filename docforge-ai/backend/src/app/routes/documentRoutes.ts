import { Router } from 'express';
import {
  createTemplate,
  getActiveDocument,
  listTemplates,
  runAssistantAction,
  updateActiveDocument,
} from '../controllers/documentController.js';

export function createDocumentRouter() {
  const router = Router();

  router.get('/documents/active', getActiveDocument);
  router.post('/documents/active', updateActiveDocument);
  router.get('/templates', listTemplates);
  router.post('/templates', createTemplate);
  router.post('/assistant', runAssistantAction);

  return router;
}
