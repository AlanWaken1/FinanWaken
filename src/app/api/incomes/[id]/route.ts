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
    
    // Verificar que el ingreso pertenece al usuario
    const income = await prisma.income.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!income || income.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Ingreso no encontrado o no autorizado" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { amount, source, date, notes } = body;
    
    const updatedIncome = await prisma.income.update({
      where: { id: params.id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        source: source !== undefined ? source : undefined,
        date: date !== undefined ? new Date(date) : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error("Error updating income:", error);
    return NextResponse.json(
      { error: "Error al actualizar el ingreso" },
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
    
    // Verificar que el ingreso pertenece al usuario
    const income = await prisma.income.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!income || income.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Ingreso no encontrado o no autorizado" },
        { status: 404 }
      );
    }
    
    await prisma.income.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json(
      { error: "Error al eliminar el ingreso" },
      { status: 500 }
    );
  }
} 