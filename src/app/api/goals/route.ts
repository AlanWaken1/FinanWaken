// src/app/api/goals/route.ts (actualizado)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../auth/[...nextauth]/route";

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
    const { title, target, saved, deadline, description } = body;
    
    const goal = await prisma.goal.create({
      data: {
        title,
        target: parseFloat(target),
        saved: parseFloat(saved || 0),
        deadline: deadline ? new Date(deadline) : null,
        description,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Error al crear la meta" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Error al obtener las metas" },
      { status: 500 }
    );
  }
}