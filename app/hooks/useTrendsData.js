"use client";
import { useState, useEffect } from "react";

export function useTrendsData(isSignedIn, showTrends) {
  const [trendsData, setTrendsData] = useState({
    daily: [],
    weekly: [],
    macros: [],
    goals: [],
    topFoods: [],
    streak: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(7);

  const fetchTrendsData = async () => {
    if (!isSignedIn) return;

    setIsLoading(true);
    try {
      const [dailyRes, macrosRes, goalsRes, topFoodsRes, streakRes] = await Promise.all([
        fetch(`/api/trends/daily?days=${timeRange}`),
        fetch(`/api/trends/macros?days=${timeRange}`),
        fetch(`/api/trends/goals?days=${timeRange}&type=trends`),
        fetch(`/api/trends/foods?days=${timeRange}&limit=5`),
        fetch(`/api/trends/streak`)
      ]);

      const [daily, macros, goals, topFoods, streak] = await Promise.all([
        dailyRes.json(),
        macrosRes.json(),
        goalsRes.json(),
        topFoodsRes.json(),
        streakRes.json()
      ]);

      setTrendsData({
        daily: daily.data || [],
        macros: macros.data || [],
        goals: goals.data || [],
        topFoods: topFoods.data || [],
        streak: streak.streak || 0
      });
    } catch (error) {
      console.error("Error fetching trends data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showTrends) {
      fetchTrendsData();
    }
  }, [isSignedIn, timeRange, showTrends]);

  return {
    trendsData,
    isLoading,
    timeRange,
    setTimeRange,
    refreshTrends: fetchTrendsData
  };
}