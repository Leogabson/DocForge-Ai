export interface StorageProvider {
  /**
   * Upload or save a file to the storage provider.
   * Returns the file path/URL or unique key of the saved file.
   */
  put(key: string, data: Buffer | string, options?: { contentType?: string }): Promise<string>;

  /**
   * Download or retrieve a file's content from the storage provider.
   */
  get(key: string): Promise<Buffer>;

  /**
   * Delete a file from the storage provider.
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a file exists.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get a public or temporary signed URL to access the file.
   */
  getSignedUrl(key: string, expiresSeconds?: number): Promise<string>;
}
