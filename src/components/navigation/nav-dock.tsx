// src/components/navigation/nav-dock.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconReceipt,
  IconCoin,
  IconCreditCard,
  IconTarget,
  IconChartBar,
  IconCalendarEvent
} from "@tabler/icons-react";

export function NavDock() {
  const { data: session } = useSession();

  // Definimos los enlaces para usuarios no autenticados
  const publicLinks = [
    {
      title: "Inicio",
      icon: <IconHome className="h-full w-full text-[var(--color-foreground)]" />,
      href: "/",
    },
  ];

  // Definimos los enlaces para usuarios autenticados
  const authLinks = [
    {
      title: "Dashboard",
      icon: <IconChartBar className="h-full w-full text-[var(--color-foreground)]" />,
      href: "/dashboard",
    },
    {
      title: "Gastos",
      icon: <IconReceipt className="h-full w-full text-[var(--color-foreground)]" />,
      href: "/expenses",
    },
    {
      title: "Ingresos",
      icon: <IconCoin className="h-full w-full text-[var(--color-foreground)]" />,
      href: "/incomes",
    },
    {
      title: "Deudas",
      icon: <IconCreditCard className="h-full w-full text-[var(--color-foreground)]" />,
      href: "/debts",
    },
    {
      title: "Metas",
      icon: <IconTarget className="h-full w-full text-[var(--color-foreground)]" />,
      href: "/goals",
    },
    {
      title: "Calendario",
      icon: <IconCalendarEvent className="h-full w-full text-[var(--color-foreground)]" />,
      href: "/calendar",
    },
  ];

  // Seleccionamos qué enlaces mostrar según el estado de autenticación
  const links = session ? authLinks : publicLinks;

  return (
    <FloatingDock
      items={links}
      desktopClassName="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      mobileClassName="fixed bottom-6 right-6 z-50"
    />
  );
}