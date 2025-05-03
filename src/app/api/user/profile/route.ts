// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name
      }
    }) as any;
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
} catch (error) {
  console.error("Error updating user profile:", error);
  return NextResponse.json(
    { error: "Error al actualizar el perfil" },
    { status: 500 }
  );
}
}