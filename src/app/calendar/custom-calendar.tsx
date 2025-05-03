"use client";

import { useState } from "react";
import { 
  addMonths, 
  subMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addDays,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CustomCalendarProps = {
  value?: Date;
  onChange?: (date: Date) => void;
  hasEvent?: (date: Date) => boolean;
  className?: string;
  footer?: React.ReactNode;
};

export default function CustomCalendar({ 
  value, 
  onChange, 
  hasEvent, 
  className,
  footer 
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  
  // Días de la semana en español
  const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];
  
  // Obtener el primer y último día del mes actual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Obtener el primer día de la primera semana y el último día de la última semana
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Comienza el lunes
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  // Obtener todos los días del calendario
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Agrupar días en semanas
  const weeks: Date[][] = [];
  let week: Date[] = [];
  
  calendarDays.forEach((day, i) => {
    if (i % 7 === 0 && i !== 0) {
      weeks.push([...week]);
      week = [];
    }
    week.push(day);
    if (i === calendarDays.length - 1) {
      weeks.push([...week]);
    }
  });
  
  // Función para avanzar al mes siguiente
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Función para retroceder al mes anterior
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Función para manejar el clic en un día
  const handleDateClick = (day: Date) => {
    onChange && onChange(day);
  };
  
  const today = new Date();
  
  return (
    <div className={cn("p-4 rounded-lg w-full shadow-sm transition-all duration-200", className)}>
      {/* Encabezado con el nombre del mes y botones de navegación */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="h-9 w-9 rounded-full opacity-70 hover:opacity-100 hover:bg-primary/10 transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Mes anterior</span>
        </Button>
        
        <h2 className="text-lg font-semibold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-9 w-9 rounded-full opacity-70 hover:opacity-100 hover:bg-primary/10 transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Mes siguiente</span>
        </Button>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {diasSemana.map((dia, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
            {dia}
          </div>
        ))}
      </div>
      
      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1.5">
        {weeks.flat().map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = value ? isSameDay(day, value) : false;
          const isToday = isSameDay(day, today);
          const hasEventOnDay = hasEvent ? hasEvent(day) : false;
          
          return (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              className={cn(
                "aspect-square w-full p-0 font-normal rounded-full relative transition-all duration-150",
                !isCurrentMonth && "text-muted-foreground opacity-30",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                isToday && !isSelected && "border border-accent text-accent-foreground font-medium",
                hasEventOnDay && !isSelected && "font-medium",
                "hover:bg-accent/30 hover:text-accent-foreground"
              )}
              onClick={() => handleDateClick(day)}
            >
              {format(day, "d")}
              {hasEventOnDay && !isSelected && (
                <span className="absolute h-1.5 w-1.5 bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="mt-5 pt-3 border-t border-border/30">
          {footer}
        </div>
      )}
    </div>
  );
} 