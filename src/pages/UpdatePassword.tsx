import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";

// Validação de senha forte (reused logic)
const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const isPasswordValid = (password: string) => {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
};

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isPasswordValid(password)) {
        toast({
          title: "Senha fraca",
          description: "A senha deve atender a todos os requisitos de segurança",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await updatePassword(password);
      if (error) {
        toast({
          title: "Erro ao atualizar senha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="relative">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-8 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

               {/* Requisitos de senha */}
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Requisitos da senha:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {passwordValidation.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Uma letra maiúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Uma letra minúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Um número
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Um caractere especial (!@#$%^&*)
                    </div>
                  </div>
                </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirme sua nova senha"
                />
              </div>

            <Button 
                type="submit" 
                className="w-full bg-gradient-primary text-white"
                disabled={loading}
              >
                {loading ? "Atualizando..." : "Atualizar Senha"}
              </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
