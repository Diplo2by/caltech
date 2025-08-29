export function todayISO() {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return d.toISOString().slice(0, 10);
}

export function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function numberOrZero(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}
