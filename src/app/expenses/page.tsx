// src/app/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconReceipt, IconPencil, IconTrash, IconPlus, IconArrowUpRight, IconArrowDownRight, IconTrendingUp } from "@tabler/icons-react";
import { toast } from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// Interfaces
interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  createdAt: string;
}

export default function ExpensesPage() {
  // Estado para la lista de gastos
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [timeRange, setTimeRange] = useState("month");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    userId: "1" // Temporal hasta implementar autenticación
  });
  
  // Categorías de gastos
  const categories = [
    "Alimentación",
    "Transporte",
    "Vivienda",
    "Servicios",
    "Entretenimiento",
    "Salud",
    "Educación",
    "Ropa",
    "Regalos",
    "Otros"
  ];
  
  // Cargar los gastos al montar el componente
  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true);
        const response = await fetch("/api/expenses");
        if (!response.ok) {
          throw new Error("Error al cargar los gastos");
        }
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchExpenses();
  }, []);
  
  // Calcular totales
  useEffect(() => {
    if (expenses.length > 0) {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
      const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

      const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfCurrentMonth && expenseDate <= endOfCurrentMonth;
      });

      const previousMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfPreviousMonth && expenseDate <= endOfPreviousMonth;
      });

      const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const previousTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calcular totales por categoría
      const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      setTotalExpenses(currentTotal);
      setPreviousTotal(previousTotal);
      setCategoryTotals(categoryTotals);
    }
  }, [expenses]);

  // Calcular el cambio porcentual
  const calculateChange = () => {
    if (previousTotal === 0) return 0;
    return ((totalExpenses - previousTotal) / previousTotal) * 100;
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar selección de categoría
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  // Manejar edición de gasto
  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || "",
      date: new Date(expense.date).toISOString().split("T")[0],
      userId: expense.userId
    });
    setIsEditing(true);
    setActiveTab("form");
  };
  
  // Manejar eliminación de gasto
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el gasto");
      }
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success("Gasto eliminado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el gasto");
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = isEditing 
        ? `/api/expenses/${selectedExpense?.id}`
        : "/api/expenses";
      
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(isEditing ? "Error al actualizar el gasto" : "Error al crear el gasto");
      }
      
      const data = await response.json();
      
      if (isEditing) {
        setExpenses(prev => prev.map(expense => 
          expense.id === selectedExpense?.id ? data : expense
        ));
        toast.success("Gasto actualizado correctamente");
      } else {
        setExpenses(prev => [data, ...prev]);
        toast.success("Gasto creado correctamente");
      }
      
      // Limpiar formulario
      setFormData({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        userId: "1"
      });
      
      setIsEditing(false);
      setSelectedExpense(null);
      
    } catch (error) {
      console.error("Error:", error);
      toast.error(isEditing ? "Error al actualizar el gasto" : "Error al crear el gasto");
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditing(false);
            setSelectedExpense(null);
            setFormData({
              amount: "",
              category: "",
              description: "",
              date: new Date().toISOString().split("T")[0],
              userId: "1"
            });
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <IconReceipt className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-600">Este mes</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">${totalExpenses.toFixed(2)}</h3>
              <div className="flex items-center text-sm">
                {calculateChange() >= 0 ? (
                  <IconArrowUpRight className="h-4 w-4 text-red-600 mr-1" />
                ) : (
                  <IconArrowDownRight className="h-4 w-4 text-green-600 mr-1" />
                )}
                <span className={calculateChange() >= 0 ? "text-red-600" : "text-green-600"}>
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
                {expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : "0.00"}
              </h3>
              <p className="text-sm text-muted-foreground">Promedio por gasto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Historial de Gastos</h2>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-red-50 rounded-full p-4 w-fit mx-auto mb-4">
                <IconReceipt className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay gastos registrados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza registrando tu primer gasto
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedExpense(null);
                  setFormData({
                    amount: "",
                    category: "",
                    description: "",
                    date: new Date().toISOString().split("T")[0],
                    userId: "1"
                  });
                  setIsDialogOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Agregar Gasto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map(expense => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <IconReceipt className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{expense.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-red-600">
                      ${parseFloat(expense.amount.toString()).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(expense)}
                        className="hover:bg-red-50"
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
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

      {/* Diálogo para crear/editar gasto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modifica los datos del gasto" : "Registra un nuevo gasto en tu presupuesto"}
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
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
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
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                placeholder="Describe el gasto"
                value={formData.description}
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
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
              >
                {isEditing ? "Actualizar Gasto" : "Guardar Gasto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}