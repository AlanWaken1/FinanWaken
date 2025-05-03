// src/components/aceternity/animated-card.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedCardProps = {
  title: string;
  value: number;
  previousValue?: number;
  icon?: React.ReactNode;
  className?: string;
  formatter?: (val: number) => string;
};

export const AnimatedCard = ({ 
  title, 
  value, 
  previousValue, 
  icon, 
  className = "", 
  formatter = (val: number) => `$${val.toLocaleString()}` 
}: AnimatedCardProps) => {
  const percentChange = previousValue 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "p-6 rounded-xl shadow-lg bg-white dark:bg-zinc-800", 
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
          <p className="mt-1 text-2xl font-bold">{formatter(value)}</p>
          
          {previousValue !== undefined && (
            <div className="flex items-center mt-2">
              <span 
                className={cn(
                  "text-xs font-medium", 
                  percentChange >= 0 ? "text-accent-500" : "text-error-500"
                )}
              >
                {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
              </span>
              <span className="ml-1 text-xs text-zinc-400">vs. anterior</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-700">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};