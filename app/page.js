"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@stackframe/stack";
import { todayISO, convertDecimal } from "@/util/scripts"

import { useUserData } from "@/app/hooks/useUserData";
import { useEntries } from "@/app/hooks/useEntries";
import { useFoodData } from "@/app/hooks/useFoodData";

import LoadingScreen from "@/app/components/CalorieTracker/LoadingScreen"
import Header from "@/app/components/CalorieTracker/Header";
import StatsDashboard from "@/app/components/CalorieTracker/StatsDashboard";
import AddFoodForm from "@/app/components/CalorieTracker/AddFoodForm";
import EntriesList from "@/app/components/CalorieTracker/EntriesList";
import { useTrendsData } from "./hooks/useTrendsData";
import TrendsSection from "./components/CalorieTracker/TrendsSection";

export default function CalorieTrackerPage() {
  const user = useUser();
  const isSignedIn = !!user;

  const [date, setDate] = useState(todayISO().sqlDate);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showTrends, setShowTrends] = useState(false)

  const { goal, updateGoal, isLoading: isUserLoading } = useUserData(isSignedIn);
  const { entries, addEntry, updateEntry, deleteEntry } = useEntries(date, isSignedIn);
  const { allFoods } = useFoodData();
  const { trendsData, isLoading: isTrendsLoading, timeRange, setTimeRange } = useTrendsData(isSignedIn, showTrends)

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
        {/* Navigation */}
        <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1 mt-4 mb-6 inline-flex border border-gray-700">
          <div
            className={`absolute top-1 bottom-1 bg-white rounded-xl transition-all duration-300 ease-out shadow-lg ${showTrends ? 'left-1/2 right-1' : 'left-1 right-1/2'
              }`}
          />
          <button
            onClick={() => setShowTrends(false)}
            className={`relative px-8 py-3 rounded-xl font-medium transition-all duration-300 z-10 ${!showTrends
              ? 'text-black'
              : 'text-gray-300 hover:text-white'
              }`}
          >
            Daily Tracker
          </button>
          <button
            onClick={() => setShowTrends(true)}
            className={`relative px-8 py-3 rounded-xl font-medium transition-all duration-300 z-10 ${showTrends
              ? 'text-black'
              : 'text-gray-300 hover:text-white'
              }`}
          >
            Trends & Analytics
          </button>
        </div>

        <main>
          {/* TODO: Add a loading screen for date change */}

          {showTrends ? (
            <TrendsSection
              trendsData={trendsData}
              isLoading={isTrendsLoading}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
          ) : (<>
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
            </motion.section></>)}
        </main>
        <footer className="py-8 mt-8 text-center font-mono">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">
              Made with <span className="text-teal-400 animate-pulse">&lt;3</span> by <span className="text-teal-50">Me</span> & <span className=" text-teal-50">Meg</span>
            </div>
            <div className="text-xs text-gray-500">
              © Copyleft. All Wrongs Reserved. <br />
              Debugging in production since 2025.
            </div>
          </div>
          <div className="flex justify-center items-center space-x-2 mt-4">
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
          </div>
        </footer>
      </div>
    </div>
  );
}