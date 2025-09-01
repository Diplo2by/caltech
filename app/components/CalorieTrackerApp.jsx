"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { useUser } from "@stackframe/stack";
import { todayISO, numberOrZero, uid } from "@/util/scripts";

export default function CalorieTrackerApp() {
  const [entries, setEntries] = useState([]);
  const [goal, setGoal] = useState(2000);
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: "",
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [loadingMacros, setLoadingMacros] = useState(false);

  const user = useUser();
  const isSignedIn = !!user;

  useEffect(() => {
    if (isSignedIn) loadUserData();
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) loadEntries();
  }, [date, isSignedIn]);

  async function loadUserData() {
    try {
      const res = await fetch("/api/goal");
      const data = await res.json();
      if (data.goal) setGoal(data.goal);
    } catch (error) {
      console.error("Error loading user goal:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadEntries() {
    try {
      const res = await fetch(`/api/entries?date=${date}`);
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  }

  async function updateGoal(newGoal) {
    // Update UI immediately for better UX
    setGoal(newGoal);

    try {
      const res = await fetch("/api/goal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: newGoal }),
      });
      if (!res.ok) {
        // Revert on failure
        console.error("Failed to update goal");
        loadUserData(); // Reload the actual goal from server
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      loadUserData(); // Reload the actual goal from server
    }
  }

  const dayEntries = useMemo(() => {
    return entries.filter((e) => {
      const entryDate = new Date(e.date).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const currentDate = new Date(date + "T12:00:00").toLocaleDateString(
        "en-CA",
        { timeZone: "Asia/Kolkata" }
      );
      return entryDate === currentDate;
    });
  }, [entries, date]);

  const totals = useMemo(() => {
    return dayEntries.reduce(
      (acc, e) => {
        acc.calories += e.calories || 0;
        acc.protein += e.protein || 0;
        acc.carbs += e.carbs || 0;
        acc.fat += e.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [dayEntries]);

  const remaining = Math.max(goal - totals.calories, 0);

  const chartData = [
    { name: "Consumed", value: totals.calories },
    { name: "Left", value: Math.max(goal - totals.calories, 0) },
  ];

  function resetForm() {
    setForm({
      id: "",
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
    setEditingId("");
  }

  async function fetchMacrosFromGemini(food) {
    try {
      setLoadingMacros(true);
      const res = await fetch("/api/macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food }),
      });
      const data = await res.json();
      if (data.calories) {
        setForm((prev) => ({
          ...prev,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
        }));
      }
    } catch (err) {
      console.error("Gemini error", err);
    } finally {
      setLoadingMacros(false);
    }
  }

  async function addOrUpdateEntry(e) {
    e.preventDefault();
    const payload = {
      id: editingId || uid(),
      name: form.name.trim() || "Food",
      calories: numberOrZero(form.calories),
      protein: numberOrZero(form.protein),
      carbs: numberOrZero(form.carbs),
      fat: numberOrZero(form.fat),
      date,
    };

    try {
      if (editingId) {
        const res = await fetch("/api/entries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId: editingId, ...payload }),
        });
        if (res.ok) {
          setEntries((prev) =>
            prev.map((x) => (x.id === editingId ? payload : x))
          );
        }
      } else {
        const res = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) setEntries((prev) => [payload, ...prev]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      name: item.name,
      calories: String(item.calories || ""),
      protein: String(item.protein || ""),
      carbs: String(item.carbs || ""),
      fat: String(item.fat || ""),
    });
  }

  async function onDelete(id) {
    try {
      const res = await fetch(`/api/entries?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        if (editingId === id) resetForm();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  }

  const filtered = dayEntries.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin h-8 w-8 border-2 border-gray-700 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.header
          className="pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Min-Max
            </h1>
            <p className="text-sm text-gray-400">{user?.primaryEmail}</p>
          </div>
          <div className="mt-2 sm:mt-0 text-sm text-gray-500">
            {new Date(date).toLocaleDateString("en-IN", { weekday: "long" })}
          </div>
        </motion.header>

        {/* Stats + Chart */}
        <motion.section
          className="mt-6 grid gap-4 rounded-2xl bg-gray-900/50 border border-gray-800 p-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-2 font-medium">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white outline-none focus:border-gray-600 transition-colors"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-2 font-medium">
              Daily goal
            </label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={goal}
              onChange={(e) => updateGoal(numberOrZero(e.target.value))}
              className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white outline-none focus:border-gray-600 transition-colors"
            />
          </div>

          {/* Totals */}
          <div className="col-span-full lg:col-span-1 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-gray-800 border border-gray-700 p-4 px-2">
              <p className="text-xs text-gray-400 font-medium">Consumed</p>
              <p className="text-xl font-bold text-white">{totals.calories}</p>
            </div>
            <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
              <p className="text-xs text-gray-400 font-medium">Left</p>
              <p
                className={`text-xl font-bold ${
                  remaining === 0 ? "text-red-400" : "text-white"
                }`}
              >
                {remaining}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
              <p className="text-xs text-gray-400 font-medium">Goal</p>
              <p className="text-xl font-bold text-white">{goal}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="col-span-full h-48 sm:h-56 lg:h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius="65%"
                  outerRadius="80%"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 ? "#4b5563" : "#1f2937"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-white">
                {Math.round((totals.calories / goal) * 100)}%
              </p>
              <p className="text-xs text-gray-400">complete</p>
            </div>
          </div>
        </motion.section>

        {/* Food form + entries */}
        <motion.section
          className="mt-6 grid gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Add food */}
          <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Add food</h2>
            <form
              onSubmit={addOrUpdateEntry}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2 flex gap-2">
                <input
                  placeholder="Food name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => fetchMacrosFromGemini(form.name)}
                  disabled={!form.name || loadingMacros}
                  className="rounded-lg bg-gray-700 px-4 text-white hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {loadingMacros ? "..." : "Auto"}
                </button>
              </div>

              <input
                type="number"
                inputMode="numeric"
                placeholder="Calories"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Protein g"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Carbs g"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Fat g"
                value={form.fat}
                onChange={(e) => setForm({ ...form, fat: e.target.value })}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
              />

              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-white text-black p-3 font-medium hover:bg-gray-200 transition-colors hover:cursor-pointer active:scale-105"
                >
                  {editingId ? "Update" : "Add"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg bg-gray-700 px-4 text-white hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          {/* Entries list */}
          <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">
                Today's entries
              </h2>
              <div className="ml-auto" />
              <input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
              />
            </div>

            <div className="text-xs text-gray-500 mb-3">
              Click to edit • Right-click to delete
            </div>

            <ul className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {filtered.map((item) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 py-3 hover:bg-gray-800/30 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <button
                      onClick={() => onEdit(item)}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        {item.calories} kcal • P {item.protein} • C {item.carbs}{" "}
                        • F {item.fat}
                      </p>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded-lg bg-red-900/30 border border-red-800 px-3 py-1 text-red-400 text-sm hover:bg-red-900/50 transition-colors"
                    >
                      Delete
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No entries yet</p>
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-gray-800 border border-gray-700 p-3">
                <p className="text-xs text-gray-400 mb-1">Protein</p>
                <p className="font-semibold text-white">{totals.protein}g</p>
              </div>
              <div className="rounded-lg bg-gray-800 border border-gray-700 p-3">
                <p className="text-xs text-gray-400 mb-1">Carbs</p>
                <p className="font-semibold text-white">{totals.carbs}g</p>
              </div>
              <div className="rounded-lg bg-gray-800 border border-gray-700 p-3">
                <p className="text-xs text-gray-400 mb-1">Fat</p>
                <p className="font-semibold text-white">{totals.fat}g</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-gray-600">
          <div className="w-1 h-1 bg-gray-700 rounded-full mx-auto"></div>
        </footer>
      </div>
    </div>
  );
}
