-- Fix RLS policies for INSERT operations to ensure user_id matches auth.uid()

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Users can create their own receitas" ON public.receitas;
DROP POLICY IF EXISTS "Users can create their own despesas" ON public.despesas;
DROP POLICY IF EXISTS "Users can create their own dividas" ON public.dividas;

-- Recreate INSERT policies with proper WITH CHECK clause
CREATE POLICY "Users can create their own receitas" 
ON public.receitas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own despesas" 
ON public.despesas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own dividas" 
ON public.dividas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);