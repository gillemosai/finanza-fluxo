import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl md:text-3xl">Termos de Uso</CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6 md:p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e utilizar o Finanza Fluxo, você concorda em cumprir estes Termos de Uso 
                e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes 
                termos, está proibido de usar ou acessar este aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Licença de Uso</h2>
              <p className="text-muted-foreground">
                O Finanza Fluxo é um software <strong>proprietário</strong>. É concedida permissão 
                para uso pessoal e não comercial do aplicativo, sujeito às seguintes restrições:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Não modificar, copiar ou criar trabalhos derivados</li>
                <li>Não utilizar para fins comerciais sem autorização expressa</li>
                <li>Não realizar engenharia reversa ou descompilar o software</li>
                <li>Não redistribuir, sublicenciar ou transferir direitos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Privacidade e Dados</h2>
              <p className="text-muted-foreground">
                Seus dados financeiros são armazenados de forma segura e protegidos por criptografia. 
                Utilizamos Row Level Security (RLS) para garantir que apenas você tenha acesso aos 
                seus próprios dados. Não compartilhamos, vendemos ou cedemos suas informações a terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Responsabilidades do Usuário</h2>
              <p className="text-muted-foreground">O usuário é responsável por:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Garantir a precisão das informações financeiras inseridas</li>
                <li>Utilizar o aplicativo de acordo com a legislação vigente</li>
                <li>Notificar imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                O Finanza Fluxo é fornecido "como está", sem garantias de qualquer tipo. Não nos 
                responsabilizamos por decisões financeiras tomadas com base nas informações do 
                aplicativo. O usuário é o único responsável por suas decisões financeiras.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Modificações</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações 
                significativas serão comunicadas através do aplicativo. O uso continuado após 
                modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre estes termos ou para licenciamento comercial, entre em contato 
                através da nossa <a href="/contato" className="text-primary hover:underline">página de contato</a>.
              </p>
            </section>

            <div className="border-t pt-6 mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Gil Lemos. Todos os direitos reservados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermosDeUso;
