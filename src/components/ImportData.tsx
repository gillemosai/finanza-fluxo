import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet } from "lucide-react";

export function ImportData() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const processExcelData = async (file: File) => {
    setIsLoading(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      let totalInserted = 0;
      
      // Processa cada aba da planilha
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length === 0) continue;
        
        // Identifica o tipo de dados baseado no nome da aba ou colunas
        const firstRow = data[0] as any;
        const columns = Object.keys(firstRow).map(k => k.toLowerCase());
        
        if (sheetName.toLowerCase().includes('receita') || columns.some(col => col.includes('receita'))) {
          // Processa receitas
          for (const row of data) {
            const receita = {
              user_id: user!.id,
              descricao: row['Descrição'] || row['Descrição'] || row['descricao'] || 'Receita importada',
              valor: parseFloat(String(row['Valor'] || row['valor'] || 0).replace(',', '.')),
              categoria: row['Categoria'] || row['categoria'] || 'Outros',
              data_recebimento: row['Data'] || row['data'] || new Date().toISOString().split('T')[0],
              mes_referencia: row['Mês'] || row['mes'] || new Date().toISOString().slice(0, 7),
              observacoes: row['Observações'] || row['observacoes'] || null
            };
            
            if (receita.valor > 0) {
              await supabase.from('receitas').insert(receita);
              totalInserted++;
            }
          }
        } else if (sheetName.toLowerCase().includes('despesa') || columns.some(col => col.includes('despesa'))) {
          // Processa despesas
          for (const row of data) {
            const despesa = {
              user_id: user!.id,
              descricao: row['Descrição'] || row['descricao'] || 'Despesa importada',
              valor: parseFloat(String(row['Valor'] || row['valor'] || 0).replace(',', '.')),
              categoria: row['Categoria'] || row['categoria'] || 'Outros',
              data_pagamento: row['Data'] || row['data'] || new Date().toISOString().split('T')[0],
              mes_referencia: row['Mês'] || row['mes'] || new Date().toISOString().slice(0, 7),
              observacoes: row['Observações'] || row['observacoes'] || null
            };
            
            if (despesa.valor > 0) {
              await supabase.from('despesas').insert(despesa);
              totalInserted++;
            }
          }
        } else if (sheetName.toLowerCase().includes('divida') || columns.some(col => col.includes('divida'))) {
          // Processa dívidas
          for (const row of data) {
            const divida = {
              user_id: user!.id,
              descricao: row['Descrição'] || row['descricao'] || 'Dívida importada',
              valor_total: parseFloat(String(row['Valor Total'] || row['valor_total'] || row['Valor'] || row['valor'] || 0).replace(',', '.')),
              valor_pago: parseFloat(String(row['Valor Pago'] || row['valor_pago'] || 0).replace(',', '.')),
              valor_restante: 0, // Será calculado
              categoria: row['Categoria'] || row['categoria'] || 'Outros',
              data_vencimento: row['Vencimento'] || row['vencimento'] || null,
              status: row['Status'] || row['status'] || 'pendente',
              observacoes: row['Observações'] || row['observacoes'] || null
            };
            
            divida.valor_restante = divida.valor_total - divida.valor_pago;
            
            if (divida.valor_total > 0) {
              await supabase.from('dividas').insert(divida);
              totalInserted++;
            }
          }
        } else {
          // Tenta processar como dados genéricos
          for (const row of data) {
            // Se tem coluna de valor, tenta identificar o tipo automaticamente
            const valor = parseFloat(String(row['Valor'] || row['valor'] || 0).replace(',', '.'));
            if (valor > 0) {
              const descricao = row['Descrição'] || row['descricao'] || 'Item importado';
              
              // Se a descrição indica receita, insere como receita
              if (descricao.toLowerCase().includes('salário') || descricao.toLowerCase().includes('receita')) {
                await supabase.from('receitas').insert({
                  user_id: user!.id,
                  descricao,
                  valor,
                  categoria: row['Categoria'] || row['categoria'] || 'Outros',
                  data_recebimento: row['Data'] || row['data'] || new Date().toISOString().split('T')[0],
                  mes_referencia: row['Mês'] || row['mes'] || new Date().toISOString().slice(0, 7),
                  observacoes: row['Observações'] || row['observacoes'] || null
                });
              } else {
                // Caso contrário, insere como despesa
                await supabase.from('despesas').insert({
                  user_id: user!.id,
                  descricao,
                  valor,
                  categoria: row['Categoria'] || row['categoria'] || 'Outros',
                  data_pagamento: row['Data'] || row['data'] || new Date().toISOString().split('T')[0],
                  mes_referencia: row['Mês'] || row['mes'] || new Date().toISOString().slice(0, 7),
                  observacoes: row['Observações'] || row['observacoes'] || null
                });
              }
              totalInserted++;
            }
          }
        }
      }
      
      toast({
        title: "Importação concluída!",
        description: `${totalInserted} registros foram importados com sucesso.`,
      });
      
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: "Verifique o formato da planilha e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processExcelData(file);
    }
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    
    try {
      // Carrega a planilha de exemplo
      const response = await fetch('/Base_de_Dados_-_Controle_financeiro_2025-4.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const file = new File([arrayBuffer], 'sample.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      await processExcelData(file);
    } catch (error) {
      console.error('Erro ao carregar dados de exemplo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de exemplo.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5" />
          <span>Importar Dados</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Clique para selecionar uma planilha Excel
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Formatos: .xlsx, .xls
              </p>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">ou</p>
          <Button 
            onClick={loadSampleData}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? "Importando..." : "Carregar Dados de Exemplo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}