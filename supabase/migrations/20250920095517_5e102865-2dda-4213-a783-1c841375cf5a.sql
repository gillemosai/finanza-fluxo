-- Add fields for recurring expenses and alerts
ALTER TABLE public.despesas 
ADD COLUMN data_vencimento DATE,
ADD COLUMN recorrente BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN frequencia_recorrencia TEXT CHECK (frequencia_recorrencia IN ('mensal', 'semanal', 'anual')) DEFAULT 'mensal',
ADD COLUMN proxima_cobranca DATE,
ADD COLUMN alerta_ativo BOOLEAN NOT NULL DEFAULT false;