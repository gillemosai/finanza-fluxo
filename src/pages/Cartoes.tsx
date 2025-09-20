import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Cartao {
  id: string;
  descricao: string;
  valor_total: number;
  valor_restante: number;
  valor_pago: number;
  data_vencimento?: string;
  status: string;
  observacoes?: string;
}

export default function Cartoes() {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCartao, setEditingCartao] = useState<Cartao | null>(null);
  const [formData, setFormData] = useState({
    descricao: '',
    valor_total: '',
    valor_restante: '',
    valor_pago: '',
    data_vencimento: '',
    status: 'pendente',
    observacoes: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const fetchCartoes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dividas')
        .select('*')
        .eq('user_id', user.id)
        .eq('categoria', 'Cartão')
        .order('data_vencimento');

      if (error) throw error;
      setCartoes(data || []);
    } catch (error) {
      console.error('Error fetching cartoes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cartões",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCartoes();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const cartaoData = {
        descricao: formData.descricao,
        valor_total: parseFloat(formData.valor_total.replace(/[^\d,-]/g, '').replace(',', '.')),
        valor_restante: parseFloat(formData.valor_restante.replace(/[^\d,-]/g, '').replace(',', '.')),
        valor_pago: parseFloat(formData.valor_pago.replace(/[^\d,-]/g, '').replace(',', '.')),
        data_vencimento: formData.data_vencimento || null,
        status: formData.status,
        observacoes: formData.observacoes,
        categoria: 'Cartão',
        user_id: user.id
      };

      if (editingCartao) {
        const { error } = await supabase
          .from('dividas')
          .update(cartaoData)
          .eq('id', editingCartao.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Cartão atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('dividas')
          .insert([cartaoData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Cartão adicionado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingCartao(null);
      setFormData({
        descricao: '',
        valor_total: '',
        valor_restante: '',
        valor_pago: '',
        data_vencimento: '',
        status: 'pendente',
        observacoes: ''
      });
      fetchCartoes();
    } catch (error) {
      console.error('Error saving cartao:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cartão",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cartao: Cartao) => {
    setEditingCartao(cartao);
    setFormData({
      descricao: cartao.descricao,
      valor_total: cartao.valor_total.toString(),
      valor_restante: cartao.valor_restante.toString(),
      valor_pago: cartao.valor_pago.toString(),
      data_vencimento: cartao.data_vencimento || '',
      status: cartao.status,
      observacoes: cartao.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return;

    try {
      const { error } = await supabase
        .from('dividas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Cartão excluído com sucesso!",
      });
      fetchCartoes();
    } catch (error) {
      console.error('Error deleting cartao:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir cartão",
        variant: "destructive",
      });
    }
  };

  const totalGasto = cartoes.reduce((total, cartao) => total + Number(cartao.valor_restante), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie os gastos dos seus cartões de crédito</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingCartao(null);
                setFormData({
                  descricao: '',
                  valor_total: '',
                  valor_restante: '',
                  valor_pago: '',
                  data_vencimento: '',
                  status: 'pendente',
                  observacoes: ''
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cartão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCartao ? 'Editar Cartão' : 'Adicionar Cartão'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Nome do cartão ou descrição"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="valor_total">Valor Total</Label>
                  <Input
                    id="valor_total"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="valor_pago">Valor Pago</Label>
                  <Input
                    id="valor_pago"
                    value={formData.valor_pago}
                    onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="valor_restante">Valor Restante</Label>
                  <Input
                    id="valor_restante"
                    value={formData.valor_restante}
                    onChange={(e) => setFormData({ ...formData, valor_restante: e.target.value })}
                    placeholder="0,00"
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
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="em_atraso">Em Atraso</SelectItem>
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
                  placeholder="Observações adicionais"
                  rows={3}
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
                  {editingCartao ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Card */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-medium">Total em Cartões</span>
              </div>
              <div className="text-3xl font-bold">{formatCurrency(totalGasto)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartões List */}
      <div className="grid gap-4">
        {cartoes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cartão cadastrado</h3>
              <p className="text-muted-foreground">Adicione seus cartões de crédito para começar.</p>
            </CardContent>
          </Card>
        ) : (
          cartoes.map((cartao) => (
            <Card key={cartao.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{cartao.descricao}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        cartao.status === 'pago' ? 'bg-green-100 text-green-800' :
                        cartao.status === 'em_atraso' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cartao.status === 'pago' ? 'Pago' :
                         cartao.status === 'em_atraso' ? 'Em Atraso' : 'Pendente'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total: </span>
                        <span className="text-foreground font-medium">{formatCurrency(Number(cartao.valor_total))}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pago: </span>
                        <span className="text-foreground font-medium">{formatCurrency(Number(cartao.valor_pago))}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Restante: </span>
                        <span className="text-foreground font-medium">{formatCurrency(Number(cartao.valor_restante))}</span>
                      </div>
                    </div>
                    
                    {cartao.data_vencimento && (
                      <div className="text-sm mt-2">
                        <span className="text-muted-foreground">Vencimento: </span>
                        <span className="text-foreground">{new Date(cartao.data_vencimento).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    
                    {cartao.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2">{cartao.observacoes}</p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-foreground mb-3">
                      {formatCurrency(Number(cartao.valor_restante))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cartao)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cartao.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}