// components/CalorieTracker/LoadingScreen.jsx
"use client";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="animate-spin h-8 w-8 border-2 border-gray-700 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </motion.div>
    </div>
  );
}
