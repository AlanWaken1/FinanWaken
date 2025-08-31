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
    
    // Verificar que el gasto pertenece al usuario
    const expense = await prisma.expense.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Gasto no encontrado o no autorizado" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { amount, category, description, date } = body;
    
    const updatedExpense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category: category !== undefined ? category : undefined,
        description: description !== undefined ? description : undefined,
        date: date !== undefined ? new Date(date) : undefined
      }
    });
    
    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Error al actualizar el gasto" },
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
    
    // Verificar que el gasto pertenece al usuario
    const expense = await prisma.expense.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Gasto no encontrado o no autorizado" },
        { status: 404 }
      );
    }
    
    await prisma.expense.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Error al eliminar el gasto" },
      { status: 500 }
    );
  }
} 