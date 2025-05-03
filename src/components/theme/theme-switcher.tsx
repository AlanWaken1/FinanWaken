// src/components/theme/theme-switcher.tsx
"use client";

import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { setDarkMode, setLightMode, setSystemMode } from "@/lib/theme-script";

export function ThemeSwitcher({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Inicializar el estado del tema desde localStorage cuando el componente se monta
  useEffect(() => {
    if (localStorage.theme === 'dark') {
      setTheme('dark');
    } else if (localStorage.theme === 'light') {
      setTheme('light');
    } else {
      setTheme('system');
    }
  }, []);

  // Función para cambiar el tema
  const toggleTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'dark') {
      setDarkMode();
    } else if (newTheme === 'light') {
      setLightMode();
    } else {
      setSystemMode();
    }
    setTheme(newTheme);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button 
        onClick={() => toggleTheme('light')}
        className={`p-2 rounded-full ${theme === 'light' ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}
        aria-label="Modo claro"
      >
        <IconSun className="h-5 w-5" />
      </button>
      
      <button 
        onClick={() => toggleTheme('dark')}
        className={`p-2 rounded-full ${theme === 'dark' ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}
        aria-label="Modo oscuro"
      >
        <IconMoon className="h-5 w-5" />
      </button>
      
      <button 
        onClick={() => toggleTheme('system')}
        className={`p-2 rounded-full ${theme === 'system' ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}
        aria-label="Usar preferencia del sistema"
      >
        <IconDeviceDesktop className="h-5 w-5" />
      </button>
    </div>
  );
}