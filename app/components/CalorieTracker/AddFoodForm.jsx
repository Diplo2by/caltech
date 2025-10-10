"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { numberOrZero, uid } from "@/util/scripts";
import { useOnClickOutside } from "@/app/hooks/useOnClickOutside";
import MacroInput from "./MacroInput";
import LoadingThreeDotsPulse from "../motions/LoadingThreeDotsPulse";

const EMPTY_FORM = {
  name: "",
  quantity: "",
  unit: "g",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

export default function AddFoodForm({
  date,
  addEntry,
  updateEntry,
  editingEntry,
  setEditingEntry,
  allFoods,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create a ref for the suggestions container
  const suggestionsContainerRef = useRef(null);
  const isEditing = !!editingEntry;

  // Use the custom hook to close suggestions on outside click
  useOnClickOutside(suggestionsContainerRef, () => setSuggestions([]));

  useEffect(() => {
    if (editingEntry) {
      setForm({
        name: editingEntry.name,
        quantity: String(editingEntry.quantity || ""),
        unit: String(editingEntry.unit || "g"),
        calories: String(editingEntry.calories || ""),
        protein: String(editingEntry.protein || ""),
        carbs: String(editingEntry.carbs || ""),
        fat: String(editingEntry.fat || ""),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingEntry]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingEntry(null);
    setSuggestions([]);
  }

  async function fetchMacrosFromGemini(foodName) {
    if (!foodName) return;
    const food =
      typeof foodName === "string" && foodName ? foodName : form.name;
    try {
      setLoading(true);
      const res = await fetch("/api/macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: food }),
      });
      const data = await res.json();
      if (data.calories) {
        setForm((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Gemini error", err);
    } finally {
      setLoading(false);
      setSuggestions([]);
    }
  }

  async function handleSubmit(e) {
    setLoading(true);
    e.preventDefault();
    const payload = {
      id: editingEntry?.id || uid(),
      name: form.name.trim() || "Food",
      quantity: numberOrZero(form.quantity),
      unit: form.unit,
      calories: numberOrZero(form.calories),
      protein: numberOrZero(form.protein),
      carbs: numberOrZero(form.carbs),
      fat: numberOrZero(form.fat),
      date,
    };

    const success = isEditing
      ? await updateEntry(payload)
      : await addEntry(payload);

    if (success) {
      setLoading(false);
      resetForm();
    }
  }

  function handleNameChange(e) {
    const value = e.target.value;
    setForm({ ...form, name: value });

    if (value.length > 1) {
      const filtered = allFoods.filter((food) =>
        food.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Limit suggestions
    } else {
      setSuggestions([]);
    }
  }

  function handleSuggestionClick(food) {
    setForm({
      ...form,
      name: food.name,
    });
    setSuggestions([]);
    fetchMacrosFromGemini(food.name);
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setSuggestions([]);
  }
  const addDuplicate = async (e) => {
    setLoading(true);
    const payload = {
      id: uid(), // New ID for new entry
      name: form.name.trim() || "Food",
      quantity: numberOrZero(form.quantity),
      unit: form.unit,
      calories: numberOrZero(form.calories),
      protein: numberOrZero(form.protein),
      carbs: numberOrZero(form.carbs),
      fat: numberOrZero(form.fat),
      date,
    };
    const success = await addEntry(payload);
    if (success) {
      setLoading(false);
      resetForm();
    }
  };

  return (
    <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        {isEditing ? "Edit Food" : "Add Food"}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        {/* Food Name and Auto Button */}
        <div className="col-span-2 flex gap-2">
          <div className="flex-1 relative" ref={suggestionsContainerRef}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Food name
            </label>
            <input
              placeholder="What did you eat?"
              value={form.name}
              onChange={handleNameChange}
              autoComplete="off"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
            />
            <AnimatePresence>
              {suggestions.length > 0 && !loading && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto rounded-lg bg-gray-800 border border-gray-700 shadow-lg"
                >
                  {suggestions.map((food) => (
                    <li
                      key={food.name}
                      onClick={() => handleSuggestionClick(food)}
                      className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
                    >
                      {food.name}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={fetchMacrosFromGemini}
              disabled={!form.name || loading}
              className={`rounded-lg px-4 py-3 font-semibold text-white transition-all duration-300 ${
                loading
                  ? "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-[length:200%_auto] animate-gradient-pan cursor-wait py-6"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {loading ? <LoadingThreeDotsPulse /> : "Auto ✨"}
            </button>
          </div>
        </div>

        {/* Macro Inputs */}
        <MacroInput
          label="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Unit
          </label>
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 text-white outline-none focus:border-gray-600 transition-colors py-3.5 text-sm"
          >
            <option value="g">grams (g)</option>
            <option value="kg">kilograms (kg)</option>
            <option value="ml">milliliters (ml)</option>
            <option value="l">liters (l)</option>
            <option value="cup">cups</option>
            <option value="tbsp">tablespoons</option>
            <option value="tsp">teaspoons</option>
            <option value="piece">pieces</option>
            <option value="slice">slices</option>
          </select>
        </div>
        <MacroInput
          label="Calories"
          value={form.calories}
          onChange={(e) => setForm({ ...form, calories: e.target.value })}
        />
        <MacroInput
          label="Protein (g)"
          value={form.protein}
          onChange={(e) => setForm({ ...form, protein: e.target.value })}
        />
        <MacroInput
          label="Carbs (g)"
          value={form.carbs}
          onChange={(e) => setForm({ ...form, carbs: e.target.value })}
        />
        <MacroInput
          label="Fat (g)"
          value={form.fat}
          onChange={(e) => setForm({ ...form, fat: e.target.value })}
        />

        {/* Action Buttons */}
        <div className="col-span-2 flex gap-2 mt-2">
          <button
            disabled={loading}
            type="submit"
            className="disabled:bg-gray-600 disabled:cursor-default flex-1 rounded-lg bg-white text-black p-3 font-medium hover:bg-gray-200 transition-colors hover:cursor-pointer active:scale-105"
          >
            {loading ? (
              <LoadingThreeDotsPulse />
            ) : isEditing ? (
              "Update Entry"
            ) : (
              "Add Entry"
            )}
          </button>

          {!isEditing && form != EMPTY_FORM && (
            <button
              type="button"
              onClick={clearForm}
              disabled={loading}
              className="disabled:bg-gray-600 disabled:cursor-default rounded-lg bg-gray-700 px-4 text-white hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
          {isEditing && (
            <>
              <button
                type="button"
                onClick={addDuplicate}
                disabled={loading}
                className="disabled:bg-gray-600 disabled:cursor-default flex-1 rounded-lg bg-teal-200 text-black p-3 font-medium hover:bg-gray-200 transition-colors hover:cursor-pointer active:scale-105"
              >
                Add Again
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-700 px-4 text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
