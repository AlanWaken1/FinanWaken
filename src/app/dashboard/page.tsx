// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IconChartBar, IconTrendingUp, IconTrendingDown, IconCoin, IconReceipt, IconCreditCard, IconTarget } from "@tabler/icons-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { SimpleFinanceChart } from "@/components/dashboard/simple-finance-chart";
import { EnhancedFinanceChart } from "@/components/dashboard/enhanced-finance-chart";
import { BasicFinanceChart } from "@/components/dashboard/basic-finance-chart";
import { StyledFinanceChart } from "@/components/dashboard/styled-finance-chart";

// Interfaces
interface MonthData {
  month: string;
  year: number;
  total: number;
}

interface ExpensesByMonth {
  month: string;
  year: number;
  total: number;
}

interface IncomesByMonth {
  month: string;
  year: number;
  total: number;
}

interface ExpensesByCategory {
  category: string;
  amount: number;
}

interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  remaining: number;
  creditor: string;
  isPaid: boolean;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  saved: number;
  isAchieved: boolean;
}

interface DashboardData {
  expensesByMonth: ExpensesByMonth[];
  incomesByMonth: IncomesByMonth[];
  expensesByCategory: ExpensesByCategory[];
  activeDebts: Debt[];
  totalDebts: number;
  activeGoals: Goal[];
  totalGoalsTarget: number;
  totalGoalsSaved: number;
  totalExpensesMonth: number;
  totalIncomesMonth: number;
  balance: number;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Colores para los gráficos
  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
    "#82CA9D", "#FF6B6B", "#C9CB3A", "#6CAAD9", "#B19CD9"
  ];
  
  // Cargar datos del dashboard
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Error al cargar los datos del dashboard");
        }
        const data = await response.json();
        
        // Inspeccionar en detalle los datos para debugging
        console.log("Datos de la API (detalle):", {
          expensesByMonth: data.expensesByMonth ? 
            data.expensesByMonth.map((item: MonthData) => ({ month: item.month, year: item.year, total: item.total })) : 
            'No disponible',
          incomesByMonth: data.incomesByMonth ? 
            data.incomesByMonth.map((item: MonthData) => ({ month: item.month, year: item.year, total: item.total })) : 
            'No disponible'
        });
        
        // Verificar si tenemos datos para la gráfica
        if (!data.expensesByMonth || !data.incomesByMonth) {
          console.log("Faltan datos para la gráfica:", data);
          // Agregar datos de prueba si no hay datos reales
          data.expensesByMonth = generateMockData('expense');
          data.incomesByMonth = generateMockData('income');
        }
        setDashboardData(data);
      } catch (error) {
        console.error("Error:", error);
        // Crear datos simulados en caso de error
        const mockData = createMockDashboardData();
        setDashboardData(mockData);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  
  // Función para generar datos de prueba
  function generateMockData(type: 'expense' | 'income') {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const year = new Date().getFullYear();
    
    return months.map(month => ({
      month,
      year,
      total: Math.round(Math.random() * (type === 'income' ? 5000 : 3000) + 1000)
    }));
  }
  
  // Crear un dashboard completo con datos simulados
  function createMockDashboardData(): DashboardData {
    return {
      expensesByMonth: generateMockData('expense'),
      incomesByMonth: generateMockData('income'),
      expensesByCategory: [
        { category: "Comida", amount: 1250 },
        { category: "Transporte", amount: 800 },
        { category: "Ocio", amount: 450 }
      ],
      activeDebts: [
        { id: "1", title: "Préstamo coche", totalAmount: 15000, remaining: 10000, creditor: "Banco X", isPaid: false }
      ],
      totalDebts: 10000,
      activeGoals: [
        { id: "1", title: "Vacaciones", target: 5000, saved: 2000, isAchieved: false }
      ],
      totalGoalsTarget: 5000,
      totalGoalsSaved: 2000,
      totalExpensesMonth: 2500,
      totalIncomesMonth: 4000,
      balance: 1500
    };
  }
  
  // Preparar datos para el gráfico de ingresos vs gastos
  const prepareIncomeVsExpenseData = () => {
    if (!dashboardData) return [];
    
    return dashboardData.expensesByMonth.map((item, index) => ({
      name: `${item.month} ${item.year}`,
      Gastos: item.total,
      Ingresos: dashboardData.incomesByMonth[index]?.total || 0
    }));
  };
  
  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando datos...</div>;
  }

  console.log('Datos disponibles:', dashboardData);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard Financiero</h1>
        <IconChartBar className="h-8 w-8 text-purple-500" />
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Balance del Mes
            </CardTitle>
            {dashboardData && dashboardData.balance >= 0 ? (
              <IconTrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <IconTrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData && formatCurrency(dashboardData.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData && dashboardData.balance >= 0 
                ? "¡Excelente! Estás ahorrando este mes" 
                : "¡Cuidado! Estás gastando más de lo que ingresas"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Mes
            </CardTitle>
            <IconCoin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData && formatCurrency(dashboardData.totalIncomesMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de ingresos en el mes actual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos del Mes
            </CardTitle>
            <IconReceipt className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData && formatCurrency(dashboardData.totalExpensesMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de gastos en el mes actual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Deudas Activas
            </CardTitle>
            <IconCreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData && formatCurrency(dashboardData.totalDebts)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de {dashboardData?.activeDebts.length} deudas activas
            </p>
          </CardContent>
        </Card>
      </div>
      
{/* Gráfico de Ingresos vs Gastos */}
<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
  <div className="col-span-1 lg:col-span-2">
    <StyledFinanceChart dashboardData={dashboardData} />
  </div>
</div>
      
      {/* Distribución de gastos y Metas */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
        {/* Distribución de gastos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Gastos</CardTitle>
            <CardDescription>
              Por categoría en el mes actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {dashboardData && dashboardData.expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No hay gastos registrados en el mes actual</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Progreso de metas */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Metas</CardTitle>
            <CardDescription>
              Metas de ahorro activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData && dashboardData.activeGoals.length > 0 ? (
                dashboardData.activeGoals.map(goal => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{goal.title}</span>
                      <span>{formatCurrency(goal.saved)} / {formatCurrency(goal.target)}</span>
                    </div>
                    <Progress 
                      value={(goal.saved / goal.target) * 100} 
                      className="h-2"
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No tienes metas activas</p>
              )}
              
              {dashboardData && dashboardData.activeGoals.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total de metas:</span>
                    <span>{formatCurrency(dashboardData.totalGoalsSaved)} / {formatCurrency(dashboardData.totalGoalsTarget)}</span>
                  </div>
                  <Progress 
                    value={(dashboardData.totalGoalsSaved / dashboardData.totalGoalsTarget) * 100} 
                    className="h-2 mt-2"
                  />
                </div>
              )}
               </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Deudas y Balance Global */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
        {/* Lista de deudas */}
        <Card>
          <CardHeader>
            <CardTitle>Deudas Activas</CardTitle>
            <CardDescription>
              Todas tus deudas pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData && dashboardData.activeDebts.length > 0 ? (
                dashboardData.activeDebts.map(debt => (
                  <div key={debt.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{debt.title}</p>
                      <p className="text-sm text-muted-foreground">{debt.creditor}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(debt.remaining)}</p>
                      <p className="text-sm text-muted-foreground">
                        de {formatCurrency(debt.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No tienes deudas activas</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Balance Global */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Global</CardTitle>
            <CardDescription>
              Tu situación financiera general
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Ahorros (Metas):</span>
                  <span>{dashboardData && formatCurrency(dashboardData.totalGoalsSaved)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deudas:</span>
                  <span className="text-red-500">{dashboardData && formatCurrency(dashboardData.totalDebts)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Balance Neto:</span>
                    <span className={dashboardData && (dashboardData.totalGoalsSaved - dashboardData.totalDebts) >= 0 ? "text-green-500" : "text-red-500"}>
                      {dashboardData && formatCurrency(dashboardData.totalGoalsSaved - dashboardData.totalDebts)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Estado Financiero:</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`border rounded-md p-2 text-center ${dashboardData && dashboardData.balance >= 0 ? "bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800" : "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700"}`}>
                    <p className="text-xs">Ahorro Mensual</p>
                    <Badge variant={dashboardData && dashboardData.balance >= 0 ? "default" : "secondary"} className="mt-1">
                      {dashboardData && dashboardData.balance >= 0 ? "Positivo" : "Negativo"}
                    </Badge>
                  </div>
                  <div className={`border rounded-md p-2 text-center ${dashboardData && dashboardData.activeDebts.length === 0 ? "bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800" : dashboardData && dashboardData.totalDebts && dashboardData.totalIncomesMonth && dashboardData.totalDebts <= dashboardData.totalIncomesMonth * 3 ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800" : "bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800"}`}>
                    <p className="text-xs">Nivel de Deuda</p>
                    <Badge 
                      variant={
                        dashboardData && dashboardData.activeDebts.length === 0 
                          ? "default" 
                          : dashboardData && dashboardData.totalDebts && dashboardData.totalIncomesMonth && dashboardData.totalDebts <= dashboardData.totalIncomesMonth * 3 
                            ? "secondary" 
                            : "destructive"
                      } 
                      className="mt-1"
                    >
                      {dashboardData && dashboardData.activeDebts.length === 0 
                        ? "Sin deudas" 
                        : dashboardData && dashboardData.totalDebts && dashboardData.totalIncomesMonth && dashboardData.totalDebts <= dashboardData.totalIncomesMonth * 3 
                          ? "Moderado" 
                          : "Alto"}
                    </Badge>
                  </div>
                  <div className={`border rounded-md p-2 text-center ${dashboardData && (dashboardData.totalGoalsSaved - dashboardData.totalDebts) >= 0 ? "bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800" : "bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800"}`}>
                    <p className="text-xs">Patrimonio</p>
                    <Badge 
                      variant={dashboardData && (dashboardData.totalGoalsSaved - dashboardData.totalDebts) >= 0 ? "default" : "destructive"} 
                      className="mt-1"
                    >
                      {dashboardData && (dashboardData.totalGoalsSaved - dashboardData.totalDebts) >= 0 ? "Positivo" : "Negativo"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Recomendaciones:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {dashboardData && dashboardData.balance < 0 && (
                    <li>Considera reducir tus gastos para mantener un balance positivo.</li>
                  )}
                  {dashboardData && dashboardData.activeDebts.length > 0 && (
                    <li>Prioriza el pago de tus deudas antes de aumentar tus metas de ahorro.</li>
                  )}
                  {dashboardData && dashboardData.expensesByCategory.length > 0 && (
                    <li>Revisa tus gastos en {dashboardData.expensesByCategory[0].category}, es tu categoría con mayor gasto.</li>
                  )}
                  {dashboardData && dashboardData.activeGoals.length === 0 && (
                    <li>Establece metas de ahorro para mejorar tu situación financiera a futuro.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}