import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './StorageProvider.js';
import { config } from '../../config/index.js';
import { StorageError } from '../../errors/customErrors.js';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(config.storage.localPath);
    // Ensure base directory exists synchronously or asynchronously (we will verify on first call)
  }

  private async ensureBaseDir(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error: any) {
      throw new StorageError(`Failed to create storage directory at ${this.baseDir}`, error);
    }
  }

  private getSafePath(key: string): string {
    // Prevent directory traversal attacks by resolving and validating
    const safeKey = path.normalize(key).replace(/^(\.\.(\/|\\))+/, '');
    const resolvedPath = path.resolve(this.baseDir, safeKey);
    
    if (!resolvedPath.startsWith(this.baseDir)) {
      throw new StorageError('Directory traversal attack detected.');
    }
    return resolvedPath;
  }

  public async put(key: string, data: Buffer | string): Promise<string> {
    await this.ensureBaseDir();
    const filePath = this.getSafePath(key);
    
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, data);
      return filePath;
    } catch (error: any) {
      throw new StorageError(`Failed to write file to storage: ${key}`, error);
    }
  }

  public async get(key: string): Promise<Buffer> {
    const filePath = this.getSafePath(key);
    try {
      return await fs.readFile(filePath);
    } catch (error: any) {
      throw new StorageError(`Failed to read file from storage: ${key}`, error);
    }
  }

  public async delete(key: string): Promise<void> {
    const filePath = this.getSafePath(key);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      // Don't throw if file is already deleted/doesn't exist
      if (error.code !== 'ENOENT') {
        throw new StorageError(`Failed to delete file: ${key}`, error);
      }
    }
  }

  public async exists(key: string): Promise<boolean> {
    const filePath = this.getSafePath(key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async getSignedUrl(key: string): Promise<string> {
    // For local storage, we resolve it as a relative URL route, e.g. /api/storage/files/:key
    // For simplicity, we just return a localhost or relative API endpoint path
    return `/api/storage/files/${key}`;
  }
}
