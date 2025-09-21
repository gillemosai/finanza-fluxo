import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Download, FileText, Table as TableIcon, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("SET/25");
  const [tipoRelatorio, setTipoRelatorio] = useState("completo");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const fetchDataForReport = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      const [receitasResponse, despesasResponse, dividasResponse] = await Promise.all([
        supabase
          .from('receitas')
          .select('*')
          .eq('user_id', user.id)
          .eq('mes_referencia', periodo),
        supabase
          .from('despesas')
          .select('*')
          .eq('user_id', user.id)
          .eq('mes_referencia', periodo),
        supabase
          .from('dividas')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (receitasResponse.error) throw receitasResponse.error;
      if (despesasResponse.error) throw despesasResponse.error;
      if (dividasResponse.error) throw dividasResponse.error;

      return {
        receitas: receitasResponse.data || [],
        despesas: despesasResponse.data || [],
        dividas: dividasResponse.data || []
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar dados para o relatório",
        variant: "destructive",
      });
      return null;
    }
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const data = await fetchDataForReport();
      if (!data) return;

      const workbook = XLSX.utils.book_new();

      // Planilha de Receitas
      if (tipoRelatorio === "completo" || tipoRelatorio === "receitas") {
        const receitasData = data.receitas.map(item => ({
          'Descrição': item.descricao,
          'Categoria': item.categoria,
          'Valor': item.valor,
          'Data Recebimento': new Date(item.data_recebimento).toLocaleDateString('pt-BR'),
          'Mês Referência': item.mes_referencia,
          'Observações': item.observacoes || ''
        }));
        const receitasSheet = XLSX.utils.json_to_sheet(receitasData);
        XLSX.utils.book_append_sheet(workbook, receitasSheet, 'Receitas');
      }

      // Planilha de Despesas
      if (tipoRelatorio === "completo" || tipoRelatorio === "despesas") {
        const despesasData = data.despesas.map(item => ({
          'Descrição': item.descricao,
          'Categoria': item.categoria,
          'Valor': item.valor,
          'Data Pagamento': new Date(item.data_pagamento).toLocaleDateString('pt-BR'),
          'Mês Referência': item.mes_referencia,
          'Observações': item.observacoes || ''
        }));
        const despesasSheet = XLSX.utils.json_to_sheet(despesasData);
        XLSX.utils.book_append_sheet(workbook, despesasSheet, 'Despesas');
      }

      // Planilha de Dívidas
      if (tipoRelatorio === "completo" || tipoRelatorio === "dividas") {
        const dividasData = data.dividas.map(item => ({
          'Descrição': item.descricao,
          'Categoria': item.categoria || '',
          'Valor Total': item.valor_total,
          'Valor Pago': item.valor_pago,
          'Valor Restante': item.valor_restante,
          'Data Vencimento': item.data_vencimento ? new Date(item.data_vencimento).toLocaleDateString('pt-BR') : '',
          'Status': item.status,
          'Observações': item.observacoes || ''
        }));
        const dividasSheet = XLSX.utils.json_to_sheet(dividasData);
        XLSX.utils.book_append_sheet(workbook, dividasSheet, 'Dívidas');
      }

      // Planilha de Resumo
      if (tipoRelatorio === "completo") {
        const totalReceitas = data.receitas.reduce((acc, item) => acc + Number(item.valor), 0);
        const totalDespesas = data.despesas.reduce((acc, item) => acc + Number(item.valor), 0);
        const totalDividas = data.dividas.reduce((acc, item) => acc + Number(item.valor_restante), 0);
        const saldo = totalReceitas - totalDespesas;

        const resumoData = [
          { 'Tipo': 'Total de Receitas', 'Valor': totalReceitas },
          { 'Tipo': 'Total de Despesas', 'Valor': totalDespesas },
          { 'Tipo': 'Saldo (Receitas - Despesas)', 'Valor': saldo },
          { 'Tipo': 'Total de Dívidas Pendentes', 'Valor': totalDividas }
        ];
        const resumoSheet = XLSX.utils.json_to_sheet(resumoData);
        XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo');
      }

      // Download do arquivo
      const fileName = `relatorio_financeiro_${periodo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso!",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    setLoading(true);
    try {
      const data = await fetchDataForReport();
      if (!data) return;

      // Criar um relatório HTML simples e abrir para impressão/PDF
      const totalReceitas = data.receitas.reduce((acc, item) => acc + Number(item.valor), 0);
      const totalDespesas = data.despesas.reduce((acc, item) => acc + Number(item.valor), 0);
      const saldo = totalReceitas - totalDespesas;

      const htmlContent = `
        <html>
          <head>
            <title>Relatório Financeiro - ${periodo}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #4f46e5; text-align: center; }
              h2 { color: #6366f1; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; }
              .summary { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .positive { color: #059669; font-weight: bold; }
              .negative { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Relatório Financeiro - ${periodo}</h1>
            
            <div class="summary">
              <h2>Resumo Executivo</h2>
              <p><strong>Total de Receitas:</strong> <span class="positive">${formatCurrency(totalReceitas)}</span></p>
              <p><strong>Total de Despesas:</strong> <span class="negative">${formatCurrency(totalDespesas)}</span></p>
              <p><strong>Saldo:</strong> <span class="${saldo >= 0 ? 'positive' : 'negative'}">${formatCurrency(saldo)}</span></p>
            </div>

            ${data.receitas.length > 0 ? `
              <h2>Receitas</h2>
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.receitas.map(item => `
                    <tr>
                      <td>${item.descricao}</td>
                      <td>${item.categoria}</td>
                      <td>${formatCurrency(Number(item.valor))}</td>
                      <td>${new Date(item.data_recebimento).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            ${data.despesas.length > 0 ? `
              <h2>Despesas</h2>
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.despesas.map(item => `
                    <tr>
                      <td>${item.descricao}</td>
                      <td>${item.categoria}</td>
                      <td>${formatCurrency(Number(item.valor))}</td>
                      <td>${new Date(item.data_pagamento).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            <p style="text-align: center; margin-top: 40px; color: #6b7280;">
              Relatório gerado em ${new Date().toLocaleString('pt-BR')}
            </p>
          </body>
        </html>
      `;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.print();
      }

      toast({
        title: "Sucesso",
        description: "Relatório PDF gerado! Use Ctrl+P para salvar como PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Relatórios
        </h1>
        <p className="text-muted-foreground">
          Exporte seus dados financeiros em diferentes formatos
        </p>
      </div>

      {/* Filtros */}
      <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Configurações do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SET/25">Setembro 2025</SelectItem>
                  <SelectItem value="AGO/25">Agosto 2025</SelectItem>
                  <SelectItem value="JUL/25">Julho 2025</SelectItem>
                  <SelectItem value="JUN/25">Junho 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completo">Relatório Completo</SelectItem>
                  <SelectItem value="receitas">Apenas Receitas</SelectItem>
                  <SelectItem value="despesas">Apenas Despesas</SelectItem>
                  <SelectItem value="dividas">Apenas Dívidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opções de Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card border-0 bg-gradient-success/5 border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <TableIcon className="w-5 h-5" />
              <span>Exportar para Excel</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Exporte seus dados financeiros em planilhas Excel organizadas por categoria.
            </p>
            <Button 
              onClick={exportToExcel}
              disabled={loading}
              className="w-full bg-gradient-success text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Exportando..." : "Exportar Excel"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-info/5 border-l-4 border-l-info">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-info">
              <FileText className="w-5 h-5" />
              <span>Gerar Relatório PDF</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gere um relatório detalhado em PDF com resumo executivo e tabelas.
            </p>
            <Button 
              onClick={generatePDFReport}
              disabled={loading}
              className="w-full bg-gradient-info text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              {loading ? "Gerando..." : "Gerar PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="shadow-card border-0 bg-gradient-warning/5 border-l-4 border-l-warning">
        <CardHeader>
          <CardTitle className="text-warning">Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-foreground">
            <p>• <strong>Excel:</strong> Ideal para análise detalhada e manipulação dos dados</p>
            <p>• <strong>PDF:</strong> Perfeito para apresentações e arquivamento</p>
            <p>• <strong>Período:</strong> Filtra os dados por mês de referência</p>
            <p>• <strong>Tipo:</strong> Escolha quais categorias incluir no relatório</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}