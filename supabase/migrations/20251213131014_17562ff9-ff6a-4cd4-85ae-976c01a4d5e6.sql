-- Create table for financial goals/dreams
CREATE TABLE public.metas_financeiras (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    valor_objetivo NUMERIC NOT NULL,
    valor_atual NUMERIC NOT NULL DEFAULT 0,
    data_limite DATE,
    icone TEXT DEFAULT '🎯',
    cor TEXT DEFAULT '#8B5CF6',
    categoria TEXT NOT NULL DEFAULT 'outro',
    status TEXT NOT NULL DEFAULT 'em_progresso',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own metas"
ON public.metas_financeiras
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metas"
ON public.metas_financeiras
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metas"
ON public.metas_financeiras
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metas"
ON public.metas_financeiras
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_metas_financeiras_updated_at
BEFORE UPDATE ON public.metas_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();