import type { Response } from 'express';
import { prisma } from '../../db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Helper to get or create a default sandbox user if no auth is present
async function getOrCreateSandboxUser() {
  const email = 'sandbox@docforge.ai';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Sandbox User',
        passwordHash: 'sandbox-no-password',
      },
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
  try {
    const userId = await getTargetUserId(req);

    // Find the most recently updated document for this user
    let doc = await prisma.document.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    // If no document exists, create a default one
    if (!doc) {
      doc = await prisma.document.create({
        data: {
          title: 'Untitled document',
          content: '',
          userId,
        },
      });
    }

    res.json(doc);
  } catch (error) {
    console.error('getActiveDocument error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /documents/active
export async function updateActiveDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = await getTargetUserId(req);
    const { title, content, styleConfig } = req.body as { title?: string; content?: string; styleConfig?: string };

    // Find the most recently updated document
    let doc = await prisma.document.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!doc) {
      doc = await prisma.document.create({
        data: {
          title: title || 'Untitled document',
          content: content || '',
          styleConfig: styleConfig || '{}',
          userId,
        },
      });
    } else {
      doc = await prisma.document.update({
        where: { id: doc.id },
        data: {
          title: typeof title === 'string' ? title : doc.title,
          content: typeof content === 'string' ? content : doc.content,
          styleConfig: typeof styleConfig === 'string' ? styleConfig : doc.styleConfig,
        },
      });
    }

    res.json(doc);
  } catch (error) {
    console.error('updateActiveDocument error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /documents (list all documents for the user with filters, search, pinning)
export async function listDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = (await getTargetUserId(req)) as string;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const folderId = typeof req.query.folderId === 'string' ? req.query.folderId : undefined;
    const isPinned = typeof req.query.isPinned === 'string' ? req.query.isPinned : undefined;
    const isFavorite = typeof req.query.isFavorite === 'string' ? req.query.isFavorite : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;

    const whereClause: any = { userId };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (folderId) {
      whereClause.folderId = folderId === 'root' ? null : folderId;
    }

    if (isPinned) {
      whereClause.isPinned = isPinned === 'true';
    }

    if (isFavorite) {
      whereClause.isFavorite = isFavorite === 'true';
    }

    if (tag) {
      whereClause.tags = { has: tag };
    }

    const docs = await prisma.document.findMany({
      where: whereClause,
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    res.json(docs);
  } catch (error) {
    console.error('listDocuments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /documents
export async function createDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = await getTargetUserId(req);
    const { title, description, content, folderId, tags, styleConfig } = req.body as {
      title?: string;
      description?: string;
      content?: string;
      folderId?: string;
      tags?: string[];
      styleConfig?: string;
    };

    const doc = await prisma.document.create({
      data: {
        title: title || 'Untitled document',
        description: description || null,
        content: content || '',
        folderId: folderId || null,
        tags: tags || [],
        styleConfig: styleConfig || '{}',
        userId,
      },
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('createDocument error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /documents/:id
export async function getDocumentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = (await getTargetUserId(req)) as string;
    const id = req.params.id as string;

    const doc = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json(doc);
  } catch (error) {
    console.error('getDocumentById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /documents/:id
export async function updateDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = (await getTargetUserId(req)) as string;
    const id = req.params.id as string;
    const { title, description, content, folderId, isPinned, isFavorite, tags, styleConfig } = req.body as {
      title?: string;
      description?: string;
      content?: string;
      folderId?: string;
      isPinned?: boolean;
      isFavorite?: boolean;
      tags?: string[];
      styleConfig?: string;
    };

    const existingDoc = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!existingDoc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const doc = await prisma.document.update({
      where: { id },
      data: {
        title: typeof title === 'string' ? title : existingDoc.title,
        description: typeof description === 'string' ? description : existingDoc.description,
        content: typeof content === 'string' ? content : existingDoc.content,
        folderId: typeof folderId !== 'undefined' ? folderId : existingDoc.folderId,
        isPinned: typeof isPinned === 'boolean' ? isPinned : existingDoc.isPinned,
        isFavorite: typeof isFavorite === 'boolean' ? isFavorite : existingDoc.isFavorite,
        tags: tags || existingDoc.tags,
        styleConfig: typeof styleConfig === 'string' ? styleConfig : existingDoc.styleConfig,
      },
    });

    res.json(doc);
  } catch (error) {
    console.error('updateDocument error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /documents/:id
export async function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = (await getTargetUserId(req)) as string;
    const id = req.params.id as string;

    const existingDoc = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!existingDoc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    await prisma.document.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /folders
export async function listFolders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = await getTargetUserId(req);
    const folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    res.json(folders);
  } catch (error) {
    console.error('listFolders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /folders
export async function createFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = await getTargetUserId(req);
    const { name } = req.body as { name?: string };

    if (!name) {
      res.status(400).json({ error: 'Folder name is required.' });
      return;
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        userId,
      },
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error('createFolder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /folders/:id
export async function deleteFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = (await getTargetUserId(req)) as string;
    const id = req.params.id as string;

    const folder = await prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    await prisma.folder.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('deleteFolder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /templates
export async function listTemplates(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // Currently template documents can be loaded from templates seeded in DB, fallback to empty list
    const templates = await prisma.document.findMany({
      where: { title: { startsWith: 'Template:' } },
    });
    res.json(templates);
  } catch (error) {
    console.error('listTemplates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /templates
export async function createTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = await getTargetUserId(req);
    const { name, content } = req.body as { name?: string; content?: string };

    if (!name || !content) {
      res.status(400).json({ error: 'Template name and content are required.' });
      return;
    }

    // Save templates as special documents prefixed with 'Template:'
    const doc = await prisma.document.create({
      data: {
        title: `Template: ${name.trim()}`,
        content: content.trim(),
        userId,
      },
    });

    res.status(201).json({
      id: doc.id,
      name: name.trim(),
      content: doc.content,
      createdAt: doc.createdAt,
    });
  } catch (error) {
    console.error('createTemplate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Assistant functions (Mock assistant rules, will connect to Gemini in Phase 5)
function normalizeText(value: string) {
  return value.trim();
}

function summarizeContent(content: string) {
  const lines = normalizeText(content)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return 'Add document content to generate a summary.';
  }

  const summaryLines = lines.slice(0, 4).map((line) => `- ${line}`);
  return summaryLines.join('\n');
}

function refineTone(content: string) {
  const lines = normalizeText(content)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return 'Add document content to refine the tone.';
  }

  return lines
    .map((line) => {
      if (line.startsWith('#')) {
        return line;
      }
      return line.replace(/\b(very|really|just)\b/gi, '');
    })
    .join('\n\n');
}

function structureContent(content: string) {
  const lines = normalizeText(content)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return 'Add document content to build a structured outline.';
  }

  const overview = lines[0];
  const supporting = lines.slice(1, 4).join('\n\n');

  return `## Overview\n${overview}\n\n## Supporting points\n${supporting}`;
}

export async function runAssistantAction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { action, content } = req.body as { action?: string; content?: string };

    if (typeof content !== 'string') {
      res.status(400).json({ error: 'Document content is required.' });
      return;
    }

    let result = content;

    switch (action) {
      case 'summary':
        result = summarizeContent(content);
        break;
      case 'tone':
        result = refineTone(content);
        break;
      case 'structure':
        result = structureContent(content);
        break;
      default:
        result = content;
        break;
    }

    res.json({ content: result, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('runAssistantAction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
