// src/components/ui/module-card.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Definimos los colores RGB para cada tipo de módulo
const MODULE_COLORS = {
  expenses: [[220, 38, 38]], // Rojo para gastos
  incomes: [[22, 163, 74]], // Verde para ingresos
  debts: [[234, 88, 12]], // Naranja para deudas
  goals: [[59, 130, 246]], // Azul para metas
  dashboard: [[139, 92, 246]], // Púrpura para dashboard
  default: [[100, 116, 139]], // Gris azulado como color predeterminado
};

// Definimos las clases de fondo para cada tipo
const BG_CLASSES = {
  expenses: "bg-red-800",
  incomes: "bg-green-800",
  debts: "bg-orange-800",
  goals: "bg-blue-800",
  dashboard: "bg-purple-800",
  default: "bg-slate-800",
};

export type ModuleType = "expenses" | "incomes" | "debts" | "goals" | "dashboard" | "default";

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  type: ModuleType;
  className?: string;
}

export function ModuleCard({
  title,
  description,
  href,
  icon,
  type = "default",
  className,
}: ModuleCardProps) {
  const [hovered, setHovered] = React.useState(false);
  
  // Obtener el color correspondiente al tipo de módulo
  const colors = MODULE_COLORS[type] || MODULE_COLORS.default;
  const bgClass = BG_CLASSES[type] || BG_CLASSES.default;
  
  return (
    <Link href={href}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "border border-border group/canvas-card flex flex-col items-center justify-center h-64 p-6 relative transition-all duration-300 hover:shadow-lg rounded-lg",
          className
        )}
      >
        <CardCorners />
        
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 rounded-lg overflow-hidden"
            >
              <CanvasRevealEffect
                animationSpeed={3}
                containerClassName={bgClass}
                colors={colors}
                dotSize={2}
              />
              {/* Gradiente para mejorar la legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-20 flex flex-col items-center text-center">
          <div className="text-4xl mb-4 transition-transform duration-300 group-hover/canvas-card:-translate-y-2">
            {icon}
          </div>
          <h2 className="text-xl font-bold mb-2 transition-colors duration-300 group-hover/canvas-card:text-white">
            {title}
          </h2>
          <p className="text-muted-foreground transition-colors duration-300 group-hover/canvas-card:text-white/80">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Componente para las esquinas decorativas de la tarjeta
function CardCorners() {
  return (
    <>
      <Corner className="absolute h-3 w-3 -top-1.5 -left-1.5" />
      <Corner className="absolute h-3 w-3 -bottom-1.5 -left-1.5 rotate-90" />
      <Corner className="absolute h-3 w-3 -top-1.5 -right-1.5 -rotate-90" />
      <Corner className="absolute h-3 w-3 -bottom-1.5 -right-1.5 rotate-180" />
    </>
  );
}

// Componente para las esquinas
function Corner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
}