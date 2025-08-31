// src/app/incomes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconCurrencyDollar, IconPencil, IconTrash, IconPlus, IconArrowUpRight, IconArrowDownRight, IconTrendingUp } from "@tabler/icons-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// Interfaces
interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  notes: string | null;
  userId: string;
  createdAt: string;
}

export default function IncomesPage() {
  // Estado para la lista de ingresos
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    amount: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    userId: "1" // Temporal hasta implementar autenticación
  });
  
  // Fuentes de ingreso comunes
  const sources = [
    "Salario",
    "Freelance",
    "Inversiones",
    "Regalos",
    "Ventas",
    "Reembolsos",
    "Becas",
    "Otros"
  ];
  
  // Estado para el rango de tiempo y totales
  const [timeRange, setTimeRange] = useState("month");
  const [totalIncome, setTotalIncome] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);
  
  // Cargar los ingresos al montar el componente
  useEffect(() => {
    async function fetchIncomes() {
      try {
        setLoading(true);
        const response = await fetch("/api/incomes");
        if (!response.ok) {
          throw new Error("Error al cargar los ingresos");
        }
        const data = await response.json();
        setIncomes(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchIncomes();
  }, []);
  
  // Calcular totales
  useEffect(() => {
    if (incomes.length > 0) {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
      const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

      const currentMonthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= startOfCurrentMonth && incomeDate <= endOfCurrentMonth;
      });

      const previousMonthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= startOfPreviousMonth && incomeDate <= endOfPreviousMonth;
      });

      const currentTotal = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0);
      const previousTotal = previousMonthIncomes.reduce((sum, income) => sum + income.amount, 0);

      setTotalIncome(currentTotal);
      setPreviousTotal(previousTotal);
    }
  }, [incomes]);

  // Calcular el cambio porcentual
  const calculateChange = () => {
    if (previousTotal === 0) return 0;
    return ((totalIncome - previousTotal) / previousTotal) * 100;
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar selección de fuente
  const handleSourceChange = (value: string) => {
    setFormData(prev => ({ ...prev, source: value }));
  };
  
  // Manejar edición de ingreso
  const handleEdit = (income: Income) => {
    setSelectedIncome(income);
    setFormData({
      amount: income.amount.toString(),
      source: income.source,
      date: new Date(income.date).toISOString().split("T")[0],
      notes: income.notes || "",
      userId: income.userId
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };
  
  // Manejar eliminación de ingreso
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este ingreso?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el ingreso");
      }
      
      setIncomes(prev => prev.filter(income => income.id !== id));
      toast.success("Ingreso eliminado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el ingreso");
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = isEditing 
        ? `/api/incomes/${selectedIncome?.id}`
        : "/api/incomes";
      
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(isEditing ? "Error al actualizar el ingreso" : "Error al crear el ingreso");
      }
      
      const data = await response.json();
      
      if (isEditing) {
        setIncomes(prev => prev.map(income => 
          income.id === selectedIncome?.id ? data : income
        ));
        toast.success("Ingreso actualizado correctamente");
      } else {
        setIncomes(prev => [data, ...prev]);
        toast.success("Ingreso creado correctamente");
      }
      
      // Limpiar formulario
      setFormData({
        amount: "",
        source: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        userId: "1"
      });
      
      setIsEditing(false);
      setSelectedIncome(null);
      
    } catch (error) {
      console.error("Error:", error);
      toast.error(isEditing ? "Error al actualizar el ingreso" : "Error al crear el ingreso");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ingresos</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditing(false);
            setSelectedIncome(null);
            setFormData({
              amount: "",
              source: "",
              date: new Date().toISOString().split("T")[0],
              notes: "",
              userId: "1"
            });
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Nuevo Ingreso
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <IconCurrencyDollar className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">Este mes</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">${totalIncome.toFixed(2)}</h3>
              <div className="flex items-center text-sm">
                {calculateChange() >= 0 ? (
                  <IconArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <IconArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={calculateChange() >= 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(calculateChange()).toFixed(1)}% vs mes anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">Tendencia</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">
                {incomes.length > 0 ? (totalIncome / incomes.length).toFixed(2) : "0.00"}
              </h3>
              <p className="text-sm text-muted-foreground">Promedio por ingreso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Historial de Ingresos</h2>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-green-50 rounded-full p-4 w-fit mx-auto mb-4">
                <IconCurrencyDollar className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay ingresos registrados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza registrando tu primer ingreso
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedIncome(null);
                  setFormData({
                    amount: "",
                    source: "",
                    date: new Date().toISOString().split("T")[0],
                    notes: "",
                    userId: "1"
                  });
                  setIsDialogOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Agregar Ingreso
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {incomes.map(income => (
                <div 
                  key={income.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconCurrencyDollar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{income.source}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(income.date), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-green-600">
                      ${parseFloat(income.amount.toString()).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(income)}
                        className="hover:bg-green-50"
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(income.id)}
                        className="hover:bg-red-50"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar ingreso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Ingreso" : "Nuevo Ingreso"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modifica los datos del ingreso" : "Registra un nuevo ingreso en tu presupuesto"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Fuente</Label>
              <Select
                value={formData.source}
                onValueChange={handleSourceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una fuente" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Notas adicionales"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isEditing ? "Actualizar Ingreso" : "Guardar Ingreso"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}