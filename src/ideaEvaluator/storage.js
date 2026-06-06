// storage.js
// Thin localStorage persistence so a user's idea, evaluation, plan progress and
// accountability log survive refreshes. Everything stays on the user's device.

const KEY = 'idea-evaluator:v1';

const EMPTY = {
  idea: { name: '', oneLiner: '', customer: '', problem: '', model: 'app' },
  ratings: {},
  worthRatings: {},
  progress: {}, // milestone key -> boolean
  checkins: [], // [{ date, done, blockers, next }]
  updatedAt: null,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  } catch {
    // Storage full or unavailable — fail quietly; the app still works in-session.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return { ...EMPTY };
}

export { EMPTY };
