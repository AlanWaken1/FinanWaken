// src/app/api/dashboard/route.ts (actualizado)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Obtener total de gastos del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    // Obtener gastos por mes (últimos 6 meses)
    const expensesByMonth = await getExpensesByMonth(userId, 6);
    
    // Obtener ingresos por mes (últimos 6 meses)
    const incomesByMonth = await getIncomesByMonth(userId, 6);
    
    // Obtener gastos por categoría (mes actual)
    const expensesByCategory = await getExpensesByCategory(userId, startOfMonth, endOfMonth);
    
    // Obtener deudas activas
    const activeDebts = await prisma.debt.findMany({
      where: {
        userId,
        isPaid: false
      },
      orderBy: {
        remaining: 'desc'
      }
    });
    
    // Obtener total de deudas
    const totalDebts = activeDebts.reduce((acc, debt) => acc + Number(debt.remaining), 0);
    
    // Obtener metas activas
    const activeGoals = await prisma.goal.findMany({
      where: {
        userId,
        isAchieved: false
      },
      orderBy: {
        target: 'desc'
      }
    });
    
    // Obtener total de metas
    const totalGoalsTarget = activeGoals.reduce((acc, goal) => acc + Number(goal.target), 0);
    const totalGoalsSaved = activeGoals.reduce((acc, goal) => acc + Number(goal.saved), 0);
    
    // Obtener totales del mes
    const totalExpensesMonth = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    const totalIncomesMonth = await prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    return NextResponse.json({
      expensesByMonth,
      incomesByMonth,
      expensesByCategory,
      activeDebts,
      totalDebts,
      activeGoals,
      totalGoalsTarget,
      totalGoalsSaved,
      totalExpensesMonth: totalExpensesMonth._sum.amount || 0,
      totalIncomesMonth: totalIncomesMonth._sum.amount || 0,
      balance: (totalIncomesMonth._sum.amount || 0) - (totalExpensesMonth._sum.amount || 0)
    });
    
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos del dashboard" },
      { status: 500 }
    );
  }
}

// Función para obtener gastos por mes
async function getExpensesByMonth(userId: string, monthsCount: number) {
  const result = [];
  
  for (let i = 0; i < monthsCount; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const total = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    result.push({
      month: startOfMonth.toLocaleString('default', { month: 'short' }),
      year: startOfMonth.getFullYear(),
      total: total._sum.amount || 0
    });
  }
  
  return result.reverse();
}

// Función para obtener ingresos por mes
async function getIncomesByMonth(userId: string, monthsCount: number) {
  const result = [];
  
  for (let i = 0; i < monthsCount; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const total = await prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    result.push({
      month: startOfMonth.toLocaleString('default', { month: 'short' }),
      year: startOfMonth.getFullYear(),
      total: total._sum.amount || 0
    });
  }
  
  return result.reverse();
}

// Función para obtener gastos por categoría
async function getExpensesByCategory(userId: string, startDate: Date, endDate: Date) {
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      category: true,
      amount: true
    }
  });
  
  const categoriesMap = new Map();
  
  expenses.forEach(expense => {
    const category = expense.category;
    const amount = Number(expense.amount);
    
    if (categoriesMap.has(category)) {
      categoriesMap.set(category, categoriesMap.get(category) + amount);
    } else {
      categoriesMap.set(category, amount);
    }
  });
  
  const result = Array.from(categoriesMap.entries()).map(([category, amount]) => ({
    category,
    amount
  }));
  
  return result;
}