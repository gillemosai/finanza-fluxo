import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'divida';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useCategorias(tipo?: 'receita' | 'despesa' | 'divida') {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategorias = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id);

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query.order('nome', { ascending: true });

      if (error) throw error;
      setCategorias(data as Categoria[] || []);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [user?.id, tipo]);

  // Get category names as string array (for backward compatibility)
  const getCategoryNames = (): string[] => {
    return categorias.map(cat => cat.nome);
  };

  return {
    categorias,
    categoryNames: getCategoryNames(),
    loading,
    refetch: fetchCategorias
  };
}