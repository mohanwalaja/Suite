// CreativeHistoryManager. The rotation history survives refreshes because it lives in the
// same local storage namespace as the rest of the studio. It records generated designs,
// manual choices and confirmed publications as separate events.

const KEY = 'creative-history-v1';
const memory = new Map();
const browserStorage = () => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};
const source = (storage) => storage || browserStorage();
const read = (storage) => {
  const s = source(storage);
  try {
    const raw = s ? s.getItem('astrosivam:' + KEY) : memory.get(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const write = (entries, storage) => {
  const s = source(storage);
  const raw = JSON.stringify(entries);
  try {
    if (s) s.setItem('astrosivam:' + KEY, raw);
    else memory.set(KEY, raw);
  } catch {
    memory.set(KEY, raw);
  }
  return entries;
};

export class CreativeHistoryManager {
  constructor(storage = null) {
    this.storage = storage;
  }
  all() {
    return read(this.storage);
  }
  record(entry, date = new Date()) {
    const event = {
      date: date.toISOString(),
      day: date.toISOString().slice(0, 10),
      subjectId: entry.subjectId ?? entry.topic?.id,
      subject: entry.subject || entry.topic?.name || '',
      // Design zero is a valid ID; never discard it with a truthiness check.
      designId: entry.designId ?? entry.id,
      designName: entry.designName || entry.name || '',
      composition: entry.composition || '',
      source: entry.source || 'generated',
      signature: entry.signature || null,
    };
    if (event.subjectId === undefined || event.subjectId === null || event.designId === undefined || event.designId === null || event.designId === '') return event;
    const entries = [...this.all(), event];
    // Keep a generous but bounded trail. The no-repeat rule needs the last 100 per subject.
    write(entries.length > 8000 ? entries.slice(-8000) : entries, this.storage);
    return event;
  }
  forSubject(subjectId) {
    return this.all().filter((e) => e.subjectId === subjectId);
  }
  usedIds(subjectId) {
    return new Set(this.forSubject(subjectId).map((e) => e.designId));
  }
  publishedIds(subjectId) {
    return new Set(
      this.forSubject(subjectId)
        .filter((e) => e.source === 'published')
        .map((e) => e.designId),
    );
  }
  recent(subjectId, count = 6) {
    return this.forSubject(subjectId).slice(-count).reverse();
  }
  lastComposition(subjectId) {
    return this.recent(subjectId, 1)[0]?.composition || '';
  }
  stats() {
    const entries = this.all();
    return {
      total: entries.length,
      generated: entries.filter((e) => e.source === 'generated').length,
      published: entries.filter((e) => e.source === 'published').length,
      manual: entries.filter((e) => e.source === 'manual').length,
      subjects: new Set(entries.map((e) => e.subjectId)).size,
      lastDate: entries.at(-1)?.date || null,
    };
  }
  reset() {
    write([], this.storage);
    return true;
  }
}

export const history = new CreativeHistoryManager();
