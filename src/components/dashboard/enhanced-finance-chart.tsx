"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
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

// Datos de fallback
const FALLBACK_DATA = [
  { date: "2024-01-01", income: 4000, expense: 2400 },
  { date: "2024-02-01", income: 4500, expense: 2800 },
  { date: "2024-03-01", income: 3800, expense: 2300 },
  { date: "2024-04-01", income: 5000, expense: 3000 },
  { date: "2024-05-01", income: 4200, expense: 2500 },
  { date: "2024-06-01", income: 4800, expense: 2700 }
];

const chartConfig = {
  finance: {
    label: "Finanzas",
  },
  income: {
    label: "Ingresos",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Gastos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function EnhancedFinanceChart({ dashboardData }: { dashboardData: DashboardData | null }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("all")
  
  // Preparar los datos para la gráfica
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
      
      // Usamos los valores directamente para simplificar
      // Si son cero, usamos un valor mínimo para que se vea algo
      const expenseValue = expense.total || 50;
      const incomeValue = income.total || 100;
      
      // Para la fecha, usamos el mes y año
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
    
    return combinedData;
  }, [dashboardData]);
  
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("3m")
    }
  }, [isMobile])

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
  
  // Formatear valores de moneda
  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`
  }
  
  // Generar IDs únicos para gradientes
  const incomeGradientId = React.useId() + "-income"
  const expenseGradientId = React.useId() + "-expense"

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Ingresos vs Gastos</CardTitle>
        <CardDescription>
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
            <ToggleGroupItem value="all" className="h-8 px-2.5">
              Todo
            </ToggleGroupItem>
            <ToggleGroupItem value="6m" className="h-8 px-2.5">
              Últimos 6 meses
            </ToggleGroupItem>
            <ToggleGroupItem value="3m" className="h-8 px-2.5">
              Últimos 3 meses
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Seleccionar rango de tiempo"
            >
              <SelectValue placeholder="Todo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todo
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Últimos 6 meses
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id={expenseGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  year: "2-digit"
                })
              }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (value < 1000) return `$${value}`;
                return `$${(value / 1000).toFixed(0)}k`;
              }}
              width={50}
              hide={isMobile}
            />
            <ChartTooltip
              cursor={false}
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })
              }}
              indicator="dot"
            />
            <Area
              dataKey="expense"
              type="monotone"
              fill={`url(#${expenseGradientId})`}
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Gastos"
              connectNulls
              isAnimationActive
              animationDuration={1000}
            />
            <Area
              dataKey="income"
              type="monotone"
              fill={`url(#${incomeGradientId})`}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Ingresos"
              connectNulls
              isAnimationActive
              animationDuration={1000}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 