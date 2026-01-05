import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, DollarSign, Check, X, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createDemoSession } from "@/utils/demoData";

// Validação de senha forte
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

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordValidation = validatePassword(password);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password, rememberMe);
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
          });
          navigate("/dashboard");
        }
      } else {
        // Validar senha forte no cadastro
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

        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já pode fazer login.",
          });
          setIsLogin(true);
        }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        setShowForgotPassword(false);
        setResetEmail("");
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

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    
    try {
      // Criar sessão demo efêmera com credenciais únicas
      const result = await createDemoSession();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Conta demo criada!",
        description: "Bem-vindo ao modo demonstração.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        title: "Erro no login demo",
        description: error.message || "Não foi possível acessar o modo demo",
        variant: "destructive",
      });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-card border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <DollarSign className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Controle Financeiro
            </h1>
          </div>
          <CardTitle className="text-xl">
            {isLogin ? "Faça seu login" : "Crie sua conta"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isLogin 
              ? "Entre para acessar sua conta" 
              : "Cadastre-se para começar a usar"
            }
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="signup" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="Seu nome completo"
                  />
                </div>
              </TabsContent>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="relative">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
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

              <TabsContent value="signup" className="space-y-4 mt-0">
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
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    placeholder="Confirme sua senha"
                  />
                </div>
              </TabsContent>

              <TabsContent value="login" className="space-y-4 mt-0">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Permanecer conectado
                  </Label>
                </div>
              </TabsContent>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary text-white"
                disabled={loading}
              >
                {loading ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
              </Button>

              {isLogin && (
                <>
                  <div className="text-center mt-4">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Esqueci minha senha
                    </Button>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full"
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {demoLoading ? "Entrando..." : "Acessar modo demonstração"}
                  </Button>
                </>
              )}
            </form>
          </Tabs>

          {/* Forgot Password Dialog */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Recuperar Senha</CardTitle>
                  <p className="text-muted-foreground">
                    Digite seu email para receber o link de recuperação
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="resetEmail">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowForgotPassword(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}