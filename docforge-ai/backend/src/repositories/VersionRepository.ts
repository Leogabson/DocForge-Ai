import { prisma } from '../db.js';
import type { DocumentVersion } from '@prisma/client';

export class VersionRepository {
  public async create(data: {
    documentId: string;
    contentSnapshot: string;
    label?: string | null;
  }): Promise<DocumentVersion> {
    return prisma.documentVersion.create({
      data: {
        documentId: data.documentId,
        contentSnapshot: data.contentSnapshot,
        label: data.label ?? null,
      },
    });
  }

  public async listByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    return prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findById(id: string): Promise<DocumentVersion | null> {
    return prisma.documentVersion.findUnique({
      where: { id },
    });
  }

  public async delete(id: string): Promise<DocumentVersion> {
    return prisma.documentVersion.delete({
      where: { id },
    });
  }
}
export const versionRepository = new VersionRepository();
