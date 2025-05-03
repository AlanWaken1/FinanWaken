// src/app/api/debts/[id]/route.ts (actualizado)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    // Verificar que la deuda pertenece al usuario
    const debt = await prisma.debt.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!debt || debt.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Deuda no encontrada o no autorizada" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { remaining, isPaid } = body;
    
    const updatedDebt = await prisma.debt.update({
      where: { id: params.id },
      data: {
        remaining: remaining !== undefined ? parseFloat(remaining) : undefined,
        isPaid: isPaid !== undefined ? isPaid : undefined
      }
    });
    
    return NextResponse.json(updatedDebt);
  } catch (error) {
    console.error("Error updating debt:", error);
    return NextResponse.json(
      { error: "Error al actualizar la deuda" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    // Verificar que la deuda pertenece al usuario
    const debt = await prisma.debt.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!debt || debt.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Deuda no encontrada o no autorizada" },
        { status: 404 }
      );
    }
    
    // Eliminar la deuda y sus pagos asociados (cascada)
    await prisma.debt.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting debt:", error);
    return NextResponse.json(
      { error: "Error al eliminar la deuda" },
      { status: 500 }
    );
  }
}