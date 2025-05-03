"use client"

import React from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  expensesByMonth: Array<{month: string; year: number; total: number}>;
  incomesByMonth: Array<{month: string; year: number; total: number}>;
  [key: string]: any;
}

// Datos de fallback por si no hay datos reales o están vacíos
const FALLBACK_DATA = [
  { name: "Enero", ingresos: 4000, gastos: 2400 },
  { name: "Febrero", ingresos: 4500, gastos: 2800 },
  { name: "Marzo", ingresos: 3800, gastos: 2300 },
  { name: "Abril", ingresos: 5000, gastos: 3000 },
  { name: "Mayo", ingresos: 4200, gastos: 2500 },
  { name: "Junio", ingresos: 4800, gastos: 2700 }
];

export function SimpleFinanceChart({ dashboardData }: { dashboardData: DashboardData | null }) {
  // Preparar los datos para la gráfica si existen
  const chartData = React.useMemo(() => {
    if (!dashboardData?.expensesByMonth?.length || !dashboardData?.incomesByMonth?.length) {
      console.log("Usando datos de fallback");
      return FALLBACK_DATA;
    }
    
    console.log("Usando datos reales");
    
    // Combinar datos de ingresos y gastos
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    const combinedData = [];
    
    // Solo procesamos hasta 6 meses para simplificar
    const maxItems = Math.min(dashboardData.expensesByMonth.length, dashboardData.incomesByMonth.length, 6);
    
    for (let i = 0; i < maxItems; i++) {
      const expense = dashboardData.expensesByMonth[i] || { total: 0 };
      const income = dashboardData.incomesByMonth[i] || { total: 0 };
      
      // Usamos los valores directamente para simplificar
      // Si son cero, usamos un valor mínimo para que se vea algo
      const gastos = expense.total || 50;
      const ingresos = income.total || 100;
      
      // Para el nombre, usamos el mes y año
      const monthIndex = months.indexOf(expense.month) !== -1 ? 
                          months.indexOf(expense.month) : 
                          i;
      const name = `${months[monthIndex % 12]} ${expense.year || new Date().getFullYear()}`;
      
      combinedData.push({
        name,
        ingresos,
        gastos
      });
    }
    
    return combinedData;
  }, [dashboardData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F44336" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F44336" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, undefined]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="ingresos" 
                name="Ingresos"
                stroke="#4CAF50" 
                fillOpacity={1} 
                fill="url(#colorIngresos)" 
              />
              <Area 
                type="monotone" 
                dataKey="gastos" 
                name="Gastos"
                stroke="#F44336" 
                fillOpacity={1} 
                fill="url(#colorGastos)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 