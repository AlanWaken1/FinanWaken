// src/app/goals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconTarget, IconTrash, IconEdit, IconCheck } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
  
  // Estado para el formulario de meta
  const [goalForm, setGoalForm] = useState({
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
  
  // Manejar cambios en el formulario de meta
  const handleGoalFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGoalForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar cambios en el formulario de añadir fondos
  const handleFundsFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFundsForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Enviar el formulario de meta
  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalForm),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear la meta");
      }
      
      const newGoal = await response.json();
      
      // Actualizar la lista de metas
      setGoals(prev => [newGoal, ...prev]);
      
      // Limpiar el formulario
      setGoalForm({
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
  const handleDeleteGoal = async (id: string) => {
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
  const calculateProgress = (goal: Goal) => {
    return Math.min(Math.round((goal.saved / goal.target) * 100), 100);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Metas de Ahorro</h1>
        <IconTarget className="h-8 w-8 text-blue-500" />
      </div>
      
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>
          Nueva Meta
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Metas Activas</TabsTrigger>
          <TabsTrigger value="achieved">Metas Logradas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Cargando metas...</p>
            ) : goals.filter(goal => !goal.isAchieved).length === 0 ? (
              <p>No tienes metas activas. ¡Crea una nueva meta para empezar a ahorrar!</p>
            ) : (
              goals
                .filter(goal => !goal.isAchieved)
                .map(goal => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{goal.title}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleGoalAchieved(goal)}
                          >
                            <IconCheck className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <IconTrash className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{goal.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Meta:</span>
                          <span>${parseFloat(goal.target.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ahorrado:</span>
                          <span>${parseFloat(goal.saved.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Falta:</span>
                          <span>${Math.max(parseFloat(goal.target.toString()) - parseFloat(goal.saved.toString()), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha límite:</span>
                          <span>{formatDate(goal.deadline)}</span>
                        </div>
                        
                        {goal.deadline && calculateRemainingDays(goal.deadline) !== null && (
                          <div className="flex justify-between">
                            <span>Días restantes:</span>
                            <span className={calculateRemainingDays(goal.deadline)! < 0 ? "text-red-500" : ""}>
                              {calculateRemainingDays(goal.deadline)! < 0 
                                ? `${Math.abs(calculateRemainingDays(goal.deadline)!)} días de retraso` 
                                : calculateRemainingDays(goal.deadline)}
                            </span>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Progreso:</span>
                            <span className="text-sm">{calculateProgress(goal)}%</span>
                          </div>
                          <Progress value={calculateProgress(goal)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => openAddFundsDialog(goal)}
                      >
                        Añadir Fondos
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="achieved">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Cargando metas...</p>
            ) : goals.filter(goal => goal.isAchieved).length === 0 ? (
              <p>No tienes metas logradas aún.</p>
            ) : (
              goals
                .filter(goal => goal.isAchieved)
                .map(goal => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{goal.title}</CardTitle>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Lograda
                        </Badge>
                      </div>
                      <CardDescription>{goal.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Meta:</span>
                          <span>${parseFloat(goal.target.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ahorrado:</span>
                          <span>${parseFloat(goal.saved.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha límite:</span>
                          <span>{formatDate(goal.deadline)}</span>
                        </div>
                        
                        <div className="pt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Progreso:</span>
                            <span className="text-sm">100%</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => toggleGoalAchieved(goal)}
                      >
                        Reactivar Meta
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de nueva meta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Meta de Ahorro</DialogTitle>
            <DialogDescription>
              Crea una nueva meta para ahorrar dinero
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Viaje a la playa"
                value={goalForm.title}
                onChange={handleGoalFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target">Monto Objetivo</Label>
              <Input
                id="target"
                name="target"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={goalForm.target}
                onChange={handleGoalFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saved">Monto Inicial (si ya has ahorrado algo)</Label>
              <Input
                id="saved"
                name="saved"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={goalForm.saved}
                onChange={handleGoalFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha Límite (Opcional)</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={goalForm.deadline}
                onChange={handleGoalFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe tu meta"
                value={goalForm.description}
                onChange={handleGoalFormChange}
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
                Guardar Meta
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