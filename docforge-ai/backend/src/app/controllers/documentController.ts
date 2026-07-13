import type { Request, Response } from 'express';

type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type TemplateRecord = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

const activeDocument: DocumentRecord = {
  id: 'doc-active',
  title: 'Untitled document',
  content: '',
  updatedAt: new Date().toISOString(),
};

const templates: TemplateRecord[] = [];

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

export function getActiveDocument(_req: Request, res: Response) {
  res.json(activeDocument);
}

export function updateActiveDocument(req: Request, res: Response) {
  const { title, content } = req.body as Partial<DocumentRecord>;

  if (typeof title === 'string') {
    activeDocument.title = title;
  }

  if (typeof content === 'string') {
    activeDocument.content = content;
  }

  activeDocument.updatedAt = new Date().toISOString();

  res.json(activeDocument);
}

export function listTemplates(_req: Request, res: Response) {
  res.json(templates);
}

export function createTemplate(req: Request, res: Response) {
  const { name, content } = req.body as { name?: string; content?: string };

  if (typeof name !== 'string' || typeof content !== 'string') {
    res.status(400).json({ error: 'Template name and content are required.' });
    return;
  }

  const template: TemplateRecord = {
    id: `template-${Date.now()}`,
    name: name.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  templates.unshift(template);
  res.status(201).json(template);
}

export function runAssistantAction(req: Request, res: Response) {
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

  activeDocument.content = result;
  activeDocument.updatedAt = new Date().toISOString();

  res.json({ content: result, updatedAt: activeDocument.updatedAt });
}
