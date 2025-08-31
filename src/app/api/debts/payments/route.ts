// src/app/api/debts/payments/route.ts (actualizado)
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
    const { amount, date, notes, debtId } = body;
    
    // Verificar que la deuda pertenece al usuario
    const debt = await prisma.debt.findUnique({
      where: {
        id: debtId
      }
    });
    
    if (!debt || debt.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Deuda no encontrada o no autorizada" },
        { status: 404 }
      );
    }
    
    // Iniciar una transacción para actualizar el pago y la deuda
    const [payment, updatedDebt] = await prisma.$transaction([
      // Crear el pago
      prisma.debtPayment.create({
        data: {
          amount: parseFloat(amount),
          date: new Date(date),
          notes,
          debtId
        }
      }),
      
      // Actualizar el monto restante de la deuda
      prisma.debt.update({
        where: { id: debtId },
        data: {
          remaining: {
            decrement: parseFloat(amount)
          },
          isPaid: {
            set: debt.remaining <= parseFloat(amount)
          }
        },
        include: {
          payments: true
        }
      })
    ]);
    
    return NextResponse.json({ payment, debt: updatedDebt });
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    return NextResponse.json(
      { error: "Error al registrar el pago" },
      { status: 500 }
    );
  }
}