
export interface MessageCard {
  id: string;
  sessionId: string; // ID of the project/file this message belongs to
  timestamp?: string; // Raw string from text
  dateObj?: Date;    // Parsed for filtering
  sender: string;
  content: string;
  preview: string;
  hasEntities: boolean;
  entities: {
    urls: string[];
    numbers: string[];
    currency: string[];
    emails: string[];
    phones: string[];
    actions: string[]; // "send", "pay", "deliver", "confirm"
  };
}

export interface SessionMetadata {
  id: string; // Unique ID for the project
  title: string;
  fileName: string;
  fileSize: number;
  lastUpdated: number;
  description: string;
  totalMessages: number;
  senders: string[];
  dates: string[];
}

export interface FilterState {
  search: string;
  sender: string;
  date: string;
  timeRange: [number, number]; // 0-23 hours
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
