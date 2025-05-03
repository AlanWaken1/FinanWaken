"use client"

import * as React from "react"
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface DashboardData {
  expensesByMonth: Array<{month: string; year: number; total: number}>;
  incomesByMonth: Array<{month: string; year: number; total: number}>;
  [key: string]: any;
}

// Datos de fallback si no hay datos reales
const FALLBACK_DATA = [
  { date: "2024-01-01", income: 4000, expense: 2400 },
  { date: "2024-02-01", income: 4500, expense: 2800 },
  { date: "2024-03-01", income: 3800, expense: 2300 },
  { date: "2024-04-01", income: 5000, expense: 3000 },
  { date: "2024-05-01", income: 4200, expense: 2500 },
  { date: "2024-06-01", income: 4800, expense: 2700 }
];

// Mejorar el rango de colores para un aspecto más moderno
const COLORS = {
  income: {
    main: "hsl(142, 76%, 36%)", // Verde un poco más saturado
    light: "hsl(142, 76%, 46%)",
    gradient: {
      start: "hsl(142, 76%, 46%)",
      end: "hsla(142, 76%, 46%, 0.05)"
    }
  },
  expense: {
    main: "hsl(0, 72%, 51%)", // Rojo un poco más vibrante
    light: "hsl(0, 72%, 61%)",
    gradient: {
      start: "hsl(0, 72%, 51%)",
      end: "hsla(0, 72%, 51%, 0.05)"
    }
  },
  grid: "hsla(0, 0%, 100%, 0.07)",
  tooltip: {
    bg: "hsla(0, 0%, 0%, 0.85)",
    border: "hsla(0, 0%, 100%, 0.1)"
  }
};

export function StyledFinanceChart({ dashboardData }: { dashboardData: DashboardData | null }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("all")
  
  // Preparar los datos para el gráfico
  const chartData = React.useMemo(() => {
    if (!dashboardData?.expensesByMonth?.length || !dashboardData?.incomesByMonth?.length) {
      console.log("Usando datos de fallback");
      return FALLBACK_DATA;
    }
    
    console.log("Usando datos reales");
    
    // Combinar datos de ingresos y gastos
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const combinedData = [];
    
    // Solo procesamos hasta 6 meses para simplificar
    const maxItems = Math.min(dashboardData.expensesByMonth.length, dashboardData.incomesByMonth.length, 6);
    
    for (let i = 0; i < maxItems; i++) {
      const expense = dashboardData.expensesByMonth[i] || { total: 0 };
      const income = dashboardData.incomesByMonth[i] || { total: 0 };
      
      // Asegurarnos de tener valores válidos para la visualización
      const expenseValue = expense.total || 100;
      const incomeValue = income.total || 200;
      
      // Construir la fecha basada en mes y año
      const monthIndex = months.indexOf(expense.month) !== -1 ? 
                          months.indexOf(expense.month) : 
                          i;
      const dateStr = `${expense.year || new Date().getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      
      combinedData.push({
        date: dateStr,
        income: incomeValue,
        expense: expenseValue
      });
    }
    
    console.log("Datos procesados:", combinedData);
    return combinedData;
  }, [dashboardData]);
  
  // Filtrar datos según el rango de tiempo seleccionado
  const filteredData = React.useMemo(() => {
    if (!chartData.length) return []
    
    if (timeRange === "all") {
      return chartData
    }
    
    const now = new Date()
    let monthsToSubtract = 12
    
    if (timeRange === "6m") {
      monthsToSubtract = 6
    } else if (timeRange === "3m") {
      monthsToSubtract = 3
    }
    
    const startDate = new Date(now)
    startDate.setMonth(now.getMonth() - monthsToSubtract)
    
    return chartData.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate
    })
  }, [chartData, timeRange])

  // Generar IDs únicos para gradientes (para evitar conflictos)
  const incomeGradientId = React.useId() + "-income-gradient"
  const expenseGradientId = React.useId() + "-expense-gradient"
  const areaGradientId = React.useId() + "-area-gradient"

  return (
    <Card className="@container/card overflow-hidden">
      <CardHeader className="relative pb-2">
        <CardTitle className="text-xl font-bold">Ingresos vs Gastos</CardTitle>
        <CardDescription className="text-muted-foreground">
          <span className="@[540px]/card:block hidden">
            Comparativa de ingresos y gastos
          </span>
          <span className="@[540px]/card:hidden">Ingresos vs Gastos</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="all" className="h-8 px-2.5 text-xs">
              Todo
            </ToggleGroupItem>
            <ToggleGroupItem value="6m" className="h-8 px-2.5 text-xs">
              Últimos 6 meses
            </ToggleGroupItem>
            <ToggleGroupItem value="3m" className="h-8 px-2.5 text-xs">
              Últimos 3 meses
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40 h-8 text-xs"
              aria-label="Seleccionar rango de tiempo"
            >
              <SelectValue placeholder="Todo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg text-xs">
                Todo
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg text-xs">
                Últimos 6 meses
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg text-xs">
                Últimos 3 meses
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-2 pb-0">
        <div className="w-full h-[350px] bg-gradient-to-b from-transparent to-background/20 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 20, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.income.gradient.start} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.income.gradient.end} stopOpacity={1} />
                </linearGradient>
                <linearGradient id={expenseGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.expense.gradient.start} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.expense.gradient.end} stopOpacity={1} />
                </linearGradient>
                <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.05)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3" 
                stroke={COLORS.grid} 
                strokeOpacity={0.7}
              />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('es-ES', { 
                    month: 'short'
                  });
                }}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  opacity: 0.8
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={50}
                tickFormatter={(value) => {
                  if (value < 1000) return `$${value}`;
                  return `$${(value / 1000).toFixed(0)}k`;
                }}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  opacity: 0.8
                }}
                hide={isMobile}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: COLORS.tooltip.bg,
                  borderRadius: '0.75rem',
                  border: `1px solid ${COLORS.tooltip.border}`,
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  padding: '0.75rem',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                  backdropFilter: 'blur(8px)'
                }}
                itemStyle={{
                  padding: '2px 0'
                }}
                formatter={(value, name) => {
                  return [
                    `$${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    name === 'income' ? 'Ingresos' : 'Gastos'
                  ];
                }}
                labelFormatter={(value) => {
                  const date = new Date(value as string);
                  return date.toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric'
                  });
                }}
                cursor={{
                  stroke: 'rgba(255,255,255,0.15)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4'
                }}
              />
              <Area 
                type="natural" 
                dataKey="income" 
                name="income" 
                stroke={COLORS.income.main} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill={`url(#${incomeGradientId})`}
                activeDot={{ 
                  r: 6, 
                  fill: COLORS.income.light,
                  strokeWidth: 2,
                  stroke: 'rgba(255, 255, 255, 0.4)'
                }}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Area 
                type="natural" 
                dataKey="expense" 
                name="expense" 
                stroke={COLORS.expense.main} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill={`url(#${expenseGradientId})`}
                activeDot={{ 
                  r: 6, 
                  fill: COLORS.expense.light,
                  strokeWidth: 2,
                  stroke: 'rgba(255, 255, 255, 0.4)'
                }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Leyenda personalizada */}
        <div className="flex items-center justify-center space-x-8 p-4 pt-0">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.income.main }}></div>
            <span className="text-xs text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.expense.main }}></div>
            <span className="text-xs text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 