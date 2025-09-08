// hooks/useUserData.js
"use client";
import { useState, useEffect } from "react";
import { numberOrZero } from "@/util/scripts";

export function useUserData(isSignedIn) {
    const [goal, setGoal] = useState(2000);
    const [isLoading, setIsLoading] = useState(true);

    async function loadUserData() {
        try {
            setIsLoading(true);
            const res = await fetch("/api/goal");
            const data = await res.json();
            if (data.goal) setGoal(data.goal);
        } catch (error) {
            console.error("Error loading user goal:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (isSignedIn) {
            loadUserData();
        }
    }, [isSignedIn]);

    async function updateGoal(newGoalValue) {
        const newGoal = numberOrZero(newGoalValue);
        const oldGoal = goal;
        setGoal(newGoal); // Optimistic update

        try {
            const res = await fetch("/api/goal", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal: newGoal }),
            });
            if (!res.ok) {
                setGoal(oldGoal); // Revert on failure
                console.error("Failed to update goal");
            }
        } catch (error) {
            setGoal(oldGoal); // Revert on failure
            console.error("Error updating goal:", error);
        }
    }

    return { goal, updateGoal, isLoading };
}