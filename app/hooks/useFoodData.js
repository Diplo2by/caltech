"use client";
import { useState, useEffect } from "react";

export function useFoodData() {
    const [allFoods, setAllFoods] = useState([]);

    useEffect(() => {
        async function loadFoodData() {
            try {
                const res = await fetch("/foods.json");
                const data = await res.json();
                setAllFoods(data);
            } catch (error) {
                console.error("Failed to load food data:", error);
            }
        }
        loadFoodData();
    }, []);

    return { allFoods };
}