import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'divida';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function Configuracoes() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "" as 'receita' | 'despesa' | 'divida' | ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch categories from database
  const fetchCategorias = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setCategorias(data as Categoria[] || []);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [user]);

  // Create default categories for new users
  const createDefaultCategories = async () => {
    if (!user) return;

    const defaultCategories = [
      // Receitas
      { nome: 'Trabalho', tipo: 'receita' as const },
      { nome: 'Renda Passiva', tipo: 'receita' as const },
      { nome: 'Freelance', tipo: 'receita' as const },
      { nome: 'Investimentos', tipo: 'receita' as const },
      { nome: 'Vendas', tipo: 'receita' as const },
      { nome: 'Outros', tipo: 'receita' as const },
      
      // Despesas
      { nome: 'Moradia', tipo: 'despesa' as const },
      { nome: 'Alimentação', tipo: 'despesa' as const },
      { nome: 'Transporte', tipo: 'despesa' as const },
      { nome: 'Utilidades', tipo: 'despesa' as const },
      { nome: 'Saúde', tipo: 'despesa' as const },
      { nome: 'Educação', tipo: 'despesa' as const },
      { nome: 'Entretenimento', tipo: 'despesa' as const },
      { nome: 'Vestuário', tipo: 'despesa' as const },
      { nome: 'Seguros', tipo: 'despesa' as const },
      { nome: 'Outros', tipo: 'despesa' as const },
      
      // Dívidas
      { nome: 'Cartão', tipo: 'divida' as const },
      { nome: 'Empréstimo', tipo: 'divida' as const },
      { nome: 'Financiamento', tipo: 'divida' as const },
      { nome: 'Veículo', tipo: 'divida' as const },
      { nome: 'Imóvel', tipo: 'divida' as const },
      { nome: 'Outros', tipo: 'divida' as const }
    ];

    try {
      const categoriasWithUserId = defaultCategories.map(cat => ({
        ...cat,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('categorias')
        .insert(categoriasWithUserId);

      if (error) throw error;
      
      await fetchCategorias();
      toast.success('Categorias padrão criadas com sucesso!');
    } catch (error) {
      console.error('Error creating default categories:', error);
      toast.error('Erro ao criar categorias padrão');
    }
  };

  // Initialize default categories if none exist
  useEffect(() => {
    if (user && categorias.length === 0) {
      const timer = setTimeout(() => {
        createDefaultCategories();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, categorias.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.nome || !formData.tipo) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .insert([{
          nome: formData.nome,
          tipo: formData.tipo,
          user_id: user.id
        }]);

      if (error) throw error;

      setFormData({ nome: "", tipo: "" });
      setIsDialogOpen(false);
      await fetchCategorias();
      toast.success('Categoria criada com sucesso!');
    } catch (error: any) {
      console.error('Error creating categoria:', error);
      if (error.code === '23505') {
        toast.error('Esta categoria já existe para este tipo');
      } else {
        toast.error('Erro ao criar categoria');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategorias();
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const getCategoriasByTipo = (tipo: string) => {
    return categorias.filter(cat => cat.tipo === tipo);
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'receita': return 'Receitas';
      case 'despesa': return 'Despesas';
      case 'divida': return 'Dívidas';
      default: return tipo;
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'receita': return 'default';
      case 'despesa': return 'destructive';
      case 'divida': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as categorias do seu sistema financeiro</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma nova categoria para organizar suas finanças
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Categoria</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Educação"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value: 'receita' | 'despesa' | 'divida') => 
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="divida">Dívida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {['receita', 'despesa', 'divida'].map((tipo) => (
          <Card key={tipo}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {getTipoLabel(tipo)}
              </CardTitle>
              <CardDescription>
                Categorias de {tipo === 'receita' ? 'receitas' : tipo === 'despesa' ? 'despesas' : 'dívidas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {getCategoriasByTipo(tipo).length > 0 ? (
                  getCategoriasByTipo(tipo).map((categoria) => (
                    <div key={categoria.id} className="flex items-center gap-1">
                      <Badge variant={getTipoBadgeVariant(categoria.tipo) as any}>
                        {categoria.nome}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-1 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(categoria.id, categoria.nome)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma categoria encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}