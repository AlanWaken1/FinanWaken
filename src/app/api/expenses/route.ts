// src/app/api/expenses/route.ts (actualizado)
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
    const { amount, category, description, date } = body;
    
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        userId: session.user.id
      }
    });
    
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error al crear el gasto:", error);
    return NextResponse.json(
      { error: "Error al crear el gasto" },
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
    
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error al obtener los gastos:", error);
    return NextResponse.json(
      { error: "Error al obtener los gastos" },
      { status: 500 }
    );
  }
}