-- Inserir dados de exemplo para o usuário
INSERT INTO receitas (user_id, descricao, valor, categoria, data_recebimento, mes_referencia, observacoes) VALUES 
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Salário', 8000.00, 'Salário', '2024-01-05', '2024-01', 'Salário mensal'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Freelance', 2500.00, 'Trabalho', '2024-01-15', '2024-01', 'Projeto freelance'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Investimentos', 1200.00, 'Investimentos', '2024-01-20', '2024-01', 'Rendimentos de aplicações'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Venda', 850.00, 'Outros', '2024-01-25', '2024-01', 'Venda de item usado'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Aluguel Recebido', 1260.00, 'Aluguéis', '2024-01-30', '2024-01', 'Aluguel de imóvel'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Salário Fevereiro', 8000.00, 'Salário', '2024-02-05', '2024-02', 'Salário mensal'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Comissão', 1500.00, 'Trabalho', '2024-02-12', '2024-02', 'Comissão de vendas')
ON CONFLICT DO NOTHING;

INSERT INTO despesas (user_id, descricao, valor, categoria, data_pagamento, mes_referencia, observacoes) VALUES 
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Supermercado Extra', 776.00, 'Alimentação', '2024-01-03', '2024-01', 'Compras do mês'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Aluguel', 3857.00, 'Moradia', '2024-01-05', '2024-01', 'Aluguel do apartamento'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Combustível', 1777.00, 'Transporte', '2024-01-07', '2024-01', 'Gasolina'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Plano de Saúde', 565.00, 'Saúde', '2024-01-10', '2024-01', 'Plano familiar'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Internet', 242.00, 'Comunicação', '2024-01-12', '2024-01', 'Internet banda larga'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Energia Elétrica', 625.00, 'Utilidades', '2024-01-15', '2024-01', 'Conta de luz'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Curso Online', 147.00, 'Educação', '2024-01-18', '2024-01', 'Educação'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Cinema', 490.00, 'Diversos', '2024-01-20', '2024-01', 'Entretenimento'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Financiamento', 2075.00, 'Financiamento', '2024-01-22', '2024-01', 'Prestação do carro'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Dependentes', 1660.00, 'Dependentes', '2024-01-25', '2024-01', 'Gastos com filhos'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Restaurante', 235.00, 'Alimentação', '2024-01-28', '2024-01', 'Jantar especial'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Serviços Financeiros', 1198.00, 'Serviços Financeiros', '2024-01-30', '2024-01', 'Taxas bancárias')
ON CONFLICT DO NOTHING;

INSERT INTO dividas (user_id, descricao, valor_total, valor_pago, valor_restante, categoria, data_vencimento, status, observacoes) VALUES 
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Inter Master', 2115.00, 0, 2115.00, 'Cartão', '2024-02-15', 'pendente', 'Fatura cartão Inter Master'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Nubank Visa', 235.00, 0, 235.00, 'Cartão', '2024-02-10', 'pendente', 'Fatura Nubank Visa'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Financiamento Carro', 25000.00, 5000.00, 20000.00, 'Veículo', '2026-12-31', 'pendente', 'Financiamento 24x'),
('7d6f1046-f3db-459f-86e5-c83a04b89762', 'Empréstimo Pessoal', 8500.00, 3500.00, 5000.00, 'Pessoal', '2024-12-31', 'pendente', 'Empréstimo banco')
ON CONFLICT DO NOTHING;