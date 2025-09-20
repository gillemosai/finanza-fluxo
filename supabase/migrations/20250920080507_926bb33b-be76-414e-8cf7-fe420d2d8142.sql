-- Create table for managing categories
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa', 'divida')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, nome, tipo)
);

-- Enable Row Level Security
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own categorias" 
ON public.categorias 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categorias" 
ON public.categorias 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categorias" 
ON public.categorias 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categorias" 
ON public.categorias 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categorias_updated_at
BEFORE UPDATE ON public.categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories for existing functionality
INSERT INTO public.categorias (user_id, nome, tipo) VALUES
-- Default receita categories
(gen_random_uuid(), 'Trabalho', 'receita'),
(gen_random_uuid(), 'Renda Passiva', 'receita'), 
(gen_random_uuid(), 'Freelance', 'receita'),
(gen_random_uuid(), 'Investimentos', 'receita'),
(gen_random_uuid(), 'Vendas', 'receita'),
(gen_random_uuid(), 'Outros', 'receita'),

-- Default despesa categories  
(gen_random_uuid(), 'Moradia', 'despesa'),
(gen_random_uuid(), 'Alimentação', 'despesa'),
(gen_random_uuid(), 'Transporte', 'despesa'),
(gen_random_uuid(), 'Utilidades', 'despesa'),
(gen_random_uuid(), 'Saúde', 'despesa'),
(gen_random_uuid(), 'Educação', 'despesa'),
(gen_random_uuid(), 'Entretenimento', 'despesa'),
(gen_random_uuid(), 'Vestuário', 'despesa'),
(gen_random_uuid(), 'Seguros', 'despesa'),
(gen_random_uuid(), 'Outros', 'despesa'),

-- Default divida categories
(gen_random_uuid(), 'Cartão', 'divida'),
(gen_random_uuid(), 'Empréstimo', 'divida'),
(gen_random_uuid(), 'Financiamento', 'divida'),
(gen_random_uuid(), 'Veículo', 'divida'),
(gen_random_uuid(), 'Imóvel', 'divida'),
(gen_random_uuid(), 'Outros', 'divida');