// src/app/layout.tsx (actualizado)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { NavDock } from "@/components/navigation/nav-dock";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinanWaken - Control de Finanzas Personales",
  description: "Aplicación para el seguimiento y control de tus finanzas personales",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanWaken",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            document.documentElement.classList.toggle(
              'dark',
              localStorage.theme === 'dark' ||
              (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
            );
          })();
        `,
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
      <meta name="apple-mobile-web-app-title" content="FinanWaken" />
        <ThemeInitScript />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <NavDock />
          </div>
        </Providers>
      </body>
    </html>
  );
}