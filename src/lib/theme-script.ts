// src/lib/theme-script.ts

// Script para inyectar en el <head> para evitar parpadeos (FOUC)
export function themeScript() {
    const themeScript = `
      (function() {
        // On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
        document.documentElement.classList.toggle(
          'dark',
          localStorage.theme === 'dark' ||
          (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        );
      })();
    `;
    
    return themeScript;
  }
  
  // Función para activar el modo claro
  export function setLightMode() {
    localStorage.theme = 'light';
    document.documentElement.classList.remove('dark');
  }
  
  // Función para activar el modo oscuro
  export function setDarkMode() {
    localStorage.theme = 'dark';
    document.documentElement.classList.add('dark');
  }
  
  // Función para usar la preferencia del sistema
  export function setSystemMode() {
    localStorage.removeItem('theme');
    document.documentElement.classList.toggle(
      'dark',
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }