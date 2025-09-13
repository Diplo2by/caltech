export function todayISO() {
    const now = new Date();

    const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    return {
        dateString: istDate.toISOString().slice(0, 10),
        weekDay: now.toLocaleDateString("en-IN", {
            weekday: "long",
            timeZone: "Asia/Kolkata",
        })
    };
}

export function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function numberOrZero(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

export function convertDecimal(num) {
    try {
        if (isNaN(parseFloat(num))) {
            return '';
        }
        return (Math.round(num * 100) / 100).toFixed(2);
    } catch (error) {
        return "";
    }
}