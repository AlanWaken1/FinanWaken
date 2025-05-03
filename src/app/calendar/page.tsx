"use client";

import { useEffect, useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarPlus, Filter, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import CustomCalendar from "./custom-calendar";

// Tipos para los eventos
type EventCategory = "income" | "expense" | "debt" | "goal";

interface Event {
  id: string;
  title: string;
  date: string; // ISO format
  category: EventCategory;
  amount: number;
  description?: string;
  completed?: boolean;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<EventCategory[]>(["income", "expense", "debt", "goal"]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Formulario para añadir eventos
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    title: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    category: "expense",
    amount: 0,
    description: "",
  });
  
  // Cargar los eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Simulamos una carga desde una API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar eventos de prueba
        const mockEvents = generateMockEvents();
        setEvents(mockEvents);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        toast.error("No se pudieron cargar los eventos");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Generar eventos de prueba
  const generateMockEvents = (): Event[] => {
    const today = new Date();
    const mockEvents: Event[] = [];
    
    // Eventos para el mes actual
    for (let i = 1; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - 5 + i);
      
      const categories: EventCategory[] = ["income", "expense", "debt", "goal"];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      mockEvents.push({
        id: `event-${i}`,
        title: getDefaultTitle(category),
        date: date.toISOString(),
        category,
        amount: Math.floor(Math.random() * 10000) / 100,
        description: `Descripción del evento ${i}`,
        completed: Math.random() > 0.5,
      });
    }
    
    return mockEvents;
  };
  
  // Obtener título por defecto según la categoría
  const getDefaultTitle = (category: EventCategory): string => {
    switch (category) {
      case "income":
        return "Ingreso";
      case "expense":
        return "Gasto";
      case "debt":
        return "Deuda";
      case "goal":
        return "Meta";
      default:
        return "Evento";
    }
  };
  
  // Comprobar si hay eventos en una fecha específica
  const hasEventOnDate = (date: Date): boolean => {
    return events.some(
      (event) => 
        isSameDay(parseISO(event.date), date) && 
        activeFilters.includes(event.category)
    );
  };
  
  // Filtrar eventos para la fecha seleccionada
  const eventsOnSelectedDate = events.filter(
    (event) => 
      isSameDay(parseISO(event.date), selectedDate) && 
      activeFilters.includes(event.category)
  );
  
  // Manejar cambio de filtros
  const handleFilterChange = (value: string[]) => {
    setActiveFilters(value as EventCategory[]);
  };
  
  // Manejar cambio en el formulario de nuevo evento
  const handleNewEventChange = (field: keyof Omit<Event, "id">, value: any) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Manejar adición de un nuevo evento
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    
    const event: Event = {
      ...newEvent,
      id: `event-${Date.now()}`,
      date: new Date(newEvent.date).toISOString(),
    };
    
    setEvents((prev) => [...prev, event]);
    setIsAddingEvent(false);
    toast.success("Evento añadido correctamente");
    
    // Resetear formulario
    setNewEvent({
      title: "",
      date: format(selectedDate, "yyyy-MM-dd"),
      category: "expense",
      amount: 0,
      description: "",
    });
  };
  
  // Manejar eliminación de un evento
  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    toast.success("Evento eliminado correctamente");
  };
  
  // Manejar cambio de estado completado
  const handleToggleCompleted = (id: string) => {
    setEvents((prev) => 
      prev.map((event) => 
        event.id === id ? { ...event, completed: !event.completed } : event
      )
    );
  };
  
  // Obtener color según la categoría
  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case "income":
        return "bg-green-100 text-green-700 border-green-200";
      case "expense":
        return "bg-red-100 text-red-700 border-red-200";
      case "debt":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "goal":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  
  // Obtener icono según la categoría
  const getCategoryIcon = (category: EventCategory) => {
    switch (category) {
      case "income":
        return "💰";
      case "expense":
        return "💸";
      case "debt":
        return "💳";
      case "goal":
        return "🎯";
      default:
        return "📅";
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col-reverse md:flex-row gap-8">
        <div className="w-full md:w-2/3 space-y-6">
          <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-background/50 pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold">Eventos</CardTitle>
                  <CardDescription>
                    {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 font-medium hover:bg-primary/10" 
                  onClick={() => setIsAddingEvent(true)}
                >
                  <Plus className="h-4 w-4" />
                  Añadir
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : eventsOnSelectedDate.length > 0 ? (
                <ScrollArea className="h-[400px] px-6 pb-2">
                  <div className="space-y-4 pt-4">
                    {eventsOnSelectedDate.map((event) => (
                      <div 
                        key={event.id} 
                        className={`
                          p-4 rounded-lg border border-border/50 
                          ${event.completed ? 'opacity-70' : 'opacity-100'} 
                          transition-all duration-200 hover:shadow-sm
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge 
                                variant="outline" 
                                className={`${getCategoryColor(event.category)} px-2 py-0.5 text-xs capitalize flex items-center gap-1`}
                              >
                                <span>{getCategoryIcon(event.category)}</span>
                                {event.category}
                              </Badge>
                              {event.completed && (
                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                                  Completado
                                </Badge>
                              )}
                            </div>
                            <h3 className={`text-base font-semibold ${event.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <p className={`text-sm mt-2 font-medium ${event.category === 'income' ? 'text-green-600' : event.category === 'expense' ? 'text-red-600' : 'text-primary'}`}>
                              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(event.amount)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-slate-100">
                                  <span className="sr-only">Acciones</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="12" cy="5" r="1"/>
                                    <circle cx="12" cy="19" r="1"/>
                                  </svg>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-1.5">
                                <div className="space-y-0.5">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-sm font-normal h-9"
                                    onClick={() => handleToggleCompleted(event.id)}
                                  >
                                    {event.completed ? 'Marcar pendiente' : 'Marcar completo'}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="w-full justify-start text-sm font-normal h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="bg-slate-100 rounded-full p-3 mb-4">
                    <CalendarPlus className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No hay eventos para este día</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-4">
                    No tienes ningún evento programado para esta fecha. Puedes añadir uno nuevo haciendo clic en el botón.
                  </p>
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => setIsAddingEvent(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Añadir evento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-md col-span-2 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Resumen mensual</CardTitle>
                <CardDescription>
                  Distribución de eventos por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["income", "expense", "debt", "goal"].map((category) => {
                    const count = events.filter(e => e.category === category).length;
                    const total = events
                      .filter(e => e.category === category)
                      .reduce((sum, e) => sum + e.amount, 0);
                      
                    return (
                      <div 
                        key={category} 
                        className={`p-4 rounded-lg border ${
                          category === 'income' ? 'border-green-200 bg-green-50' : 
                          category === 'expense' ? 'border-red-200 bg-red-50' : 
                          category === 'debt' ? 'border-blue-200 bg-blue-50' :
                          'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span>{getCategoryIcon(category as EventCategory)}</span>
                          <span className="text-sm font-medium capitalize">{category}</span>
                        </div>
                        <div className="text-xl font-bold">
                          {count}
                        </div>
                        <div className={`text-sm ${
                          category === 'income' ? 'text-green-600' : 
                          category === 'expense' ? 'text-red-600' : 
                          category === 'debt' ? 'text-blue-600' :
                          'text-amber-600'
                        }`}>
                          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
                <CardDescription>
                  Selecciona las categorías a mostrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["income", "expense", "debt", "goal"].map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Switch 
                        id={`filter-${category}`}
                        checked={activeFilters.includes(category as EventCategory)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setActiveFilters(prev => [...prev, category as EventCategory]);
                          } else {
                            setActiveFilters(prev => prev.filter(c => c !== category));
                          }
                        }}
                      />
                      <Label htmlFor={`filter-${category}`} className="flex items-center gap-2 cursor-pointer">
                        <span>{getCategoryIcon(category as EventCategory)}</span>
                        <span className="capitalize">{category}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <CustomCalendar 
                value={selectedDate}
                onChange={setSelectedDate}
                hasEvent={hasEventOnDate}
                className="p-0"
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal para añadir evento */}
      <Sheet open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Añadir evento</SheetTitle>
            <SheetDescription>
              Completa el formulario para añadir un nuevo evento
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Título</Label>
              <Input 
                id="event-title" 
                placeholder="Título del evento" 
                value={newEvent.title}
                onChange={(e) => handleNewEventChange("title", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-date">Fecha</Label>
              <Input 
                id="event-date" 
                type="date" 
                value={newEvent.date}
                onChange={(e) => handleNewEventChange("date", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-category">Categoría</Label>
              <Select 
                value={newEvent.category}
                onValueChange={(value) => handleNewEventChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Ingreso</SelectItem>
                  <SelectItem value="expense">💸 Gasto</SelectItem>
                  <SelectItem value="debt">💳 Deuda</SelectItem>
                  <SelectItem value="goal">🎯 Meta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-amount">Importe (€)</Label>
              <Input 
                id="event-amount" 
                type="number" 
                step="0.01"
                min="0"
                value={newEvent.amount}
                onChange={(e) => handleNewEventChange("amount", parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-description">Descripción (opcional)</Label>
              <Input 
                id="event-description" 
                placeholder="Descripción del evento" 
                value={newEvent.description}
                onChange={(e) => handleNewEventChange("description", e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEvent}>
              Guardar evento
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 