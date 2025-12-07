import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { importDataFromExcel } from "@/utils/importData";
import { generateSampleData } from "@/utils/generateSampleData";
import { Upload, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DataImporter() {
  const [importing, setImporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imported, setImported] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!user) return;
    
    setImporting(true);
    try {
      await importDataFromExcel(user.id);
      setImported(true);
      toast({
        title: "Dados importados com sucesso!",
        description: "Todos os dados da planilha foram carregados no sistema.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const handleGenerateSample = async () => {
    if (!user) return;
    
    setGenerating(true);
    try {
      await generateSampleData(user.id);
      toast({
        title: "Dados de exemplo gerados!",
        description: "Dados aleatórios foram criados para demonstração do sistema.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Generate sample error:", error);
      toast({
        title: "Erro ao gerar dados",
        description: "Ocorreu um erro ao gerar os dados de exemplo.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (imported) {
    return (
      <Card className="w-full" role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-success">
            <CheckCircle className="h-6 w-6" aria-hidden="true" />
            Dados Carregados!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Os dados foram carregados com sucesso no sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" role="region" aria-label="Opções de importação de dados">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" aria-hidden="true" />
          Importação de Dados
        </CardTitle>
        <CardDescription>
          Importe dados de uma planilha Excel ou gere dados de exemplo para testar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Button 
            onClick={handleImport}
            disabled={importing || generating}
            variant="outline"
            className="w-full h-auto py-4 flex flex-col gap-2"
            aria-label="Importar dados de uma planilha Excel"
          >
            <Upload className="h-5 w-5" aria-hidden="true" />
            <span>{importing ? "Importando..." : "Importar Planilha"}</span>
          </Button>
          
          <Button 
            onClick={handleGenerateSample}
            disabled={importing || generating}
            className="w-full h-auto py-4 flex flex-col gap-2"
            aria-label="Gerar dados de exemplo aleatórios para demonstração"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span>{generating ? "Gerando..." : "Gerar Dados de Exemplo"}</span>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Os dados de exemplo incluem receitas, despesas, dívidas e saldos bancários dos últimos 6 meses.
        </p>
      </CardContent>
    </Card>
  );
}