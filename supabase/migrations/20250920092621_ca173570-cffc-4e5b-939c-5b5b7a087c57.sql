-- Create a table for bank balances
CREATE TABLE public.saldos_bancarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  banco TEXT NOT NULL,
  tipo_conta TEXT NOT NULL DEFAULT 'corrente',
  saldo NUMERIC NOT NULL DEFAULT 0,
  numero_conta TEXT,
  agencia TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saldos_bancarios ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own saldos_bancarios" 
ON public.saldos_bancarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saldos_bancarios" 
ON public.saldos_bancarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saldos_bancarios" 
ON public.saldos_bancarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saldos_bancarios" 
ON public.saldos_bancarios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saldos_bancarios_updated_at
BEFORE UPDATE ON public.saldos_bancarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();