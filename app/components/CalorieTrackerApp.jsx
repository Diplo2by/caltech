"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { todayISO } from "@/util/scripts";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/util/storage";
export default function CalorieTrackerApp() {
  const [entries, setEntries] = useState(() =>
    loadJSON(STORAGE_KEYS.entries, [])
  );
  const [goal, setGoal] = useState(() => loadJSON(STORAGE_KEYS.goal, 2000));
  const [date, setDate] = useState(todayISO());
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

  useEffect(() => saveJSON(STORAGE_KEYS.entries, entries), [entries]);
  useEffect(() => saveJSON(STORAGE_KEYS.goal, goal), [goal]);

  const dayEntries = useMemo(
    () => entries.filter((e) => e.date === date),
    [entries, date]
  );

  const totals = useMemo(() => {
    return dayEntries.reduce(
      (acc, e) => {
        acc.calories += e.calories;
        acc.protein += e.protein;
        acc.carbs += e.carbs;
        acc.fat += e.fat;
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

  function addOrUpdateEntry(e) {
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

    if (editingId) {
      setEntries((prev) => prev.map((x) => (x.id === editingId ? payload : x)));
    } else {
      setEntries((prev) => [payload, ...prev]);
    }
    resetForm();
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      name: item.name,
      calories: String(item.calories),
      protein: String(item.protein),
      carbs: String(item.carbs),
      fat: String(item.fat),
    });
  }

  function onDelete(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) resetForm();
  }

  const filtered = dayEntries.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-md p-4 sm:p-6">
        <header className="pb-4">
          <h1 className="text-2xl font-bold">Calorie tracker</h1>
          <p className="text-sm text-zinc-600">
            Hi {user.primaryEmail} DB {getDBVersion()} hi{" "}
            {process.env.STACK_SECRET_SERVER_KEY}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border p-2 outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-500">Daily goal</label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={goal}
              onChange={(e) => setGoal(numberOrZero(e.target.value))}
              className="rounded-xl border p-2 outline-none"
            />
          </div>

          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">Consumed</p>
                <p className="text-xl font-semibold">{totals.calories}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">Left</p>
                <p
                  className={`text-xl font-semibold ${
                    remaining === 0 ? "text-rose-600" : ""
                  }`}
                >
                  {remaining}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">Goal</p>
                <p className="text-xl font-semibold">{goal}</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`c-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold">Add food</h2>
          <form onSubmit={addOrUpdateEntry} className="grid grid-cols-2 gap-2">
            <div className="col-span-2 flex gap-2">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="flex-1 rounded-xl border p-2 outline-none"
              />
              <button
                type="button"
                onClick={() => fetchMacrosFromGemini(form.name)}
                disabled={!form.name || loadingMacros}
                className="rounded-xl bg-blue-500 px-3 text-white disabled:opacity-50"
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
              className="rounded-xl border p-2 outline-none"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Protein g"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: e.target.value })}
              className="rounded-xl border p-2 outline-none"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Carbs g"
              value={form.carbs}
              onChange={(e) => setForm({ ...form, carbs: e.target.value })}
              className="rounded-xl border p-2 outline-none"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Fat g"
              value={form.fat}
              onChange={(e) => setForm({ ...form, fat: e.target.value })}
              className="rounded-xl border p-2 outline-none"
            />

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-zinc-900 p-3 text-white shadow active:translate-y-px"
              >
                {editingId ? "Update" : "Add"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl bg-zinc-200 px-4 text-zinc-900"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Today entries</h2>
            <div className="ml-auto" />
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border p-2 text-sm outline-none"
            />
          </div>
          <div className="text-xs text-zinc-500 mb-2">
            Tap an item to edit. Swipe left to delete on touch devices
          </div>
          <ul className="divide-y">
            <AnimatePresence initial={false}>
              {filtered.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-3 py-3"
                >
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-500">
                      {item.calories} kcal · P {item.protein} C {item.carbs} F{" "}
                      {item.fat}
                    </p>
                  </button>
                  <button
                    aria-label="Delete"
                    onClick={() => onDelete(item.id)}
                    className="rounded-xl bg-rose-100 px-3 py-1 text-rose-700 active:translate-y-px"
                  >
                    Delete
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {filtered.length === 0 ? (
            <p className="py-6 text-center text-zinc-500">No items yet</p>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Protein</p>
              <p className="font-semibold">{totals.protein} g</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Carbs</p>
              <p className="font-semibold">{totals.carbs} g</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Fat</p>
              <p className="font-semibold">{totals.fat} g</p>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-zinc-500">
          <p>Tip press P C or F while typing to jump between fields</p>
        </footer>
      </div>
    </div>
  );
}
