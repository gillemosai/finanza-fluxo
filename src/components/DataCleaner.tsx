import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DataCleaner() {
  const [cleaning, setCleaning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleClean = async () => {
    if (!user) return;
    
    setCleaning(true);
    try {
      // Delete all user data
      const { error: receitasError } = await supabase
        .from('receitas')
        .delete()
        .eq('user_id', user.id);
        
      if (receitasError) throw receitasError;

      const { error: despesasError } = await supabase
        .from('despesas')
        .delete()
        .eq('user_id', user.id);
        
      if (despesasError) throw despesasError;

      const { error: dividasError } = await supabase
        .from('dividas')
        .delete()
        .eq('user_id', user.id);
        
      if (dividasError) throw dividasError;

      toast({
        title: "Dados limpos com sucesso!",
        description: "Todos os dados foram removidos. Agora você pode reimportar a planilha.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Clean error:', error);
      toast({
        title: "Erro ao limpar dados",
        description: "Ocorreu um erro ao limpar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-destructive">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-destructive">
          <AlertTriangle className="h-6 w-6" />
          Limpar Todos os Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Esta ação irá remover TODOS os seus dados (receitas, despesas e dívidas) permanentemente.
          Use apenas se precisar reimportar a planilha.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              disabled={cleaning}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {cleaning ? "Limpando..." : "Limpar Todos os Dados"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todos os seus dados financeiros serão 
                permanentemente deletados do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClean} className="bg-destructive hover:bg-destructive/90">
                Sim, limpar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
