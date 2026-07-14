import type { Response } from 'express';
import { documentService } from '../../modules/documents/documentService.js';
import { versionService } from '../../modules/documents/versionService.js';
import { templateRepository } from '../../repositories/TemplateRepository.js';
import { userRepository } from '../../repositories/UserRepository.js';
import { aiProvider } from '../../providers/ai/GeminiProvider.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sendResponse } from '../../errors/apiResponse.js';

// Helper to get or create a default sandbox user if no auth is present
async function getOrCreateSandboxUser() {
  const email = 'sandbox@docforge.ai';
  let user = await userRepository.findByEmail(email);
  if (!user) {
    user = await userRepository.create({
      email,
      name: 'Sandbox User',
      passwordHash: 'sandbox-no-password',
    });
  }
  return user;
}

// Helper to get active user ID from request or fallback to sandbox
async function getTargetUserId(req: AuthenticatedRequest): Promise<string> {
  if (req.user?.userId) {
    return req.user.userId;
  }
  const sandboxUser = await getOrCreateSandboxUser();
  return sandboxUser.id;
}

// GET /documents/active
export async function getActiveDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const docs = await documentService.getDocuments(userId, { limit: 1 });
  
  let doc = docs[0];
  if (!doc) {
    doc = await documentService.createDocument(userId, {
      title: 'Untitled document',
      content: '',
    });
  }

  sendResponse({
    res,
    statusCode: 200,
    data: doc,
  });
}

// POST /documents/active
export async function updateActiveDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const { title, content, styleConfig } = req.body as { title?: string; content?: string; styleConfig?: string };

  const docs = await documentService.getDocuments(userId, { limit: 1 });
  let doc = docs[0];

  if (!doc) {
    doc = await documentService.createDocument(userId, {
      title: title || 'Untitled document',
      content: content || '',
      styleConfig: styleConfig || '{}',
    });
  } else {
    doc = await documentService.updateDocument(doc.id, userId, {
      title,
      content,
      styleConfig,
    });
  }

  sendResponse({
    res,
    statusCode: 200,
    data: doc,
  });
}

// GET /documents
export async function listDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const { search, folderId, isPinned, isFavorite, recent } = req.query as {
    search?: string;
    folderId?: string;
    isPinned?: string;
    isFavorite?: string;
    recent?: string;
  };

  const filters = {
    search,
    folderId: folderId === 'null' ? null : folderId,
    isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
    isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
    orderByRecent: recent === 'true',
  };

  const docs = await documentService.getDocuments(userId, filters);
  sendResponse({
    res,
    statusCode: 200,
    data: docs,
  });
}

// POST /documents
export async function createDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const { title, description, content, folderId, tags, styleConfig } = req.body as {
    title: string;
    description?: string;
    content?: string;
    folderId?: string;
    tags?: string[];
    styleConfig?: string;
  };

  const doc = await documentService.createDocument(userId, {
    title: title || 'Untitled document',
    description,
    content,
    folderId,
    tags,
    styleConfig,
  });

  sendResponse({
    res,
    statusCode: 201,
    data: doc,
  });
}

// GET /documents/:id
export async function getDocumentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const id = req.params.id as string;
  const doc = await documentService.getDocumentById(id, userId);

  sendResponse({
    res,
    statusCode: 200,
    data: doc,
  });
}

// PUT /documents/:id
export async function updateDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const id = req.params.id as string;
  const { title, description, content, folderId, isPinned, isFavorite, tags, styleConfig } = req.body as any;

  const doc = await documentService.updateDocument(id, userId, {
    title,
    description,
    content,
    folderId: folderId === 'null' ? null : folderId,
    isPinned,
    isFavorite,
    tags,
    styleConfig,
  });

  sendResponse({
    res,
    statusCode: 200,
    data: doc,
  });
}

// DELETE /documents/:id
export async function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const id = req.params.id as string;
  await documentService.deleteDocument(id, userId);

  sendResponse({
    res,
    statusCode: 200,
    message: 'Document deleted successfully.',
  });
}

// GET /folders
export async function listFolders(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const folders = await documentService.getFolders(userId);

  sendResponse({
    res,
    statusCode: 200,
    data: folders,
  });
}

// POST /folders
export async function createFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const { name } = req.body as { name?: string };

  if (!name) {
    res.status(400).json({ error: 'Folder name is required.' });
    return;
  }

  const folder = await documentService.createFolder(userId, name);
  sendResponse({
    res,
    statusCode: 201,
    data: folder,
  });
}

// DELETE /folders/:id
export async function deleteFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const id = req.params.id as string;
  await documentService.deleteFolder(id, userId);

  sendResponse({
    res,
    statusCode: 200,
    message: 'Folder deleted successfully.',
  });
}

// GET /templates
export async function listTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
  const templates = await templateRepository.listTemplates();
  sendResponse({
    res,
    statusCode: 200,
    data: templates,
  });
}

// POST /templates
export async function createTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const { name, content } = req.body as { name?: string; content?: string };

  if (!name || !content) {
    res.status(400).json({ error: 'Template name and content are required.' });
    return;
  }

  const doc = await templateRepository.createTemplate({
    name,
    content,
    userId,
  });

  sendResponse({
    res,
    statusCode: 201,
    data: {
      id: doc.id,
      name: name.trim(),
      content: doc.content,
      createdAt: doc.createdAt,
    },
  });
}

// POST /assistant
export async function runAssistantAction(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { action, content, instruction, targetLanguage } = req.body as {
    action?: string;
    content?: string;
    instruction?: string;
    targetLanguage?: string;
  };

  if (typeof content !== 'string') {
    res.status(400).json({ error: 'Document content is required.' });
    return;
  }

  let result = content;
  const start = process.hrtime();

  switch (action) {
    case 'summary':
      result = await aiProvider.summarize(content);
      break;
    case 'tone':
      result = await aiProvider.rewrite(content, instruction || 'professional tone');
      break;
    case 'structure':
      result = await aiProvider.rewrite(content, 'structure with clear headers and bullet points');
      break;
    case 'grammar':
      result = await aiProvider.grammar(content);
      break;
    case 'translate':
      result = await aiProvider.translate(content, targetLanguage || 'English');
      break;
    case 'improve':
      result = await aiProvider.improveWriting(content);
      break;
    default:
      result = content;
      break;
  }

  const diff = process.hrtime(start);
  const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;

  sendResponse({
    res,
    statusCode: 200,
    data: {
      content: result,
      updatedAt: new Date().toISOString(),
      durationMs: Number(durationMs.toFixed(2)),
    },
  });
}

// --- Version Control Handlers ---
export async function listVersions(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const documentId = req.params.id as string;
  const versions = await versionService.getVersions(documentId, userId);

  sendResponse({
    res,
    statusCode: 200,
    data: versions,
  });
}

export async function createSnapshot(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const documentId = req.params.id as string;
  const { label } = req.body as { label?: string };

  const version = await versionService.createSnapshot(documentId, userId, label);
  sendResponse({
    res,
    statusCode: 201,
    data: version,
  });
}

export async function restoreVersion(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = await getTargetUserId(req);
  const versionId = req.params.id as string;
  
  const restored = await versionService.restoreVersion(versionId, userId);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Version restored successfully.',
    data: restored,
  });
}
