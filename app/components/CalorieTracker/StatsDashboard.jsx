"use client";
import { motion } from "framer-motion";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { convertDecimal } from "@/util/scripts";

export default function StatsDashboard({
  date,
  setDate,
  goal,
  updateGoal,
  totals,
  remaining,
}) {
  const percentage = Math.round((totals.calories / goal) * 100);
  const isOverGoal = totals.calories > goal;

  const chartData = isOverGoal
    ? [
        { name: "Goal", value: goal },
        { name: "Over", value: totals.calories - goal },
      ]
    : [
        { name: "Consumed", value: totals.calories },
        { name: "Remaining", value: Math.max(goal - totals.calories, 0) },
      ];

  const colors = isOverGoal ? ["#4b5563", "#dc2626"] : ["#4b5563", "#1f2937"];

  return (
    <motion.section
      className="mt-6 grid gap-4 rounded-2xl bg-gray-900/50 border border-gray-800 p-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Inputs */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-400 mb-2 font-medium">Date</label>
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
          onChange={(e) => updateGoal(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-white outline-none focus:border-gray-600 transition-colors"
        />
      </div>

      {/* Totals */}
      <div className="col-span-full lg:col-span-1 grid grid-cols-3 gap-3 text-center">
        <StatCard label="Consumed" value={convertDecimal(totals.calories)} />
        <StatCard
          label="Left"
          value={convertDecimal(remaining)}
          valueClassName={remaining <= 0 ? "text-red-400" : "text-white"}
        />
        <StatCard label="Goal" value={goal} />
      </div>

      {/* Chart */}
      <div className="col-span-full h-48 sm:h-56 lg:h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius="60%"
              outerRadius="85%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {/* Fix: Map colors to data */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isOverGoal ? (
            <>
              <p className="text-2xl font-bold text-red-400">
                {Math.round(((totals.calories - goal) / goal) * 100)}%
              </p>
              <p className="text-xs text-gray-400">over goal</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-white">{percentage}%</p>
              <p className="text-xs text-gray-400">complete</p>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}

const StatCard = ({ label, value, valueClassName = "text-white" }) => (
  <div className="rounded-lg bg-gray-800 border border-gray-700 p-4 px-2">
    <p className="text-xs text-gray-400 font-medium">{label}</p>
    <p className={`text-md font-bold ${valueClassName}`}>{value}</p>
  </div>
);
