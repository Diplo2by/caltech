"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { convertDecimal } from "@/util/scripts";

export default function EntriesList({
  entries,
  onEdit,
  onDelete,
  totals,
  editingEntry,
}) {
  const [search, setSearch] = useState("");

  const filteredEntries = useMemo(() => {
    return entries.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [entries, search]);

  return (
    <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
      {/* List Header */}
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-white">Today's entries</h2>
        <div className="ml-auto" />
        <input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-600 transition-colors"
        />
      </div>

      {/* List */}
      <ul className="divide-y divide-gray-800 max-h-72 overflow-y-auto">
        <AnimatePresence>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((item) => (
              <EntryItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                isEditing={editingEntry?.id === item.id}
              />
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No entries found</p>
            </div>
          )}
        </AnimatePresence>
      </ul>

      {/* Macro Totals */}
      <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
        <MacroTotal
          label="Protein"
          value={`${convertDecimal(totals.protein)}g`}
        />
        <MacroTotal label="Carbs" value={`${convertDecimal(totals.carbs)}g`} />
        <MacroTotal label="Fat" value={`${convertDecimal(totals.fat)}g`} />
      </div>
    </div>
  );
}

const EntryItem = ({ item, onEdit, onDelete, isEditing }) => (
  <motion.li
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className={`flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg transition-colors ${
      isEditing ? "bg-gray-800" : "hover:bg-gray-800/50"
    }`}
  >
    <button onClick={() => onEdit(item)} className="flex-1 text-left">
      <p className="font-medium text-white">{item.name}</p>
      <p className="text-sm text-gray-400">
        {item.calories} kcal • P {item.protein} • C {item.carbs} • F {item.fat}
      </p>
    </button>
    <button
      onClick={() => onDelete(item.id)}
      className="rounded-lg bg-red-900/30 border border-red-800 px-3 py-1 text-red-400 text-sm hover:bg-red-900/50 transition-colors"
    >
      Delete
    </button>
  </motion.li>
);

const MacroTotal = ({ label, value }) => (
  <div className="rounded-lg bg-gray-800 border border-gray-700 p-3">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="font-semibold text-white">{value}</p>
  </div>
);
