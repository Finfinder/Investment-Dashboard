import { IStorageAdapter } from './IStorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export class StorageService {
  private static instance: StorageService;
  private adapter: IStorageAdapter;

  private constructor(adapter?: IStorageAdapter) {
    this.adapter = adapter || new LocalStorageAdapter();
  }

  public static getInstance(adapter?: IStorageAdapter): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(adapter);
    }
    return StorageService.instance;
  }

  public getAdapter(): IStorageAdapter {
    return this.adapter;
  }

  public setAdapter(adapter: IStorageAdapter): void {
    this.adapter = adapter;
  }
}
