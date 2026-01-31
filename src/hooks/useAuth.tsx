import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Se é um evento de logout ou o usuário não quer permanecer conectado
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          const isTemporary = localStorage.getItem('temporary_session');
          if (isTemporary === 'true' && event === 'TOKEN_REFRESHED') {
            // Se é uma sessão temporária e o token foi atualizado, 
            // verificar se devemos manter a sessão
            const loginTime = localStorage.getItem('login_time');
            if (loginTime) {
              const elapsed = Date.now() - parseInt(loginTime);
              const oneDay = 24 * 60 * 60 * 1000;
              if (elapsed > oneDay) {
                supabase.auth.signOut();
              }
            }
          }
        }

        if (event === 'SIGNED_IN') {
          // Armazenar o tempo de login se não for para lembrar
          const isTemporary = localStorage.getItem('temporary_session');
          if (isTemporary === 'true') {
            localStorage.setItem('login_time', Date.now().toString());
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    // Se não for para lembrar, salva uma flag no localStorage para controlar o comportamento
    if (!rememberMe) {
      localStorage.setItem('temporary_session', 'true');
      // Configurar um timeout para fazer logout automático após inatividade
      setTimeout(() => {
        const isTemporary = localStorage.getItem('temporary_session');
        if (isTemporary === 'true') {
          signOut();
        }
      }, 24 * 60 * 60 * 1000); // 24 horas
    } else {
      localStorage.removeItem('temporary_session');
    }

    return { error };
  };

  const signOut = async () => {
    // Limpar dados de sessão temporária
    localStorage.removeItem('temporary_session');
    localStorage.removeItem('login_time');
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      // Determine the correct redirect URL - use production URL if available
      const productionUrl = 'https://finanza-fluxo.lovable.app';
      const redirectUrl = window.location.hostname === 'localhost' 
        ? productionUrl 
        : window.location.origin;
      
      // Use custom edge function for password reset via Resend
      const response = await fetch(
        `https://laqvhiaxerzafvsmxewn.supabase.co/functions/v1/send-password-reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            redirectUrl: `${redirectUrl}/update-password`
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Erro ao enviar email de recuperação' } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: 'Erro ao conectar com o servidor' } };
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}