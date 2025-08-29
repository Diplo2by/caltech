export function loadJSON(key, fallback) {
    try {
        const raw =
            typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function saveJSON(key, value) {
    try {
        if (typeof window !== "undefined")
            window.localStorage.setItem(key, JSON.stringify(value));
    } catch { }
}
export const STORAGE_KEYS = {
  entries: "ct_entries_v1",
  goal: "ct_goal_v1",
};
