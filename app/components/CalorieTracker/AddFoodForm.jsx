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

  // ref for the hidden file input
  const imageInputRef = useRef(null);

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

  async function fetchMacrosFromImage(file) {
    if (!file) return;
    try {
      setLoading(true);

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // strip data URI prefix
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/analyze-food-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });

      const data = await res.json();

      if (data.detectedFoods?.length > 0) {
        const first = data.detectedFoods[0];
        // Populate form with the first detected food
        // (if multiple foods detected, fill totals + a combined name)
        if (data.detectedFoods.length === 1) {
          setForm((prev) => ({
            ...prev,
            name: first.name,
            quantity: String(first.quantity),
            unit: first.unit,
            calories: String(first.calories),
            protein: String(first.protein),
            carbs: String(first.carbs),
            fat: String(first.fat),
          }));
        } else {
          // Multi-food plate: combine into one entry
          const combinedName = data.detectedFoods.map((f) => f.name).join(", ");
          setForm((prev) => ({
            ...prev,
            name: combinedName,
            quantity: "1",
            unit: "piece",
            calories: String(data.totalCalories),
            protein: String(data.totalProtein),
            carbs: String(data.totalCarbs),
            fat: String(data.totalFat),
          }));
        }
      }
    } catch (err) {
      console.error("Image analysis error", err);
    } finally {
      setLoading(false);
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
        food.name.toLowerCase().includes(value.toLowerCase()),
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
        <div className="col-span-2 flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-300">
            Food name
          </label>

          <div className="flex gap-2" ref={suggestionsContainerRef}>
            <div className="relative flex-1">
              <input
                placeholder="What did you eat?"
                value={form.name}
                onChange={handleNameChange}
                autoComplete="off"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
              />
              <AnimatePresence>
                {suggestions.length > 0 && !loading && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto rounded-xl bg-gray-800 border border-gray-700 shadow-lg"
                  >
                    {suggestions.map((food) => (
                      <li
                        key={food.name}
                        onClick={() => handleSuggestionClick(food)}
                        className="px-4 py-3 text-white hover:bg-gray-700 active:bg-gray-600 cursor-pointer text-sm"
                      >
                        {food.name}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={fetchMacrosFromGemini}
              disabled={!form.name || loading}
              className={`flex items-center gap-2 px-4 rounded-xl text-sm font-medium text-white border transition-all shrink-0
        ${loading
                  ? "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-[length:200%_auto] animate-gradient-pan cursor-wait border-transparent"
                  : "bg-teal-950 border-teal-700 hover:bg-teal-900 text-teal-300 disabled:opacity-40"
                }`}
            >
              {loading ? (
                <LoadingThreeDotsPulse />
              ) : (
                <>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#5eead4" strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
                  </svg>
                  Auto
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-teal-700 text-teal-400 bg-teal-950/30 hover:border-teal-500 hover:text-teal-300 active:bg-teal-950 transition-all disabled:opacity-40"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Scan photo
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) fetchMacrosFromImage(file);
              e.target.value = "";
            }}
          />
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
            className="disabled:bg-gray-600 disabled:cursor-default flex-1 rounded-lg bg-teal-600 text-white hover:bg-teal-500 active:bg-teal-700 p-3 font-medium  transition-colors hover:cursor-pointer active:scale-105"
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
