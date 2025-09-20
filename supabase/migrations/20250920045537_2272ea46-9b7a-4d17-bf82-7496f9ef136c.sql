-- Create receitas (revenues) table
CREATE TABLE public.receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_recebimento DATE NOT NULL,
  mes_referencia TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create despesas (expenses) table
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  mes_referencia TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dividas (debts) table
CREATE TABLE public.dividas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_restante DECIMAL(10,2) NOT NULL,
  data_vencimento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'em_atraso')),
  categoria TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;

-- Create policies for receitas
CREATE POLICY "Users can view their own receitas" 
ON public.receitas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receitas" 
ON public.receitas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receitas" 
ON public.receitas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receitas" 
ON public.receitas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for despesas
CREATE POLICY "Users can view their own despesas" 
ON public.despesas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own despesas" 
ON public.despesas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own despesas" 
ON public.despesas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own despesas" 
ON public.despesas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for dividas
CREATE POLICY "Users can view their own dividas" 
ON public.dividas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dividas" 
ON public.dividas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dividas" 
ON public.dividas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dividas" 
ON public.dividas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_receitas_updated_at
  BEFORE UPDATE ON public.receitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_despesas_updated_at
  BEFORE UPDATE ON public.despesas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dividas_updated_at
  BEFORE UPDATE ON public.dividas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data (receitas)
INSERT INTO public.receitas (user_id, descricao, categoria, valor, data_recebimento, mes_referencia, observacoes) VALUES
('00000000-0000-0000-0000-000000000000', 'Salário', 'Trabalho', 5500.00, '2025-01-05', '2025-01', 'Salário mensal'),
('00000000-0000-0000-0000-000000000000', 'Freelance', 'Trabalho', 1200.00, '2025-01-15', '2025-01', 'Projeto extra'),
('00000000-0000-0000-0000-000000000000', 'Investimentos', 'Renda Passiva', 800.00, '2025-01-30', '2025-01', 'Dividendos'),
('00000000-0000-0000-0000-000000000000', 'Venda', 'Outros', 1000.00, '2025-01-20', '2025-01', 'Venda de equipamento');

-- Insert sample data (despesas)
INSERT INTO public.despesas (user_id, descricao, categoria, valor, data_pagamento, mes_referencia, observacoes) VALUES
('00000000-0000-0000-0000-000000000000', 'Aluguel', 'Moradia', 1800.00, '2025-01-05', '2025-01', 'Aluguel mensal'),
('00000000-0000-0000-0000-000000000000', 'Supermercado', 'Alimentação', 650.00, '2025-01-10', '2025-01', 'Compras do mês'),
('00000000-0000-0000-0000-000000000000', 'Combustível', 'Transporte', 400.00, '2025-01-15', '2025-01', 'Gasolina'),
('00000000-0000-0000-0000-000000000000', 'Internet', 'Utilidades', 120.00, '2025-01-08', '2025-01', 'Internet fibra'),
('00000000-0000-0000-0000-000000000000', 'Academia', 'Saúde', 180.00, '2025-01-12', '2025-01', 'Mensalidade'),
('00000000-0000-0000-0000-000000000000', 'Restaurante', 'Alimentação', 250.00, '2025-01-18', '2025-01', 'Jantar fim de semana');

-- Insert sample data (dividas)
INSERT INTO public.dividas (user_id, descricao, valor_total, valor_pago, valor_restante, data_vencimento, status, categoria, observacoes) VALUES
('00000000-0000-0000-0000-000000000000', 'Cartão de Crédito', 3500.00, 1000.00, 2500.00, '2025-02-15', 'pendente', 'Cartão', 'Parcelamento em 5x'),
('00000000-0000-0000-0000-000000000000', 'Financiamento Carro', 25000.00, 8000.00, 17000.00, '2025-12-31', 'pendente', 'Veículo', '36 parcelas restantes'),
('00000000-0000-0000-0000-000000000000', 'Empréstimo Pessoal', 8000.00, 2000.00, 6000.00, '2025-06-30', 'pendente', 'Pessoal', 'Empréstimo banco');