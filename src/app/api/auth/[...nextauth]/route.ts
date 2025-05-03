// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; // Importado GoogleProvider
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthConfig } from "next-auth"; // Importar tipo
// Opcional: Importar Request si no lo reconoce automáticamente dentro de authorize
// import type { Request } from 'next/server';

// 1. Define tu configuración (como la tenías, pero con el tipo)
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // --- Proveedor de Google Activado ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "", // Asegúrate que estas variables estén en tu .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // --- Proveedor de Credenciales con authorize CORREGIDO ---
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // --- Firma y lógica de authorize CORREGIDAS ---
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>, request: Request): Promise<any | null> {
        console.log("Intentando autorizar con credenciales:", credentials);

        const email = credentials?.email;
        const password = credentials?.password;

        // Validar que email y password sean strings válidos
        if (typeof email !== 'string' || email.trim() === '' || typeof password !== 'string' || password === '') {
          console.error("Authorize: Email o contraseña no son strings válidos o están vacíos.");
          // Puedes lanzar un error personalizado si quieres que se muestre en la página de error
          // import { CredentialsSignin } from "next-auth";
          // throw new CredentialsSignin("Credenciales inválidas.");
          return null;
        }

        // Continuar con la lógica si son strings válidos
        try {
          const user = await prisma.user.findUnique({
            where: { email: email }
          });

          // Usuario no encontrado o no tiene contraseña (puede ser usuario de Google)
          if (!user || !user.password) {
            console.log(`Authorize: Usuario ${email} no encontrado o sin contraseña.`);
            return null;
          }

          // Comparar contraseñas
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            console.log(`Authorize: Contraseña incorrecta para ${email}.`);
            return null;
          }

          console.log(`Authorize: Usuario ${email} autenticado correctamente.`);
          // Éxito: Retornar el objeto usuario esperado por NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };

        } catch (dbError) {
          console.error("Authorize: Error de base de datos:", dbError);
          // throw new Error("Error interno del servidor"); // Podrías lanzar un error genérico
          return null; // O simplemente retornar null
        }
      } // Fin de authorize
    }), // Fin de CredentialsProvider
  ],
  pages: {
    signIn: "/login", // Página de inicio de sesión personalizada
    signOut: "/",      // Página a la que redirigir después de cerrar sesión
    error: "/error",   // Página para mostrar errores de autenticación (ej. credenciales inválidas)
  },
  session: {
    strategy: "jwt", // Usar JWT para manejar la sesión
  },
  callbacks: {
    // Callback de session (probablemente está bien como estaba)
    async session({ session, token }) {
      // Verifica que session.user exista antes de asignarle propiedades
      if (token?.id && session.user) {
        (session.user as any).id = token.id as string; // Castear si es necesario
      }
      return session;
    },
    // --- Callback JWT CORREGIDO ---
    async jwt({ token, user }) {
      // 'user' solo está disponible al iniciar sesión/registrarse
      if (user) {
        // --- AÑADIR ESTA VERIFICACIÓN ---
        // Asegurarse de que user.id existe y es un string antes de asignarlo
        if (typeof user.id === 'string') {
          token.id = user.id; // Asignación segura
        } else {
          // Opcional: Log si user existe pero id no (no debería pasar con CUID de Prisma)
          console.warn("Callback JWT: Objeto 'user' recibido pero 'id' falta o no es string:", user);
        }
        // Aquí también podrías añadir otros datos del usuario al token si los necesitas
        // token.email = user.email;
        // token.name = user.name;
        // token.picture = user.image;
      }
      return token;
    },
  },
  // secret: process.env.AUTH_SECRET, // MUY IMPORTANTE: Define esto en tu .env para producción
  // debug: process.env.NODE_ENV === 'development', // Útil para ver más logs en desarrollo
};

// 2. Llama a NextAuth y desestructura handlers y auth (y otros)
const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// 3. EXPORTA EXPLÍCITAMENTE GET Y POST desde handlers
export const GET = handlers.GET;
export const POST = handlers.POST;

// 4. TAMBIÉN EXPORTA auth (y otros si los necesitas en otras partes)
export { auth, signIn, signOut };