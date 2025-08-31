// src/app/goals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconTarget, IconTrash, IconEdit, IconCheck, IconPlus, IconArrowUpRight, IconArrowDownRight, IconTrendingUp } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// Interfaces
interface Goal {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline: string | null;
  description: string | null;
  isAchieved: boolean;
  userId: string;
  createdAt: string;
}

export default function GoalsPage() {
  // Estado para la lista de metas
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [totalGoals, setTotalGoals] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [achievedGoals, setAchievedGoals] = useState(0);
  
  // Estado para el formulario de meta
  const [formData, setFormData] = useState({
    title: "",
    target: "",
    saved: "0",
    deadline: "",
    description: "",
    userId: "1" // Temporal hasta implementar autenticación
  });
  
  // Estado para el formulario de añadir fondos
  const [fundsForm, setFundsForm] = useState({
    amount: "",
    goalId: ""
  });
  
  // Cargar las metas al montar el componente
  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        const response = await fetch("/api/goals");
        if (!response.ok) {
          throw new Error("Error al cargar las metas");
        }
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGoals();
  }, []);
  
  // Calcular totales
  useEffect(() => {
    if (goals.length > 0) {
      const total = goals.reduce((sum, goal) => sum + goal.target, 0);
      const saved = goals.reduce((sum, goal) => sum + goal.saved, 0);
      const achieved = goals.filter(goal => goal.isAchieved).length;

      setTotalGoals(total);
      setTotalSaved(saved);
      setAchievedGoals(achieved);
    }
  }, [goals]);
  
  // Manejar cambios en el formulario de meta
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar cambios en el formulario de añadir fondos
  const handleFundsFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFundsForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Enviar el formulario de meta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear la meta");
      }
      
      const newGoal = await response.json();
      
      // Actualizar la lista de metas
      setGoals(prev => [newGoal, ...prev]);
      
      // Limpiar el formulario
      setFormData({
        title: "",
        target: "",
        saved: "0",
        deadline: "",
        description: "",
        userId: "1"
      });
      
      // Cerrar el diálogo
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Enviar el formulario de añadir fondos
  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoal) return;
    
    try {
      const amountToAdd = parseFloat(fundsForm.amount);
      const newSaved = selectedGoal.saved + amountToAdd;
      const isAchieved = newSaved >= selectedGoal.target;
      
      const response = await fetch(`/api/goals/${fundsForm.goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saved: newSaved,
          isAchieved
        }),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar la meta");
      }
      
      const updatedGoal = await response.json();
      
      // Actualizar la meta en la lista
      setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      
      // Cerrar el diálogo
      setIsAddFundsDialogOpen(false);
      
      // Limpiar el formulario
      setFundsForm({
        amount: "",
        goalId: ""
      });
      
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Eliminar una meta
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta meta?")) return;
    
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar la meta");
      }
      
      // Eliminar la meta de la lista
      setGoals(prev => prev.filter(g => g.id !== id));
      
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Marcar/desmarcar meta como lograda
  const toggleGoalAchieved = async (goal: Goal) => {
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAchieved: !goal.isAchieved
        }),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar la meta");
      }
      
      const updatedGoal = await response.json();
      
      // Actualizar la meta en la lista
      setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Abrir el diálogo de añadir fondos
  const openAddFundsDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setFundsForm(prev => ({
      ...prev,
      goalId: goal.id,
      amount: ""
    }));
    setIsAddFundsDialogOpen(true);
  };
  
  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Calcular el porcentaje de progreso
  const calculateProgress = () => {
    if (totalGoals === 0) return 0;
    return (totalSaved / totalGoals) * 100;
  };
  
  // Calcular días restantes
  const calculateRemainingDays = (deadline: string | null) => {
    if (!deadline) return null;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Metas Financieras</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditing(false);
            setSelectedGoal(null);
            setFormData({
              title: "",
              target: "",
              saved: "0",
              deadline: "",
              description: "",
              userId: "1"
            });
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Nueva Meta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconTarget className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">Total Meta</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">${totalGoals.toFixed(2)}</h3>
              <div className="flex items-center text-sm">
                <IconArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-blue-600">
                  {calculateProgress().toFixed(1)}% completado
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <IconTrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">Ahorrado</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">${totalSaved.toFixed(2)}</h3>
              <p className="text-sm text-muted-foreground">
                {achievedGoals} metas alcanzadas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Mis Metas</h2>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 rounded-full p-4 w-fit mx-auto mb-4">
                <IconTarget className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay metas registradas</h3>
              <p className="text-muted-foreground mb-4">
                Comienza estableciendo tu primera meta financiera
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedGoal(null);
                  setFormData({
                    title: "",
                    target: "",
                    saved: "0",
                    deadline: "",
                    description: "",
                    userId: "1"
                  });
                  setIsDialogOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Agregar Meta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <div 
                  key={goal.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconTarget className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.deadline ? format(new Date(goal.deadline), "d 'de' MMMM yyyy", { locale: es }) : "Sin fecha límite"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-medium text-blue-600 block">
                        ${parseFloat(goal.saved.toString()).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        de ${parseFloat(goal.target.toString()).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsEditing(true);
                          setSelectedGoal(goal);
                          setFormData({
                            title: goal.title,
                            target: goal.target.toString(),
                            saved: goal.saved.toString(),
                            deadline: goal.deadline ?? "",
                            description: goal.description ?? "",
                            userId: "1"
                          });
                          setIsDialogOpen(true);
                        }}
                        className="hover:bg-blue-50"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
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

      {/* Diálogo para crear/editar meta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Meta" : "Nueva Meta"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modifica los datos de tu meta" : "Establece una nueva meta financiera"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Fondo de emergencia"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target">Meta</Label>
              <Input
                id="target"
                name="target"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.target}
                onChange={handleChange}
                required
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saved">Ahorrado</Label>
              <Input
                id="saved"
                name="saved"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.saved}
                onChange={handleChange}
                required
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha Límite</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                placeholder="Describe tu meta"
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
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {isEditing ? "Actualizar Meta" : "Guardar Meta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de añadir fondos */}
      <Dialog open={isAddFundsDialogOpen} onOpenChange={setIsAddFundsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Fondos</DialogTitle>
            <DialogDescription>
              {selectedGoal ? `Meta: ${selectedGoal.title}` : ''}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddFundsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Añadir</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={fundsForm.amount}
                onChange={handleFundsFormChange}
                required
              />
              {selectedGoal && (
                <div className="mt-2 text-sm">
                  <p>Ahorrado: ${parseFloat(selectedGoal.saved.toString()).toFixed(2)}</p>
                  <p>Objetivo: ${parseFloat(selectedGoal.target.toString()).toFixed(2)}</p>
                  <p>Falta: ${Math.max(parseFloat(selectedGoal.target.toString()) - parseFloat(selectedGoal.saved.toString()), 0).toFixed(2)}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsAddFundsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Añadir Fondos
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}