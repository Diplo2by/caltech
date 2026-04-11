"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { numberOrZero } from "@/util/scripts";

export function useUserData(isSignedIn) {
    const [goal, setGoal] = useState(2000);
    const [isLoading, setIsLoading] = useState(true);
    const saveTimeoutRef = useRef(null);
    const lastSavedGoalRef = useRef(2000);

    const loadUserData = useCallback(async () => {
        if (!isSignedIn) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const res = await fetch("/api/goal");
            const data = await res.json();
            if (data.goal) {
                setGoal(data.goal);
                lastSavedGoalRef.current = data.goal;
            }
        } catch (error) {
            console.error("Error loading user goal:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isSignedIn]);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const persistGoal = useCallback(async (newGoal) => {
        if (!isSignedIn) return;

        try {
            const res = await fetch("/api/goal", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal: newGoal }),
            });
            if (!res.ok) {
                setGoal(lastSavedGoalRef.current);
                console.error("Failed to update goal");
                return;
            }
            lastSavedGoalRef.current = newGoal;
        } catch (error) {
            setGoal(lastSavedGoalRef.current);
            console.error("Error updating goal:", error);
        }
    }, [isSignedIn]);

    function updateGoal(newGoalValue) {
        const newGoal = numberOrZero(newGoalValue);
        setGoal(newGoal); // Optimistic update

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            persistGoal(newGoal);
        }, 350);
    }

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return { goal, updateGoal, isLoading };
}
