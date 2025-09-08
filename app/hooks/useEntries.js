// hooks/useEntries.js
"use client";
import { useState, useEffect } from "react";

export function useEntries(date, isSignedIn) {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        async function loadEntries() {
            if (!isSignedIn) return;
            try {
                const res = await fetch(`/api/entries?date=${date}`);
                const data = await res.json();
                setEntries(data.entries || []);
            } catch (error) {
                console.error("Error loading entries:", error);
            }
        }
        loadEntries();
    }, [date, isSignedIn]);

    const addEntry = async (entry) => {
        try {
            const res = await fetch("/api/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });
            if (res.ok) setEntries((prev) => [entry, ...prev]);
            return res.ok;
        } catch (error) {
            console.error("Error adding entry:", error);
            return false;
        }
    };

    const updateEntry = async (entry) => {
        try {
            const res = await fetch("/api/entries", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entryId: entry.id, ...entry }),
            });
            if (res.ok) {
                setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
            }
            return res.ok;
        } catch (error) {
            console.error("Error updating entry:", error);
            return false;
        }
    };

    const deleteEntry = async (id) => {
        try {
            const res = await fetch(`/api/entries?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setEntries((prev) => prev.filter((e) => e.id !== id));
            }
            return res.ok;
        } catch (error) {
            console.error("Error deleting entry:", error);
            return false;
        }
    };

    return { entries, addEntry, updateEntry, deleteEntry };
}