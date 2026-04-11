"use client";
import { useState, useEffect, useCallback } from "react";

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

  const fetchTrendsData = useCallback(async (signal) => {
    if (!isSignedIn) return;

    setIsLoading(true);
    try {
      const [dailyRes, macrosRes, goalsRes, topFoodsRes, streakRes] = await Promise.all([
        fetch(`/api/trends/daily?days=${timeRange}`, { signal }),
        fetch(`/api/trends/macros?days=${timeRange}`, { signal }),
        fetch(`/api/trends/goals?days=${timeRange}&type=trends`, { signal }),
        fetch(`/api/trends/foods?days=${timeRange}&limit=5`, { signal }),
        fetch(`/api/trends/streak`, { signal })
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
      if (error.name !== "AbortError") {
        console.error("Error fetching trends data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, timeRange]);

  useEffect(() => {
    if (!showTrends || !isSignedIn) return;

    const controller = new AbortController();
    fetchTrendsData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [isSignedIn, timeRange, showTrends, fetchTrendsData]);

  return {
    trendsData,
    isLoading,
    timeRange,
    setTimeRange,
    refreshTrends: () => fetchTrendsData()
  };
}
