"use client";
import { useState, useEffect } from "react";

let cachedFoods = null;
let foodsRequest = null;

export function useFoodData() {
    const [allFoods, setAllFoods] = useState([]);

    useEffect(() => {
        async function loadFoodData() {
            if (cachedFoods) {
                setAllFoods(cachedFoods);
                return;
            }
            try {
                if (!foodsRequest) {
                    foodsRequest = fetch("/foods.json").then((res) => res.json());
                }

                const data = await foodsRequest;
                cachedFoods = data;
                setAllFoods(data);
            } catch (error) {
                console.error("Failed to load food data:", error);
            }
        }
        loadFoodData();
    }, []);

    return { allFoods };
}
