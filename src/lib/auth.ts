import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
        if (!credentials?.email || !credentials?.password || 
            typeof credentials.email !== 'string' || 
            typeof credentials.password !== 'string') {
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          if (!user || !user.password) {
            return null;
          }
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error de autenticación:", error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        if (typeof user.id === 'string') {
          token.id = user.id;
        } else {
          console.warn("Callback JWT: Objeto 'user' recibido pero 'id' falta o no es string:", user);
        }
      }
      return token;
    },
  },
};

const { auth, signIn, signOut } = NextAuth(authConfig);

export { auth, signIn, signOut }; 