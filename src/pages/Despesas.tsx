import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderElement, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CategorySelect } from "@/components/CategorySelect";
import { Plus, Edit, Trash2, TrendingDown, Search, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatDateToMonthRef } from "@/utils/dateUtils";
import { MonthFilter } from "@/components/MonthFilter";
import { TableHeader } from "@/components/TableHeader";

interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_pagamento: string;
  data_vencimento?: string;
  mes_referencia: string;
  status: string;
  recorrente: boolean;
  frequencia_recorrencia?: string;
  proxima_cobranca?: string;
  alerta_ativo: boolean;
  observacoes?: string;
}

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
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
    data_pagamento: "",
    data_vencimento: "",
    mes_referencia: "",
    status: "a_pagar",
    recorrente: false,
    frequencia_recorrencia: "mensal",
    alerta_ativo: false,
    observacoes: ""
  });
  const { toast } = useToast();
  

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAlertasPagamentos = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return despesas.filter(despesa => 
      despesa.data_vencimento === hoje && 
      despesa.status === 'a_pagar' && 
      despesa.alerta_ativo
    );
  };

  const filteredAndSortedDespesas = useMemo(() => {
    let filtered = despesas.filter(despesa => {
      const matchesSearch = despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           despesa.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = !selectedMonth || despesa.mes_referencia === selectedMonth;
      return matchesSearch && matchesMonth;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.field as keyof Despesa];
        let bValue = b[sortConfig.field as keyof Despesa];

        if (sortConfig.field === 'valor') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (sortConfig.field === 'data_pagamento') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [despesas, searchTerm, selectedMonth, sortConfig]);

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
    fetchDespesas();
  }, []);

  const fetchDespesas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', user.id)
        .order('data_pagamento', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Error fetching despesas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar despesas",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const despesaData = {
        user_id: user.id,
        descricao: formData.descricao,
        categoria: formData.categoria,
        valor: parseFloat(formData.valor),
        data_pagamento: formData.data_pagamento,
        data_vencimento: formData.data_vencimento || null,
        mes_referencia: formData.mes_referencia,
        status: formData.status,
        recorrente: formData.recorrente,
        frequencia_recorrencia: formData.recorrente ? formData.frequencia_recorrencia : null,
        proxima_cobranca: formData.recorrente && formData.data_vencimento ? formData.data_vencimento : null,
        alerta_ativo: formData.alerta_ativo,
        observacoes: formData.observacoes
      };

      if (editingDespesa) {
        const { error } = await supabase
          .from('despesas')
          .update(despesaData)
          .eq('id', editingDespesa.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('despesas')
          .insert([despesaData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso", 
          description: "Despesa criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingDespesa(null);
      setFormData({
        descricao: "",
        categoria: "",
        valor: "",
        data_pagamento: "",
        data_vencimento: "",
        mes_referencia: "",
        status: "a_pagar",
        recorrente: false,
        frequencia_recorrencia: "mensal",
        alerta_ativo: false,
        observacoes: ""
      });
      fetchDespesas();
    } catch (error) {
      console.error('Error saving despesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar despesa",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setFormData({
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      valor: despesa.valor.toString(),
      data_pagamento: despesa.data_pagamento,
      data_vencimento: despesa.data_vencimento || "",
      mes_referencia: despesa.mes_referencia,
      status: despesa.status,
      recorrente: despesa.recorrente,
      frequencia_recorrencia: despesa.frequencia_recorrencia || "mensal",
      alerta_ativo: despesa.alerta_ativo,
      observacoes: despesa.observacoes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });
      fetchDespesas();
    } catch (error) {
      console.error('Error deleting despesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (despesa: Despesa) => {
    try {
      const newStatus = despesa.status === 'paga' ? 'a_pagar' : 'paga';
      
      const { error } = await supabase
        .from('despesas')
        .update({ status: newStatus })
        .eq('id', despesa.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Status alterado para ${newStatus === 'paga' ? 'Paga' : 'A Pagar'}!`,
      });
      fetchDespesas();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const totalDespesas = filteredAndSortedDespesas.reduce((acc, despesa) => acc + despesa.valor, 0);

  // Dados para o gráfico de pizza
  const categoryData = useMemo(() => {
    const categoryTotals = filteredAndSortedDespesas.reduce((acc, despesa) => {
      acc[despesa.categoria] = (acc[despesa.categoria] || 0) + despesa.valor;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentage: ((valor / totalDespesas) * 100).toFixed(1)
    }));
  }, [filteredAndSortedDespesas, totalDespesas]);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--destructive))', 
    'hsl(var(--warning))',
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
            Despesas
          </h1>
          <p className="text-muted-foreground">
            Controle seus gastos mensais
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
              placeholder="Buscar despesas..."
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
              Nova Despesa
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDespesa ? "Editar Despesa" : "Nova Despesa"}
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
                    tipo="despesa"
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
                  <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                  <Input
                    id="data_pagamento"
                    type="date"
                    value={formData.data_pagamento}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({ 
                        ...formData, 
                        data_pagamento: newDate,
                        mes_referencia: formatDateToMonthRef(newDate)
                      });
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_pagar">A Pagar</SelectItem>
                      <SelectItem value="paga">Paga</SelectItem>
                    </SelectContent>
                  </Select>
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
                    Gerado automaticamente a partir da data de pagamento
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Para controle de alertas e despesas recorrentes
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recorrente"
                    checked={formData.recorrente}
                    onCheckedChange={(checked) => setFormData({ ...formData, recorrente: checked as boolean })}
                  />
                  <Label htmlFor="recorrente">Despesa Recorrente</Label>
                </div>

                {formData.recorrente && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequencia_recorrencia">Frequência</Label>
                      <Select 
                        value={formData.frequencia_recorrencia} 
                        onValueChange={(value) => setFormData({ ...formData, frequencia_recorrencia: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="alerta_ativo"
                        checked={formData.alerta_ativo}
                        onCheckedChange={(checked) => setFormData({ ...formData, alerta_ativo: checked as boolean })}
                      />
                      <Label htmlFor="alerta_ativo">Alertas Ativos</Label>
                    </div>
                  </div>
                )}
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
                  {editingDespesa ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Pagamento */}
      {getAlertasPagamentos().length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <span className="animate-pulse">🔔</span>
              Pagar Hoje ({getAlertasPagamentos().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getAlertasPagamentos().map((despesa) => (
                <div key={despesa.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">{despesa.descricao}</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">{despesa.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-800 dark:text-orange-200">{formatCurrency(despesa.valor)}</p>
                    <Button
                      size="sm"
                      onClick={() => handleStatusToggle(despesa)}
                      className="mt-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Marcar como Paga
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Totais */}
        <Card className="shadow-card border-0 bg-gradient-destructive/5 border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <TrendingDown className="w-5 h-5" />
              <span>Total de Despesas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {formatCurrency(totalDespesas)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredAndSortedDespesas.length} de {despesas.length} despesa(s) mostrada(s)
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
            {filteredAndSortedDespesas.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoria, percentage }) => `${categoria} ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhuma despesa cadastrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Despesas */}
      <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
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
                  sortKey="data_pagamento" 
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
                <TableHeader 
                  sortKey="status" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Status
                </TableHeader>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeaderElement>
            <TableBody>
              {filteredAndSortedDespesas.map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell className="font-medium">{despesa.descricao}</TableCell>
                  <TableCell>{despesa.categoria}</TableCell>
                  <TableCell className="text-destructive font-semibold">
                    {formatCurrency(despesa.valor)}
                  </TableCell>
                  <TableCell>
                    {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{despesa.mes_referencia}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleStatusToggle(despesa)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer hover:opacity-80 ${
                        despesa.status === 'paga' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                      }`}
                    >
                      {despesa.status === 'paga' ? 'Paga' : 'A Pagar'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(despesa)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(despesa.id)}
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