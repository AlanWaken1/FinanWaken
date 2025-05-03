// src/components/ui/chart.tsx
"use client"

import React, { createContext, useContext } from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts"

// Definir correctamente ChartConfig como un tipo genérico
export type ChartVariant = "area" | "bar" | "line";

export interface ChartItemConfig {
  label: string;
  color?: string;
  variant?: ChartVariant;
}

export type ChartConfig = Record<string, ChartItemConfig>;

interface ChartContextType {
  config: ChartConfig;
}

const ChartContext = createContext<ChartContextType | null>(null);

function useChartContext() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider");
  }
  return context;
}

interface ChartContainerProps {
  config: ChartConfig;
  data?: any[];
  children: React.ReactElement;
  className?: string;
}

export function ChartContainer({
  config,
  data,
  children,
  className,
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div style={{ width: "100%", height: "100%" }} className={className}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// Solución: Defina un tipo personalizado para los objetos de carga útil de Recharts
interface ChartPayloadItem {
  value: number;
  dataKey: string;
  payload: any;
  fill?: string;
}

// La definición de este tipo es la clave para arreglar los errores
interface CustomTooltipProps<T = any> {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: string;
  indicator?: "dot" | "line";
  formatter?: (value: number, name: string, item: any) => React.ReactNode;
  labelFormatter?: (value: string) => React.ReactNode;
  cursor?: boolean;
}

export function ChartTooltipContent<T = any>({
  active,
  payload,
  label,
  indicator = "dot",
  formatter,
  labelFormatter,
}: CustomTooltipProps<T>) {
  const { config } = useChartContext();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 flex items-center gap-2 border-b pb-2">
          {labelFormatter ? labelFormatter(label || "") : label}
        </div>
        {payload.map((item, index) => {
          const { dataKey } = item;
          const config_item = config[dataKey.toString()];
          if (!config_item) {
            return null;
          }

          return (
            <div
              key={`item-${index}`}
              className="flex items-center gap-2 border-b pb-2 last:border-0"
            >
              {indicator === "dot" && (
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: config_item?.color ?? item.fill,
                  }}
                />
              )}

              {indicator === "line" && (
                <div
                  className="h-1 w-3"
                  style={{
                    backgroundColor: config_item?.color ?? item.fill,
                  }}
                />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground">
                  {config_item?.label}
                </span>
                <span className="text-sm">
                  {formatter
                    ? formatter(item.value, item.dataKey, item.payload)
                    : item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente wrapper para el Tooltip de Recharts
export function ChartTooltip(props: CustomTooltipProps) {
  const { cursor, ...rest } = props;
  return <Tooltip cursor={cursor} content={<ChartTooltipContent {...rest} />} />;
}