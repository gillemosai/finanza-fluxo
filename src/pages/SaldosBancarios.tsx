import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { useGlobalMonthFilter } from "@/hooks/useGlobalMonthFilter";
import { MonthFilter } from "@/components/MonthFilter";
import { useToast } from "@/hooks/use-toast";
import { useOfflineData } from "@/hooks/useOfflineData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SaldoBancario {
  id: string;
  banco: string;
  tipo_conta: string;
  saldo: number;
  numero_conta?: string;
  agencia?: string;
  observacoes?: string;
}

export default function SaldosBancarios() {
  const [saldos, setSaldos] = useState<SaldoBancario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSaldo, setEditingSaldo] = useState<SaldoBancario | null>(null);
  const [formData, setFormData] = useState({
    banco: '',
    tipo_conta: 'corrente',
    saldo: '',
    numero_conta: '',
    agencia: '',
    observacoes: ''
  });
  
  const { toast } = useToast();
  const { selectedMonth, setSelectedMonth } = useGlobalMonthFilter();
  const { getData, saveData, updateData, deleteData, isOnline, dataVersion, isInitialized } = useOfflineData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const fetchSaldos = useCallback(async () => {
    try {
      const data = await getData('saldos_bancarios');
      const sortedData = (data as SaldoBancario[]).sort((a, b) => 
        a.banco.localeCompare(b.banco)
      );
      setSaldos(sortedData);
    } catch (error) {
      console.error('Error fetching saldos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar saldos bancários",
        variant: "destructive",
      });
    }
  }, [getData, toast]);

  useEffect(() => {
    if (isInitialized) {
      fetchSaldos();
    }
  }, [fetchSaldos, isInitialized, dataVersion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const saldoData = {
        banco: formData.banco,
        tipo_conta: formData.tipo_conta,
        saldo: parseFloat(formData.saldo.replace(/[^\d,-]/g, '').replace(',', '.')),
        numero_conta: formData.numero_conta || null,
        agencia: formData.agencia || null,
        observacoes: formData.observacoes || null
      };

      if (editingSaldo) {
        const result = await updateData('saldos_bancarios', editingSaldo.id, saldoData);
        if (!result.success) throw new Error(result.error);
        
        toast({
          title: "Sucesso",
          description: `Saldo bancário atualizado${!isOnline ? ' (offline)' : ''}!`,
        });
      } else {
        const result = await saveData('saldos_bancarios', saldoData);
        if (!result.success) throw new Error(result.error);
        
        toast({
          title: "Sucesso",
          description: `Saldo bancário adicionado${!isOnline ? ' (offline)' : ''}!`,
        });
      }

      setIsDialogOpen(false);
      setEditingSaldo(null);
      setFormData({
        banco: '',
        tipo_conta: 'corrente',
        saldo: '',
        numero_conta: '',
        agencia: '',
        observacoes: ''
      });
      fetchSaldos();
    } catch (error) {
      console.error('Error saving saldo:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar saldo bancário",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (saldo: SaldoBancario) => {
    setEditingSaldo(saldo);
    setFormData({
      banco: saldo.banco,
      tipo_conta: saldo.tipo_conta,
      saldo: saldo.saldo.toString(),
      numero_conta: saldo.numero_conta || '',
      agencia: saldo.agencia || '',
      observacoes: saldo.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este saldo bancário?')) return;

    try {
      const result = await deleteData('saldos_bancarios', id);
      if (!result.success) throw new Error(result.error);
      
      toast({
        title: "Sucesso",
        description: `Saldo bancário excluído${!isOnline ? ' (offline)' : ''}!`,
      });
      fetchSaldos();
    } catch (error) {
      console.error('Error deleting saldo:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir saldo bancário",
        variant: "destructive",
      });
    }
  };

  const totalSaldo = saldos.reduce((total, saldo) => total + Number(saldo.saldo), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Saldos Bancários
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie os saldos de suas contas bancárias</p>
        </div>
        
        <div className="flex items-center gap-4">
          <MonthFilter 
            selectedMonth={selectedMonth}
            onFilterChange={setSelectedMonth}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingSaldo(null);
                setFormData({
                  banco: '',
                  tipo_conta: 'corrente',
                  saldo: '',
                  numero_conta: '',
                  agencia: '',
                  observacoes: ''
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Saldo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSaldo ? 'Editar Saldo Bancário' : 'Adicionar Saldo Bancário'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    placeholder="Nome do banco"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo_conta">Tipo de Conta</Label>
                  <Select value={formData.tipo_conta} onValueChange={(value) => setFormData({ ...formData, tipo_conta: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Conta Poupança</SelectItem>
                      <SelectItem value="investimento">Conta Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                    placeholder="Número da agência"
                  />
                </div>
                
                <div>
                  <Label htmlFor="numero_conta">Número da Conta</Label>
                  <Input
                    id="numero_conta"
                    value={formData.numero_conta}
                    onChange={(e) => setFormData({ ...formData, numero_conta: e.target.value })}
                    placeholder="Número da conta"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="saldo">Saldo Atual</Label>
                <Input
                  id="saldo"
                  value={formData.saldo}
                  onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
                  placeholder="0,00"
                  required
                />
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
                  {editingSaldo ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Total Card */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">Saldo Total</span>
              </div>
              <div className="text-3xl font-bold">{formatCurrency(totalSaldo)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saldos List */}
      <div className="grid gap-4">
        {saldos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum saldo cadastrado</h3>
              <p className="text-muted-foreground">Adicione seus saldos bancários para começar.</p>
            </CardContent>
          </Card>
        ) : (
          saldos.map((saldo) => (
            <Card key={saldo.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{saldo.banco}</h3>
                      <span className="text-sm text-muted-foreground">
                        {saldo.tipo_conta.charAt(0).toUpperCase() + saldo.tipo_conta.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {saldo.agencia && (
                        <div>
                          <span className="text-muted-foreground">Agência: </span>
                          <span className="text-foreground">{saldo.agencia}</span>
                        </div>
                      )}
                      {saldo.numero_conta && (
                        <div>
                          <span className="text-muted-foreground">Conta: </span>
                          <span className="text-foreground">{saldo.numero_conta}</span>
                        </div>
                      )}
                    </div>
                    
                    {saldo.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2">{saldo.observacoes}</p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-foreground mb-3">
                      {formatCurrency(Number(saldo.saldo))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(saldo)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(saldo.id)}
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
