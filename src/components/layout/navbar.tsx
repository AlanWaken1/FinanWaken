// src/components/layout/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { 
  IconMenu, 
  IconX, 
  IconLayoutDashboard, 
  IconReceipt, 
  IconCoin,
  IconCreditCard,
  IconTarget,
  IconUser,
  IconSettings,
  IconLogout
} from "@tabler/icons-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Detectar scroll para cambiar la apariencia del navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const routes = [
    {
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
      icon: <IconLayoutDashboard className="h-4 w-4" />
    },
    {
      label: "Gastos",
      href: "/expenses",
      active: pathname === "/expenses",
      icon: <IconReceipt className="h-4 w-4" />
    },
    {
      label: "Ingresos",
      href: "/incomes",
      active: pathname === "/incomes",
      icon: <IconCoin className="h-4 w-4" />
    },
    {
      label: "Deudas",
      href: "/debts",
      active: pathname === "/debts",
      icon: <IconCreditCard className="h-4 w-4" />
    },
    {
      label: "Metas",
      href: "/goals",
      active: pathname === "/goals",
      icon: <IconTarget className="h-4 w-4" />
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-200 ${
        scrolled 
          ? "border-b border-border/40 bg-background/85 backdrop-blur-md shadow-sm" 
          : "bg-background/50 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y marca */}
          <div className="flex items-center">
            <Link 
              href={session ? "/dashboard" : "/"} 
              className="flex items-center space-x-2 transition-transform hover:scale-105"
            >
              {/* Logo SVG o imagen */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">F</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                FinanWaken
              </span>
            </Link>
          </div>

          {/* Navegación escritorio - Solo mostrar si hay sesión */}
          {session && (
            <nav className="hidden md:flex items-center space-x-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    route.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  {route.icon}
                  <span>{route.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Controles derecha */}
          <div className="flex items-center space-x-3">
            {/* Cambio de tema con tooltip mejorado */}
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            
            {/* Perfil de usuario o botones de autenticación */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden border border-border/50 hover:border-border">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary-foreground/20 text-primary-foreground">
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={8}
                  className="w-64 p-2 rounded-xl"
                >
                  <div className="flex flex-col p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary-foreground/20 text-primary-foreground">
                          {session.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        {session.user?.name && (
                          <p className="font-semibold text-sm">{session.user.name}</p>
                        )}
                        {session.user?.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <Link href="/profile">
                      <IconUser className="h-4 w-4 text-muted-foreground" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <Link href="/settings">
                      <IconSettings className="h-4 w-4 text-muted-foreground" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 py-1.5 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  >
                    <IconLogout className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:flex"
                  asChild
                >
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white"
                  asChild
                >
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            )}
            
            {/* Theme switcher para móvil */}
            <div className="sm:hidden">
              <ThemeSwitcher />
            </div>
            
            {/* Botón de menú móvil - Solo mostrar si hay sesión */}
            {session && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMenu}
                className="md:hidden"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <IconX className="h-5 w-5" />
                ) : (
                  <IconMenu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Menú móvil con animación - Solo mostrar si hay sesión */}
      {session && (
        <div 
          className={`md:hidden fixed inset-x-0 top-16 z-50 transition-all duration-300 transform ${
            isMenuOpen 
              ? "translate-y-0 opacity-100" 
              : "-translate-y-10 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-popover/95 border-b border-border/40 backdrop-blur-md shadow-lg overflow-hidden">
            <div className="container mx-auto px-4 py-4">
              {/* Enlaces de navegación */}
              <nav className="grid gap-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`flex items-center justify-between p-3 text-sm font-medium rounded-lg ${
                      route.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      {route.icon}
                      <span>{route.label}</span>
                    </div>
                    <div className="opacity-70">›</div>
                  </Link>
                ))}
              </nav>
              
              {/* Información de usuario o autenticación */}
              {session ? (
                <div className="mt-4 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary-foreground/20 text-primary-foreground">
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium text-sm">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link
                      href="/profile"
                      className="flex items-center justify-center gap-2 p-2 text-xs font-medium border border-border rounded-md hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconUser className="h-3.5 w-3.5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center justify-center gap-2 p-2 text-xs font-medium border border-border rounded-md hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconSettings className="h-3.5 w-3.5" />
                      <span>Configuración</span>
                    </Link>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <IconLogout className="h-3.5 w-3.5 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}