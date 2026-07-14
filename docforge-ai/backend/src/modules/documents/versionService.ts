import { versionRepository } from '../../repositories/VersionRepository.js';
import { documentRepository } from '../../repositories/DocumentRepository.js';
import { domainEvents, DomainEventType } from '../../events/domainEvents.js';
import { NotFoundError } from '../../errors/customErrors.js';
import type { DocumentVersion, Document } from '@prisma/client';

export class VersionService {
  public async createSnapshot(documentId: string, userId: string, label?: string | null): Promise<DocumentVersion> {
    const doc = await documentRepository.findById(documentId, userId);
    if (!doc) {
      throw new NotFoundError('Document not found or access denied.');
    }

    const version = await versionRepository.create({
      documentId,
      contentSnapshot: doc.content,
      label: label || `Snapshot ${new Date().toLocaleString()}`,
    });

    domainEvents.dispatch(DomainEventType.VERSION_CREATED, {
      versionId: version.id,
      documentId,
      label: version.label,
    });

    return version;
  }

  public async getVersions(documentId: string, userId: string): Promise<DocumentVersion[]> {
    const doc = await documentRepository.findById(documentId, userId);
    if (!doc) {
      throw new NotFoundError('Document not found or access denied.');
    }
    return versionRepository.listByDocumentId(documentId);
  }

  public async restoreVersion(versionId: string, userId: string): Promise<Document> {
    const version = await versionRepository.findById(versionId);
    if (!version) {
      throw new NotFoundError('Version snapshot not found.');
    }

    const doc = await documentRepository.findById(version.documentId, userId);
    if (!doc) {
      throw new NotFoundError('Document not found or access denied.');
    }

    // Auto-create snapshot of current state before restoring
    await versionRepository.create({
      documentId: doc.id,
      contentSnapshot: doc.content,
      label: `Auto-saved before restoring to ${version.label}`,
    });

    // Update document content to the snapshot content
    const restored = await documentRepository.update(doc.id, userId, {
      content: version.contentSnapshot,
    });

    return restored;
  }
}
export const versionService = new VersionService();
