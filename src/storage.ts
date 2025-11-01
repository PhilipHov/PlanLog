const KEY = "haeren-logistik-state-v1";

export function save<T>(data: T) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
export function load<T>(fallback: T): T {
  const raw = localStorage.getItem(KEY);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

