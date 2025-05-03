// src/app/api/debts/route.ts (actualizado)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

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
    const { title, totalAmount, remaining, creditor, startDate, dueDate } = body;
    
    const debt = await prisma.debt.create({
      data: {
        title,
        totalAmount: parseFloat(totalAmount),
        remaining: parseFloat(remaining),
        creditor,
        startDate: new Date(startDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(debt);
  } catch (error) {
    console.error("Error creating debt:", error);
    return NextResponse.json(
      { error: "Error al crear la deuda" },
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
    
    const debts = await prisma.debt.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        payments: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    
    return NextResponse.json(debts);
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { error: "Error al obtener las deudas" },
      { status: 500 }
    );
  }
}