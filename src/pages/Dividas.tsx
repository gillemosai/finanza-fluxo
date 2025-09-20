import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CategorySelect } from "@/components/CategorySelect";
import { Plus, Edit, Trash2, CreditCard, AlertTriangle, PieChart } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface Divida {
  id: string;
  descricao: string;
  valor_total: number;
  valor_pago: number;
  valor_restante: number;
  data_vencimento?: string;
  status: 'pendente' | 'pago' | 'em_atraso';
  categoria?: string;
  observacoes?: string;
}

export default function Dividas() {
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDivida, setEditingDivida] = useState<Divida | null>(null);
  const [formData, setFormData] = useState<{
    descricao: string;
    valor_total: string;
    valor_pago: string;
    data_vencimento: string;
    status: 'pendente' | 'pago' | 'em_atraso';
    categoria: string;
    observacoes: string;
  }>({
    descricao: "",
    valor_total: "",
    valor_pago: "",
    data_vencimento: "",
    status: "pendente",
    categoria: "",
    observacoes: ""
  });
  const { toast } = useToast();
  

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "pago", label: "Pago" },
    { value: "em_atraso", label: "Em Atraso" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-success text-success-foreground';
      case 'em_atraso': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-warning text-warning-foreground';
    }
  };

  useEffect(() => {
    fetchDividas();
  }, []);

  const fetchDividas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('dividas')
        .select('*')
        .eq('user_id', user.id)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setDividas((data || []).map(item => ({
        ...item,
        status: item.status as 'pendente' | 'pago' | 'em_atraso'
      })));
    } catch (error) {
      console.error('Error fetching dividas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dívidas",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const valorTotal = parseFloat(formData.valor_total);
      const valorPago = parseFloat(formData.valor_pago);
      const valorRestante = valorTotal - valorPago;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dividaData = {
        user_id: user.id,
        descricao: formData.descricao,
        valor_total: valorTotal,
        valor_pago: valorPago,
        valor_restante: valorRestante,
        data_vencimento: formData.data_vencimento || null,
        status: formData.status,
        categoria: formData.categoria,
        observacoes: formData.observacoes
      };

      if (editingDivida) {
        const { error } = await supabase
          .from('dividas')
          .update(dividaData)
          .eq('id', editingDivida.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Dívida atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('dividas')
          .insert([dividaData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso", 
          description: "Dívida criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingDivida(null);
      setFormData({
        descricao: "",
        valor_total: "",
        valor_pago: "",
        data_vencimento: "",
        status: "pendente",
        categoria: "",
        observacoes: ""
      });
      fetchDividas();
    } catch (error) {
      console.error('Error saving divida:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dívida",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (divida: Divida) => {
    setEditingDivida(divida);
    setFormData({
      descricao: divida.descricao,
      valor_total: divida.valor_total.toString(),
      valor_pago: divida.valor_pago.toString(),
      data_vencimento: divida.data_vencimento || "",
      status: divida.status,
      categoria: divida.categoria || "",
      observacoes: divida.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta dívida?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('dividas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Dívida excluída com sucesso!",
      });
      fetchDividas();
    } catch (error) {
      console.error('Error deleting divida:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir dívida",
        variant: "destructive",
      });
    }
  };

  // Dados para o gráfico e total
  const { totalDividas, categoryData } = useMemo(() => {
    const total = dividas.reduce((acc, divida) => acc + divida.valor_restante, 0);
    
    const categoryTotals = dividas.reduce((acc, divida) => {
      const categoria = divida.categoria || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + divida.valor_restante;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentage: total > 0 ? ((valor / total) * 100).toFixed(1) : '0'
    }));

    return { totalDividas: total, categoryData: data };
  }, [dividas]);
  
  const dividasVencidas = dividas.filter(divida => 
    divida.data_vencimento && new Date(divida.data_vencimento) < new Date() && divida.status !== 'pago'
  ).length;

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--warning))', 
    'hsl(var(--destructive))',
    'hsl(var(--success))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--border))'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dívidas
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas dívidas e compromissos financeiros
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova Dívida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDivida ? "Editar Dívida" : "Nova Dívida"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <CategorySelect
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    tipo="divida"
                    placeholder="Selecione uma categoria"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_total">Valor Total (R$)</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor_pago">Valor Pago (R$)</Label>
                  <Input
                    id="valor_pago"
                    type="number"
                    step="0.01"
                    value={formData.valor_pago}
                    onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'pendente' | 'pago' | 'em_atraso') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingDivida ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Totais */}
        <div className="space-y-6">
          <Card className="shadow-card border-0 bg-gradient-warning/5 border-l-4 border-l-warning">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-warning">
                <CreditCard className="w-5 h-5" />
                <span>Total de Dívidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {formatCurrency(totalDividas)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {dividas.length} dívida(s) cadastrada(s)
              </p>
            </CardContent>
          </Card>

          {dividasVencidas > 0 && (
            <Card className="shadow-card border-0 bg-gradient-destructive/5 border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Dívidas Vencidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {dividasVencidas}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Dívida(s) com vencimento em atraso
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gráfico de Distribuição por Categoria */}
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dividas.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={categoryData} 
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                  >
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="categoria" 
                      tick={{ fontSize: 12 }}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Bar 
                      dataKey="valor" 
                      fill="hsl(var(--warning))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhuma dívida cadastrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dívidas */}
      <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Lista de Dívidas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Valor Restante</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dividas.map((divida) => (
                <TableRow key={divida.id}>
                  <TableCell className="font-medium">{divida.descricao}</TableCell>
                  <TableCell>{divida.categoria}</TableCell>
                  <TableCell>{formatCurrency(divida.valor_total)}</TableCell>
                  <TableCell className="text-warning font-semibold">
                    {formatCurrency(divida.valor_restante)}
                  </TableCell>
                  <TableCell>
                    {divida.data_vencimento 
                      ? new Date(divida.data_vencimento).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(divida.status)}>
                      {statusOptions.find(s => s.value === divida.status)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(divida)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(divida.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}