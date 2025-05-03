// src/app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }
    
    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    }) as any; // Usar aserción de tipo para evitar errores de TypeScript
    
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inició sesión con proveedor externo" },
        { status: 400 }
      );
    }
    
    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta" },
        { status: 400 }
      );
    }
    
    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar la contraseña
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        password: hashedPassword
      } as any // Usar aserción de tipo para evitar errores de TypeScript
    });
    
    return NextResponse.json(
      { message: "Contraseña actualizada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    return NextResponse.json(
      { error: "Error al cambiar la contraseña" },
      { status: 500 }
    );
  }
}