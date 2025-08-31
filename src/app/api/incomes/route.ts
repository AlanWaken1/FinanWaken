// src/app/api/incomes/route.ts (actualizado)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const { amount, source, date, notes } = body;
    
    const income = await prisma.income.create({
      data: {
        amount: parseFloat(amount),
        source,
        date: new Date(date),
        notes,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(income);
  } catch (error) {
    console.error("Error creating income:", error);
    return NextResponse.json(
      { error: "Error al crear el ingreso" },
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
    
    const incomes = await prisma.income.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    return NextResponse.json(incomes);
  } catch (error) {
    console.error("Error fetching incomes:", error);
    return NextResponse.json(
      { error: "Error al obtener los ingresos" },
      { status: 500 }
    );
  }
}