import { hash32 } from './uniqueness.js';
import { history } from './history.js';
import { modelsFor } from '../art/models.js';

// DailyRotationEngine. A stable pseudo-random permutation of the subject's designs is
// consumed in order: the first 100 publications for a subject cannot repeat a design.
// The date only decides the starting point after the library has been exhausted, and
// consecutive compositions are always different.
export class DailyRotationEngine {
  constructor({ definitionsFor = modelsFor, historyManager = history, today = () => new Date() } = {}) {
    this.definitionsFor = definitionsFor;
    this.historyManager = historyManager;
    this.today = today;
  }
  day(seedDate) {
    const d = seedDate ? new Date(seedDate) : this.today();
    return Number.isNaN(d.getTime())
      ? new Date().toISOString().slice(0, 10)
      : d.toISOString().slice(0, 10);
  }
  ordered(topic) {
    return [...this.definitionsFor(topic)].sort(
      (a, b) =>
        Number.parseInt(hash32(topic.id + '|' + a.id), 16) -
        Number.parseInt(hash32(topic.id + '|' + b.id), 16),
    );
  }
  candidates(topic, seedDate) {
    const order = this.ordered(topic);
    if (!order.length) return [];
    const used = this.historyManager?.usedIds(topic.id) || new Set();
    const unused = order.filter((d) => !used.has(d.id));
    if (unused.length) return { pool: unused, exhausted: false };
    // Every design has been seen; rotate the whole library with a day-seeded offset.
    const offset = Number.parseInt(hash32(this.day(seedDate) + '|' + topic.id), 16) % order.length;
    return { pool: [...order.slice(offset), ...order.slice(0, offset)], exhausted: true };
  }
  suggest(topic, seedDate, options = {}) {
    const { pool, exhausted } = this.candidates(topic, seedDate);
    if (!pool.length) return null;
    const previous = this.historyManager?.lastComposition(topic.id) || '';
    const previousArt = this.historyManager?.lastArtwork?.(topic.id) || '';
    let list = options.directionId
      ? pool.filter((d) => d.definition?.directionId === options.directionId)
      : pool;
    if (!list.length) list = pool;
    const different = list.filter((d) => d.compositionId !== previous);
    const differentArt = different.filter((d) => d.setting !== previousArt);
    let pick = (differentArt.length ? differentArt : different.length ? different : list)[0];
    if (exhausted && !different.length) {
      // Never repeat an adjacent composition, even after a full cycle of the library.
      const alt = this.ordered(topic).find((d) => d.compositionId !== previous);
      if (alt) pick = alt;
    }
    return pick || null;
  }
  fresh(topic, seedDate) {
    const used = this.historyManager?.usedIds(topic.id) || new Set();
    const pick = this.suggest(topic, seedDate);
    return { design: pick, fresh: !!pick && !used.has(pick.id), remaining: this.remaining(topic) };
  }
  remaining(topic) {
    const used = this.historyManager?.usedIds(topic.id) || new Set();
    return this.definitionsFor(topic).filter((d) => !used.has(d.id)).length;
  }
}

// The default engine uses the browser's persistent history. Tests and other consumers can
// construct an engine with an injected history manager and no storage side effects.
export const rotation = new DailyRotationEngine();
