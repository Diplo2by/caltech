// app/page.jsx
"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@stackframe/stack";
import { todayISO, convertDecimal } from "@/util/scripts"

// Custom Hooks
import { useUserData } from "@/app/hooks/useUserData";
import { useEntries } from "@/app/hooks/useEntries";
import { useFoodData } from "@/app/hooks/useFoodData";

// Components
import LoadingScreen from "@/app/components/CalorieTracker/LoadingScreen"
import Header from "@/app/components/CalorieTracker/Header";
import StatsDashboard from "@/app/components/CalorieTracker/StatsDashboard";
import AddFoodForm from "@/app/components/CalorieTracker/AddFoodForm";
import EntriesList from "@/app/components/CalorieTracker/EntriesList";

export default function CalorieTrackerPage() {
  const user = useUser();
  const isSignedIn = !!user;

  const [date, setDate] = useState(todayISO());
  const [editingEntry, setEditingEntry] = useState(null); // State for the entry being edited

  // Custom hooks for data and state management
  const { goal, updateGoal, isLoading: isUserLoading } = useUserData(isSignedIn);
  const { entries, addEntry, updateEntry, deleteEntry } = useEntries(date, isSignedIn);
  const { allFoods } = useFoodData();

  // Memoized calculations for daily totals
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        acc.calories += e.calories || 0;
        acc.protein += e.protein || 0;
        acc.carbs += e.carbs || 0;
        acc.fat += e.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  const remaining = Math.max(goal - totals.calories, 0);

  if (isUserLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <Header date={date} />

        <main>
          {/* TODO: Add a loading screen for date change */}
          <StatsDashboard
            date={date}
            setDate={setDate}
            goal={goal}
            updateGoal={updateGoal}
            totals={totals}
            remaining={remaining}
          />

          <motion.section
            className="mt-6 grid gap-6 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AddFoodForm
              date={date}
              addEntry={addEntry}
              updateEntry={updateEntry}
              editingEntry={editingEntry}
              setEditingEntry={setEditingEntry}
              allFoods={allFoods}
            />
            <EntriesList
              entries={entries}
              onEdit={setEditingEntry}
              onDelete={deleteEntry}
              totals={totals}
              editingEntry={editingEntry}
            />
          </motion.section>
        </main>

        <footer className="py-6 mt-4 text-center text-xs text-gray-600">
          <div className="w-1 h-1 bg-gray-700 rounded-full mx-auto"></div>
        </footer>
      </div>
    </div>
  );
}