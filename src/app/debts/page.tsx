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
import { IconCreditCard, IconCash } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";

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
  
  // Enviar el formulario de deuda
  const handleDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debtForm),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear la deuda");
      }
      
      const newDebt = await response.json();
      
      // Actualizar la lista de deudas
      setDebts(prev => [newDebt, ...prev]);
      
      // Limpiar el formulario
      setDebtForm({
        title: "",
        totalAmount: "",
        remaining: "",
        creditor: "",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        userId: "1"
      });
      
    } catch (error) {
      console.error("Error:", error);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestión de Deudas</h1>
        <IconCreditCard className="h-8 w-8 text-orange-500" />
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Deudas Activas</TabsTrigger>
          <TabsTrigger value="paid">Deudas Pagadas</TabsTrigger>
          <TabsTrigger value="new">Nueva Deuda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Cargando deudas...</p>
            ) : debts.filter(debt => !debt.isPaid).length === 0 ? (
              <p>No tienes deudas activas.</p>
            ) : (
              debts
                .filter(debt => !debt.isPaid)
                .map(debt => (
                  <Card key={debt.id}>
                    <CardHeader>
                      <CardTitle>{debt.title}</CardTitle>
                      <CardDescription>{debt.creditor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>${parseFloat(debt.totalAmount.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Restante:</span>
                          <span>${parseFloat(debt.remaining.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha inicio:</span>
                          <span>{formatDate(debt.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha vencimiento:</span>
                          <span>{formatDate(debt.dueDate)}</span>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Progreso de pago:</span>
                            <span className="text-sm">{calculatePaidPercentage(debt)}%</span>
                          </div>
                          <Progress value={calculatePaidPercentage(debt)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => openPaymentDialog(debt)}
                      >
                        Registrar Pago
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="paid">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Cargando deudas...</p>
            ) : debts.filter(debt => debt.isPaid).length === 0 ? (
              <p>No tienes deudas pagadas.</p>
            ) : (
              debts
                .filter(debt => debt.isPaid)
                .map(debt => (
                  <Card key={debt.id}>
                    <CardHeader>
                      <CardTitle>{debt.title}</CardTitle>
                      <CardDescription>{debt.creditor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total pagado:</span>
                          <span>${parseFloat(debt.totalAmount.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha inicio:</span>
                          <span>{formatDate(debt.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha finalización:</span>
                          <span>
                            {debt.payments.length > 0 
                              ? formatDate(debt.payments[debt.payments.length - 1].date) 
                              : "-"}
                          </span>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Estado:</span>
                            <span className="text-sm text-green-500">Pagada</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Nueva Deuda</CardTitle>
              <CardDescription>Ingresa los detalles de tu deuda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDebtSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Ej: Préstamo personal"
                      value={debtForm.title}
                      onChange={handleDebtFormChange}
                      required
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
                    <Label htmlFor="dueDate">Fecha de Vencimiento (Opcional)</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={debtForm.dueDate}
                      onChange={handleDebtFormChange}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Guardar Deuda
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de pago */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              {selectedDebt ? `Deuda: ${selectedDebt.title} - Acreedor: ${selectedDebt.creditor}` : ''}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Pagar</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={handlePaymentFormChange}
                required
              />
              {selectedDebt && (
                <p className="text-xs text-muted-foreground">
                  Monto restante: ${parseFloat(selectedDebt.remaining.toString()).toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de Pago</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={paymentForm.date}
                onChange={handlePaymentFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Ej: Pago mensual"
                value={paymentForm.notes}
                onChange={handlePaymentFormChange}
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
              <Button type="submit">
                Registrar Pago
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}