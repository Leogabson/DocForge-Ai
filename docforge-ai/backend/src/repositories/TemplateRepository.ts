import { prisma } from '../db.js';
import type { Document } from '@prisma/client';

export class TemplateRepository {
  public async listTemplates(): Promise<Document[]> {
    return prisma.document.findMany({
      where: { title: { startsWith: 'Template:' } },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findTemplateById(id: string): Promise<Document | null> {
    return prisma.document.findFirst({
      where: {
        id,
        title: { startsWith: 'Template:' },
      },
    });
  }

  public async createTemplate(data: {
    name: string;
    content: string;
    userId: string;
  }): Promise<Document> {
    return prisma.document.create({
      data: {
        title: `Template: ${data.name.trim()}`,
        content: data.content,
        userId: data.userId,
      },
    });
  }
}
export const templateRepository = new TemplateRepository();
