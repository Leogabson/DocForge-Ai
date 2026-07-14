import { prisma } from '../db.js';
import type { Document, Folder } from '@prisma/client';

export interface DocumentListFilters {
  search?: string;
  folderId?: string | null;
  isPinned?: boolean;
  isFavorite?: boolean;
  limit?: number;
  orderByRecent?: boolean;
}

export class DocumentRepository {
  public async findMany(userId: string, filters: DocumentListFilters = {}): Promise<Document[]> {
    const where: any = { userId };

    if (filters.folderId !== undefined) {
      where.folderId = filters.folderId;
    }
    if (filters.isPinned !== undefined) {
      where.isPinned = filters.isPinned;
    }
    if (filters.isFavorite !== undefined) {
      where.isFavorite = filters.isFavorite;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    const orderBy: any = {};
    if (filters.orderByRecent) {
      orderBy.lastOpenedAt = 'desc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    return prisma.document.findMany({
      where,
      orderBy,
      take: filters.limit,
    });
  }

  public async findById(id: string, userId: string): Promise<Document | null> {
    return prisma.document.findFirst({
      where: { id, userId },
    });
  }

  public async create(data: {
    title: string;
    description?: string | null;
    content?: string;
    styleConfig?: string;
    userId: string;
    folderId?: string | null;
    tags?: string[];
  }): Promise<Document> {
    return prisma.document.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        content: data.content ?? '',
        styleConfig: data.styleConfig ?? '{}',
        userId: data.userId,
        folderId: data.folderId ?? null,
        tags: data.tags ?? [],
      },
    });
  }

  public async update(id: string, userId: string, data: Partial<Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Document> {
    return prisma.document.delete({
      where: { id },
    });
  }

  public async touchLastOpened(id: string, userId: string): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data: {
        lastOpenedAt: new Date(),
      },
    });
  }

  // --- Folder operations ---
  public async listFolders(userId: string): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  public async findFolderById(id: string, userId: string): Promise<Folder | null> {
    return prisma.folder.findFirst({
      where: { id, userId },
    });
  }

  public async createFolder(userId: string, name: string): Promise<Folder> {
    return prisma.folder.create({
      data: {
        name: name.trim(),
        userId,
      },
    });
  }

  public async deleteFolder(id: string): Promise<Folder> {
    return prisma.folder.delete({
      where: { id },
    });
  }
}
export const documentRepository = new DocumentRepository();
