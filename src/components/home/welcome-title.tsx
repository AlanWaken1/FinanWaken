// src/components/home/welcome-title.tsx
"use client";

import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

export function WelcomeTitle() {
  const words = [
    {
      text: "Bienvenido",
    },
    {
      text: "a",
    },
    {
      text: "FinanWaken",
      className: "text-[#3b82f6] dark:text-[#60a5fa]", // Azul agradable (blue-500 en claro, blue-400 en oscuro)
    },
    {
      text: "tu",
    },
    {
      text: "asistente",
    },
    {
      text: "financiero",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center my-8">
      <TypewriterEffectSmooth 
        words={words} 
        cursorClassName="bg-[#3b82f6] dark:bg-[#60a5fa]" 
      />
      <p className="mt-4 text-center text-muted-foreground max-w-xl">
        Controla tus finanzas personales de manera sencilla y efectiva. Visualiza gastos, ingresos, deudas y metas en un solo lugar.
      </p>
    </div>
  );
}