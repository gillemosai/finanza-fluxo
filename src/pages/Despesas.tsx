import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderElement, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CategorySelect } from "@/components/CategorySelect";
import { Plus, Edit, Trash2, TrendingDown, Search, PieChart, Filter, CheckSquare, Info, Lightbulb, X } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateToMonthRef } from "@/utils/dateUtils";
import { useGlobalMonthFilter } from "@/hooks/useGlobalMonthFilter";
import { MonthFilter } from "@/components/MonthFilter";
import { TableHeader } from "@/components/TableHeader";
import { DataReplicator } from "@/components/DataReplicator";
import { useOfflineData } from "@/hooks/useOfflineData";

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
  const [dataVencimentoUpdated, setDataVencimentoUpdated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showTipPopup, setShowTipPopup] = useState(() => {
    return localStorage.getItem('despesas-tip-dismissed') !== 'true';
  });
  const { selectedMonth, setSelectedMonth } = useGlobalMonthFilter();
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
  const { getData, saveData, updateData, deleteData, isOnline } = useOfflineData();

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
      const matchesCategory = selectedCategory === "all" || despesa.categoria === selectedCategory;
      return matchesSearch && matchesMonth && matchesCategory;
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
  }, [despesas, searchTerm, selectedMonth, sortConfig, selectedCategory]);

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = new Set(despesas.map(d => d.categoria));
    return Array.from(categories).sort();
  }, [despesas]);

  // Calculate selected items total
  const selectedTotal = useMemo(() => {
    return filteredAndSortedDespesas
      .filter(d => selectedItems.has(d.id))
      .reduce((acc, d) => acc + d.valor, 0);
  }, [filteredAndSortedDespesas, selectedItems]);

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedDespesas.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedDespesas.map(d => d.id)));
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

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

  const fetchDespesas = useCallback(async () => {
    try {
      const data = await getData('despesas');
      const sortedData = (data as Despesa[]).sort((a, b) => 
        new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime()
      );
      setDespesas(sortedData);
    } catch (error) {
      console.error('Error fetching despesas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar despesas",
        variant: "destructive",
      });
    }
  }, [getData, toast]);

  useEffect(() => {
    fetchDespesas();
  }, [fetchDespesas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const despesaData = {
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
        const result = await updateData('despesas', editingDespesa.id, despesaData);
        if (!result.success) throw new Error(result.error);
        
        toast({
          title: "Sucesso",
          description: `Despesa atualizada${!isOnline ? ' (offline)' : ''}!`,
        });
      } else {
        const result = await saveData('despesas', despesaData);
        if (!result.success) throw new Error(result.error);
        
        // Se a categoria for "Cartão de Crédito", replicar para a tabela de cartões
        if (formData.categoria.toLowerCase().includes('cartão') || 
            formData.categoria.toLowerCase().includes('cartao') ||
            formData.categoria.toLowerCase().includes('crédito') ||
            formData.categoria.toLowerCase().includes('credito')) {
          try {
            const cartaoData = {
              descricao: formData.descricao,
              valor_total: parseFloat(formData.valor),
              valor_restante: parseFloat(formData.valor),
              valor_pago: 0,
              data_vencimento: formData.data_vencimento || null,
              mes_referencia: formData.mes_referencia || null,
              status: 'pendente',
              observacoes: formData.observacoes,
              categoria: 'Cartão'
            };
            await saveData('dividas', cartaoData);
            toast({
              title: "Cartão Replicado",
              description: "Despesa também adicionada aos Cartões de Crédito",
            });
          } catch (cartaoError) {
            console.error('Error replicating to cartoes:', cartaoError);
          }
        }
        
        toast({
          title: "Sucesso", 
          description: `Despesa criada${!isOnline ? ' (offline)' : ''}!`,
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
      const result = await deleteData('despesas', id);
      if (!result.success) throw new Error(result.error);

      toast({
        title: "Sucesso",
        description: `Despesa excluída${!isOnline ? ' (offline)' : ''}!`,
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
      
      const result = await updateData('despesas', despesa.id, { status: newStatus });
      if (!result.success) throw new Error(result.error);

      toast({
        title: "Sucesso",
        description: `Status alterado para ${newStatus === 'paga' ? 'Paga' : 'A Pagar'}${!isOnline ? ' (offline)' : ''}!`,
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

  const { totalDespesas, categoryData } = useMemo(() => {
    const total = filteredAndSortedDespesas.reduce((acc, despesa) => acc + despesa.valor, 0);
    
    const categoryTotals = filteredAndSortedDespesas.reduce((acc, despesa) => {
      acc[despesa.categoria] = (acc[despesa.categoria] || 0) + despesa.valor;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentage: total > 0 ? ((valor / total) * 100).toFixed(1) : '0'
    }));

    return { totalDespesas: total, categoryData: data };
  }, [filteredAndSortedDespesas]);

  const handleDismissTip = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('despesas-tip-dismissed', 'true');
    }
    setShowTipPopup(false);
  };

  return (
    <div className="space-y-6">
      {/* Popup de Dica */}
      <Dialog open={showTipPopup} onOpenChange={setShowTipPopup}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Dica: Recursos de Análise
            </DialogTitle>
            <DialogDescription className="pt-4 text-base leading-relaxed">
              Para ter <span className="font-semibold text-foreground">maior controle</span> sobre suas despesas, você pode:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Filter className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Filtrar por Categoria</p>
                <p className="text-sm text-muted-foreground">
                  Use o filtro no topo da página para visualizar apenas despesas de uma categoria específica e ver o total filtrado.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Selecionar Múltiplos Itens</p>
                <p className="text-sm text-muted-foreground">
                  Clique nas linhas da tabela ou nos checkboxes para selecionar várias despesas e ver automaticamente a soma dos valores selecionados.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleDismissTip(true)}
              className="w-full sm:w-auto"
            >
              Entendi, não mostrar novamente
            </Button>
            <Button 
              onClick={() => handleDismissTip(false)}
              className="w-full sm:w-auto bg-gradient-primary text-white"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-destructive" />
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
          <DataReplicator
            tableType="despesas"
            targetMonth={selectedMonth || ""}
            onReplicationComplete={fetchDespesas}
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
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                        data_vencimento: newDate,
                        mes_referencia: formatDateToMonthRef(newDate)
                      });
                      // Trigger visual feedback for auto-fill
                      setDataVencimentoUpdated(true);
                      setTimeout(() => setDataVencimentoUpdated(false), 1500);
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
                  className={`transition-all duration-300 ${dataVencimentoUpdated ? "ring-4 ring-emerald-500 bg-emerald-500/20 border-emerald-500 scale-105 shadow-lg shadow-emerald-500/30" : ""}`}
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
                    <RechartsTooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Bar 
                      dataKey="valor" 
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
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

      {/* Soma de Itens Selecionados */}
      {selectedItems.size > 0 && (
        <Card className="shadow-card border-0 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {selectedItems.size} item(s) selecionado(s)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(selectedTotal)}
                </div>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Limpar Seleção
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Despesas */}
      <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Lista de Despesas</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-muted transition-colors">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px] p-3">
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-primary" />
                        Seleção Múltipla
                      </p>
                      <p className="text-muted-foreground">
                        Clique nas linhas ou use os checkboxes para selecionar várias despesas e ver o total somado automaticamente.
                      </p>
                      <p className="font-semibold flex items-center gap-2 pt-1">
                        <Filter className="w-4 h-4 text-primary" />
                        Filtro por Categoria
                      </p>
                      <p className="text-muted-foreground">
                        Use o filtro no topo da página para ver o total de despesas por categoria específica.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {filteredAndSortedDespesas.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedItems.size === filteredAndSortedDespesas.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <Table className="min-w-[900px]">
                <TableHeaderElement>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedItems.size === filteredAndSortedDespesas.length && filteredAndSortedDespesas.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
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
                  sortKey="data_vencimento" 
                  currentSort={sortConfig} 
                  onSort={handleSort}
                >
                  Dt_Venc.
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
                <TableRow 
                  key={despesa.id}
                  className={`cursor-pointer transition-colors ${selectedItems.has(despesa.id) ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                  onClick={() => handleSelectItem(despesa.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.has(despesa.id)}
                      onCheckedChange={() => handleSelectItem(despesa.id)}
                      aria-label={`Selecionar ${despesa.descricao}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{despesa.descricao}</TableCell>
                  <TableCell>{despesa.categoria}</TableCell>
                  <TableCell className="text-destructive font-semibold">
                    {formatCurrency(despesa.valor)}
                  </TableCell>
                  <TableCell>
                    {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {despesa.data_vencimento 
                      ? new Date(despesa.data_vencimento).toLocaleDateString('pt-BR')
                      : '-'
                    }
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
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
