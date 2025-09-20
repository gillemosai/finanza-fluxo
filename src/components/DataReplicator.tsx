import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateToMonthRef } from "@/utils/dateUtils";

interface DataReplicatorProps {
  tableType: 'receitas' | 'despesas' | 'dividas' | 'saldos_bancarios';
  targetMonth: string;
  onReplicationComplete: () => void;
}

export function DataReplicator({ tableType, targetMonth, onReplicationComplete }: DataReplicatorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourceMonth, setSourceMonth] = useState("");
  const [isReplicating, setIsReplicating] = useState(false);
  const { toast } = useToast();

  // Generate available months (current month and 12 months back)
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      
      // Fix timezone issue by creating a properly formatted date string
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = '01';
      const dateString = `${year}-${month}-${day}`;
      
      const monthRef = formatDateToMonthRef(dateString);
      
      
      months.push({
        value: monthRef,
        label: `${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} (${monthRef})`
      });
    }
    
    return months;
  };

  const adjustDateToTargetMonth = (originalDate: string, targetMonthRef: string) => {
    const [targetMonthAbb, targetYear] = targetMonthRef.split('/');
    const targetYearFull = 2000 + parseInt(targetYear);
    
    // Map month abbreviations to numbers
    const monthMap: { [key: string]: number } = {
      'JAN': 0, 'FEV': 1, 'MAR': 2, 'ABR': 3, 'MAI': 4, 'JUN': 5,
      'JUL': 6, 'AGO': 7, 'SET': 8, 'OUT': 9, 'NOV': 10, 'DEZ': 11
    };
    
    const targetMonthNum = monthMap[targetMonthAbb];
    const originalDateObj = new Date(originalDate);
    const adjustedDate = new Date(targetYearFull, targetMonthNum, originalDateObj.getDate());
    
    return adjustedDate.toISOString().split('T')[0];
  };

  const replicateData = async () => {
    if (!sourceMonth || !targetMonth) return;

    setIsReplicating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Only replicate data for tables that have mes_referencia
      if (tableType === 'saldos_bancarios') {
        toast({
          title: "Aviso",
          description: "Saldos bancários não podem ser replicados por mês",
          variant: "default",
        });
        return;
      }

      // Fetch source data
      const { data: sourceData, error: fetchError } = await supabase
        .from(tableType)
        .select('*')
        .eq('user_id', user.id)
        .eq('mes_referencia', sourceMonth);

      if (fetchError) throw fetchError;

      if (!sourceData || sourceData.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum dado encontrado no mês de origem",
          variant: "default",
        });
        return;
      }

      // Prepare data for replication with type safety
      const replicatedData = sourceData.map(item => {
        const newItem: any = { ...item };
        delete newItem.id; // Remove ID to create new records
        newItem.mes_referencia = targetMonth;

        // Adjust dates based on table type
        if (tableType === 'receitas') {
          newItem.data_recebimento = adjustDateToTargetMonth(newItem.data_recebimento, targetMonth);
        } else if (tableType === 'despesas') {
          newItem.data_pagamento = adjustDateToTargetMonth(newItem.data_pagamento, targetMonth);
          if (newItem.data_vencimento) {
            newItem.data_vencimento = adjustDateToTargetMonth(newItem.data_vencimento, targetMonth);
          }
          if (newItem.proxima_cobranca) {
            newItem.proxima_cobranca = adjustDateToTargetMonth(newItem.proxima_cobranca, targetMonth);
          }
        } else if (tableType === 'dividas' && newItem.data_vencimento) {
          newItem.data_vencimento = adjustDateToTargetMonth(newItem.data_vencimento, targetMonth);
        }

        return newItem;
      });

      // Insert replicated data
      const { error: insertError } = await supabase
        .from(tableType)
        .insert(replicatedData);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: `${sourceData.length} registro(s) replicado(s) com sucesso!`,
      });

      setIsDialogOpen(false);
      setSourceMonth("");
      onReplicationComplete();

    } catch (error) {
      console.error('Error replicating data:', error);
      toast({
        title: "Erro",
        description: "Erro ao replicar dados",
        variant: "destructive",
      });
    } finally {
      setIsReplicating(false);
    }
  };

  const monthOptions = generateMonthOptions();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-secondary text-secondary-foreground">
          <Copy className="w-4 h-4 mr-2" />
          Replicar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Replicar Dados</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Mês de Destino (atual)</Label>
            <div className="p-2 bg-muted rounded border text-sm">
              {targetMonth || "Nenhum filtro ativo"}
            </div>
          </div>
          
          <div>
            <Label htmlFor="source-month">Mês de Origem</Label>
            <Select value={sourceMonth} onValueChange={setSourceMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês de origem" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <p><strong>Como funciona:</strong></p>
            <p>• Os dados do mês de origem serão copiados</p>
            <p>• As datas serão ajustadas para o mês de destino</p>
            <p>• Novos registros serão criados (não sobrescreve dados existentes)</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={replicateData} 
              disabled={!sourceMonth || isReplicating}
              className="bg-gradient-primary text-white"
            >
              {isReplicating ? "Replicando..." : "Replicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}