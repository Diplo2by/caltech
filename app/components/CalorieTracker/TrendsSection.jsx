"use client";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { convertDecimal } from "@/util/scripts";
import { StatCard } from "./StatCard";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const TIME_RANGES = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 30, label: "30 Days" },
];

export default function TrendsSection({
  trendsData,
  isLoading,
  timeRange,
  setTimeRange,
}) {
  const { daily, macros, goals, topFoods, streak } = trendsData;

  // Prepare chart data
  const calorieChartData = daily.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    calories: day.total_calories || 0,
    goal: goals.find((g) => g.date === day.date)?.daily_goal || 2000,
  }));

  const macroChartData =
    macros.length > 0
      ? [
          {
            name: "Protein",
            value: Math.round(
              macros.reduce(
                (acc, day) => acc + (parseFloat(day.protein_percentage) || 0),
                0
              ) / macros.length
            ),
            color: "#3b82f6",
          },
          {
            name: "Carbs",
            value: Math.round(
              macros.reduce(
                (acc, day) => acc + (parseFloat(day.carbs_percentage) || 0),
                0
              ) / macros.length
            ),
            color: "#10b981",
          },
          {
            name: "Fat",
            value: Math.round(
              macros.reduce(
                (acc, day) => acc + (parseFloat(day.fat_percentage) || 0),
                0
              ) / macros.length
            ),
            color: "#f59e0b",
          },
        ]
      : [];

  if (isLoading) {
    return (
      <motion.section
        className="mt-6 rounded-2xl bg-gray-900/50 border border-gray-800 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading trends...</div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mt-6 rounded-2xl bg-gray-900/50 border border-gray-800 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 sm:mb-0">
          Trends & Analytics
        </h2>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? "bg-white text-black"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Logging Streak"
          value={`${streak} days`}
          subtitle="Keep it up!"
        />
        <StatCard
          title="Avg Calories"
          value={convertDecimal(
            daily.reduce((acc, day) => acc + (day.total_calories || 0), 0) /
              Math.max(daily.length, 1)
          )}
          subtitle="per day"
        />
        <StatCard
          title="Days Logged"
          value={daily.length}
          subtitle={`out of ${timeRange}`}
        />
        <StatCard
          title="Goal Success"
          value={`${Math.round(
            (goals.filter((g) => (g.daily_calories || 0) >= (g.daily_goal || 0))
              .length /
              Math.max(goals.length, 1)) *
              100
          )}%`}
          subtitle="days met goal"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calorie Trends Chart */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-medium mb-4">
            Daily Calories vs Goal
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieChartData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#6B7280"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Distribution */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-medium mb-4">
            Average Macro Distribution
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroChartData}
                  dataKey="value"
                  innerRadius="40%"
                  outerRadius="70%"
                  stroke="none"
                >
                  {macroChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-400">Macros</div>
                <div className="text-sm text-white font-medium">
                  Distribution
                </div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-2">
            {macroChartData.map((macro, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: macro.color }}
                />
                <span className="text-xs text-gray-300">
                  {macro.name}: {macro.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
