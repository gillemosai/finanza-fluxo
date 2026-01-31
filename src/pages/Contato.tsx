import { Mail, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import logoImage from "@/assets/logo_cheia_transp_var01-2.png";

const Contato = () => {
  const navigate = useNavigate();
  const emailComercial = "contato@finanza.com.br";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex flex-col items-center gap-4">
              <img 
                src={logoImage} 
                alt="Finanza Logo" 
                className="h-16 w-auto"
              />
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl md:text-3xl">Contato Comercial</CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-lg">
                Interessado em licenciamento comercial, parcerias ou tem alguma dúvida sobre o 
                <strong className="text-foreground"> Finanza Fluxo</strong>?
              </p>
              <p className="text-muted-foreground">
                Entre em contato conosco através do email abaixo:
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Email comercial</p>
              <a 
                href={`mailto:${emailComercial}?subject=Contato Comercial - Finanza Fluxo`}
                className="text-2xl font-semibold text-primary hover:underline flex items-center justify-center gap-2"
              >
                {emailComercial}
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                Assuntos que tratamos:
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Licenciamento comercial do software</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Parcerias e integrações</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Suporte empresarial</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Customizações e desenvolvimento</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Desenvolvido por
              </p>
              <a 
                href="https://www.linkedin.com/in/gillemosai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                @gillemosai
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contato;
