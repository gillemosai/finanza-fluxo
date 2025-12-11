import { useState } from 'react';
import { useSQLite } from '@/hooks/useSQLite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Download, Upload, CheckCircle2, XCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SQLiteSyncStatus() {
  const { isInitialized, isNative, isSyncing, lastSyncTime, syncNow, exportData, importData } = useSQLite();
  const [isExporting, setIsExporting] = useState(false);

  const handleSync = async () => {
    const result = await syncNow();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finanza_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup exportado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao exportar backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const jsonData = event.target?.result as string;
            const result = await importData(jsonData);
            if (result.success) {
              toast.success(`${result.imported} registros importados com sucesso!`);
            } else {
              toast.error('Erro ao importar backup');
            }
          } catch (error) {
            toast.error('Arquivo inválido');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Only show this component on native platforms
  if (!isNative) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            Banco de Dados Local
          </CardTitle>
          <CardDescription>
            O banco de dados SQLite local está disponível apenas no aplicativo móvel nativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>Instale o app nativo para usar o armazenamento local offline.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Banco de Dados Local (SQLite)
        </CardTitle>
        <CardDescription>
          Seus dados são salvos localmente no dispositivo e sincronizados com a nuvem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={isInitialized ? 'default' : 'destructive'} className="gap-1">
            {isInitialized ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Ativo
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Inativo
              </>
            )}
          </Badge>
        </div>

        {/* Last Sync */}
        {lastSyncTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Última sincronização:</span>
            <span className="text-sm">
              {format(lastSyncTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={handleSync}
            disabled={!isInitialized || isSyncing}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!isInitialized || isExporting}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Backup
          </Button>
          
          <Button
            variant="outline"
            onClick={handleImport}
            disabled={!isInitialized}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Backup
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          O banco de dados local garante que seus dados estejam sempre disponíveis, mesmo sem conexão com a internet.
        </p>
      </CardContent>
    </Card>
  );
}
