
import { MessageCard, SessionMetadata } from './types';

const DB_NAME = 'ChatCardParserDB';
const DB_VERSION = 5; 
const STORE_NAME = 'messages';
const META_STORE = 'metadata';

export class ChatDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Clear existing stores for a clean upgrade to compound indexing
        if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME);
        if (db.objectStoreNames.contains(META_STORE)) db.deleteObjectStore(META_STORE);

        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Compound index: [sessionId, dateObj]
        // This allows filtering by sessionId AND sorting by dateObj in one pass
        store.createIndex('session_date', ['sessionId', 'dateObj'], { unique: false });
        store.createIndex('sender', 'sender', { unique: false });
        
        db.createObjectStore(META_STORE, { keyPath: 'id' });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction([STORE_NAME, META_STORE], 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore(META_STORE).clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction([STORE_NAME, META_STORE], 'readwrite');
    tx.objectStore(META_STORE).delete(id);
    
    const msgStore = tx.objectStore(STORE_NAME);
    const index = msgStore.index('session_date');
    // Bound range to find all entries for this sessionId
    const range = IDBKeyRange.bound([id, new Date(-8640000000000000)], [id, new Date(8640000000000000)]);
    const request = index.openKeyCursor(range);
    
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        msgStore.delete(cursor.primaryKey);
        cursor.continue();
      }
    };

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async addMessages(messages: MessageCard[]): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    messages.forEach(m => store.put(m));
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async saveMetadata(meta: SessionMetadata): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).put(meta);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async getAllMetadata(): Promise<SessionMetadata[]> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, 'readonly');
      const request = tx.objectStore(META_STORE).getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async getMetadata(id: string): Promise<SessionMetadata | null> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction(META_STORE, 'readonly');
      const request = tx.objectStore(META_STORE).get(id);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async queryMessages(
    sessionId: string,
    offset: number, 
    limit: number, 
    filters: { search: string, sender: string, date: string, sortOrder: 'asc' | 'desc' }
  ): Promise<MessageCard[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve) => {
      const results: MessageCard[] = [];
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('session_date');
      
      // Use the compound index to filter by session and automatically sort by dateObj
      // Range: [sessionId, MinDate] to [sessionId, MaxDate]
      const range = IDBKeyRange.bound(
        [sessionId, new Date(-8640000000000000)], 
        [sessionId, new Date(8640000000000000)]
      );
      
      // next = Chronological (Earliest to Latest)
      // prev = Reverse Chronological (Latest to Earliest)
      const direction = filters.sortOrder === 'desc' ? 'prev' : 'next';
      const request = index.openCursor(range, direction);

      let skipped = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (!cursor || results.length >= limit) {
          resolve(results);
          return;
        }

        const msg = cursor.value as MessageCard;
        
        const matchesSearch = !filters.search || msg.content.toLowerCase().includes(filters.search.toLowerCase());
        const matchesSender = !filters.sender || msg.sender === filters.sender;
        const matchesDate = !filters.date || (msg.dateObj && msg.dateObj.toISOString().split('T')[0] === filters.date);

        if (matchesSearch && matchesSender && matchesDate) {
          if (skipped < offset) {
            skipped++;
          } else {
            results.push(msg);
          }
        }
        
        cursor.continue();
      };
    });
  }
}

export const chatDB = new ChatDB();
