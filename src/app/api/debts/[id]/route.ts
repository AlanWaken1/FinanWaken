// src/app/api/debts/[id]/route.ts (actualizado)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const { title, totalAmount, remaining, creditor, startDate, dueDate } = body;
    
    const updatedDebt = await prisma.debt.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : undefined,
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : undefined,
        remaining: remaining !== undefined ? parseFloat(remaining) : undefined,
        creditor: creditor !== undefined ? creditor : undefined,
        startDate: startDate !== undefined ? new Date(startDate) : undefined,
        dueDate: dueDate !== undefined ? new Date(dueDate) : undefined
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
  context: { params: { id: string } }
): Promise<Response> {
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
        id: context.params.id
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
      where: { id: context.params.id }
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