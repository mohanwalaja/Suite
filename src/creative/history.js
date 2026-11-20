// CreativeHistoryManager. The rotation history survives refreshes because it lives in the
// same local storage namespace as the rest of the studio. It records generated designs,
// manual choices and confirmed publications as separate events.

const KEY = 'creative-history-v1';
const JOURNAL = 'astrosivam:creative-event-v1:';
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

const eventKey = (e) =>
  `${e.subjectId}|${e.designId}|${e.source}|${e.day}|${e.composition || ''}`;
export class CreativeHistoryManager {
  constructor(storage = null) {
    this.storage = storage;
    this.listeners = new Set();
    if (typeof window !== 'undefined' && window.addEventListener)
      window.addEventListener('storage', (e) => {
        if (e.key === 'astrosivam:' + KEY || e.key?.startsWith(JOURNAL) || e.key === null)
          for (const fn of this.listeners) fn();
      });
  }
  all() {
    const entries = read(this.storage);
    const s = source(this.storage);
    if (s && typeof s.key === 'function') {
      try {
        for (let i = 0; i < s.length; i++) {
          const key = s.key(i);
          if (key?.startsWith(JOURNAL)) {
            const item = JSON.parse(s.getItem(key));
            if (item && typeof item === 'object') entries.push(item);
          }
        }
      } catch {
        // Legacy history remains usable if browser storage is unavailable.
      }
    }
    const unique = new Map(entries.map((entry) => [eventKey(entry), entry]));
    return [...unique.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
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
      artwork: entry.artwork || entry.setting || '',
      source: entry.source || 'generated',
      signature: entry.signature || null,
    };
    if (event.subjectId === undefined || event.subjectId === null || event.designId === undefined || event.designId === null || event.designId === '') return event;
    // One key per event prevents unrelated tabs from overwriting each other's history.
    // Selection itself is not atomic; two tabs may still choose the same unused design.
    const s = source(this.storage);
    if (s && typeof s.key === 'function') {
      try {
        s.setItem(JOURNAL + encodeURIComponent(eventKey(event)), JSON.stringify(event));
        // Preserve the legacy aggregate for existing readers; the journal remains
        // authoritative if concurrent tabs race while updating this compatibility copy.
        write(this.all(), this.storage);
      } catch {
        const entries = this.all();
        if (!entries.some((e) => eventKey(e) === eventKey(event))) entries.push(event);
        write(entries, this.storage);
      }
    } else {
      const entries = this.all();
      if (!entries.some((e) => eventKey(e) === eventKey(event))) entries.push(event);
      write(entries, this.storage);
    }
    for (const fn of this.listeners) fn();
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
  lastArtwork(subjectId) {
    return this.recent(subjectId, 1)[0]?.artwork || '';
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
    const s = source(this.storage);
    if (s && typeof s.key === 'function') {
      const keys = [];
      for (let i = 0; i < s.length; i++) {
        const key = s.key(i);
        if (key?.startsWith(JOURNAL)) keys.push(key);
      }
      keys.forEach((key) => s.removeItem(key));
    }
    write([], this.storage);
    for (const fn of this.listeners) fn();
    return true;
  }
}

export const history = new CreativeHistoryManager();
