// src/components/dashboard/finance-chart.tsx
"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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

// Definir tipos para los datos
interface MonthData {
  month: string;
  year: number;
  total: number;
}

interface ChartItem {
  date: string;
  income: number;
  expense: number;
}

interface DashboardData {
  expensesByMonth: MonthData[];
  incomesByMonth: MonthData[];
  // otros campos que pueda tener dashboardData
}

// Esta función convierte los datos del dashboard a formato para la gráfica
function prepareChartData(expensesByMonth: MonthData[] = [], incomesByMonth: MonthData[] = []): ChartItem[] {
  // Asegurarnos de que tenemos datos para mostrar
  if (!expensesByMonth?.length || !incomesByMonth?.length) {
    return []
  }

  // Combinar los datos de gastos e ingresos por mes
  const chartData: ChartItem[] = []
  
  // Usar los últimos 6 meses o la cantidad disponible
  const monthsToShow = Math.min(expensesByMonth.length, incomesByMonth.length)
  
  for (let i = 0; i < monthsToShow; i++) {
    const expenseData = expensesByMonth[i]
    const incomeData = incomesByMonth[i]
    
    // Solo añadir si tenemos datos para el mismo mes
    if (expenseData && incomeData && expenseData.month === incomeData.month) {
      // Crear una fecha para este mes (usamos el primer día del mes para simplificar)
      const dateStr = `${expenseData.year}-${
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          .indexOf(expenseData.month) + 1
      }-01`
      
      chartData.push({
        date: dateStr,
        income: incomeData.total,
        expense: expenseData.total
      })
    }
  }
  
  return chartData
}

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

export function FinanceChart({ dashboardData }: { dashboardData: DashboardData | null }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("all")
  
  // Preparar los datos para la gráfica
  const chartData = React.useMemo(() => {
    if (!dashboardData) return []
    return prepareChartData(
      dashboardData.expensesByMonth, 
      dashboardData.incomesByMonth
    )
  }, [dashboardData])
  
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
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
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
              fill="url(#fillExpense)"
              stroke="var(--chart-2)"
              stackId="a"
            />
            <Area
              dataKey="income"
              type="monotone"
              fill="url(#fillIncome)"
              stroke="var(--chart-1)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}