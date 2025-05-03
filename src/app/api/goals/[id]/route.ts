// src/app/api/goals/[id]/route.ts (actualizado)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../auth/[...nextauth]/route";

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
    
    // Verificar que la meta pertenece al usuario
    const goal = await prisma.goal.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Meta no encontrada o no autorizada" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { saved, isAchieved } = body;
    
    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        saved: saved !== undefined ? parseFloat(saved) : undefined,
        isAchieved: isAchieved !== undefined ? isAchieved : undefined
      }
    });
    
    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Error al actualizar la meta" },
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
    
    // Verificar que la meta pertenece al usuario
    const goal = await prisma.goal.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Meta no encontrada o no autorizada" },
        { status: 404 }
      );
    }
    
    await prisma.goal.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Error al eliminar la meta" },
      { status: 500 }
    );
  }
}