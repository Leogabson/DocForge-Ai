import { documentRepository, DocumentListFilters } from '../../repositories/DocumentRepository.js';
import { domainEvents, DomainEventType } from '../../events/domainEvents.js';
import { NotFoundError } from '../../errors/customErrors.js';
import type { Document, Folder } from '@prisma/client';

export class DocumentService {
  public async getDocuments(userId: string, filters: DocumentListFilters = {}): Promise<Document[]> {
    return documentRepository.findMany(userId, filters);
  }

  public async getDocumentById(id: string, userId: string): Promise<Document> {
    const doc = await documentRepository.findById(id, userId);
    if (!doc) {
      throw new NotFoundError('Document not found or access denied.');
    }
    // Update last opened timestamp
    await documentRepository.touchLastOpened(id, userId);
    return doc;
  }

  public async createDocument(userId: string, data: {
    title: string;
    description?: string | null;
    content?: string;
    styleConfig?: string;
    folderId?: string | null;
    tags?: string[];
  }): Promise<Document> {
    const doc = await documentRepository.create({ ...data, userId });
    domainEvents.dispatch(DomainEventType.DOCUMENT_CREATED, {
      documentId: doc.id,
      userId,
      title: doc.title,
    });
    return doc;
  }

  public async updateDocument(id: string, userId: string, data: Partial<Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Document> {
    // Check if exists
    const existing = await documentRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Document not found or access denied.');
    }

    const updated = await documentRepository.update(id, userId, data);

    const fieldsChanged = Object.keys(data);
    domainEvents.dispatch(DomainEventType.DOCUMENT_UPDATED, {
      documentId: updated.id,
      userId,
      fieldsChanged,
    });

    return updated;
  }

  public async deleteDocument(id: string, userId: string): Promise<void> {
    const existing = await documentRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Document not found or access denied.');
    }
    await documentRepository.delete(id);
  }

  // --- Folder Delegation ---
  public async getFolders(userId: string): Promise<Folder[]> {
    return documentRepository.listFolders(userId);
  }

  public async createFolder(userId: string, name: string): Promise<Folder> {
    return documentRepository.createFolder(userId, name);
  }

  public async deleteFolder(id: string, userId: string): Promise<void> {
    const existing = await documentRepository.findFolderById(id, userId);
    if (!existing) {
      throw new NotFoundError('Folder not found or access denied.');
    }
    await documentRepository.deleteFolder(id);
  }
}
export const documentService = new DocumentService();
