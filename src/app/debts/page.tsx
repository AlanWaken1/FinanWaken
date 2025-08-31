// src/app/debts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconCreditCard, IconCash, IconPencil, IconTrash, IconPlus, IconArrowUpRight, IconArrowDownRight, IconTrendingUp } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// Interfaces
interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  notes: string | null;
  debtId: string;
}

interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  remaining: number;
  creditor: string;
  startDate: string;
  dueDate: string | null;
  isPaid: boolean;
  userId: string;
  createdAt: string;
  payments: DebtPayment[];
}

export default function DebtsPage() {
  // Estado para la lista de deudas
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  
  // Estado para el formulario de deuda
  const [debtForm, setDebtForm] = useState({
    title: "",
    totalAmount: "",
    remaining: "",
    creditor: "",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    userId: "1" // Temporal hasta implementar autenticación
  });
  
  // Estado para el formulario de pago
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    debtId: ""
  });
  
  const [timeRange, setTimeRange] = useState("month");
  const [totalDebt, setTotalDebt] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [paidDebt, setPaidDebt] = useState(0);
  
  // Cargar las deudas al montar el componente
  useEffect(() => {
    async function fetchDebts() {
      try {
        setLoading(true);
        const response = await fetch("/api/debts");
        if (!response.ok) {
          throw new Error("Error al cargar las deudas");
        }
        const data = await response.json();
        setDebts(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDebts();
  }, []);
  
  // Calcular totales
  useEffect(() => {
    if (debts.length > 0) {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);
      const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
      const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

      const currentMonthDebts = debts.filter(debt => {
        const debtDate = new Date(debt.startDate);
        return debtDate >= startOfCurrentMonth && debtDate <= endOfCurrentMonth;
      });

      const previousMonthDebts = debts.filter(debt => {
        const debtDate = new Date(debt.startDate);
        return debtDate >= startOfPreviousMonth && debtDate <= endOfPreviousMonth;
      });

      const currentTotal = currentMonthDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
      const previousTotal = previousMonthDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
      const paid = debts.reduce((sum, debt) => sum + (debt.totalAmount - debt.remaining), 0);

      setTotalDebt(currentTotal);
      setPreviousTotal(previousTotal);
      setPaidDebt(paid);
    }
  }, [debts]);
  
  // Calcular el cambio porcentual
  const calculateChange = () => {
    if (previousTotal === 0) return 0;
    return ((totalDebt - previousTotal) / previousTotal) * 100;
  };
  
  // Manejar cambios en el formulario de deuda
  const handleDebtFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDebtForm(prev => ({ ...prev, [name]: value }));
    
    // Si se cambia el monto total, actualizar también el monto restante
    if (name === "totalAmount") {
      setDebtForm(prev => ({ ...prev, remaining: value }));
    }
  };
  
  // Manejar cambios en el formulario de pago
  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar edición de deuda
  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setDebtForm({
      title: debt.title,
      totalAmount: debt.totalAmount.toString(),
      remaining: debt.remaining.toString(),
      creditor: debt.creditor,
      startDate: new Date(debt.startDate).toISOString().split("T")[0],
      dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split("T")[0] : "",
      userId: debt.userId
    });
    setIsEditing(true);
    setActiveTab("new");
  };
  
  // Manejar eliminación de deuda
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta deuda?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/debts/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar la deuda");
      }
      
      setDebts(prev => prev.filter(debt => debt.id !== id));
      toast.success("Deuda eliminada correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar la deuda");
    }
  };
  
  // Manejar envío del formulario de deuda
  const handleDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = isEditing 
        ? `/api/debts/${selectedDebt?.id}`
        : "/api/debts";
      
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debtForm),
      });
      
      if (!response.ok) {
        throw new Error(isEditing ? "Error al actualizar la deuda" : "Error al crear la deuda");
      }
      
      const data = await response.json();
      
      if (isEditing) {
        setDebts(prev => prev.map(debt => 
          debt.id === selectedDebt?.id ? data : debt
        ));
        toast.success("Deuda actualizada correctamente");
      } else {
        setDebts(prev => [data, ...prev]);
        toast.success("Deuda creada correctamente");
      }
      
      // Limpiar formulario
      setDebtForm({
        title: "",
        totalAmount: "",
        remaining: "",
        creditor: "",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        userId: "1"
      });
      
      setIsEditing(false);
      setSelectedDebt(null);
      
    } catch (error) {
      console.error("Error:", error);
      toast.error(isEditing ? "Error al actualizar la deuda" : "Error al crear la deuda");
    }
  };
  
  // Enviar el formulario de pago
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/debts/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentForm),
      });
      
      if (!response.ok) {
        throw new Error("Error al registrar el pago");
      }
      
      const { debt } = await response.json();
      
      // Actualizar la deuda en la lista
      setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
      
      // Cerrar el diálogo
      setIsDialogOpen(false);
      
      // Limpiar el formulario
      setPaymentForm({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        debtId: ""
      });
      
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Abrir el diálogo de pago
  const openPaymentDialog = (debt: Debt) => {
    setSelectedDebt(debt);
    setPaymentForm(prev => ({
      ...prev,
      debtId: debt.id,
      amount: debt.remaining.toString()
    }));
    setIsDialogOpen(true);
  };
  
  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Calcular el porcentaje pagado
  const calculatePaidPercentage = (debt: Debt) => {
    return Math.round(((debt.totalAmount - debt.remaining) / debt.totalAmount) * 100);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Deudas</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditing(false);
            setSelectedDebt(null);
            setDebtForm({
              title: "",
              totalAmount: "",
              remaining: "",
              creditor: "",
              startDate: new Date().toISOString().split("T")[0],
              dueDate: "",
              userId: "1"
            });
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Nueva Deuda
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IconCreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">Total Deuda</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">${totalDebt.toFixed(2)}</h3>
              <div className="flex items-center text-sm">
                {calculateChange() >= 0 ? (
                  <IconArrowUpRight className="h-4 w-4 text-purple-600 mr-1" />
                ) : (
                  <IconArrowDownRight className="h-4 w-4 text-green-600 mr-1" />
                )}
                <span className={calculateChange() >= 0 ? "text-purple-600" : "text-green-600"}>
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
              <span className="text-sm font-medium text-blue-600">Pagado</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">${paidDebt.toFixed(2)}</h3>
              <p className="text-sm text-muted-foreground">
                {((paidDebt / totalDebt) * 100).toFixed(1)}% del total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Historial de Deudas</h2>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : debts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-purple-50 rounded-full p-4 w-fit mx-auto mb-4">
                <IconCreditCard className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay deudas registradas</h3>
              <p className="text-muted-foreground mb-4">
                Comienza registrando tu primera deuda
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedDebt(null);
                  setDebtForm({
                    title: "",
                    totalAmount: "",
                    remaining: "",
                    creditor: "",
                    startDate: new Date().toISOString().split("T")[0],
                    dueDate: "",
                    userId: "1"
                  });
                  setIsDialogOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Agregar Deuda
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map(debt => (
                <div 
                  key={debt.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <IconCreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{debt.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(debt.startDate), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-medium text-purple-600 block">
                        ${parseFloat(debt.remaining.toString()).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        de ${parseFloat(debt.totalAmount.toString()).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(debt)}
                        className="hover:bg-purple-50"
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(debt.id)}
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

      {/* Diálogo para crear/editar deuda */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Deuda" : "Nueva Deuda"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modifica los datos de la deuda" : "Registra una nueva deuda en tu presupuesto"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDebtSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Préstamo Auto"
                value={debtForm.title}
                onChange={handleDebtFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Monto Total</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={debtForm.totalAmount}
                onChange={handleDebtFormChange}
                required
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remaining">Monto Restante</Label>
              <Input
                id="remaining"
                name="remaining"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={debtForm.remaining}
                onChange={handleDebtFormChange}
                required
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creditor">Acreedor</Label>
              <Input
                id="creditor"
                name="creditor"
                placeholder="Ej: Banco XYZ"
                value={debtForm.creditor}
                onChange={handleDebtFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={debtForm.startDate}
                onChange={handleDebtFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={debtForm.dueDate}
                onChange={handleDebtFormChange}
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
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                {isEditing ? "Actualizar Deuda" : "Guardar Deuda"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}