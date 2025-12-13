-- Replicar despesas de cartão de crédito para a tabela de cartões (dividas)
INSERT INTO public.dividas (user_id, descricao, valor_total, valor_restante, valor_pago, data_vencimento, mes_referencia, status, observacoes, categoria)
SELECT 
  user_id,
  descricao,
  valor as valor_total,
  CASE WHEN status = 'paga' THEN 0 ELSE valor END as valor_restante,
  CASE WHEN status = 'paga' THEN valor ELSE 0 END as valor_pago,
  data_vencimento,
  mes_referencia,
  CASE WHEN status = 'paga' THEN 'pago' ELSE 'pendente' END as status,
  observacoes,
  'Cartão' as categoria
FROM public.despesas
WHERE (LOWER(categoria) LIKE '%cart%' OR LOWER(categoria) LIKE '%créd%' OR LOWER(categoria) LIKE '%cred%')
AND NOT EXISTS (
  SELECT 1 FROM public.dividas d 
  WHERE d.descricao = despesas.descricao 
  AND d.mes_referencia = despesas.mes_referencia 
  AND d.categoria = 'Cartão'
);