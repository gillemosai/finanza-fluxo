-- Temporarily allow public access to demo data for development
-- Update RLS policies to allow viewing demo data

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own receitas" ON public.receitas;
DROP POLICY IF EXISTS "Users can view their own despesas" ON public.despesas;

-- Create new policies that allow viewing demo data or user's own data
CREATE POLICY "Users can view receitas" 
ON public.receitas 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can view despesas" 
ON public.despesas 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000000'
);

-- Keep the other policies unchanged for insert/update/delete
-- They will still require authentication for user-specific operations