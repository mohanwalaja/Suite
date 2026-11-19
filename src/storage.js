export function load(key, fallback) {
  try {
    const s = localStorage.getItem('astrosivam:' + key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}
export function store(key, value) {
  localStorage.setItem('astrosivam:' + key, JSON.stringify(value));
}
export function uid() {
  return (
    crypto.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  );
}
export async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await res
    .json()
    .catch(() => ({ error: 'The workspace server could not be reached.' }));
  if (!res.ok) throw new Error(data.error || 'Please try again.');
  return data;
}
