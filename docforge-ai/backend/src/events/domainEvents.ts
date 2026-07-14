import { EventEmitter } from 'events';
import { logger } from '../config/logger.js';

export enum DomainEventType {
  DOCUMENT_CREATED = 'DOCUMENT_CREATED',
  DOCUMENT_UPDATED = 'DOCUMENT_UPDATED',
  DOCUMENT_EXPORTED = 'DOCUMENT_EXPORTED',
  VERSION_CREATED = 'VERSION_CREATED',
  TEMPLATE_USED = 'TEMPLATE_USED',
  AI_REQUEST_COMPLETED = 'AI_REQUEST_COMPLETED',
}

export interface DomainEventPayloads {
  [DomainEventType.DOCUMENT_CREATED]: { documentId: string; userId: string; title: string };
  [DomainEventType.DOCUMENT_UPDATED]: { documentId: string; userId: string; fieldsChanged: string[] };
  [DomainEventType.DOCUMENT_EXPORTED]: { documentId: string; userId: string; format: string; durationMs: number };
  [DomainEventType.VERSION_CREATED]: { versionId: string; documentId: string; label: string | null };
  [DomainEventType.TEMPLATE_USED]: { templateId: string; documentId: string; userId: string };
  [DomainEventType.AI_REQUEST_COMPLETED]: { userId: string; action: string; durationMs: number };
}

class DomainEventsEmitter extends EventEmitter {
  constructor() {
    super();
    // Register general logger listener
    this.onAny((eventType, payload) => {
      logger.info({
        message: `Domain Event Dispatched: ${eventType}`,
        event: eventType,
        payload,
      });
    });
  }

  // Helper method to emit and log
  public dispatch<T extends DomainEventType>(eventType: T, payload: DomainEventPayloads[T]): void {
    this.emit(eventType, payload);
    this.emit('*', eventType, payload);
  }

  private onAny(listener: (eventType: DomainEventType, payload: any) => void) {
    this.on('*', listener);
  }
}

export const domainEvents = new DomainEventsEmitter();
