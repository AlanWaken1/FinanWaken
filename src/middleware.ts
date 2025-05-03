// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const isAuthenticated = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/register");

  // Rutas que requieren autenticación
  const protectedRoutes = [
    "/dashboard",
    "/expenses",
    "/incomes",
    "/debts",
    "/goals",
    "/profile",
    "/settings",
    "/calendar",
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirigir a login si no está autenticado y la ruta es protegida
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirigir al dashboard si ya está autenticado y trata de acceder a las páginas de autenticación
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/incomes/:path*",
    "/debts/:path*",
    "/goals/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/calendar/:path*",
    "/login",
    "/register",
  ],
};