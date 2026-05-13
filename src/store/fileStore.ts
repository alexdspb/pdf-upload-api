import { FileMetadata } from '../types';

const store = new Map<string, FileMetadata>();

export const fileStore = {
  add(metadata: FileMetadata): void {
    store.set(metadata.id, metadata);
  },
  getAll(): FileMetadata[] {
    return Array.from(store.values());
  },
  getById(id: string): FileMetadata | undefined {
    return store.get(id);
  },
  clear(): void {
    store.clear();
  },
};
