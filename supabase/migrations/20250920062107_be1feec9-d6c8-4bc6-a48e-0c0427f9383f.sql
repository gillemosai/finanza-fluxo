-- Clear existing data and add sample user for demonstration
DO $$
DECLARE
    sample_user_id UUID := 'aa6e9cb8-2023-4fdf-82a9-d51ac213d450';
BEGIN
    -- Clear all existing data
    DELETE FROM public.receitas;
    DELETE FROM public.despesas;
    DELETE FROM public.dividas;
    
    -- Insert sample receitas data
    INSERT INTO public.receitas (user_id, descricao, categoria, valor, data_recebimento, mes_referencia, observacoes) VALUES
    (sample_user_id, 'Salário', 'Trabalho', 8500.00, '2024-01-05', '2024-01', NULL),
    (sample_user_id, 'Freelance', 'Trabalho', 2000.00, '2024-01-15', '2024-01', 'Projeto web'),
    (sample_user_id, 'Aluguel recebido', 'Investimentos', 1500.00, '2024-01-10', '2024-01', NULL),
    (sample_user_id, 'Salário', 'Trabalho', 8500.00, '2024-02-05', '2024-02', NULL),
    (sample_user_id, 'Dividendos', 'Investimentos', 300.00, '2024-02-20', '2024-02', 'Ações ITUB4'),
    (sample_user_id, 'Salário', 'Trabalho', 8500.00, '2024-03-05', '2024-03', NULL),
    (sample_user_id, 'Freelance', 'Trabalho', 1800.00, '2024-03-18', '2024-03', 'App mobile');
    
    -- Insert sample despesas data
    INSERT INTO public.despesas (user_id, descricao, categoria, valor, data_pagamento, mes_referencia, observacoes) VALUES
    (sample_user_id, 'Aluguel', 'Moradia', 2500.00, '2024-01-01', '2024-01', NULL),
    (sample_user_id, 'Supermercado', 'Alimentação', 800.00, '2024-01-10', '2024-01', NULL),
    (sample_user_id, 'Energia elétrica', 'Contas', 180.00, '2024-01-15', '2024-01', NULL),
    (sample_user_id, 'Internet', 'Contas', 100.00, '2024-01-20', '2024-01', NULL),
    (sample_user_id, 'Gasolina', 'Transporte', 400.00, '2024-01-25', '2024-01', NULL),
    (sample_user_id, 'Academia', 'Saúde', 120.00, '2024-01-05', '2024-01', NULL),
    (sample_user_id, 'Aluguel', 'Moradia', 2500.00, '2024-02-01', '2024-02', NULL),
    (sample_user_id, 'Supermercado', 'Alimentação', 750.00, '2024-02-08', '2024-02', NULL),
    (sample_user_id, 'Energia elétrica', 'Contas', 220.00, '2024-02-12', '2024-02', NULL),
    (sample_user_id, 'Internet', 'Contas', 100.00, '2024-02-20', '2024-02', NULL),
    (sample_user_id, 'Aluguel', 'Moradia', 2500.00, '2024-03-01', '2024-03', NULL),
    (sample_user_id, 'Supermercado', 'Alimentação', 900.00, '2024-03-10', '2024-03', NULL);
    
    -- Insert sample dividas data
    INSERT INTO public.dividas (user_id, descricao, categoria, valor_total, valor_pago, valor_restante, data_vencimento, status, observacoes) VALUES
    (sample_user_id, 'Cartão de Crédito Nubank', 'Cartão', 3500.00, 1500.00, 2000.00, '2024-04-15', 'pendente', NULL),
    (sample_user_id, 'Financiamento do Carro', 'Financiamento', 25000.00, 8000.00, 17000.00, '2027-06-01', 'pendente', '36 parcelas'),
    (sample_user_id, 'Empréstimo Pessoal', 'Empréstimo', 15000.00, 5000.00, 10000.00, '2025-12-01', 'pendente', 'Banco do Brasil'),
    (sample_user_id, 'Cartão de Crédito Itaú', 'Cartão', 2200.00, 800.00, 1400.00, '2024-04-10', 'pendente', NULL),
    (sample_user_id, 'Consórcio', 'Financiamento', 80000.00, 20000.00, 60000.00, '2030-01-01', 'pendente', 'Imóvel');
END $$;