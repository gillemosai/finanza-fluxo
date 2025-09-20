import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderElement, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CategorySelect } from "@/components/CategorySelect";
import { Plus, Edit, Trash2, TrendingUp, Search, PieChart } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatDateToMonthRef } from "@/utils/dateUtils";
import { MonthFilter } from "@/components/MonthFilter";
import { TableHeader } from "@/components/TableHeader";

interface Receita {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_recebimento: string;
  mes_referencia: string;
  observacoes?: string;
}

export default function Receitas() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    data_recebimento: "",
    mes_referencia: "",
    observacoes: ""
  });
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredAndSortedReceitas = useMemo(() => {
    let filtered = receitas.filter(receita => {
      const matchesSearch = receita.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receita.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = !selectedMonth || receita.mes_referencia === selectedMonth;
      return matchesSearch && matchesMonth;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.field as keyof Receita];
        let bValue = b[sortConfig.field as keyof Receita];

        if (sortConfig.field === 'valor') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (sortConfig.field === 'data_recebimento') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [receitas, searchTerm, selectedMonth, sortConfig]);

  const handleSort = (field: string) => {
    setSortConfig(current => {
      if (current?.field === field) {
        return {
          field,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { field, direction: 'asc' };
    });
  };

  useEffect(() => {
    fetchReceitas();
  }, []);

  const fetchReceitas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user.id)
        .order('data_recebimento', { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (error) {
      console.error('Error fetching receitas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar receitas",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const receitaData = {
        user_id: user.id,
        descricao: formData.descricao,
        categoria: formData.categoria,
        valor: parseFloat(formData.valor),
        data_recebimento: formData.data_recebimento,
        mes_referencia: formData.mes_referencia,
        observacoes: formData.observacoes
      };

      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update(receitaData)
          .eq('id', editingReceita.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Receita atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('receitas')
          .insert([receitaData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso", 
          description: "Receita criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingReceita(null);
      setFormData({
        descricao: "",
        categoria: "",
        valor: "",
        data_recebimento: "",
        mes_referencia: "",
        observacoes: ""
      });
      fetchReceitas();
    } catch (error) {
      console.error('Error saving receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar receita",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (receita: Receita) => {
    setEditingReceita(receita);
    setFormData({
      descricao: receita.descricao,
      categoria: receita.categoria,
      valor: receita.valor.toString(),
      data_recebimento: receita.data_recebimento,
      mes_referencia: receita.mes_referencia,
      observacoes: receita.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso!",
      });
      fetchReceitas();
    } catch (error) {
      console.error('Error deleting receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir receita",
        variant: "destructive",
      });
    }
  };

  const totalReceitas = filteredAndSortedReceitas.reduce((acc, receita) => acc + receita.valor, 0);

  // Dados para o gráfico de pizza
  const categoryData = useMemo(() => {
    const categoryTotals = filteredAndSortedReceitas.reduce((acc, receita) => {
      acc[receita.categoria] = (acc[receita.categoria] || 0) + receita.valor;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentage: ((valor / totalReceitas) * 100).toFixed(1)
    }));
  }, [filteredAndSortedReceitas, totalReceitas]);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--success))', 
    'hsl(var(--warning))',
    'hsl(var(--destructive))',
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
            Receitas
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas fontes de renda
          </p>
        </div>
        <div className="flex items-center gap-4">
          <MonthFilter 
            selectedMonth={selectedMonth}
            onFilterChange={setSelectedMonth}
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[200px]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingReceita ? "Editar Receita" : "Nova Receita"}
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
                    tipo="receita"
                    placeholder="Selecione uma categoria"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_recebimento">Data de Recebimento</Label>
                  <Input
                    id="data_recebimento"
                    type="date"
                    value={formData.data_recebimento}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({ 
                        ...formData, 
                        data_recebimento: newDate,
                        mes_referencia: formatDateToMonthRef(newDate)
                      });
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mes_referencia">Mês Referência</Label>
                <Input
                  id="mes_referencia"
                  placeholder="SET/25"
                  value={formData.mes_referencia}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Gerado automaticamente a partir da data de recebimento
                </p>
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
                  {editingReceita ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Totais */}
        <Card className="shadow-card border-0 bg-gradient-success/5 border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <TrendingUp className="w-5 h-5" />
              <span>Total de Receitas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {formatCurrency(totalReceitas)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredAndSortedReceitas.length} receita(s) {selectedMonth || searchTerm ? 'filtrada(s)' : 'cadastrada(s)'}
            </p>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Categoria */}
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAndSortedReceitas.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="categoria" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Bar 
                      dataKey="valor" 
                      fill="hsl(var(--success))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhuma receita cadastrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Receitas */}
      <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Lista de Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeaderElement>
              <TableRow>
                <TableHeader 
                  sortKey="descricao"
                  currentSort={sortConfig}
                  onSort={handleSort}
                >
                  Descrição
                </TableHeader>
                <TableHeader 
                  sortKey="categoria"
                  currentSort={sortConfig}
                  onSort={handleSort}
                >
                  Categoria
                </TableHeader>
                <TableHeader 
                  sortKey="valor"
                  currentSort={sortConfig}
                  onSort={handleSort}
                >
                  Valor
                </TableHeader>
                <TableHeader 
                  sortKey="data_recebimento"
                  currentSort={sortConfig}
                  onSort={handleSort}
                >
                  Data
                </TableHeader>
                <TableHeader 
                  sortKey="mes_referencia"
                  currentSort={sortConfig}
                  onSort={handleSort}
                >
                  Mês Ref.
                </TableHeader>
                <TableHeader>Ações</TableHeader>
              </TableRow>
            </TableHeaderElement>
            <TableBody>
              {filteredAndSortedReceitas.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell className="font-medium">{receita.descricao}</TableCell>
                  <TableCell>{receita.categoria}</TableCell>
                  <TableCell className="text-success font-semibold">
                    {formatCurrency(receita.valor)}
                  </TableCell>
                  <TableCell>
                    {new Date(receita.data_recebimento).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{receita.mes_referencia}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(receita)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(receita.id)}
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