// src/app/incomes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconCoin } from "@tabler/icons-react";

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
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar selección de fuente
  const handleSourceChange = (value: string) => {
    setFormData(prev => ({ ...prev, source: value }));
  };
  
  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el ingreso");
      }
      
      const newIncome = await response.json();
      
      // Actualizar la lista de ingresos
      setIncomes(prev => [newIncome, ...prev]);
      
      // Limpiar el formulario
      setFormData({
        amount: "",
        source: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        userId: "1"
      });
      
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Registro de Ingresos</h1>
        <IconCoin className="h-8 w-8 text-green-500" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario de registro */}
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Ingreso</CardTitle>
            <CardDescription>Registra un nuevo ingreso</CardDescription>
          </CardHeader>
          <CardContent>
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
              
              <Button type="submit" className="w-full">
                Guardar Ingreso
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Lista de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ingresos</CardTitle>
            <CardDescription>Tus ingresos recientes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando ingresos...</p>
            ) : incomes.length === 0 ? (
              <p>No tienes ingresos registrados aún.</p>
            ) : (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes.map(income => (
                      <TableRow key={income.id}>
                        <TableCell>{formatDate(income.date)}</TableCell>
                        <TableCell>{income.source}</TableCell>
                        <TableCell>{income.notes || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(income.amount.toString()).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}