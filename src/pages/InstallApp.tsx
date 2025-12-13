import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, CheckCircle, Info } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img 
              src="/pwa-192x192.png" 
              alt="Finanza Logo" 
              className="w-24 h-24 rounded-2xl shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
            Instalar Finanza
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Instale o app no seu dispositivo para acesso rápido e funcionamento offline
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                App Instalado!
              </h3>
              <p className="text-muted-foreground">
                O Finanza já está instalado no seu dispositivo. Você pode acessá-lo pelo ícone na área de trabalho ou menu de apps.
              </p>
            </div>
          ) : (
            <>
              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Acesso Rápido</h4>
                    <p className="text-sm text-muted-foreground">
                      Abra o app direto do desktop ou tela inicial
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Monitor className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Funciona Offline</h4>
                    <p className="text-sm text-muted-foreground">
                      Use o app mesmo sem conexão com internet
                    </p>
                  </div>
                </div>
              </div>

              {/* Install Button or Instructions */}
              {deferredPrompt ? (
                <Button 
                  onClick={handleInstall}
                  className="w-full h-12 text-lg bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Instalar Agora
                </Button>
              ) : isIOS ? (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Como instalar no iOS</h4>
                      <ol className="text-sm text-muted-foreground space-y-1">
                        <li>1. Toque no botão <strong>Compartilhar</strong> (ícone de seta)</li>
                        <li>2. Role e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                        <li>3. Toque em <strong>"Adicionar"</strong></li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Como instalar</h4>
                      <p className="text-sm text-muted-foreground">
                        No navegador, clique no ícone de instalação na barra de endereço (geralmente um "+" ou ícone de download) ou acesse o menu e selecione "Instalar app".
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Back to app */}
          <div className="text-center pt-2">
            <a 
              href="/" 
              className="text-sm text-primary hover:underline"
            >
              Voltar para o app
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
