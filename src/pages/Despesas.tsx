import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, TrendingDown } from "lucide-react";

interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_pagamento: string;
  mes_referencia: string;
  observacoes?: string;
}

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    data_pagamento: "",
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

  const categorias = [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Utilidades",
    "Saúde",
    "Lazer",
    "Educação",
    "Roupas",
    "Outros"
  ];

  useEffect(() => {
    fetchDespesas();
  }, []);

  const fetchDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
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
      const despesaData = {
        user_id: '00000000-0000-0000-0000-000000000000',
        descricao: formData.descricao,
        categoria: formData.categoria,
        valor: parseFloat(formData.valor),
        data_pagamento: formData.data_pagamento,
        mes_referencia: formData.mes_referencia,
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
        mes_referencia: "",
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
      mes_referencia: despesa.mes_referencia,
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

  const totalDespesas = despesas.reduce((acc, despesa) => acc + despesa.valor, 0);

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
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mes_referencia">Mês Referência</Label>
                <Input
                  id="mes_referencia"
                  placeholder="2025-01"
                  value={formData.mes_referencia}
                  onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
                  required
                />
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

      {/* Resumo */}
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
            {despesas.length} despesa(s) cadastrada(s)
          </p>
        </CardContent>
      </Card>

      {/* Tabela de Despesas */}
      <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Mês Ref.</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.map((despesa) => (
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