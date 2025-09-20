import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { importDataFromExcel } from "@/utils/importData";
import { Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DataImporter() {
  const [importing, setImporting] = useState(false);
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
      
      // Refresh the page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  if (imported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Dados Importados!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Os dados da planilha foram carregados com sucesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Upload className="h-6 w-6" />
          Importar Dados da Planilha
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Clique para importar todos os dados da planilha enviada e limpar os dados existentes.
        </p>
        <Button 
          onClick={handleImport}
          disabled={importing}
          className="w-full"
        >
          {importing ? "Importando..." : "Importar Dados"}
        </Button>
      </CardContent>
    </Card>
  );
}