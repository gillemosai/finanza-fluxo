-- Add status column to despesas table
ALTER TABLE public.despesas 
ADD COLUMN status TEXT NOT NULL DEFAULT 'a_pagar' CHECK (status IN ('paga', 'a_pagar'));