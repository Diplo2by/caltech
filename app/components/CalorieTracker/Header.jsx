"use client";
import { motion } from "framer-motion";
import { UserButton, useUser } from "@stackframe/stack";
import { todayISO } from "@/util/scripts";

export default function Header({ date }) {
  const user = useUser();

  return (
    <motion.header
      className="pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-800"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Calibra</h1>
        <p className="text-sm text-gray-400">{user?.primaryEmail}</p>
      </div>
      <div className="mt-2 sm:mt-0 text-sm text-gray-500">
        {todayISO().weekDay}
      </div>
      <div className=" text-teal-900">
        <UserButton />
      </div>
    </motion.header>
  );
}
