
import { MessageCard } from './types';

const MESSAGE_START_REGEX = /^(\[?(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})[,\s]+(\d{1,2}[:.]\d{1,2}([:.]\d{1,2})?\s?(AM|PM)?)\]?)\s?([-–]\s)?([^:]+):\s?(.*)/i;
const SYSTEM_MESSAGE_REGEX = /^(\[?(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})[,\s]+(\d{1,2}[:.]\d{1,2}([:.]\d{1,2})?\s?(AM|PM)?)\]?)\s?([-–]\s)?([^:]+)$/i;

export function parseMessageBlock(line: string, prevMsg: MessageCard | null, sessionId: string): { newMsg: MessageCard | null, updatedPrev: boolean } {
  const match = line.match(MESSAGE_START_REGEX);
  
  if (match) {
    const [ , fullTs, dateStr, timeStr, , ampm, dash, sender, firstLine] = match;
    const dateObj = new Date(dateStr.replace(/\./g, '/') + ' ' + (timeStr || ''));
    
    const msg: MessageCard = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId,
      timestamp: fullTs,
      // Default to Epoch if date is invalid to ensure the record is still indexed and sortable
      dateObj: isNaN(dateObj.getTime()) ? new Date(0) : dateObj,
      sender: sender.trim(),
      content: firstLine,
      preview: firstLine.substring(0, 100),
      hasEntities: false,
      entities: extractEntities(firstLine)
    };
    return { newMsg: msg, updatedPrev: false };
  }

  const systemMatch = line.match(SYSTEM_MESSAGE_REGEX);
  if (systemMatch) {
    const [ , fullTs, dateStr, timeStr, , ampm, dash, content] = systemMatch;
    const dateObj = new Date(dateStr.replace(/\./g, '/') + ' ' + (timeStr || ''));
    
    const msg: MessageCard = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId,
      timestamp: fullTs,
      dateObj: isNaN(dateObj.getTime()) ? new Date(0) : dateObj,
      sender: 'SYSTEM',
      content: content.trim(),
      preview: content.substring(0, 100),
      hasEntities: false,
      entities: extractEntities(content)
    };
    return { newMsg: msg, updatedPrev: false };
  }

  if (prevMsg) {
    prevMsg.content += '\n' + line;
    prevMsg.preview = prevMsg.content.substring(0, 100);
    prevMsg.entities = extractEntities(prevMsg.content);
    return { newMsg: null, updatedPrev: true };
  }

  return { newMsg: null, updatedPrev: false };
}

function extractEntities(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const currencyRegex = /([$€£₦¥]|RS\.|USD)\s?(\d+([.,]\d+)?)/gi;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const phoneRegex = /(\+?\d{1,4}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g;
  const actionWords = /\b(send|pay|deliver|confirm|payment|received|ordered)\b/gi;

  const urls = text.match(urlRegex) || [];
  const currency = text.match(currencyRegex) || [];
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const actions = text.match(actionWords) || [];

  return { 
    urls: Array.from(new Set(urls)), 
    numbers: [],
    currency: Array.from(new Set(currency)), 
    emails: Array.from(new Set(emails)), 
    phones: Array.from(new Set(phones)),
    actions: Array.from(new Set(actions.map(a => a.toLowerCase())))
  };
}

export async function processFile(
  file: File, 
  sessionId: string,
  onProgress: (p: number) => void,
  onChunk: (msgs: MessageCard[]) => Promise<void>
) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let leftover = '';
  let totalProcessed = 0;
  let currentMsg: MessageCard | null = null;
  let batch: MessageCard[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = (leftover + text).split(/\r?\n/);
    leftover = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const { newMsg } = parseMessageBlock(line, currentMsg, sessionId);
      if (newMsg) {
        if (currentMsg) {
          finalizeMsg(currentMsg);
          batch.push(currentMsg);
        }
        currentMsg = newMsg;
      }

      if (batch.length >= 1000) {
        await onChunk(batch);
        totalProcessed += batch.length;
        batch = [];
      }
    }
    onProgress(totalProcessed);
  }

  if (currentMsg) {
    finalizeMsg(currentMsg);
    batch.push(currentMsg);
  }
  if (batch.length > 0) await onChunk(batch);
}

function finalizeMsg(msg: MessageCard) {
  msg.hasEntities = (
    msg.entities.urls.length > 0 || 
    msg.entities.currency.length > 0 ||
    msg.entities.emails.length > 0 ||
    msg.entities.phones.length > 0 ||
    msg.entities.actions.length > 0
  );
}
